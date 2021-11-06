// ==UserScript==
// @name         puzzle.aggie.io chat
// @namespace    http://tampermonkey.net/
// @version      1.0.1
// @description  puzzle.aggie.io chat
// @author       firlin123
// @match        https://puzzle.aggie.io/*
// @icon         https://www.google.com/s2/favicons?domain=puzzle.aggie.io
// @homepage     https://firlin123.github.io
// @updateURL    https://firlin123.github.io/pony/puzzle.aggie.io/chat.user.js
// @downloadURL  https://firlin123.github.io/pony/puzzle.aggie.io/chat.user.js
// @grant        unsafeWindow
// @grant        GM_xmlhttpRequest
// @grant        GM.xmlHttpRequest
// @connect      firlin123.workers.dev
// @connect      firlin123.github.io
// @connect      ngrok.io
// @connect      0.0.0.0
// ==/UserScript==

(function () {
    'use strict';
    var resources = [
        ['script', 'https://firlin123.github.io/pony/puzzle.aggie.io/chat.code.js?_=' + Date.now()],
        ['style', 'https://firlin123.github.io/pony/puzzle.aggie.io/chat.style.css?_=' + Date.now()],
    ];
    var gmXHR;

    if (typeof GM_xmlhttpRequest === 'undefined') {
        // Assume GM4.0
        debug('Using GM4.0 GM.xmlHttpRequest');
        gmXHR = GM.xmlHttpRequest;
    } else {
        debug('Using old-style GM_xmlhttpRequest');
        gmXHR = GM_xmlhttpRequest;
    }
    unsafeWindow.gmXHR = gmXHR;
    unsafeWindow.gmFetch = gmFetch;
    unsafeWindow.puzzleAggieIoUserScriptVersion = '1.0.1';
    loadResources();

    async function loadResources() {
        for (const resource of resources) {
            try {
                var response = await gmFetch(resource[1]);
                var text = await response.text();
                const e = unsafeWindow.document.createElement(resource[0]);
                e.innerHTML = text;
                unsafeWindow.document.body.appendChild(e);
            } catch (err) {
                var errStr = '';
                try { errStr = '":' + err } catch (e) { }
                debug('Error fetching "' + resource[1] + '"' + errStr);
            }
        }
    }

    function debug() {
        try {
            unsafeWindow.console.log('[puzzle chat]', ...arguments);
        } catch (error) {
            unsafeWindow.console.error(error);
        }
    }

    function gmFetch(url, options = {}) {
        var p = new Promise((resolve, reject) => {
            try {
                var rqOptions = { method: "GET" }
                for (const option in options) rqOptions[option] = options[option];
                rqOptions.onload = (xhrResponse) => {
                    try {
                        var init = {
                            status: xhrResponse.status,
                            statusText: xhrResponse.statusText,
                            headers: parseHeaders(xhrResponse.responseHeaders)
                        };
                        var response = new Response(xhrResponse.responseText, init);
                        Object.defineProperty(response, "url", { value: xhrResponse.finalUrl });
                        Object.defineProperty(response, "redirected", { value: (url !== xhrResponse.finalUrl) });
                        response.xhrResponse = xhrResponse;
                        resolve(response);
                    }
                    catch (error) { reject({ xhrResponse, error }); }
                };
                rqOptions.onerror = (response) => reject(response);
                rqOptions.ontimeout = (response) => reject(response);
                rqOptions.url = url;
                gmXHR(rqOptions);
            } catch (error) { reject(error); }
        });
        return p;
    }

    // https://github.com/kesla/parse-headers
    function parseHeaders(headers) {
        if (!headers) return {}
        var result = {}
        var trim = s => s.replace(/^\s+|\s+$/g, '');
        var isArray = a => Object.prototype.toString.call(a) === '[object Array]';
        var headersArr = trim(headers).split('\n')
        for (const row of headersArr) {
            var i = row.indexOf(':');
            var key = trim(row.slice(0, i)).toLowerCase();
            var value = trim(row.slice(i + 1));
            if (typeof (result[key]) === 'undefined') {
                result[key] = value
            } else if (isArray(result[key])) {
                result[key].push(value)
            } else {
                result[key] = [result[key], value]
            }
        }
        return result;
    }
})();
