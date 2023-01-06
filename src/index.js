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
    super(bucketName, config={})
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

}


const client = function(bucketName, config={}){
    if(!process.env.AWS_SECRET_ACCESS_KEY){
      console.warn('[s3fs] WARNING: AWS credentials are not set. Using local file system')
      return fs
    }
    return new CyclicS3FS(bucketName, config)
}

module.exports = client
