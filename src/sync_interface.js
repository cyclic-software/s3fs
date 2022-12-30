const path = require('path')
const process = require('process')
const childProcess = require('child_process')
const v8 = require('v8')
const s3fs = require("./index.js")
const HUNDRED_MEGABYTES = 1000 * 1000 * 100;

const runSync =  function(client, method, args){
    const bucket = client.bucket
    const config = JSON.stringify(client.config)
    const args_serialized = v8.serialize(args).toString('hex');
    const {error: subprocessError, stdout, stderr} = childProcess.spawnSync(
        `node`, [`${path.resolve(__dirname,'./sync_interface.js')}`,
                bucket,
                config,
                method,
                args_serialized
            ], {
                maxBuffer: HUNDRED_MEGABYTES,
                env: {
                    ...process.env,
                    },
                }
            );

    //   console.log({
    //     stdout: stdout?.toString(),
    //     stderr: stderr?.toString(),
    //   })
  
      let error = stderr?.toString()
      if(error){
        throw error
      }
      
  
      let result = stdout?.toString()
      if(result){
        const r = v8.deserialize(Buffer.from(result,'hex'));
        return r
      }
}



module.exports = {
    runSync,
}
const run = async function(bucket, config, method, args){
        
    const fs = new s3fs(bucket, config)
    let result = await fs[method](...args)

    const serialized = v8.serialize(result).toString('hex');
    process.stdout.write(serialized);
}

if (require.main === module) {
    let _argv = process.argv.slice(2,)
    let bucket = _argv[0]
    let config = JSON.parse(_argv[1])
    let method = _argv[2]
    let args = _argv[3]
    args = v8.deserialize(Buffer.from(args,'hex'));
    run(bucket, config, method, args)
}