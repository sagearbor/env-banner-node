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
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function buildBannerHtml(env, host) {
    if (isProd(env)) return "";

    const [bg, fg] = bannerPalette(env);
    const label = bannerLabel(env);
    const hostText = host ? ` • ${host}` : "";
    const text = `${escapeHtml(label)}${escapeHtml(hostText)}`;

    return `
<style>
  #env-banner-bar {
    position: fixed; top: 0; left: 0; right: 0; height: 32px;
    display: flex; align-items: center; justify-content: center;
    font-family: system-ui, sans-serif; font-size: 12px; font-weight: 700;
    z-index: 2147483647; background: ${bg}; color: ${fg};
    text-transform: uppercase; box-shadow: 0 1px 3px rgba(0,0,0,.2);
  }
  body { padding-top: 32px !important; }
</style>
<div id="env-banner-bar" role="status">${text}</div>
`;
}

module.exports = {
    classifyEnv,
    isProd,
    buildBannerHtml
};
