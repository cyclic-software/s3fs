const fs = require("fs")
const path = require("path")
const BUCKET = 'infra-man-348655018330-us-east-2'
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const s3 = new S3Client({});

const s3fs = require("../src")

beforeAll(async () => {
  console.log('preparing test')
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: 'test/_read.json',
    Body: fs.readFileSync(path.resolve(__dirname,'./_read.json')).toString(),
    ContentType: 'application/json'
  }))
})

// const bucket = 'cyclic-sh-s3fs-test-bucket-us-east-2'

describe("Basic smoke tests", () => {
  test("test constructor", async () => {
    const fs = new s3fs(BUCKET)
    expect(s3fs).toBeDefined()
  })
  test("readFile()", async () => {
    const fs = new s3fs(BUCKET)
    const d = await fs.readFile('test/_read.json')
    const s = d.toString("utf8")
    const json = JSON.parse(s)
    expect(json).toEqual({key: 'value'})
  })


  test("readFileSync()", async () => {
    const fs = new s3fs(BUCKET)
    const d = fs.readFileSync('test/_read.json')
    expect(JSON.parse(d)).toEqual({key: 'value'})
  })
})
