const path = require('path')
const os = require('os')
const child = require('child_process')
const cacheMagic = require('cache-me-outside')
const getSize = require('./getFolderSize')
const osDir = path.join(os.homedir(), '/cache')
console.log('OS dir', osDir)
// const cacheFolder = path.resolve('./opt/buildhome/cache')
// const cacheFolder = path.resolve('./cache')
const cacheFolder = path.join('/', 'opt', 'build', 'cache')
console.log('cacheFolder', cacheFolder)

console.log('Whats in my cache before?')
console.log('------------------')
child.execSync('ls ../cache', {stdio: [0, 1, 2]})

// Do it
const options = {
  // directorys or files to cache
  // contents: path.join(__dirname, 'two'),
  contents: [
    {
      path: path.join(__dirname, 'okta/gated-site-1/node_modules'),
      // TODO finish Cache Invalidator
      invalidateOn: path.join(__dirname, 'okta/gated-site-1/package.json'),
      command: 'npm install'
    },
    {
      path: path.join(__dirname, 'okta/gated-site-2/node_modules'),
      // TODO finish Cache Invalidator
      invalidateOn: path.join(__dirname, 'okta/gated-site-2/package.json'),
      command: 'npm install'
    },
    {
      path: path.join(__dirname, 'okta/login-site-okta/node_modules'),
      // TODO finish Cache Invalidator
      invalidateOn: path.join(__dirname, 'okta/login-site-okta/package.json'),
      command: 'npm install'
    }
  ],
  // cache folder destination
  cacheFolder: cacheFolder,

  ignoreIfFolderExists: false,
  // TODO finish Cache Invalidator
  invalidateOn: () => {
    return ''
  }
}

cacheMagic(options).then(() => {
  console.log('Success! You are ready to rock. Caches saved')
  getSize(cacheFolder, (err, size) => {
    if (err) {
      throw err
    }
    console.log('Cache size')
    console.log(size + ' bytes')
    console.log((size / 1024 / 1024).toFixed(2) + ' MB')
    console.log('Whats in my cache After?')
    console.log('------------------')
    child.execSync('ls ../cache', {stdio: [0, 1, 2]})

    try {
      child.execSync(`cd && ls ${cacheFolder}`, {stdio: [0, 1, 2]})
    } catch (e) {
      console.log('nada found')
    }
  })
})
