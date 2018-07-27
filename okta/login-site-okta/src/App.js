import React, { Component } from 'react'
import { getUrlParams, parseUrlHash } from './utils'
import oktaLogo from './okta-logo.png'
import './App.css'

// Okta configuration for
const oktaBaseURL = 'https://dev-641447.oktapreview.com'
const oktaClientId = '0oafted8qq8atokyf0h7'

// Gated sites
const protectedSitesList = [
  {
    url: 'https://site-gated-by-okta-1.netlify.com',
    title: 'Site 1'
  },
  {
    url: 'https://site-gated-by-okta-2.netlify.com',
    title: 'Site 2'
  }
]

// where redirect URL gets stored in localStorage
const LocalStorageRedirectUrl = 'redirect_url'

export default class App extends Component {
  state = {
    loggedIn: false
  }
  constructor() {
    super()
    const parsed = getUrlParams()
    // Set redirect URL if found on query param ?site=xyz.com
    if (parsed.site) {
      localStorage.setItem(LocalStorageRedirectUrl, parsed.site)
    }
  }
  componentDidMount() {
    const urlParams = getUrlParams()

    // init okta widget
    const oktaSignIn = new window.OktaSignIn({
      baseUrl: oktaBaseURL,
      oktaClientId: oktaClientId,
      redirectUri: window.location.origin,
      authParams: {
        issuer: oktaBaseURL + '/oauth2/default',
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

            console.log('okta login response', data)

            const redirectUrl = localStorage.getItem(LocalStorageRedirectUrl)
            const hashData = parseUrlHash()

            // if there is a redirect site do the redirect
            if (urlParams.site || hashData.id_token) {
              console.log('do redirest', redirectUrl)
              if (redirectUrl) {
                doRedirect(redirectUrl, data.token)
              }
            }
          })
        //
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
      baseUrl: oktaBaseURL,
      oktaClientId: oktaClientId,
      redirectUri: window.location.origin,
      authParams: {
        issuer: oktaBaseURL + '/oauth2/default',
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
    return protectedSitesList.map((site, i) => {
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
                View {site.title} cookies
              </button>
            </div>
            <div className='site-clear-auth'>
              <button onClick={() => { removeCookie(site.url) }}>
                Clear {site.title} auth cookie
              </button>
            </div>
          </div>
        </div>
      )
    })
  }
  renderContent() {
    const { loggedIn } = this.state

    // Show login widget
    if (!loggedIn) {
      return (
        <div className='app-contents'>
          <h1>Please log in</h1>
          <div id="okta-login-container"></div>
        </div>
      )
    }

    // Else show protected site list
    return (
      <div className='app-contents'>
        <h1>Protected Site List</h1>
        {this.renderSiteList()}
      </div>
    )
  }
  render() {
    const { loggedIn } = this.state

    let logoutButton
    if (loggedIn) {
      logoutButton = (
        <button onClick={this.handleOktaLogout}>
          Okta Sign Out
        </button>
      )
    }

    return (
      <div className="app">
        <header className="app-header">
          <h1>
            Login with <img alt='okta logo' className='okta-logo' src={oktaLogo} />
          </h1>
          {logoutButton}
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
  window.location.href = `${url}/.netlify/functions/delete-cookie`
}
