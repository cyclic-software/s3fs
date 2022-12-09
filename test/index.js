
const s3fs = require("../src")


describe("can require", () => {
  test("test true", async () => {
    expect(s3fs).toBeDefined()
  })
})
