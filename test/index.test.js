
const s3fs = require("../src")


describe("can require", () => {
  test("test true", async () => {
    const fs = new s3fs('test-bucket-name')
    expect(s3fs).toBeDefined()
  })
})
