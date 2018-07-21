
exports.handler = (event, context, callback) => {
  console.log('event', event)
  console.log('context', context)
  console.log(event.headers)
  return callback(null, {
    statusCode: 200,
    body: JSON.stringify({
      data: 'foo'
    })
  })
}
