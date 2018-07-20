import cookie from 'cookie'
import jwt from 'jsonwebtoken'

exports.handler = (event, context, callback) => {
  console.log('event', event)
  const params = event.queryStringParameters || {}
  const redirectUrl = event.headers.referer
  const authToken = params.token

  // invalid token - synchronous
  const secret = 'secret'
  try {
    var valid = jwt.verify(authToken, secret)
    console.log('authToken valid', valid)
  } catch (err) {
    console.log('verify error', err)
    console.log(err.name)
    console.log(err.message)
  }

  const myCookie = cookie.serialize('nf_jwt', null, {
    secure: true,
    httpOnly: true,
    path: '/',
    maxAge: -1,
  })

  const html = `
  <html lang="en">
    <head>
      <meta charset="utf-8">
    </head>
    <body>
      <noscript>
        <meta http-equiv="refresh" content="0; url=${redirectUrl}" />
      </noscript>
    </body>
    <script>
      setTimeout(function(){
        window.location.href = ${JSON.stringify(redirectUrl)}
      }, 0)
    </script>
  </html>`

  const cookieResponse = {
    'statusCode': 200,
    'headers': {
      'Set-Cookie': myCookie,
      'Cache-Control': 'no-cache',
      'Content-Type': 'text/html',
    },
    'body': html
  }

  console.log(`${process.env.URL} Delete`, cookieResponse)

  // set cookie and redirect
  return callback(null, cookieResponse)
}
