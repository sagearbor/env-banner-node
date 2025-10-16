// lib/middleware.js
'use strict';

const { classifyEnv, isProd, buildBannerHtml } = require('./core');

function envBannerMiddleware(options = {}) {
    const envVarName = options.envVarName || 'APP_ENV';

    return function(req, res, next) {
        const originalEnd = res.end;
        const originalWrite = res.write;
        let buffer = Buffer.from('');

        // Buffer the response
        res.write = function(chunk) {
            buffer = Buffer.concat([buffer, Buffer.from(chunk)]);
        };

        res.end = function(chunk) {
            if (chunk) {
                buffer = Buffer.concat([buffer, Buffer.from(chunk)]);
            }

            const contentType = res.getHeader('Content-Type');
            const statusCode = res.statusCode;

            // Only inject banner into 2xx HTML responses
            if (statusCode >= 200 && statusCode < 300 && contentType && contentType.includes('text/html')) {
                const host = req.headers.host || '';
                const path = req.originalUrl || req.url || '';
                
                // *** THIS IS THE MODIFIED LINE ***
                // Prioritize APP_ENV, but fall back to NODE_ENV for ecosystem compatibility.
                const envVar = process.env[envVarName] || process.env.ENVBANNER_ENV || process.env.NODE_ENV;

                const env = classifyEnv({ envVar, host, path });

                if (!isProd(env)) {
                    const bannerHtml = buildBannerHtml(env, host);
                    let body = buffer.toString('utf8');
                    
                    // Inject before closing body tag, or append
                    const bodyTagIndex = body.lastIndexOf('</body>');
                    if (bodyTagIndex !== -1) {
                        body = body.slice(0, bodyTagIndex) + bannerHtml + body.slice(bodyTagIndex);
                    } else {
                        body += bannerHtml;
                    }
                    
                    buffer = Buffer.from(body, 'utf8');
                    res.setHeader('Content-Length', buffer.length);
                }
            }

            originalEnd.call(res, buffer);
        };

        next();
    };
}

module.exports = envBannerMiddleware;
