const fs = require('fs')
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");


function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks))); // can call .toString("utf8") on the buffer
  });
}

class CyclicS3FS {
  constructor(bucketName) {
    this.bucket = bucketName
    this.s3 = new S3Client({});
  }

  async readFile(fileName) {
    const cmd = new GetObjectCommand({
      Bucket: this.bucket,
      Key: fileName,
    })
    console.log('about to send')
    let obj = await this.s3.send(cmd)
    console.log('send done, read stream')
    return streamToBuffer(obj.Body)
  }

  readFileSync(fileName) {
    var result = null
    var done = false
    var start = Date.now()
    var timeoutMS = 10 * 1000

    this.readFile(fileName).then((res) => {
      result = res
      done = true
    })
    while(!done && start + timeoutMS > Date.now()) {
      console.log('spin again')
      require('deasync').sleep(100);
    }
    return result;


    // this.readFile(fileName).then((res) => {
    //   console.log('then')
    //   result = res
    //   done = true
    // }).catch((err) => {
    //   console.log('catch')
    //   console.error(err)
    //   result = {msg: `failed to get ${fileName}`, error: err}
    // }).finally(() => {
    //   console.log('finally')
    //   done = true
    //   result = result || {msg: `unknown error ${fileName}`}
    // })
    // console.log('looping')
    // require('deasync').loopWhile(()=> {return !done})
    return result
    // return fs.readFileSync(fileName)
  }
}

module.exports = CyclicS3FS
