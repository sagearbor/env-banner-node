// lib/core.js
'use strict';

const DEFAULT_RULES = [
    // dev/local/test
    [/(localhost|127\.0\.0\.1|\.local$)/, "dev"],
    [/(^|\.)dev(\.|-)|(\b)dev(\b)/, "dev"],
    [/(^|\.)test(\.|-)|(\b)qa(\b)|(\b)sandbox(\b)/, "dev"],
    [/:\d{2,5}$/, "dev"], // non-standard port is a strong hint

    // staging/validation
    [/(^|\.)stg(\.|-)|(^|\.)stage(\.|-)|(^|\.)staging(\.)/, "staging"],
    [/(^|\.)val(\.|-)|(\b)validation(\b)|(\b)preprod(\b)/, "staging"],
];

const ENV_NORMS = {
    "prod": "prod", "production": "prod",
    "staging": "staging", "stage": "staging", "stg": "staging",
    "val": "staging", "validation": "staging", "preprod": "staging",
    "dev": "dev", "development": "dev",
    "local": "dev",
    "test": "dev", "qa": "dev",
    "unknown": "unknown", "auto": "auto",
};

function normEnv(value) {
    if (!value) return null;
    const v = String(value).trim().toLowerCase();
    return ENV_NORMS[v] || v;
}

function classifyFromHostPath(host, path) {
    const text = `${host || ''}${path || ''}`.toLowerCase();
    for (const [pattern, env] of DEFAULT_RULES) {
        if (pattern.test(text)) {
            return env;
        }
    }
    return "unknown";
}

function classifyEnv({ envVar, host, path }) {
    // 1) Explicit env var wins if provided
    const e = normEnv(envVar);
    if (e && e !== "auto") {
        return e;
    }

    // 2) Host/path detection when available
    if (host) {
        const detected = classifyFromHostPath(host, path);
        if (detected !== "unknown") {
            return detected;
        }
        // unknown from host: prefer safety unless explicitly prod
        return "dev";
    }

    // 3) Last resort
    return "dev"; // safe default
}

function isProd(env) {
    return env === "prod";
}

function bannerPalette(env) {
    if (env === "staging") {
        return ["#f59e0b", "#111827"]; // amber-500 bg, gray-900 text
    }
    // dev/test/local/unknown -> red
    return ["#ef4444", "#ffffff"]; // red-500 bg, white text
}

function bannerLabel(env) {
    if (env === "prod") return "";
    if (env === "staging") return "STAGING";
    if (["dev", "test", "local"].includes(env)) return env.toUpperCase();
    if (env === "unknown") return "NON-PROD (UNKNOWN)";
    return (env || '').toUpperCase();
}

