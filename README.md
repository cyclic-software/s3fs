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



refer to fs, s3fs:

- https://github.com/TooTallNate/s3fs
- https://nodejs.org/docs/latest-v0.10.x/api/fs.html#fs_fs_mkdir_path_mode_callback