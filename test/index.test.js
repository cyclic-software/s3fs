
const s3fs = require("../src")


describe("can require", () => {
  test("test constructor", async () => {
    const fs = new s3fs('test-bucket-name')
    expect(s3fs).toBeDefined()
  })
  test("readFileSync()", async () => {
    const fs = new s3fs('test-bucket-name')
    const d = fs.readFileSync('test/_read.json')
    expect(JSON.parse(d)).toEqual({key: 'value'})
  })
})