function escapeHtml(text) {
    return String(text || '').replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Generates the complete HTML and CSS for the banner based on options.
 * @param {object} options - The combined options object.
 * @returns {string} The HTML string to be injected.
 */
function buildBannerHtml(options) {
    const { env, host } = options;
    if (isProd(env)) return "";

    // Determine text and colors: use custom options first, then fall back to defaults.
    const [defaultBg, defaultFg] = bannerPalette(env);
    const background = options.background || defaultBg;
    const color = options.color || defaultFg;
    const label = options.text || bannerLabel(env);
    const hostText = (host && options.showHost !== false) ? ` • ${host}` : "";
    const text = `${escapeHtml(label)}${escapeHtml(hostText)}`;

    // Determine position and generate appropriate CSS
    const position = options.position || 'top';
    let css = '';

    if (position === 'top-right') {
        const opacity = options.opacity !== undefined ? options.opacity : 1.0;
        css = `
        #env-banner-bar {
            position: fixed; top: 0; right: 0;
            width: 200px; height: 50px;
            overflow: hidden;
            z-index: 2147483647;
        }
        #env-banner-bar-ribbon {
            position: absolute; top: 15px; right: -50px;
            padding: 4px 0;
            width: 200px;
            transform: rotate(45deg);
            box-shadow: 0 1px 3px rgba(0,0,0,.2);
            display: flex; align-items: center; justify-content: center;
            font-family: system-ui, sans-serif; font-size: 12px; font-weight: 700;
            background: ${background}; color: ${color}; text-transform: uppercase;
            opacity: ${opacity};
        }`;
        // For the ribbon, we don't need to adjust body padding
        return `<div id="env-banner-bar"><style>${css}</style><div id="env-banner-bar-ribbon" role="status">${text}</div></div>`;
    }

    if (position === 'top-left') {
        const opacity = options.opacity !== undefined ? options.opacity : 1.0;
        css = `
        #env-banner-bar {
            position: fixed; top: 0; left: 0;
            width: 200px; height: 50px;
            overflow: hidden;
            z-index: 2147483647;
        }
        #env-banner-bar-ribbon {
            position: absolute; top: 15px; left: -50px;
            padding: 4px 0;
            width: 200px;
            transform: rotate(-45deg);
            box-shadow: 0 1px 3px rgba(0,0,0,.2);
            display: flex; align-items: center; justify-content: center;
            font-family: system-ui, sans-serif; font-size: 12px; font-weight: 700;
            background: ${background}; color: ${color}; text-transform: uppercase;
            opacity: ${opacity};
        }`;
        return `<div id="env-banner-bar"><style>${css}</style><div id="env-banner-bar-ribbon" role="status">${text}</div></div>`;
    }

    if (position === 'bottom-right') {
        const opacity = options.opacity !== undefined ? options.opacity : 1.0;
        css = `
        #env-banner-bar {
            position: fixed; bottom: 0; right: 0;
            width: 200px; height: 50px;
            overflow: hidden;
            z-index: 2147483647;
        }
        #env-banner-bar-ribbon {
            position: absolute; bottom: 15px; right: -50px;
            padding: 4px 0;
            width: 200px;
            transform: rotate(-45deg);
            box-shadow: 0 1px 3px rgba(0,0,0,.2);
            display: flex; align-items: center; justify-content: center;
            font-family: system-ui, sans-serif; font-size: 12px; font-weight: 700;
            background: ${background}; color: ${color}; text-transform: uppercase;
            opacity: ${opacity};
        }`;
        return `<div id="env-banner-bar"><style>${css}</style><div id="env-banner-bar-ribbon" role="status">${text}</div></div>`;
    }

    if (position === 'bottom-left') {
        const opacity = options.opacity !== undefined ? options.opacity : 1.0;
        css = `
        #env-banner-bar {
            position: fixed; bottom: 0; left: 0;
            width: 200px; height: 50px;
            overflow: hidden;
            z-index: 2147483647;
        }
        #env-banner-bar-ribbon {
            position: absolute; bottom: 15px; left: -50px;
            padding: 4px 0;
            width: 200px;
            transform: rotate(45deg);
            box-shadow: 0 1px 3px rgba(0,0,0,.2);
            display: flex; align-items: center; justify-content: center;
            font-family: system-ui, sans-serif; font-size: 12px; font-weight: 700;
            background: ${background}; color: ${color}; text-transform: uppercase;
            opacity: ${opacity};
        }`;
        return `<div id="env-banner-bar"><style>${css}</style><div id="env-banner-bar-ribbon" role="status">${text}</div></div>`;
    }

    if (position === 'diagonal') {
        const opacity = options.opacity !== undefined ? options.opacity : 0.5;
        css = `
        #env-banner-bar {
            position: fixed;
            bottom: 0;
            left: 0;
            width: 200vw;
            padding: 10px 0;
            transform-origin: bottom left;
            transform: rotate(45deg);
            opacity: ${opacity};
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: system-ui, sans-serif;
            font-size: 14px;
            font-weight: 700;
            z-index: 2147483647;
            background: ${background};
            color: ${color};
            text-transform: uppercase;
            box-shadow: 0 2px 4px rgba(0,0,0,.3);
            pointer-events: none;
        }`;
        return `<style>${css}</style><div id="env-banner-bar" role="status">${text}</div>`;
    }

    // Default to top or bottom bar
    const opacity = options.opacity !== undefined ? options.opacity : 1.0;
    css = `
    #env-banner-bar {
        position: fixed; left: 0; right: 0; height: 32px;
        display: flex; align-items: center; justify-content: center;
        font-family: system-ui, sans-serif; font-size: 12px; font-weight: 700;
        z-index: 2147483647; background: ${background}; color: ${color};
        text-transform: uppercase; box-shadow: 0 1px 3px rgba(0,0,0,.2);
        opacity: ${opacity};
    }
    ${ position === 'bottom' ?
       `#env-banner-bar { bottom: 0; top: auto; } body { padding-bottom: 32px !important; }` :
       `#env-banner-bar { top: 0; } body { padding-top: 32px !important; }`
    }`;

    return `<style>${css}</style><div id="env-banner-bar" role="status">${text}</div>`;
}

module.exports = {
    classifyEnv,
    isProd,
    buildBannerHtml
};
