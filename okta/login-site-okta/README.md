# Login Site

This [site](https://site-gated-by-okta-1.netlify.com/) gates multiple Netlify sites via one login portal.

A.k.a. Single Sign On

> `TLDR;` You can use netlify functions + any identity provider (Auth0, Okta, Netlify identity etc) to gate as  many Netlify sites as they want!

The protected sites can only be access *after* logging in through the [Login Portal site](https://site-gated-by-okta-1.netlify.com/).

## Login Portal

https://site-gated-by-okta-1.netlify.com/

## Gated Sites

These are the sites that are protected

- [Gated Site 1](https://site-gated-by-okta-1.netlify.com/)
- [Gated Site 2](https://site-gated-by-okta-2.netlify.com/)

## How does it work?

We are using a combination of [Netlify functions](https://www.netlify.com/docs/functions/), [Access Control](https://www.netlify.com/docs/visitor-access-control/#role-based-access-controls-with-jwt-tokens) and [role based `_redirects`](https://www.netlify.com/docs/redirects/#role-based-redirect-rules)


## Setting up Okta

1. Setup the okta widget

  (optional) setting up 2 factor auth https://stackoverflow.com/questions/46333510/okta-sign-in-widget-mfa

2. Then create API token https://dev-652264-admin.oktapreview.com/admin/access/api/tokens

3. Then add Netlify env vars

## Troubleshooting

If you see "Unable to connect to the server. Please check your network connection." message from the Okta widget. Make sure you have the correct okta client ID and base URL set. They should look like base url `https://dev-342521.oktapreview.com` and client ID `0oafn963hdsjY6P0h7`
