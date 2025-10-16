# Environment Banner for Node.js (`env-banner-node`)

A single, portable Node.js utility to display an environment warning banner (e.g., "DEVELOPMENT", "STAGING") across any Connect/Express-style web framework. One source of truth, one-line usage per app.

This is the official Node.js port of the original [env-banner-python](https://github.com/sagearbor/env-banner-python) utility, providing consistent behavior across your entire technology stack.

## Why This Exists

This library is designed to be:

* **Portable**: A single NPM package that works in any Node.js web project.
* **Bulletproof**: Uses reliable server-side detection and sane defaults. It fails safe by showing a banner if the environment is unknown.
* **Thoughtless**: Requires only a one-line integration for most major frameworks.
* **Framework-Agnostic**: Works with Express, Connect, and any other middleware-compatible Node.js framework.
* **Maintainable**: All banner logic, colors, and rules are in one place.

## Repository Structure

```
env-banner-node/
├── lib/
│   ├── core.js
│   └── middleware.js
├── LICENSE
├── package.json
└── README.md
```

## Installation

Install the package from NPM (once published) or directly from the Git repository:

```bash
npm install git+[https://github.com/sagearbor/env-banner-node.git](https://github.com/sagearbor/env-banner-node.git)
```

## How It Works

The utility provides a standard middleware function.

1.  **Environment Classification**: It determines the current environment by checking the `APP_ENV` environment variable first, then falling back to reliable server-side request details (host, path). It defaults to `dev` if uncertain.
2.  **Middleware Injection**: The middleware intercepts HTML responses. It buffers the response body, injects the banner HTML just before the closing `</body>` tag, updates the `Content-Length` header, and sends the modified response to the user. Non-HTML responses are ignored.

## Configuration

The banner's behavior is controlled primarily by a single environment variable:

**`APP_ENV`** (or `ENVBANNER_ENV`)

Set this variable in your deployment environment (Docker, Kubernetes, etc.).

* `prod` or `production`: **No banner** is shown.
* `staging`, `val`, `preprod`: A **yellow banner** is shown.
* `dev`, `test`, `local`: A **red banner** is shown.
* **If unset**: A **red banner** is shown by default.

## Usage

Require the library and add it as middleware to your application.

### Express.js / Connect

```javascript
const express = require('express');
const envBanner = require('env-banner-node'); // or require('./path/to/lib/middleware');

const app = express();

app.use(envBanner()); // <-- Add this line

app.get('/', (req, res) => {
  res.send('<html><head></head><body><h1>Hello World!</h1></body></html>');
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
```
