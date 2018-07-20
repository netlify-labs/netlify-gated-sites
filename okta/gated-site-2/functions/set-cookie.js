import cookie from 'cookie'
import jwt from 'jsonwebtoken'
import util from 'util'

exports.handler = (event, context, callback) => {
  const params = event.queryStringParameters
  const redirectUrl = params.url || process.env.URL
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
  var hour = 3600000
  var twoWeeks = 14 * 24 * hour
  const myCookie = cookie.serialize('nf_jwt', authToken, {
    secure: true,
    httpOnly: true,
    path: '/',
    maxAge: twoWeeks,
    // domain: 'gated-sites-demo-site1.netlify.com'
    // expires: expiresValue
  })

  let decodedToken
  try {
    decodedToken = jwt.decode(params.token, { complete: true })
    console.log('decodedToken')
    console.log(util.inspect(decodedToken, false, null))
  } catch (e) {
    console.log(e)
  }

  // Do redirects via html
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

  console.log(process.env.URL, cookieResponse)

  // set cookie and redirect
  return callback(null, cookieResponse)
}
