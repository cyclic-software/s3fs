const path = require('path')
const process = require('process')
const childProcess = require('child_process')
const v8 = require('v8')
const CyclicS3FSPromises = require('./CyclicS3FSPromises')

const HUNDRED_MEGABYTES = 1000 * 1000 * 100;
var fs = require("fs");

const runSync =  function(client, method, args){
    const bucket = client.bucket
    const config = JSON.stringify(client.config)
    const args_serialized = v8.serialize(args)
    const {error: subprocessError, stdout, stderr} = childProcess.spawnSync(
        `node`, [`${path.resolve(__dirname,'./sync_interface.js')}`,
                bucket,
                config,
                method,
                // args_serialized
            ], {
                input: Buffer.from(args_serialized),
                maxBuffer: HUNDRED_MEGABYTES,
                env: {
                    ...process.env,
                    },
                }
            );

      // console.log({
      //   stdout: stdout?.toString(),
      //   stderr: stderr?.toString(),
      // })
  
      let error = stderr?.toString()
      if(error){
        throw error
      }
      
  
      if(stdout){
        return stdout
      }
}



module.exports = {
    runSync,
}
const run = async function(bucket, config, method, args){
    
    const fs = new CyclicS3FSPromises(bucket, config)
    let result = await fs[method](...args)
    if(typeof result !== 'undefined'){
        if(['stat','exists','readdir'].includes(method)){
            result = v8.serialize(result)
        }
        process.stdout.write(result);
    }
}

if (require.main === module) {

    let _argv = process.argv.slice(2,)
    let bucket = _argv[0]
    let config = JSON.parse(_argv[1])
    let method = _argv[2]
    var buf = '';

    process.stdin.on('data', function(d) {
        buf += d;
      }).on('end', function() {
        let args = v8.deserialize(Buffer.from(buf,'binary'));
        run(bucket, config, method, args)
      }).setEncoding('binary');

}