
const path = require("path")
const BUCKET = process.env.BUCKET
const { 
   S3Client,
   PutObjectCommand,
  } = require("@aws-sdk/client-s3");
const s3 = new S3Client({});

const s3fs = require("../src") 
const s3fs_promises = require("../src/promises")

afterAll(async () => {
  let markers = await s3fs_promises(BUCKET).deleteVersionMarkers()
  expect(markers.length > 10)

  // need to run twice because need to delete the delete markers 
  markers = await s3fs_promises(BUCKET).deleteVersionMarkers()
  expect(markers.length > 10)
  
  // now should be empty
  markers = await s3fs_promises(BUCKET).deleteVersionMarkers()
  expect(markers.length == 0)
})

beforeAll(async () => {
  const fs = require("fs")
  console.log('preparing test')
  try{

    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: `${path.resolve(__dirname,'./_read.json').replace(new RegExp(`^${path.sep}+`, 'g'), '')}`,
      Body: fs.readFileSync(path.resolve(__dirname,'./_read.json')),
      ContentType: 'application/json'
    }))
    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: `${path.resolve(__dirname,'./_read.jpeg').replace(new RegExp(`^${path.sep}+`, 'g'), '')}`,
      Body: fs.readFileSync(path.resolve(__dirname,'./_read.jpeg')),
      ContentType: 'image/jpeg'
    }))

  }catch(e){
    console.warn(e)
    console.warn('running s3fs in local mode')
  }
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

    const fs = s3fs(BUCKET)
    const _d = fs.readFileSync('test/_read.jpeg')

    expect(Buffer.compare(d, _d)).toEqual(0)
  })

  test("writeFileSync(json)", async () => {
    let content = JSON.stringify({
      [Date.now()]: Date.now(),
    })

    const fs = s3fs(BUCKET)
    fs.writeFileSync('test/_write.json', content)
    let x = fs.readFileSync('test/_write.json')

    expect(x.toString()).toEqual(content)
  })

  test("writeFileSync(big_text)", async () => {
    const big_text = require("fs").readFileSync('test/_read_big.txt')

    const fs = s3fs(BUCKET)
    fs.writeFileSync('test/_write_big.txt', big_text)
    let x = fs.readFileSync('test/_write_big.txt')

    expect(x.toString()).toEqual(big_text.toString())
  })

  test("writeFileSync(jpeg)", async () => {
    const jpeg = require("fs").readFileSync('test/_read.jpeg')

    const fs = s3fs(BUCKET)
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


  test("statSync(json)", async () => {
    const fs = s3fs(BUCKET)
    let stat = fs.statSync('test/_read.json')
    expect(stat).toHaveProperty('size')
    expect(stat).toHaveProperty('birthtime')
    expect(stat.size).toEqual(21)
    
  })

  test("stat(json) - promises", async () => {
    const fs = s3fs_promises(BUCKET)
    let stat = await fs.stat('test/_read.json')
    expect(stat).toHaveProperty('size')
    expect(stat).toHaveProperty('birthtime')
    expect(stat.size).toEqual(21)
    
  })

  test("stat(json) - callback", async () => {
    await new Promise((resolve,reject)=>{
      const fs = s3fs(BUCKET)
      fs.stat('test/_read.json',(error,result)=>{
        expect(result).toHaveProperty('size')
        expect(result).toHaveProperty('birthtime')
        expect(result.size).toEqual(21)
        resolve()
      })
    })
    
  })


  test("mkdir(), readdir() - promises", async () => {
    const fs = s3fs_promises(BUCKET)
    let dir_name = `dir_${Date.now()}`
    try{
      let d = await fs.readdir(dir_name)
    }catch(e){
      expect(e.message).toContain(`ENOENT: no such file or directory`)
    }
    await fs.mkdir(dir_name)
    
    let d = await fs.readdir(dir_name)
    expect(d).toEqual([])

  })
  

  test("mkdir(), readdir() - callback", async () => {
    const fs = s3fs(BUCKET)
    await new Promise((resolve,reject)=>{
      let dir_name = `dir_${Date.now()}`
      fs.mkdir(dir_name, ()=>{
        fs.readdir(dir_name, (error, result)=>{
          expect(result).toEqual([])
          resolve()
        })
      })
    })
    
    await new Promise((resolve,reject)=>{
      let dir_name = `dir_not_there_${Date.now()}`
      fs.readdir(dir_name, (error, result)=>{
          expect(error.message).toContain(`ENOENT: no such file or directory`)
          resolve()
      })
    })

  })
  

  test("readdirSync(), mkdirSync()", async () => {
    const fs = s3fs(BUCKET)
    let dir_name = `dir_${Date.now()}`
    try{
      fs.readdirSync(dir_name)
    }catch(e){
      expect(e).toContain(`ENOENT: no such file or directory`)
    }
    fs.mkdirSync(dir_name)
    let contents = fs.readdirSync(dir_name)
    expect(contents).toEqual([])

  })
  

  test("readdir(), mkdir() - nested", async () => {
    const fs = s3fs_promises(BUCKET)
    let dir_name = `/dir_nested_${Date.now()}`

    await fs.mkdir(`${dir_name}/nested`)
    
    contents = await fs.readdir(dir_name)
    expect(contents).toEqual(['nested'])

    await fs.writeFile(`${dir_name}/file`,Date.now().toString())

    contents = await fs.readdir(dir_name)
    expect(contents).toEqual(['nested', 'file'])

  })

  test("rm() - promises", async () => {
    const fs = s3fs_promises(BUCKET)
    try{
      await fs.rm('test/not_there.json')
    }catch(e){
      expect(e.message).toContain(`ENOENT: no such file or directory`)
    }
    await fs.writeFile('test/aaa.txt','asdfsdf')
    await fs.rm('test/aaa.txt')

    try{
      await fs.stat('test/aaa.txt')
    }catch(e){
      expect(e.message).toContain(`ENOENT: no such file or directory`)
    }
  })
  
  test("rmSync()", async () => {
    const fs = s3fs(BUCKET)
    try{
      fs.rmSync('test/not_there.json')
    }catch(e){
      expect(e).toContain(`ENOENT: no such file or directory`)
    }

    fs.writeFileSync('test/aaa.txt','asdfsdf')
    fs.rmSync('test/aaa.txt')

    try{
      await fs.statSync('test/aaa.txt')
    }catch(e){
      expect(e).toContain(`ENOENT: no such file or directory`)
    }
  })


  test("rm() - callback", async () => {
    
    const fs = s3fs(BUCKET)
    await new Promise((resolve,reject)=>{
      fs.rm('test/not_there.txt', (error,data) =>{
        expect(error.message).toContain(`ENOENT: no such file or directory`)
        resolve()
      })
    })
    fs.writeFileSync('test/aaa.txt','asdfsdf')
    
    await new Promise((resolve,reject)=>{
      fs.rm('test/aaa.txt',(error,data)=>{
        expect(error).toEqual(null)
        resolve()
      })
    })
  })

  test("rmSync(directory)", async () => {
    const fs = s3fs(BUCKET)
    fs.mkdirSync('/dir')

    try{
      fs.rmSync('/dir')
    }catch(e){
      expect(e).toContain(`[ERR_FS_EISDIR]: Path is a directory: rm returned EISDIR (is a directory)`)
    }

  })

  test("unlink() - promises", async () => {
    const fs = s3fs_promises(BUCKET)
    try{
      await fs.rm('test/not_there.json')
    }catch(e){
      expect(e.message).toContain(`ENOENT: no such file or directory`)
    }
    await fs.writeFile('test/aaa.txt','asdfsdf')
    await fs.unlink('test/aaa.txt')

    try{
      await fs.stat('test/aaa.txt')
    }catch(e){
      expect(e.message).toContain(`ENOENT: no such file or directory`)
    }
  })
  
  test("unlinkSync()", async () => {
    const fs = s3fs(BUCKET)
    try{
      fs.unlinkSync('test/not_there.json')
    }catch(e){
      expect(e).toContain(`ENOENT: no such file or directory`)
    }

    fs.writeFileSync('test/aaa.txt','asdfsdf')
    fs.unlinkSync('test/aaa.txt')

    try{
      await fs.statSync('test/aaa.txt')
    }catch(e){
      expect(e).toContain(`ENOENT: no such file or directory`)
    }
  })


  test("unlink() - callback", async () => {
    
    const fs = s3fs(BUCKET)
    await new Promise((resolve,reject)=>{
      fs.unlink('test/not_there.txt', (error,data) =>{
        expect(error.message).toContain(`ENOENT: no such file or directory`)
        resolve()
      })
    })
    fs.writeFileSync('test/aaa.txt','asdfsdf')
    
    await new Promise((resolve,reject)=>{
      fs.unlink('test/aaa.txt',(error,data)=>{
        expect(error).toEqual(null)
        resolve()
      })
    })
  })


  test("unlinkSync(directory)", async () => {
    const fs = s3fs(BUCKET)
    fs.mkdirSync('/dir')

    try{
      fs.unlinkSync('/dir')
    }catch(e){
      expect(e).toContain(`EPERM: operation not permitted, unlink`)
    }

  })


  
  test("rmdir() - promises", async () => {
    const fs = s3fs_promises(BUCKET)
    try{
      await fs.rmdir('not_there')
    }catch(e){
      expect(e.message).toContain(`ENOENT: no such file or directory`)
    }
    let dir_name = `dir_${Date.now()}`
    await fs.mkdir(dir_name)
    await fs.rmdir(dir_name)

    try{
      await fs.readdir(dir_name)
    }catch(e){
      expect(e.message).toContain(`ENOENT: no such file or directory`)
    }
  })
  
  test("rmdirSync()", async () => {
    const fs = s3fs(BUCKET)
    try{
      fs.rmdirSync('not_there')
    }catch(e){
      expect(e).toContain(`ENOENT: no such file or directory`)
    }
    let dir_name = `dir_${Date.now()}`
    fs.mkdirSync(dir_name)
    fs.rmdirSync(dir_name)

    try{
      fs.readdirSync(dir_name)
    }catch(e){
      expect(e).toContain(`ENOENT: no such file or directory`)
    }
  })


  test("rmdir() - callback", async () => {
    
    const fs = s3fs(BUCKET)
    await new Promise((resolve,reject)=>{
      fs.rmdir('not_there', (error,data) =>{
        expect(error.message).toContain(`ENOENT: no such file or directory`)
        resolve()
      })
    })
    let dir_name = `/dir_${Date.now()}`

    fs.mkdirSync(dir_name)
    await new Promise((resolve,reject)=>{
      fs.rmdir(dir_name,(error,data)=>{
        expect(error).toEqual(null)
        resolve()
      })
    })

    await new Promise((resolve,reject)=>{
      fs.rmdir(dir_name, (error,data) =>{
        expect(error.message).toContain(`ENOENT: no such file or directory`)
        resolve()
      })
    })

  })



  test("rmdirSync() - not empty", async () => {
    const fs = s3fs(BUCKET)
    let dir_name = `/nested/dir_${Date.now()}`
    fs.mkdirSync(dir_name)
    try{
      fs.rmdirSync('/nested')
    }catch(e){
      expect(e).toContain(`ENOTEMPTY: directory not empty, rmdir`)
    }

  })


  test("object mode / function mode", async () => {
    let as_object = Object.getOwnPropertyNames(Object.getPrototypeOf(require('../src')))
    let as_function = Object.getOwnPropertyNames(Object.getPrototypeOf(require('../src')(BUCKET)))
    expect(as_function).toEqual(as_object)
  })
  
  test("object mode / function mode - promises", async () => {
    let as_object = Object.getOwnPropertyNames(Object.getPrototypeOf(require('../src/promises')))
    let as_function = Object.getOwnPropertyNames(Object.getPrototypeOf(require('../src/promises')(BUCKET)))
    expect(as_function).toEqual(as_object)
  })


  test("empty_bucket", async () => {
    const fs = s3fs(BUCKET)
    let dir_name = `/nested/dir_${Date.now()}`
    fs.mkdirSync(dir_name)
    try{
      fs.rmdirSync('/nested')
    }catch(e){
      expect(e).toContain(`ENOTEMPTY: directory not empty, rmdir`)
    }

  })


  



})
