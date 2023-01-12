
const path = require("path")
const BUCKET = process.env.BUCKET

const s3fs = require("../src")

// const bucket = 'cyclic-sh-s3fs-test-bucket-us-east-2'

getMethods = (obj) => Object.getOwnPropertyNames(obj).filter(item => typeof obj[item] === 'function')

const getAllMethods = (obj) => {
  let properties = new Set()
  let currentObj = obj
  do {
    console.log(currentObj)
    Object.getOwnPropertyNames(currentObj).map(item => properties.add(item))
  } while ((currentObj = Object.getPrototypeOf(currentObj)) && Object.getPrototypeOf(currentObj))
  return [...properties.keys()].filter(item => typeof obj[item] === 'function')
}

describe("Basic smoke tests", () => {
  test("test constructor", async () => {
    // console.log(s3fs)
    const fs = s3fs(BUCKET)
    // console.log(fs)
    // console.log(Object.keys(fs))
    // console.log(getMethods(fs))
    console.log(getAllMethods(fs))

    expect(s3fs).toBeDefined()
  })
})
