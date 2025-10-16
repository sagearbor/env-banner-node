// lib/middleware.js
'use strict';

const { classifyEnv, isProd, buildBannerHtml } = require('./core');

/**
 * Middleware to inject an environment banner into HTML responses.
 * @param {object} [options] - Configuration options.
 * @param {string} [options.envVarName='APP_ENV'] - The primary env variable to check.
 * @param {string} [options.text] - Custom text to display in the banner.
 * @param {string} [options.background] - Custom background color (hex).
 * @param {string} [options.color] - Custom text color (hex).
 * @param {('top'|'bottom'|'top-right')} [options.position='top'] - Position of the banner.
 * @returns {function} Express/Connect middleware.
 */
function envBannerMiddleware(options = {}) {
    const envVarName = options.envVarName || 'APP_ENV';

    return function(req, res, next) {
        const originalEnd = res.end;
        const originalWrite = res.write;
        let buffer = Buffer.from('');

        res.write = function(chunk) {
            buffer = Buffer.concat([buffer, Buffer.from(chunk)]);
        };

        res.end = function(chunk) {
            if (chunk) {
                buffer = Buffer.concat([buffer, Buffer.from(chunk)]);
            }

            const contentType = res.getHeader('Content-Type');
            const statusCode = res.statusCode;

            if (statusCode >= 200 && statusCode < 300 && contentType &&
contentType.includes('text/html')) {
                const host = req.headers.host || '';
                const path = req.originalUrl || req.url || '';
                const envVar = process.env[envVarName] || process.env.ENVBANNER_ENV ||
process.env.NODE_ENV;

                const env = classifyEnv({ envVar, host, path });

                if (!isProd(env)) {
                    // Pass the entire options object, plus the detected env and host
                    const bannerOptions = { ...options, env, host };
                    const bannerHtml = buildBannerHtml(bannerOptions);

                    let body = buffer.toString('utf8');
                    const bodyTagIndex = body.lastIndexOf('</body>');

                    if (bodyTagIndex !== -1) {
                        body = body.slice(0, bodyTagIndex) + bannerHtml +
body.slice(bodyTagIndex);
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
