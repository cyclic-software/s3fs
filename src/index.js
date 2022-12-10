console.log('@cyclic.sh/s3fs: index.js')
const fs = require('fs')

class CyclicS3FS {
  constructor(bucketName) {
    console.log(`new CyclicS3FS('${bucketName}')`)
  }

  readFileSync(fileName) {
    return fs.readFileSync(fileName)
  }
}

module.exports = CyclicS3FS
