const { 
  S3Client, 
  GetObjectCommand, 
  PutObjectCommand,
  HeadObjectCommand,
  ListObjectsCommand,
  ListObjectsV2Command
} = require("@aws-sdk/client-s3");
const _path = require('path')
const {Stats} = require('fs')
const util = require('./util')
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
      Key: util.normalize_path(fileName),
      })

    let obj = await this.s3.send(cmd)
    obj = await streamToBuffer(obj.Body)
    return obj
  }

  async writeFile(fileName, data, options={}){
    const cmd = new PutObjectCommand({
        Bucket: this.bucket,
        Key: util.normalize_path(fileName), 
        Body: data
    })
    await this.s3.send(cmd)
  }

  async exists(fileName, data, options={}){
    const cmd = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: util.normalize_path(fileName)
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
        Key: util.normalize_path(fileName)
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
  
  async mkdir(path){
    path = util.normalize_dir(path)
    const cmd = new PutObjectCommand({
        Bucket: this.bucket,
        Key: path,
    })
    try{
        await this.s3.send(cmd)
    }catch(e){
        throw e
    }
  }

  async readdir(path){
    path = util.normalize_dir(path)
    const cmd = new ListObjectsCommand({
        Bucket: this.bucket,
        // StartAfter: path,
        Prefix: path,
        // Delimiter: '/' 
        Delimiter: _path.sep 
    })
    let result;
    try{
        result = await this.s3.send(cmd)
        if(!result.Contents && !result.CommonPrefixes){
            throw new Error('NotFound')
        }
        let trailing_sep = new RegExp(`${_path.sep}$`)

        let folders = (result.CommonPrefixes || []).map(r=>{
            return r.Prefix.replace(path, '').replace(trailing_sep, "");
        })
        let files = (result.Contents || []).map(r=>{
            return r.Key.replace(path, '')
        })
        result = folders.concat(files).filter(r=>{return r.length})
    }catch(e){
      if(e.name === 'NotFound' || e.message === 'NotFound'){
        throw new Error(`Error: ENOENT: no such file or directory, scandir '${path}'`)
      }else{
        throw e
      }
    }
    return result
  }

}



module.exports = CyclicS3FSPromises
