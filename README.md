# @cyclic.sh/s3fs

Drop in replacement for the Node.js `fs` library backed by AWS S3.

[![Discord](https://img.shields.io/discord/895292239633338380)](https://discord.cyclic.sh/support) [![CI](https://github.com/cyclic-software/s3fs/actions/workflows/run_tests.yaml/badge.svg)](https://github.com/cyclic-software/s3fs/actions/workflows/run_tests.yaml) [![semantic-release: angular](https://img.shields.io/badge/semantic--release-angular-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)

[![npm (scoped)](https://img.shields.io/npm/v/@cyclic.sh/s3fs)](https://www.npmjs.com/package/@cyclic.sh/s3fs) ![node-current (scoped)](https://img.shields.io/node/v/@cyclic.sh/s3fs) ![code size](https://img.shields.io/github/languages/code-size/cyclic-software/s3fs) [![@cyclic.sh/s3fs](https://snyk.io/advisor/npm-package/@cyclic.sh/s3fs/badge.svg)](https://snyk.io/advisor/npm-package/@cyclic.sh/s3fs)


## Supported methods
`@cyclic.sh/s3fs` supports the following `fs` methods operating on AWS S3:
- writeFile / writeFileSync
- readFile / readFileSync
- exists / existsSync
- rm / rmSync
- stat / statSync
- unlink / unlinkSync
- readdir / readdirSync
- mkdir / mkdirSync
- rmdir / rmdirSync

## Example Usage
### Installation

```
npm install @cyclic.sh/s3fs
```


Require in the same format as Node.js `fs`, specifying an S3 Bucket: 
- Callbacks and Sync methods:
  ```js
  const fs = require('@cyclic.sh/s3fs')(S3_BUCKET_NAME)
  ```
- Promises
  ```js
  const fs = require('@cyclic.sh/s3fs/promises')(S3_BUCKET_NAME)
  ```

- On cyclic.sh
  -  Alternatively, when using with  <a href="https://cyclic.sh" target="_blank">cyclic.sh</a> or if the environment variable `CYCLIC_BUCKET_NAME` is set to an S3 bucket name, initialization can happen without specifying a bucket:
      ```js
      const fs = require('@cyclic.sh/s3fs') 
      ```
      or
      ```js
      const fs = require('@cyclic.sh/s3fs/promises') 
      ```

### Authentication

Authenticating the client:
- **cyclic.sh** -  
  - When deploying on <a href="https://cyclic.sh" target="_blank">cyclic.sh</a>, credentials are already available in the environment 
  - The bucket name is also available under the `CYCLIC_BUCKET_NAME` variable
  - read more: <a href="https://docs.cyclic.sh/concepts/env_vars#cyclic" target="_blank">Cyclic Environment Variables</a>
- **Local Mode** - When no credentials are available - the client will fall back to using `fs` and the local filesystem with a warning.
- **Environment Variables** - the internal S3 client will use AWS credentials if set in the environment
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
