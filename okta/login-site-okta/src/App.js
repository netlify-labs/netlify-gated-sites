import React, { Component } from 'react'
import netlifyIdentity from 'netlify-identity-widget'
import logo from './logo.svg'
import oktaLogo from './okta-logo.png'
import './App.css'

window.netlifyIdentity = netlifyIdentity

var baseURL = 'https://dev-641447.oktapreview.com'
var clientId = '0oafted8qq8atokyf0h7'

const REDIRECT_URL = 'redirect_url'
const sites = [
  {
    url: 'https://gated-sites-demo-site1.netlify.com',
    title: 'Site 1'
  },
  {
    url: 'https://gated-sites-demo-site2.netlify.com',
    title: 'Site 2'
  }
]

export default class App extends Component {
  state = {
    loggedIn: false
  }
  constructor() {
    super()
    console.log('document.referrer', document.referrer)
    const parsed = getParams()
    // Set redirect URL
    if (parsed.site) {
      localStorage.setItem(REDIRECT_URL, parsed.site)
    }
    const redirectUrl = localStorage.getItem(REDIRECT_URL)
  }
  componentDidMount() {
    const urlParams = getParams()

    // init okta widget
    const oktaSignIn = new window.OktaSignIn({
      baseUrl: baseURL,
      clientId: clientId,
      redirectUri: window.location.origin,
      authParams: {
        issuer: baseURL + '/oauth2/default',
        responseType: ['id_token'],
        display: 'page'
      }
    })

    oktaSignIn.session.get((res) => {
      console.log('res', res)
      if (res.status === 'INACTIVE') {
        console.log('User not logged in')
      }
      // Session exists, show logged in state.
      if (res.status === 'ACTIVE') {
        fetch('/.netlify/functions/verify-okta', {
          method: 'POST',
          headers: {
            'Content-type': 'application/json'
          },
          credentials: 'same-origin',
          body: JSON.stringify({
            okta_id: res.id
          })
        })
          .then((response) => {
            return response.json()
          })
          .then(data => {
            this.setState({
              loggedIn: true
            })

            console.log('okta data', data)
            const redirectUrl = localStorage.getItem(REDIRECT_URL) || sites[0].url
            const hashData = parseHash()
            // if there is a redirect site do the redirect
            if (urlParams.site || hashData.id_token) {
              doRedirect(redirectUrl, data.token)
            }
          // reload page
          // window.location.href = window.location.href
          })

        return false
      }
      // No session, show the login form
      oktaSignIn.renderEl({ el: '#okta-login-container' },
        function success(res) {
          res.session.setCookieAndRedirect(document.location.href)
        },
        function error(err) {
          // handle errors as needed
          console.error(err)
        }
      )
    })
  }
  handleOktaLogout = (e) => {
    e.preventDefault()
    const oktaSignIn = new window.OktaSignIn({
      baseUrl: baseURL,
      clientId: clientId,
      redirectUri: window.location.origin,
      authParams: {
        issuer: baseURL + '/oauth2/default',
        responseType: ['id_token'],
        display: 'page'
      }
    })
    oktaSignIn.session.close(function(err) {
      if (err) {
        console.log(err)
      }
      console.log('Ping delete cookie function')
      fetch('/.netlify/functions/logout-okta-post', {
        method: 'POST',
        headers: {
          'Content-type': 'application/json'
        },
        credentials: 'same-origin',
        body: JSON.stringify({})
      })
        .then(data => {
          console.log('okta cookie deleted', data)
          // then reload page
          window.location.href = window.location.origin
        })
    })
  }
  renderSiteList() {
    return sites.map((site, i) => {
      return (
        <div className='site-wrapper' key={i}>
          <div className='site-url'>
            <h2>
              <a href={site.url}>
                Click to visit {site.title}
              </a>
            </h2>
          </div>
          <div className='site-contents'>
            <div className='site-cookies'>
              <button onClick={() => { window.location.href = `${site.url}/cookies/` }}>
                View {site.title} cookies 🍪
              </button>
            </div>
            <div className='site-clear-auth'>
              <button onClick={() => { removeCookie(site.url) }}>
                ❌ {site.title} clear auth cookie
              </button>
            </div>
          </div>
        </div>
      )
    })
  }
  renderContent() {
    const { loggedIn } = this.state
    if (!loggedIn) {
      return <div id="okta-login-container"></div>
    }

    return (
      <div>
        <div>
          <h2>Protected Site List</h2>
          {this.renderSiteList()}
        </div>
        <h2>Okta SSO!</h2>
        <button onClick={this.handleOktaLogout}>
          Okta Sign Out
        </button>
      </div>
    )
  }
  render() {
    return (
      <div className="app">
        <header className="app-header">
          <h1>
            Login w/ <img alt='okta logo' className='okta-logo' src={oktaLogo} />
          </h1>
        </header>

        {this.renderContent()}

      </div>
    )
  }
}

function doRedirect(url, token) {
  window.location.href = `/.netlify/functions/do-login?site=${url}&token=${token}`
}

function removeCookie(url) {
  netlifyIdentity.logout()
  window.location.href = `${url}/.netlify/functions/delete-cookie`
}

/* Not in use
function doLogin(redirectUrl) {
  return generateHeaders().then((headers) => {
    return fetch('/.netlify/functions/handle-login-post', {
      method: "POST",
      headers,
      body: JSON.stringify({
        url: redirectUrl
      })
    })
    .then(response => {
      if (!response.ok) {
        return response.text().then(err => { throw(err) })
      }
      return response.json()
    })
    .catch((err) => {
      console.log('err', err)
    })
  })
}

function generateHeaders() {
  const headers = { "Content-Type": "application/json" };
  if (netlifyIdentity.currentUser()) {
    return netlifyIdentity.currentUser().jwt().then((token) => {
      return { ...headers, Authorization: `Bearer ${token}` };
    })
  }
  return Promise.resolve(headers);
} */

function parseHash() {
  if (!window.location.hash) {
    return {}
  }
  const hash = window.location.hash.substring(1)
  return hash.split('&').reduce((acc, curr) => {
    let temp = curr.split('=')
    acc[temp[0]] = temp[1]
    return acc
  }, {})
}

function getParams(url) {
  const urlParams = {}
  const pattern = /([^&=]+)=?([^&]*)/g
  let params
  let matches
  if (url) {
    const p = url.match(/\?(.*)/) // query
    params = (p && p[1]) ? p[1].split('#')[0] : ''
  } else {
    params = window.location.search.substring(1)
  }
  if (!params) return false
  while (matches = pattern.exec(params)) {
    if (matches[1].indexOf('[') == '-1') {
      urlParams[decode(matches[1])] = decode(matches[2])
    } else {
      const b1 = matches[1].indexOf('[')
      const aN = matches[1].slice(b1 + 1, matches[1].indexOf(']', b1))
      const pN = decode(matches[1].slice(0, b1))

      if (typeof urlParams[pN] !== 'object') {
        urlParams[decode(pN)] = {}
        urlParams[decode(pN)].length = 0
      }

      if (aN) {
        urlParams[decode(pN)][decode(aN)] = decode(matches[2])
      } else {
        Array.prototype.push.call(urlParams[decode(pN)], decode(matches[2]))
      }
    }
  }
  return urlParams
}

function decode(s) {
  return decodeURIComponent(s).replace(/\+/g, ' ')
}
