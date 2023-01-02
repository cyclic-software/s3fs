const fs = require('fs')
const path = require('path')
const { S3Client, GetObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
// const { STSClient, GetCallerIdentityCommand } = require("@aws-sdk/client-sts"); // CommonJS import

const childProcess = require('child_process')
const v8 = require('v8')
const HUNDRED_MEGABYTES = 1000 * 1000 * 100;
const sync_interface = require('./sync_interface')

function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks))); // can call .toString("utf8") on the buffer
  });
}

class CyclicS3FS {
  constructor(bucketName='', config={}) {
    this.bucket = bucketName
    this.config = config
    this.s3 = new S3Client({...config});
    this.isLocal = !bucketName
    // this.isLocalVerified = false
  }

  // isLocal() {
  //   This needs async call to STS
  //   if (!this.isLocal && !this.isLocalVerified) {
  //     const client = new STSClient(config);
  //     const command = new GetCallerIdentityCommand(input);
  //     const response = await client.send(command);
  //   }
  // }

  async readFile(fileName) {
    if (this.isLocal){
      return fs.readFile(fileName)
    }
    const cmd = new GetObjectCommand({
      Bucket: this.bucket,
      Key: fileName,
      })

    let obj = await this.s3.send(cmd)
    obj = await streamToBuffer(obj.Body)
    return obj
  }

  async writeFile(fileName, data, options={}) {
    if (this.isLocal){
      return fs.writeFile(fileNAme, data, options)
    }
    const cmd = new PutObjectCommand({
        Bucket: this.bucket,
        Key: fileName,
        Body: data
    })

    return await this.s3.send(cmd)
  }

  readFileSync(fileName) {
    if (this.isLocal){
      return fs.readFileSync(fileNAme)
    }
    return sync_interface.runSync(this,'readFile',[fileName])
  }

  writeFileSync(fileName, data, options={}) {
    if (this.isLocal){
      return fs.writeFileSync(fileNAme, data, options)
    }
    return sync_interface.runSync(this,'writeFile',[fileName, data, options])
  }
}

module.exports = CyclicS3FS
