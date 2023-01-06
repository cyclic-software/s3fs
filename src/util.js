const path = require('path')
const normalize_path = function (p) {
    p = path.normalize(p);
    p = path.resolve(process.cwd(), p)
    // p = path.relative(require.main.path, p)
    p = p.replace(new RegExp(`^${path.sep}+`, 'g'), '');
    // p = `${p}`
    // p = `s3fs:${p}`
    return p
}

const normalize_dir = function(p){
    p = normalize_path(p)
    p = `${p}${path.sep}`
    return p
}


module.exports = {
    normalize_path,
    normalize_dir
}