# @cyclic.sh/s3fs

Drop in replacement for the Node.js `fs` library backed by AWS S3. 
Use the same methods as `fs` and enjoy the convenience of S3 buckets without the hassle of AWS. 

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
- Promises (for async/await functions):
  ```js
  const fs = require('@cyclic.sh/s3fs/promises')(S3_BUCKET_NAME)
  ```

- On Cyclic.sh
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
  - When deploying on <a href="https://cyclic.sh" target="_blank">cyclic.sh</a>, credentials are already available in the environment.
  - The bucket name is also available under the `CYCLIC_BUCKET_NAME` variable.
  - Read more: <a href="https://docs.cyclic.sh/concepts/env_vars#cyclic" target="_blank">Cyclic Environment Variables</a>
  
- **Local Mode** - When no credentials are available, the client will fall back to using `fs` and the local filesystem. A warning will show in the terminal.
  
- **Environment Variables** - The internal S3 client will use AWS credentials if they are set in the local environment. Variables provided by Cyclic.sh may be found in "Data/Storage" tab in the user's Cyclic dashboard and will reset after 60 minutes.
  ```
  AWS_REGION
  AWS_ACCESS_KEY_ID
  AWS_SECRET_KEY
  AWS_SECRET_ACCESS_KEY
  ```

- **Client Credentials** - The library also accepts standard S3 client parameters at initialization. For example: 
  ```js
  const fs = require('@cyclic.sh/s3fs')(S3_BUCKET_NAME, {
          region: ...
          credentials: {...}
      })
  ```   

### Using Methods

The supported methods have the same API as Node.js `fs` and can be written as follows:
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
- Promises (async/await)
  ```js
    const fs = require('@cyclic.sh/s3fs/promises')(S3_BUCKET_NAME)
    async function run(){
      const json = JSON.parse(await fs.readFile('test/_read.json'))
    }
  ```
