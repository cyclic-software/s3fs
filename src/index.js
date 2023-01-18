const fs = require('fs')
const CyclicS3FSPromises = require('./CyclicS3FSPromises')
const sync_interface = require('./sync_interface');
const v8 = require('v8')

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

class CyclicS3FS extends CyclicS3FSPromises {
  constructor(bucketName, config={}) {
    super()
    if(process.env.CYCLIC_BUCKET_NAME){
      this.bucket = process.env.CYCLIC_BUCKET_NAME
    }
    this.config = config
    if(bucketName){
      this.bucket = bucketName
    }
  }

  _call(bucketName, config) {
    let client = new CyclicS3FS(bucketName, config)
    return client
  }

  
  readFile(fileName, options, callback) {
    callback = makeCallback(arguments[arguments.length - 1]);
    new Promise(async (resolve,reject)=>{
      try{
        let res = await super.readFile(...arguments)
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
        let res = await super.writeFile(...arguments)
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
        let res = await super.exists(...arguments)
        return resolve(callback(null,res))
      }catch(e){
        return resolve(callback(e))
      }
    })
  }

  stat(fileName, callback) {
    callback = makeCallback(arguments[arguments.length - 1]);
    new Promise(async (resolve,reject)=>{
      try{
        let res = await super.stat(...arguments)
        return resolve(callback(null,res))
      }catch(e){
        return resolve(callback(e))
      }
    })
  }
  
  readdir(path, callback) {
    callback = makeCallback(arguments[arguments.length - 1]);
    new Promise(async (resolve,reject)=>{
      try{
        let res = await super.readdir(...arguments)
        return resolve(callback(null,res))
      }catch(e){
        return resolve(callback(e))
      }
    })
  }
  
  mkdir(path, callback) {
    callback = makeCallback(arguments[arguments.length - 1]);
    new Promise(async (resolve,reject)=>{
      try{
        let res = await super.mkdir(...arguments)
        return resolve(callback(null,res))
      }catch(e){
        return resolve(callback(e))
      }
    })
  }
  
  rm(path, callback) {
    callback = makeCallback(arguments[arguments.length - 1]);
    new Promise(async (resolve,reject)=>{
      try{
        this.stat = super.stat
        this.readdir = super.readdir
        let res = await super.rm(...arguments)
        return resolve(callback(null,res))
      }catch(e){
        return resolve(callback(e))
      }
    })
  }
  
  unlink(path, callback) {
    callback = makeCallback(arguments[arguments.length - 1]);
    new Promise(async (resolve,reject)=>{
      try{
        this.stat = super.stat
        this.readdir = super.readdir
        let res = await super.unlink(...arguments)
        return resolve(callback(null,res))
      }catch(e){
        return resolve(callback(e))
      }
    })
  }
  
  rmdir(path, callback) {
    callback = makeCallback(arguments[arguments.length - 1]);
    new Promise(async (resolve,reject)=>{
      try{
        this.stat = super.stat
        this.readdir = super.readdir
        let res = await super.rmdir(...arguments)
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
    // let exists = res.toString() === 'true' ? true : false
    res = v8.deserialize(res)
    return res
  }

  statSync(fileName) {
    let res = sync_interface.runSync(this,'stat',[fileName])
    res = v8.deserialize(res)
    return res
  }

  readdirSync(path) {
    let res = sync_interface.runSync(this,'readdir',[path])
    res = v8.deserialize(res)
    return res
  }

  mkdirSync(path) {
    return sync_interface.runSync(this,'mkdir',[path])
  }

  rmSync(path) {
    return sync_interface.runSync(this,'rm',[path])
  }

  unlinkSync(path) {
    return sync_interface.runSync(this,'unlink',[path])
  }

  rmdirSync(path) {
    return sync_interface.runSync(this,'rmdir',[path])
  }

}


var client = new CyclicS3FS()
class FSFallback extends Function{
    constructor() {
      super('...args', 'return this._bound._call(...args)')
      this._bound = this.bind(this)
      Object.assign(this._bound,{...fs})
      return this._bound
    }
    _call() {
        let client = new FSFallback()
        return client
    }
}

if(!process.env.AWS_SECRET_ACCESS_KEY){
      console.warn('[s3fs] WARNING: AWS credentials are not set. Using local file system')
      client =  new FSFallback()
}


module.exports = client
