const path = require('path')
const os = require('os')
const child = require('child_process')
const getSize = require('./getFolderSize')

const cacheFolder = path.join(os.homedir(), '/cache')

console.log('process.cwd()', process.cwd())
child.execSync('ls', {stdio: [0, 1, 2]})
console.log('------------------')
console.log('parent list')
child.execSync('ls ../', {stdio: [0, 1, 2]})
console.log('------------------')
console.log('parent parent list')
child.execSync('ls ../../', {stdio: [0, 1, 2]})
console.log('------------------')
console.log('cache list')
child.execSync('ls ../cache', {stdio: [0, 1, 2]})
// getSize(cacheFolder, (err, size) => {
//   if (err) {
//     throw err
//   }
//   console.log('Cache size')
//   console.log(size + ' bytes')
//   console.log((size / 1024 / 1024).toFixed(2) + ' MB')
// })
