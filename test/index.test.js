const fs = require("fs")
const path = require("path")
const BUCKET = process.env.BUCKET
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const s3 = new S3Client({});

const s3fs = require("../src")
const s3fs_promises = require("../src/promises")

beforeAll(async () => {
  console.log('preparing test')
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: 'test/_read.json',
    Body: fs.readFileSync(path.resolve(__dirname,'./_read.json')),
    ContentType: 'application/json'
  }))
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: 'test/_read.jpeg',
    Body: fs.readFileSync(path.resolve(__dirname,'./_read.jpeg')),
    ContentType: 'image/jpeg'
  }))
})

// const bucket = 'cyclic-sh-s3fs-test-bucket-us-east-2'

describe("Basic smoke tests", () => {
  test("test constructor", async () => {
    const fs = s3fs(BUCKET)
    expect(s3fs).toBeDefined()
  })

  test("readFile(json) - promises", async () => {
    const fs = s3fs_promises(BUCKET)
    const d = await fs.readFile('test/_read.json')
    const s = d.toString("utf8")
    const json = JSON.parse(s)
    expect(json).toEqual({key: 'value'})
  })

  test("readFile(json) - callback", async () => {
    await new Promise((resolve,reject)=>{
      const fs = s3fs(BUCKET)
      fs.readFile('test/_read.json', (error,data)=>{
        const json = JSON.parse(data)
        expect(json).toEqual({key: 'value'})
        resolve()
      })
    })
  })

  test("writeFile(json) - promises", async () => {
    let content = JSON.stringify({
      [Date.now()]: Date.now(),
    })
    
    const fs = s3fs_promises(BUCKET)
    await fs.writeFile('test/_write.json',content)

    let x = await fs.readFile('test/_write.json')
    expect(x.toString()).toEqual(content)
  })

  test("writeFile(json) - callback", async () => {
    await new Promise((resolve,reject)=>{
      let content = JSON.stringify({
        [Date.now()]: Date.now(),
      })
      
      const fs = s3fs(BUCKET)
      fs.writeFile('test/_write.json',content,()=>{
        let x = fs.readFileSync('test/_write.json')
        expect(x.toString()).toEqual(content)
        resolve()
      })
    })
  })



  test("readFileSync(json)", async () => {
    const d = require("fs").readFileSync('test/_read.json')

    const fs = s3fs(BUCKET)
    const _d = fs.readFileSync('test/_read.json')

    expect(JSON.parse(d)).toEqual(JSON.parse(_d))
  })


  test("readFileSync(jpeg)", async () => {
    const d = require("fs").readFileSync('test/_read.jpeg')

    const fs = new s3fs(BUCKET)
    const _d = fs.readFileSync('test/_read.jpeg')

    expect(Buffer.compare(d, _d)).toEqual(0)
  })

  test("writeFileSync(json)", async () => {
    let content = JSON.stringify({
      [Date.now()]: Date.now(),
    })

    const fs = new s3fs(BUCKET)
    fs.writeFileSync('test/_write.json', content)
    let x = fs.readFileSync('test/_write.json')

    expect(x.toString()).toEqual(content)
  })

  test("writeFileSync(big_text)", async () => {
    const big_text = require("fs").readFileSync('test/_read_big.txt')

    const fs = new s3fs(BUCKET)
    fs.writeFileSync('test/_write_big.txt', big_text)
    let x = fs.readFileSync('test/_write_big.txt')

    expect(x.toString()).toEqual(big_text.toString())
  })

  test("writeFileSync(jpeg)", async () => {
    const jpeg = require("fs").readFileSync('test/_read.jpeg')

    const fs = new s3fs(BUCKET)
    fs.writeFileSync('test/_write.jpeg', jpeg)
    let jpeg_s3 = fs.readFileSync('test/_write.jpeg')

    expect(Buffer.compare(jpeg_s3, jpeg)).toEqual(0)
  })

  test("exists(json) - promises", async () => {
    const fs = s3fs_promises(BUCKET)
    let exists = await fs.exists('test/_read.json')
    expect(exists).toEqual(true)
    
    let exists_false = await fs.exists('test/_readxxx.json')
    expect(exists_false).toEqual(false)
  })

  test("exists(json) - callback", async () => {
    await new Promise((resolve,reject)=>{
      const fs = s3fs(BUCKET)
      fs.exists('test/_read.json',(error,result)=>{
        expect(result).toEqual(true)
        resolve()
      })
    })

    await new Promise((resolve,reject)=>{
      const fs = s3fs(BUCKET)
      fs.exists('test/_readxxx.json',(error,result)=>{
        expect(result).toEqual(false)
        resolve()
      })
    })
  })

  test("existsSync(json)", async () => {
    const fs = s3fs(BUCKET)
    let exists = fs.existsSync('test/_read.jpeg')
    expect(exists).toEqual(true)
    
    let exists_false = fs.existsSync('test/_readxxx.jpeg')
    expect(exists_false).toEqual(false)
  })


})
