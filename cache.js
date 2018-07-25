const path = require('path')
const os = require('os')
const cacheMagic = require('cache-me-outside')
const getSize = require('get-folder-size')

const cacheFolder = path.join(os.homedir(), '/cache')
// const cacheFolder = path.resolve('./opt/buildhome/cache')
// const cacheFolder = path.resolve('./cache')

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
  console.log('Success! You are ready to rock')
  getSize(cacheFolder, (err, size) => {
    if (err) {
      throw err
    }
    console.log('Cache size')
    console.log(size + ' bytes')
    console.log((size / 1024 / 1024).toFixed(2) + ' MB')
  })
})
