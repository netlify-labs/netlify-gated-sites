const path = require('path')
const os = require('os')
const child = require('child_process')
const cacheMagic = require('cache-me-outside')
const getSize = require('./getFolderSize')
const osDir = path.join(os.homedir(), '/cache')
console.log('OS dir', osDir)
// const cacheFolder = path.resolve('./opt/buildhome/cache')
// const cacheFolder = path.resolve('./cache')
// Netlify cache folder
const yourCustomNameSpace = 'fast-cache'
const cacheFolder = path.join('/opt/build/cache', yourCustomNameSpace)
// const cacheFolder = path.resolve('./cache')
console.log('cacheFolder', cacheFolder)

console.log('Whats in my cache before?')
console.log('------------------')
// child.execSync('ls ../cache', {stdio: [0, 1, 2]})

const oktaModulesDir = path.join(__dirname, 'okta/login-site-okta')

const contentsToCache = [
  {
    // Directory of files to cache
    contents: path.join(__dirname, 'node_modules'),
    // Command or Function to run on `shouldCacheUpdate = true`
    handleCacheUpdate: 'npm ci',
    // Should cache update? Return true or false
    shouldCacheUpdate: async (data, utils) => {
      const nodeModulesChanged = await utils.diff(path.join(__dirname, 'package.json'))
      return nodeModulesChanged
    },
  },
  {
    contents: path.join(oktaModulesDir, 'node_modules'),
    // Command or Function to run on `shouldCacheUpdate = true`
    handleCacheUpdate: 'npm ci',
    // Should cache update? Return true or false
    shouldCacheUpdate: async (data, utils) => {
      const nodeModulesChanged = await utils.diff(path.join(oktaModulesDir, 'package.json'))
      return nodeModulesChanged
    },
  }
]

cacheMagic(cacheFolder, contentsToCache).then((cacheInfo) => {
  console.log('Success! You are ready to rock')
  cacheInfo.forEach((info) => {
    console.log('info.cacheDir', info.cacheDir)
  })
  // getSize(cacheFolder, (err, size) => {
  //   if (err) {
  //     throw err
  //   }
  //   console.log('Cache size')
  //   console.log(size + ' bytes')
  //   console.log((size / 1024 / 1024).toFixed(2) + ' MB')
  //   console.log('Whats in my cache After?')
  //   console.log('------------------')
  //   child.execSync('find ../cache/fast-cache -type d -print -maxdepth 6', {stdio: [0, 1, 2]})
  // })
})
