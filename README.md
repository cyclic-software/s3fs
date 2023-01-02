# @cyclic.sh/s3fs

Drop in replacement for Node.js fs library backed by AWS s3.


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
- [ ] fs.stat(path, callback)
- [ ] fs.lstat(path, callback)
- [ ] fs.createReadStream(path, [options])
- [ ] fs.createWriteStream(path, [options])
- [ ] fs.unlink(path, callback)
- [ ] fs.rm(path, callback)



refer to fs, s3fs:

- https://github.com/TooTallNate/s3fs
- https://nodejs.org/docs/latest-v0.10.x/api/fs.html#fs_fs_mkdir_path_mode_callback