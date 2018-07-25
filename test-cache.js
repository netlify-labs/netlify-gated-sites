const path = require('path')
const os = require('os')
const child = require('child_process')
const getSize = require('./getFolderSize')

const cacheFolder = path.join(os.homedir(), '/cache')

child.execSync('ls', {stdio: [0, 1, 2]})

// getSize(cacheFolder, (err, size) => {
//   if (err) {
//     throw err
//   }
//   console.log('Cache size')
//   console.log(size + ' bytes')
//   console.log((size / 1024 / 1024).toFixed(2) + ' MB')
// })
