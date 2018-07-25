const path = require('path')
const os = require('os')
const getSize = require('./getFolderSize')

const cacheFolder = path.join(os.homedir(), '/cache')

getSize(cacheFolder, (err, size) => {
  if (err) {
    throw err
  }
  console.log('Cache size')
  console.log(size + ' bytes')
  console.log((size / 1024 / 1024).toFixed(2) + ' MB')
})
