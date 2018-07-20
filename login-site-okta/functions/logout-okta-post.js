import jwt from 'jsonwebtoken'
import cookie from 'cookie'

/* Delete cookie via POST request */
exports.handler = (event, context, callback) => {
  const deleteNetlifyCookie = cookie.serialize('nf_jwt', null, {
    secure: true,
    httpOnly: true,
    path: '/',
    maxAge: -1,
  })
  return callback(null, {
    'statusCode': 200,
    'headers': {
      'Set-Cookie': deleteNetlifyCookie
    },
    'body': JSON.stringify({})
  })
}
