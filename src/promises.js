const fs = require('fs/promises')
const CyclicS3FSPromises = require('./CyclicS3FSPromises')
const client = function(bucketName, config={}){
    if(!process.env.AWS_SECRET_ACCESS_KEY){
      console.warn('[s3fs] WARNING: AWS credentials are not set. Using local file system')
      return fs
    }
    return new CyclicS3FSPromises(bucketName, config)
}

module.exports = client
