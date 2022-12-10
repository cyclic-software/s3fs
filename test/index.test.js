
const s3fs = require("../src")

const bucket = 'cyclic-sh-s3fs-test-bucket-us-east-2'

describe("Basic smoke tests", () => {
  test("test constructor", async () => {
    const fs = new s3fs(bucket)
    expect(s3fs).toBeDefined()
  })
  test("readFile()", async () => {
    const fs = new s3fs(bucket)
    const d = await fs.readFile('test/_read.json')
    console.log(d)
    const s = d.toString("utf8")
    const json = JSON.parse(s)
    expect(json).toEqual({key: 'value'})
  })
  // test("readFileSync()", async () => {
  //   const fs = new s3fs(bucket)
  //   const d = fs.readFileSync('test/_read.json')
  //   expect(JSON.parse(d)).toEqual({key: 'value'})
  // })
})
