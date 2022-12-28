const process = require('process')
const v8 = require('v8')

const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const s3 =  new S3Client({});

function streamToBuffer(stream) {
    return new Promise((resolve, reject) => {
      const chunks = [];
      stream.on("data", (chunk) => chunks.push(chunk));
      stream.on("error", reject);
      stream.on("end", () => resolve(Buffer.concat(chunks))); // can call .toString("utf8") on the buffer
    });
  }
  
const readFile = async function (bucket, fileName) {
    const cmd = new GetObjectCommand({
        Bucket: bucket,
        Key: fileName,
        })

    let obj = await s3.send(cmd)
    obj = await streamToBuffer(obj.Body)
    const serialized = v8.serialize(obj).toString('hex');
    process.stdout.write(serialized);
}

readFile(process.argv[2],process.argv[3])