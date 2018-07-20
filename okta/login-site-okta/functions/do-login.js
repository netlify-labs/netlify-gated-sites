import jwt from 'jsonwebtoken'
import cookie from 'cookie'
import parseURL from 'url-parse'

exports.handler = (event, context, callback) => {
  const siteUrl = process.env.URL
  const params = event.queryStringParameters
  const urlData = parseURL(params.site)
  const redirectBaseUrl = urlData.origin
  const redirectUrl = urlData.href
  const { headers } = event
  // No auth cookie found. Return to login site

  const cookieHeader = headers.cookie || ''
  const cookies = cookie.parse(cookieHeader)
  // If no cookie, send back to login portal
  if (!headers.cookie || !cookies.nf_jwt) {
    const returnToLogin = (redirectUrl) ? `${siteUrl}?site=${redirectUrl}` : siteUrl
    return callback(null, {
      statusCode: 302,
      headers: {
        Location: returnToLogin,
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify({})
    })
  }

  let decodedToken
  try {
    decodedToken = jwt.decode(cookies.nf_jwt, { complete: true })
    console.log('decodedToken', decodedToken)
  } catch (e) {
    console.log(e)
    // Token invalid
  }

  // If other auth provider than netlify identity
  // verify the JWT against your secret
  if (!decodedToken.payload) {
    return callback(null, {
      statusCode: 401,
      body: JSON.stringify({
        message: `Your token is invalid. Logout and log back in at ${siteUrl}`,
      })
    })
  }

  // Make new token
  const newTokenData = {
    sub: decodedToken.payload.sub,
    exp: decodedToken.payload.exp,
    email: decodedToken.payload.email,
    'app_metadata': {
      ...decodedToken.payload.app_metadata,
      'authorization': {
        'roles': ['admin', 'editor']
      }
    },
    user_metadata: decodedToken.payload.user_metadata
  }

  const yourSuperSecret = 'secret'
  const newToken = jwt.sign(newTokenData, yourSuperSecret)

  /* Return this instead of redirect for debugging
  return callback(null, {
    statusCode: 200,
    body: JSON.stringify({
      event: event,
      context: context,
      cookies: cookies,
      decodedToken: decodedToken,
      newToken: newToken,
      clientContext: context.clientContext,
      urlData: urlData
    })
  })
  /**/

  // Do redirect
  const r = `${redirectBaseUrl}/.netlify/functions/set-cookie?token=${newToken}&url=${redirectUrl}`
  console.log('Ping next function', r)
  return callback(null, {
    statusCode: 302,
    headers: {
      Location: r,
      'Cache-Control': 'no-cache',
    },
    body: JSON.stringify({})
  })
}
