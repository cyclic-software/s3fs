const fs = require('fs')
const path = require('path')
const { 
  S3Client, 
  GetObjectCommand, 
  PutObjectCommand,
  HeadObjectCommand,
} = require("@aws-sdk/client-s3");
const sync_interface = require('./sync_interface');
function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks))); // can call .toString("utf8") on the buffer
  });
}

// Ensure that callbacks run in the global context. Only use this function
// for callbacks that are passed to the binding layer, callbacks that are
// invoked from JS already run in the proper scope.
function makeCallback(cb) {
  if (cb === undefined) {
    return rethrow();
  }

  if (typeof cb !== 'function') {
    throw new TypeError('callback must be a function');
  }

  return function() {
    return cb.apply(null, arguments);
  };
}


class CyclicS3FS {
  constructor(bucketName, config={}) {
    this.bucket = bucketName
    this.config = config
    this.s3 = new S3Client({...config});
  }

  promises = {
    readFile: async (fileName ,options) => {
      const cmd = new GetObjectCommand({
        Bucket: this.bucket,
        Key: fileName,
        })
  
      let obj = await this.s3.send(cmd)
      obj = await streamToBuffer(obj.Body)
      return obj
    },

    writeFile: async (fileName, data, options={}) => {
      const cmd = new PutObjectCommand({
          Bucket: this.bucket,
          Key: fileName,
          Body: data
      })
      await this.s3.send(cmd)
    },

    exists: async (fileName, data, options={}) => {
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
        }
      }
      return exists
    },

  }


  
  readFile(fileName, options, callback) {
    callback = makeCallback(arguments[arguments.length - 1]);
    new Promise(async (resolve,reject)=>{
      try{
        let res = await this.promises.readFile(...arguments)
        return resolve(callback(null,res))
      }catch(e){
        return resolve(callback(e))
      }
    })
  }
  
  writeFile(fileName, data, options, callback) {
    callback = makeCallback(arguments[arguments.length - 1]);
    new Promise(async (resolve,reject)=>{
      try{
        let res = await this.promises.writeFile(...arguments)
        return resolve(callback(null,res))
      }catch(e){
        return resolve(callback(e))
      }
    })
  }
  
  exists(fileName, callback) {
    callback = makeCallback(arguments[arguments.length - 1]);
    new Promise(async (resolve,reject)=>{
      try{
        let res = await this.promises.exists(...arguments)
        return resolve(callback(null,res))
      }catch(e){
        return resolve(callback(e))
      }
    })
  }
  

  readFileSync(fileName) {
    return sync_interface.runSync(this,'readFile',[fileName])
  }
  
  writeFileSync(fileName, data, options={}) {
    return sync_interface.runSync(this,'writeFile',[fileName, data, options])
  }

  existsSync(fileName) {
    let res = sync_interface.runSync(this,'exists',[fileName])
    let exists = res.toString() === 'true' ? true : false
    return exists
  }



}

module.exports = CyclicS3FS
