# Netlify Gated Sites

This repo demonstrates how you can use [Role Based Access Controls](https://www.netlify.com/docs/visitor-access-control/#role-based-access-controls-with-jwt-tokens), [Netlify functions](https://www.netlify.com/docs/functions/) and [role based `_redirects`](https://www.netlify.com/docs/redirects/#role-based-redirect-rules) to create single sign on flows.

> `TLDR;` You can use netlify functions + **any** identity provider (Auth0, Okta, Netlify identity etc) to gate as  many Netlify sites as they want!

## Examples

- [Using Okta](./okta)
- ... add your provider here!

## How does it work?

The protected sites can only be access *after* logging in through the Login Portal site.

<img src="https://user-images.githubusercontent.com/532272/43798056-3b4f9acc-9a3e-11e8-9a5a-3f409fee5be1.jpg"/>

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

## Demo

<a href="https://www.youtube.com/watch?v=cxieiiwms5k">
	<img src="https://user-images.githubusercontent.com/532272/43798056-3b4f9acc-9a3e-11e8-9a5a-3f409fee5be1.jpg"/>
</a>
