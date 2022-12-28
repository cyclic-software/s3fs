const fs = require('fs')
const path = require('path')
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const childProcess = require('child_process')
const v8 = require('v8')
const HUNDRED_MEGABYTES = 1000 * 1000 * 100;

function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks))); // can call .toString("utf8") on the buffer
  });
}

async function sleep(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms))
  console.log('sleep')
  return 'done sleep'
}

class CyclicS3FS {
  constructor(bucketName) {
    console.log(`new CyclicS3FS('${bucketName}')`)
    this.bucket = bucketName
    this.s3 = new S3Client({});
  }

  async readFile(fileName) {
    const cmd = new GetObjectCommand({
      Bucket: this.bucket,
      Key: fileName,
    })

    let obj = await this.s3.send(cmd)
    return streamToBuffer(obj.Body)
  }


  

  readFileSync(fileName) {

    const {error: subprocessError, stdout, stderr} = childProcess.spawnSync(
      `node`, [`${path.resolve(__dirname,'./readFileSync.js')}`, this.bucket, fileName], {
			maxBuffer: HUNDRED_MEGABYTES,
			env: {
				...process.env,
			},
		});

    // console.log({
    //   stdout: stdout?.toString(),
    //   stderr: stderr?.toString(),
    // })

    let error = stderr?.toString()
    if(error){
      throw error
    }
    

    let result = stdout?.toString()
    if(result){
      const r = v8.deserialize(Buffer.from(result,'hex'));
      return r
    }
}
}

module.exports = CyclicS3FS
