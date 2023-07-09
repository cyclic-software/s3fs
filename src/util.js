const path = require('path')
const normalize_path = function (p) {
    p = p.split('\\').join('/')

    let targetPath = p
    if (targetPath[0] === '/') targetPath = targetPath.substr(1, targetPath.length - 1)

    let lastChar = targetPath[targetPath.length - 1]
    if (lastChar !== '/') targetPath += '/'

    return targetPath
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
