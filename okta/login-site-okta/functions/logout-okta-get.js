import jwt from 'jsonwebtoken'
import cookie from 'cookie'

/* Delete cookie via GET request */
exports.handler = (event, context, callback) => {
  // Set maxAge to -1 to delete cookie
  const deleteNetlifyCookie = cookie.serialize('nf_jwt', null, {
    secure: true,
    httpOnly: true,
    path: '/',
    maxAge: -1,
  })

  // generate HTML with redirect
  const html = `
  <html lang="en">
    <head>
      <meta charset="utf-8">
    </head>
    <body>
      <noscript>
        <meta http-equiv="refresh" content="0; url=${process.env.URL}" />
      </noscript>
    </body>
    <script>
      setTimeout(function(){
        window.location.href = ${JSON.stringify(process.env.URL)}
      }, 0)
    </script>
  </html>`

  // set cookie and send back html with redirect
  return callback(null, {
    'statusCode': 200,
    'headers': {
      'Set-Cookie': deleteNetlifyCookie,
      'Cache-Control': 'no-cache',
      'Content-Type': 'text/html',
    },
    'body': html
  })
}
