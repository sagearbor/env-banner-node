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

## Customization Options

The `envBanner()` middleware accepts an optional configuration object with the following properties:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `text` | `string` | Auto-detected (e.g., "DEV", "STAGING") | Custom text to display in the banner |
| `background` | `string` | Auto-detected (red for dev, amber for staging) | Custom background color (hex code) |
| `color` | `string` | Auto-detected (white for dev, dark gray for staging) | Custom text color (hex code) |
| `position` | `string` | `'top'` | Banner position: `'top'`, `'bottom'`, `'top-left'`, `'top-right'`, `'bottom-left'`, `'bottom-right'`, or `'diagonal'` |
| `showHost` | `boolean` | `true` | Whether to display the hostname and port (e.g., " • localhost:3000") |
| `opacity` | `number` | `1.0` (bars/ribbons), `0.5` (diagonal) | Banner opacity from 0.0 (transparent) to 1.0 (fully opaque) |
| `envVarName` | `string` | `'APP_ENV'` | Primary environment variable name to check |

### Examples

#### Custom Text Without Hostname

```javascript
app.use(envBanner({
  text: "DON'T USE REAL DATA",
  showHost: false
}));
// Result: "DON'T USE REAL DATA" (no hostname/port shown)
```

#### Custom Text with Colors

```javascript
app.use(envBanner({
  text: "QA Environment - Test Data Only",
  background: "#9333ea",  // purple
  color: "#ffffff",       // white
  position: "bottom"
}));
// Result: "QA Environment - Test Data Only • localhost:3000" at bottom
```

#### Corner Ribbon Positions

Corner positions display the banner as a diagonal ribbon in the specified corner:

```javascript
// Top-right corner ribbon (default ribbon style)
app.use(envBanner({
  position: 'top-right',
  text: "STAGING"
}));

// Top-left corner ribbon
app.use(envBanner({
  position: 'top-left'
}));

// Bottom-right corner ribbon
app.use(envBanner({
  position: 'bottom-right'
}));

// Bottom-left corner ribbon
app.use(envBanner({
  position: 'bottom-left'
}));
```

#### Full Bar Positions

Full-width bar positions span the entire width of the page:

```javascript
// Top bar (default)
app.use(envBanner({
  position: 'top'
}));

// Bottom bar
app.use(envBanner({
  position: 'bottom'
}));
```

#### Diagonal Banner

The diagonal position creates a full-page diagonal banner from bottom-left to top-right, perfect for highly visible warnings without blocking content:

```javascript
// Default diagonal (50% opacity, click-through enabled)
app.use(envBanner({
  position: 'diagonal',
  text: "DON'T USE REAL DATA"
}));

// Custom opacity diagonal
app.use(envBanner({
  position: 'diagonal',
  opacity: 0.3,  // 30% opaque (very subtle)
  text: "DEVELOPMENT ENVIRONMENT"
}));

// More visible diagonal
app.use(envBanner({
  position: 'diagonal',
  opacity: 0.7,  // 70% opaque
  background: '#ef4444',
  color: '#ffffff',
  text: "STAGING - TEST DATA ONLY",
  showHost: false
}));
```

#### Transparency for Other Positions

The `opacity` option works with all position styles:

```javascript
// Semi-transparent top bar
app.use(envBanner({
  position: 'top',
  opacity: 0.8,
  text: "DEV ENVIRONMENT"
}));

// Semi-transparent corner ribbon
app.use(envBanner({
  position: 'top-right',
  opacity: 0.6,
  text: "STAGING"
}));
```
