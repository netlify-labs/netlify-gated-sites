import jwt from 'jsonwebtoken'
import cookie from 'cookie'

exports.handler = (event, context, callback) => {
  const deleteNetlifyCookie = cookie.serialize('nf_jwt', null, {
    secure: true,
    httpOnly: true,
    path: '/',
    maxAge: -1,
  })

  const cookieResponse = {
    'statusCode': 200,
    'headers': {
      'Set-Cookie': deleteNetlifyCookie
    },
    'body': JSON.stringify({})
  }

  console.log(`${process.env.URL} Delete Okta`, cookieResponse)

  // set cookie and redirect
  return callback(null, cookieResponse)
}
