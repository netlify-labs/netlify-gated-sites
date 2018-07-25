
# Gated Site One

This site is protected by Netlify's [visitor access control](https://www.netlify.com/docs/visitor-access-control/#role-based-access-controls-with-jwt-tokens) feature.

If the user does not have a `n` cookie containing a JWT (JSON web token) with user roles they will be denied access to the site and redirected to the login portal.

The
```json
{
  "app_metadata": {
    "authorization": {
      "roles": ["admin", "editor"]
    }
  }
}
```
