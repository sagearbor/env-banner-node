// test/express-app.js
// Simple Express test server for env-banner-node

const express = require('express');
const envBanner = require('../lib/middleware');

const app = express();
const PORT = 3000;

// Test different banner configurations
// Uncomment the one you want to test:

// 1. Diagonal banner (default dev environment)
app.use(envBanner({ position: 'diagonal' }));

// 2. Diagonal banner with custom opacity
// app.use(envBanner({ position: 'diagonal', opacity: 0.7 }));

// 3. Top-right corner ribbon
// app.use(envBanner({ position: 'top-right' }));

// 4. Top bar (default)
// app.use(envBanner({ position: 'top' }));

// 5. Custom text and colors
// app.use(envBanner({
//   position: 'diagonal',
//   text: 'TESTING',
//   background: '#9333ea',
//   color: '#ffffff',
//   opacity: 0.6
// }));

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>env-banner-node Test</title>
      <style>
        body {
          font-family: system-ui, sans-serif;
          max-width: 800px;
          margin: 50px auto;
          padding: 20px;
        }
        h1 { color: #1e40af; }
        .test-content {
          background: #f3f4f6;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }
        code {
          background: #e5e7eb;
          padding: 2px 6px;
          border-radius: 4px;
        }
      </style>
    </head>
    <body>
      <h1>env-banner-node Test Page</h1>
      <div class="test-content">
        <h2>Banner Configuration</h2>
        <p>You should see an environment banner on this page.</p>
        <p>Edit <code>test/express-app.js</code> to test different configurations.</p>

        <h3>Available Positions:</h3>
        <ul>
          <li><code>diagonal</code> - Full-screen diagonal stripe</li>
          <li><code>top</code> - Top bar (default)</li>
          <li><code>bottom</code> - Bottom bar</li>
          <li><code>top-right</code> - Top-right corner ribbon</li>
          <li><code>top-left</code> - Top-left corner ribbon</li>
          <li><code>bottom-right</code> - Bottom-right corner ribbon</li>
          <li><code>bottom-left</code> - Bottom-left corner ribbon</li>
        </ul>

        <h3>Custom Options:</h3>
        <ul>
          <li><code>text</code> - Custom banner text</li>
          <li><code>background</code> - Background color (hex)</li>
          <li><code>color</code> - Text color (hex)</li>
          <li><code>opacity</code> - Banner opacity (0.0 to 1.0)</li>
          <li><code>showHost</code> - Show hostname (default: true)</li>
        </ul>
      </div>
    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`Test server running at http://localhost:${PORT}`);
  console.log('Edit test/express-app.js to test different banner configurations');
});
