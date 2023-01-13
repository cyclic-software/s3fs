const { 
  S3Client, 
  GetObjectCommand, 
  PutObjectCommand,
  HeadObjectCommand,
  ListObjectsCommand,
  ListObjectsV2Command,
  ListObjectVersionsCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
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

class CyclicS3FSPromises extends Function{
  constructor(bucket, config={}) {
    super('...args', 'return this._bound._call(...args)')
    this._bound = this.bind(this)
    if(process.env.CYCLIC_BUCKET_NAME){
      this._bound.bucket = process.env.CYCLIC_BUCKET_NAME
    }
    if(bucket){
      this._bound.bucket = bucket
    }
    this._bound.s3 = new S3Client({...config});

    return this._bound
  }

  _call(bucketName, config) {
    let client = new CyclicS3FSPromises(bucketName, config)
    return client
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
    fileName = util.normalize_path(fileName)
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
        throw new Error(`ENOENT: no such file or directory, stat '${fileName}'`)
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
    const cmd = new ListObjectsV2Command({
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
        throw new Error(`ENOENT: no such file or directory, scandir '${path}'`)
      }else{
        throw e
      }
    }
    return result
  }

  async rm(path){
    try{
        let f = await Promise.allSettled([
            this.stat(path),
            this.readdir(path)
        ])

        if(f[0].status == 'rejected' && f[1].status == 'fulfilled'){
            throw new Error(`SystemError [ERR_FS_EISDIR]: Path is a directory: rm returned EISDIR (is a directory) ${path}`)
        }
        if(f[0].status == 'rejected' && f[1].status == 'rejected'){
            throw f[0].reason
        }

    }catch(e){
        throw e
    }
    path = util.normalize_path(path)
    const cmd = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: path
    })
    try{
        await this.s3.send(cmd)
    }catch(e){
        throw e
    }
    
  }
  
  async rmdir(path){
    try{
        let contents =  await this.readdir(path)
        if(contents.length){
            throw new Error(`ENOTEMPTY: directory not empty, rmdir '${path}'`)
        }
    }catch(e){
        throw e
    }

    path = util.normalize_dir(path)
    const cmd = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: path
    })
    try{
        await this.s3.send(cmd)
    }catch(e){
        throw e
    }
  }

  async unlink(path){
    try{
        let f = await Promise.allSettled([
            this.stat(path),
            this.readdir(path)
        ])

        if(f[0].status == 'rejected' && f[1].status == 'fulfilled'){
            throw new Error(`EPERM: operation not permitted, unlink '${path}'`)
        }
        if(f[0].status == 'rejected' && f[1].status == 'rejected'){
            throw f[0].reason
        }

    }catch(e){
        throw e
    }
    path = util.normalize_path(path)
    const cmd = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: path
    })
    try{
        await this.s3.send(cmd)
    }catch(e){
        throw e
    }
  }


  async deleteVersionMarkers(NextKeyMarker, list=[] ){
        if (NextKeyMarker || list.length === 0) {
          return await this.s3.send(new ListObjectVersionsCommand({
            Bucket: this.bucket,
            NextKeyMarker
          })).then(async ({ DeleteMarkers, Versions, NextKeyMarker }) => {
              if (DeleteMarkers && DeleteMarkers.length) {
                await this.s3.send(new DeleteObjectsCommand({
                  Bucket: this.bucket,
                  Delete: {
                    Objects: DeleteMarkers.map((item) => ({
                      Key: item.Key,
                      VersionId: item.VersionId,
                    })),
                  },
                }))

                return await this.deleteVersionMarkers(NextKeyMarker, [
                  ...list,
                  ...DeleteMarkers.map((item) => item.Key),
                ]);
              }

              if (Versions && Versions.length) {
                await this.s3.send(new DeleteObjectsCommand({
                    Bucket: this.bucket,
                    Delete: {
                      Objects: Versions.map((item) => ({
                        Key: item.Key,
                        VersionId: item.VersionId,
                      })),
                    },
                  }))
                return await this.deleteVersionMarkers(NextKeyMarker, [
                  ...list,
                  ...Versions.map((item) => item.Key),
                ]);
              }
              return list;
            });
        }
        return list;
      };

      

}



module.exports = CyclicS3FSPromises
