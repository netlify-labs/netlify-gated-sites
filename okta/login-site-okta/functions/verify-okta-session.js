import fetch from 'node-fetch'
import jwt from 'jsonwebtoken'
import cookie from 'cookie'

const oktaBaseURL = process.env.OKTA_BASE_URL
const oktaApiToken = process.env.OKTA_API_TOKEN
const jwtSecret = process.env.JWT_SECRET

exports.handler = (event, context, callback) => {
  const body = JSON.parse(event.body)

  if (!oktaBaseURL) {
    throw new Error('MISSING REQUIRED ENV VARS. Please set OKTA_BASE_URL')
  }
  if (!oktaApiToken) {
    throw new Error('MISSING REQUIRED ENV VARS. Please set OKTA_API_TOKEN')
  }
  if (!jwtSecret) {
    throw new Error('MISSING REQUIRED ENV VARS. Please set JWT_SECRET')
  }

  // Call our Okta instance and verify session
  fetch(`${oktaBaseURL}/api/v1/sessions/${body.okta_id}`, {
    'headers': {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `SSWS ${oktaApiToken}`
    }
  })
    .then(res => res.json())
    .then(data => {
      console.log('Okta response', data)
      // Bail if session is not ACTIVE
      if (data.status !== 'ACTIVE') {
        return callback(null, {
          statusCode: 500,
          body: JSON.stringify({
            error: 'Session status was not active'
          })
        })
      }

      // Okta session active. Make them a netlify nf_jwt Token
      const date = new Date(data.expiresAt)
      const expiresIn = (date.getTime() / 1000)

      // Customize your user roles here
      const userRoles = ['admin', 'editor']

      // Make new netlify token
      const netlifyTokenData = {
        exp: expiresIn,
        sub: data.userId,
        email: data.login,
        'app_metadata': {
          'authorization': {
            'roles': userRoles
          }
        }
      }

      // Sign Token with our Secret
      const netlifyToken = jwt.sign(netlifyTokenData, jwtSecret)

      // Generate `nf_jwt` cookie string
      const netlifyAccessCookie = cookie.serialize('nf_jwt', netlifyToken, {
        secure: true,
        httpOnly: true,
        path: '/',
        expires: date
      })

      // Return token + set Cookie
      return callback(null, {
        statusCode: 200,
        headers: {
          'Set-Cookie': netlifyAccessCookie,
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({
          token: netlifyToken
        })
      })
    }).catch((error) => {
      console.log('fetch error', error)
      return callback(null, {
        statusCode: 500,
        body: JSON.stringify({
          error: error.message
        })
      })
    })
}
