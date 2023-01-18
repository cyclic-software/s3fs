const fs = require('fs/promises')
const CyclicS3FSPromises = require('./CyclicS3FSPromises')
var client = new CyclicS3FSPromises()
class FSPromisesFallback extends Function{
    constructor() {
      super('...args', 'return this._bound._call(...args)')
      this._bound = this.bind(this)
      Object.assign(this._bound,{...fs})
      return this._bound
    }
    _call() {
        let client = new FSPromisesFallback()
        return client
    }
}

if(!process.env.AWS_SECRET_ACCESS_KEY){
      console.warn('[s3fs] WARNING: AWS credentials are not set. Using local file system')
      client =  new FSPromisesFallback()
}

module.exports = client
