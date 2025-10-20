# Test Directory

This directory contains test files for `env-banner-node`. It is excluded from the npm package but included in the git repository for development and testing.

## Files

### 1. `express-app.js` - Express Test Server

A simple Express server to test the banner middleware in a real Node.js environment.

**Requirements:**
```bash
npm install express
```

**Run:**
```bash
node test/express-app.js
```

Then open http://localhost:3000 in your browser.

**Customize:**
Edit the middleware configuration in `express-app.js` to test different banner options:
- Different positions (bottom is default, or diagonal, top, corners)
- Custom text, colors, and opacity
- Show/hide hostname

**Default behavior:**
- If no position is specified, banner appears at the **bottom** of the page

### 2. `test-diagonal.html` - Standalone HTML Test

An interactive HTML file to visually test the diagonal banner fix without needing a Node.js server.

**Run:**
```bash
# Open directly in browser
open test/test-diagonal.html
# or
xdg-open test/test-diagonal.html  # Linux
```

**Features:**
- Interactive buttons to test different height values (8vh, 10vh, 12vh, 15vh)
- Test different opacity levels
- Compare OLD (broken) vs NEW (fixed) implementation
- No dependencies required

## Testing Workflow

### Before Publishing to NPM

1. **Test with npm link:**
   ```bash
   # In env-banner-node directory
   npm link

   # In your test project
   npm link env-banner-node
   ```

2. **Test standalone HTML:**
   ```bash
   open test/test-diagonal.html
   ```

3. **Test Express integration:**
   ```bash
   npm install express
   node test/express-app.js
   ```

4. **Verify package contents:**
   ```bash
   npm pack --dry-run
   # Should ONLY include lib/, README.md, LICENSE
   # Should NOT include test/
   ```

### Cleanup npm link

When done testing:
```bash
# In your test project
npm unlink env-banner-node
npm install  # reinstall dependencies

# In env-banner-node directory
npm unlink
```

## Package Configuration

The test directory is excluded from npm via the `files` field in `package.json`:

```json
"files": [
  "lib/",
  "README.md",
  "LICENSE"
]
```

This means:
- ✅ Test files are in git (shared with team)
- ✅ Test files are NOT published to npm (keeps package lean)
- ✅ Users only download production code
