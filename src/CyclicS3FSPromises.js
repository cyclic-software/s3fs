const { 
  S3Client, 
  GetObjectCommand, 
  PutObjectCommand,
  HeadObjectCommand,
} = require("@aws-sdk/client-s3");

const {Stats} = require('fs')
const sync_interface = require('./sync_interface');
function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks))); // can call .toString("utf8") on the buffer
  });
}

class CyclicS3FSPromises{
  constructor(bucketName, config={}) {
    this.bucket = bucketName
    this.config = config
    this.s3 = new S3Client({...config});
  }

  async readFile(fileName ,options){
    const cmd = new GetObjectCommand({
      Bucket: this.bucket,
      Key: fileName,
      })

    let obj = await this.s3.send(cmd)
    obj = await streamToBuffer(obj.Body)
    return obj
  }

  async writeFile(fileName, data, options={}){
    const cmd = new PutObjectCommand({
        Bucket: this.bucket,
        Key: fileName,
        Body: data
    })
    await this.s3.send(cmd)
  }

  async exists(fileName, data, options={}){
    const cmd = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: fileName
    })
    let exists
    try{
       let res = await this.s3.send(cmd)
       if(res.LastModified){
         exists = true
       }
    }catch(e){
      if(e.name === 'NotFound'){
        exists = false
      }else{
        throw e
      }
    }
    return exists
  }
  
  async stat(fileName, data, options={}){
    const cmd = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: fileName
    })
    let result;
    try{
       let data = await this.s3.send(cmd)
       let modified_ms = new Date(data.LastModified).getTime()
       result = new Stats(...Object.values({
            dev: 0,
            mode: 0,
            nlink: 0,
            uid: 0,
            gid: 0,
            rdev: 0,
            blksize: 0,
            ino: 0,
            size: Number(data.ContentLength),
            blocks: 0,
            atimeMs: modified_ms,
            mtimeMs: modified_ms,
            ctimeMs: modified_ms,
            birthtimeMs: modified_ms,
            atime: data.LastModified,
            mtime: data.LastModified,
            ctime: data.LastModified,
            birthtime: data.LastModified
        }));
    }catch(e){
      if(e.name === 'NotFound'){
        throw new Error(`Error: ENOENT: no such file or directory, stat '${fileName}'`)
      }else{
        throw e
      }
    }
    return result
  }

}



module.exports = CyclicS3FSPromises
