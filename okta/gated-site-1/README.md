
# Gated Site One

This site is protected by Netlify's [visitor access control](https://www.netlify.com/docs/visitor-access-control/#role-based-access-controls-with-jwt-tokens) feature.

If the user does not have a `nf_jwt` cookie containing a JWT (JSON web token) with specified user roles they will be denied access to the site and redirected elsewhere.

The `nf_jwt` cookie is validated based on the JWT secret set on your netlify site. You can find this under `Settings > Access Control > Visitor Access > Password/JWT Secret`

![image](https://user-images.githubusercontent.com/532272/43340181-56e51552-9190-11e8-86aa-519ca1210179.png)

The `nf_jwt` JWT cookie should contain roles under the `app_metadata.authorization.roles` key like below.

```json
{
  "app_metadata": {
    "authorization": {
      "roles": ["admin", "editor"]
    }
  }
}
```

The types of roles will vary based on your applications needs. These roles are used in the redirect rules setup for the gated site.

For example the below redirect rule states: **If the user has a valid `nf_jwt` JWT cookie with any Role, let them through**. This is configured via `Role=*`

```
# Check for any role via *
/* /:splat 200! Role=*

# Else, redirect them to login portal site.
/* https://your-login-portal-url.com/?site=https://this-gated-site-url.com/:splat 302!
```

Likewise, we can configure this to a specific role set in `app_metadata.authorization.roles` like `Role=admin`. This would only allow admin users into the site:

```
/* /:splat 200! Role=admin

# Else, redirect them to login portal site
/* https://your-login-portal-url.com/?site=https://this-gated-site-url.com/:splat 302!
```

## Setting the cookie

The login portal needs a way to set the `nf_jwt` cookie on your gated site's domain.

To do this we are going to use a lambda function.

See `functions/set-cookie.js`, it sets a cookie and redirects the user back to their originally requested URL.
