# @cyclic.sh/s3fs

Drop in replacement for the Node.js `fs` library backed by AWS S3.

Require in the same format as Node.js `fs`, specifying an S3 Bucket: 
- Callbacks and Sync methods:
  ```js
  const fs = require('@cyclic.sh/s3fs')(AWS_BUCKET)
  ```
- Promises
  ```js
  const fs = require('@cyclic.sh/s3fs/promises')(AWS_BUCKET)
  ```

## Supported methods
`@cyclic.sh/s3fs` supports the following `fs` methods operating on AWS S3:
- [x] fs.writeFile(filename, data, [options], callback)
  - [x] promise
  - [x] cb
  - [x] sync
- [x] fs.readFile(filename, [options], callback)
  - [x] promise
  - [x] cb
  - [x] sync
- [x] fs.exists(path, callback)
  - [x] promise
  - [x] cb
  - [x] sync
- [ ] fs.readdir(path, callback)
- [ ] fs.mkdir(path, [mode], callback)
- [ ] fs.rmdir(path, callback)
- [x] fs.stat(path, callback)
  - [x] promise
  - [x] cb
  - [x] sync
- [ ] fs.lstat(path, callback)
- [ ] fs.createReadStream(path, [options])
- [ ] fs.createWriteStream(path, [options])
- [ ] fs.unlink(path, callback)
- [ ] fs.rm(path, callback)

## Example Usage
### Authentication
Authenticating the client can be done with one of two ways:
- **Environment Variables** - the internal S3 client will use AWS credentials set in the environment
  ```
  AWS_REGION
  AWS_ACCESS_KEY_ID
  AWS_SECRET_KEY
  AWS_SECRET_ACCESS_KEY
  ```
- **Client Credentials** - the library also accepts standard S3 client parameters at initialization:
  ```js
  const fs = require('@cyclic.sh/s3fs')(S3_BUCKET_NAME, {
          region: ...
          credentials: {...}
      })
  ```    


### Using Methods
The supported methods have the same API as Node.js `fs`:
- Sync
  ```js
    const fs = require('@cyclic.sh/s3fs')(S3_BUCKET_NAME)
    const json = JSON.parse(fs.readFileSync('test/_read.json'))
  ```
- Callbacks
  ```js
    const fs = require('@cyclic.sh/s3fs')(S3_BUCKET_NAME)
    fs.readFile('test/_read.json', (error,data)=>{
      const json = JSON.parse(data)
    })
  ```
- Promises
  ```js
    const fs = require('@cyclic.sh/s3fs/promises')(S3_BUCKET_NAME)
    async function run(){
      const json = JSON.parse(await fs.readFile('test/_read.json'))
    }
  ```

refer to fs, s3fs:

- https://github.com/TooTallNate/s3fs
- https://nodejs.org/docs/latest-v0.10.x/api/fs.html#fs_fs_mkdir_path_mode_callback