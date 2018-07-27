# Okta Login Site

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

```

              ┌────────────────────────────────────┐                                                     
              │     User visits the gated site     │                                                     
              │                                    │                                                     
              │             gated.com              │◀───────────────────────────────────────────────────┐
              │                                    │                                                    │
              └────────────────────────────────────┘                                                    │
                                 │                                                                      │
                                 ▼                                                                      │
     ┌──────────────────────────────────────────────────────┐                                           │
     │             Netlify role based redirects             │                                           │
     │        check for 'nf_jwt' cookie + user role         │                                           │
     │                                                      │                                           │
     │            via Netlify `_redirect` rule:             │                                           │
     │                                                      │                                           │
     │                /* /:splat 200! Role=*                │                                           │
     └──────────────────────────────────────────────────────┘                                           │
                                 │                                                                      │
                   Has valid jwt + correct role?                                                        │
                                 │                                                                      │
                                 │                                                                      │
            ┌──────yes───────────┴──────────────No────────────┐                                         │
            │                                                 │                                         │
            │                                                 │                                         │
            │                                                 │                                         │
            ▼                                                 ▼                                         │
 ┌─────────────────────┐    ┌───────────────────────────────────────────────────────────────────┐       │
 │      Success!       │    │                                                                   │       │
 │                     │    │                                                                   │       │
 │   Show gated site   │    │                 Redirect to Login Portal Site via                 │       │
 │                     │    │                     Netlify `_redirect` rule:                     │       │
 └─────────────────────┘    │                                                                   │       │
                            │  /* https://login-portal.com/?site=https://gated.com/:splat 302!  │       │
                            │                                                                   │       │
                            │                                                                   │       │
                            └───────────────────────────────────────────────────────────────────┘       │
                                                              │                                         │
                                                              ▼                                         │
                                         ┌─────────────────────────────────────────┐                    │
                                         │                                         │                    │
                                         │       User logs into Portal Site        │                    │
                                         │                                         │                    │
                                         └─────────────────────────────────────────┘                    │
                                                              │                                         │
                                                              │                                         │
                                                              ▼                                         │
                                           ┌─────────────────────────────────────┐                      │
                                           │    Netlify function triggered to    │                      │
                                           │         verify Okta session         │                      │
                                           │                                     │                      │
                                           └─────────────────────────────────────┘                      │
                                                              │                                         │
                                                              │                                         │
                                                    is Okta session valid?                              │
                                                              │                                         │
                                                              │                                         │
                                 ┌───────────No───────────────┴─────yes─────┐                           │
                                 │                                          │                           │
                                 │                                          │                           │
                                 │                                          │                           │
                                 │                                          │                           │
                                 ▼                                          ▼                           │
               ┌──────────────────────────────────┐     ┌──────────────────────────────────────┐        │
               │  Redirect back to login portal   │     │                                      │        │
               │       & show error message       │     │     Generate `nf_jwt` cookie and     │        │
               │                                  │     │   set cookie in function response    │        │
               │        "Session invalid"         │     │                                      │        │
               └──────────────────────────────────┘     └──────────────────────────────────────┘        │
                                                                            │                           │
                                                                            │                           │
                                                                            │                           │
                                                                            ▼                           │
                                                       ┌─────────────────────────────────────────┐      │
                                                       │     Then redirect back to original      │      │
                                                       │  referrer to set cookie on gated site   │      │
                                                       │                                         │      │
                                                       │   gated-site.com/set-cookie Function    │      │
                                                       └─────────────────────────────────────────┘      │
                                                                            │                           │
                                                                            ▼                           │
                                                          ┌───────────────────────────────────┐         │
                                                          │                                   │         │
                                                          │  Set nf_jwt cookie on gated.com   │         │
                                                          │                                   │         │
                                                          └───────────────────────────────────┘         │
                                                                            │                           │
                                                                            │                           │
                                                                            └─────────────┐             │
                                                                                          │             │
                                                                                          ▼             │
                                                                              ┌──────────────────────┐  │
                                                                              │                      │  │
                                                                              │ Redirect to original │  │
                                                                              │    URL requested     │──┘
                                                                              │                      │   
                                                                              └──────────────────────┘   
```

## Setting up Okta

1. Setup the okta widget

    In the application, we need to include the okta widget and setup the configuration needed.

    Follow the [okta widget instructions](https://developer.okta.com/code/javascript/okta_sign-in_widget)

    (Optional) setting up 2 factor authentication https://stackoverflow.com/questions/46333510/okta-sign-in-widget-mfa

    (Optional) Self registration flow can be setup [like this](https://support.okta.com/help/Documentation/Knowledge_Article/Okta-Self-Service-Registration-361544503)

2. Create an Okta API token

    To verify the okta session is valid, we need to make an API call to okta with the data returned from a successful widget login.

    `https://dev-YOUR_OKTA_ID-admin.oktapreview.com/admin/access/api/tokens`

    Once we have the okta token, we need to set that in the netlify ENV variables

3. Add Netlify env vars to your site

    `OKTA_API_TOKEN` - your token from previous step

    `OKTA_BASE_URL` - your Okta portal base URL. Example: `https://dev-641447.oktapreview.com`

    `JWT_SECRET` - The secret used to sign the `nf_jwt` cookie being used for role based redirects

## Troubleshooting

If you see "Unable to connect to the server. Please check your network connection." message from the Okta widget. Make sure you have the correct Okta client ID and base URL set. They should look like base url `https://dev-342521.oktapreview.com` and client ID `0oafn963hdsjY6P0h7`
