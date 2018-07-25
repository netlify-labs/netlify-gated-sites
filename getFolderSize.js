const fs = require('fs')
const path = require('path')

function eachAsync(arr, parallelLimit, iteratorFn, cb) {
  var pending = 0
  var index = 0
  var lastIndex = arr.length - 1
  var called = false
  var limit
  var callback
  var iterate

  if (typeof parallelLimit === 'number') {
    limit = parallelLimit
    iterate = iteratorFn
    callback = cb || function noop() {}
  } else {
    iterate = parallelLimit
    callback = iteratorFn || function noop() {}
    limit = arr.length
  }

  if (!arr.length) { return callback() }

  var iteratorLength = iterate.length

  var shouldCallNextIterator = function shouldCallNextIterator() {
    return (!called && (pending < limit) && (index < lastIndex))
  }

  var iteratorCallback = function iteratorCallback(err) {
    if (called) { return }

    pending--

    if (err || (index === lastIndex && !pending)) {
      called = true

      callback(err)
    } else if (shouldCallNextIterator()) {
      processIterator(++index)
    }
  }

  var processIterator = function processIterator() {
    pending++

    var args = (iteratorLength === 2) ? [arr[index], iteratorCallback] : [arr[index], index, iteratorCallback]

    iterate.apply(null, args)

    if (shouldCallNextIterator()) {
      processIterator(++index)
    }
  }

  processIterator()
}

function readSizeRecursive(seen, item, ignoreRegEx, callback) {
  let cb
  let ignoreRegExp

  if (!callback) {
    cb = ignoreRegEx
    ignoreRegExp = null
  } else {
    cb = callback
    ignoreRegExp = ignoreRegEx
  }

  fs.lstat(item, function lstat(e, stats) {
    let total = !e ? (stats.size || 0) : 0

    if (stats) {
      if (seen.has(stats.ino)) { return cb(null, 0) }

      seen.add(stats.ino)
    }

    if (!e && stats.isDirectory()) {
      fs.readdir(item, (err, list) => {
        if (err) { return cb(err) }

        eachAsync(
          list,
          (dirItem, next) => {
            readSizeRecursive(
              seen,
              path.join(item, dirItem),
              ignoreRegExp,
              (error, size) => {
                if (!error) { total += size }

                next(error)
              }
            )
          },
          (finalErr) => {
            cb(finalErr, total)
          }
        )
      })
    } else {
      if (ignoreRegExp && ignoreRegExp.test(item)) {
        total = 0
      }

      cb(e, total)
    }
  })
}

module.exports = (...args) => {
  args.unshift(new Set())

  return readSizeRecursive(...args)
}
