// ==UserScript==
// @name         puzzle.aggie.io chat
// @namespace    http://tampermonkey.net/
// @version      0.2
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
        ['json', 'https://data.firlin123.workers.dev/emotes?_=' + Date.now(), 'chatEmotes'],
        ['script', 'http://redir.firlin123.workers.dev/pony/puzzle.aggie.io/chat.code.js?_=' + Date.now()],
        ['style', 'http://redir.firlin123.workers.dev/pony/puzzle.aggie.io/chat.style.css?_=' + Date.now()],
    ];

    var mutationBuffer = [];
    var gmRequest;

    if (typeof GM_xmlhttpRequest === 'undefined') {
        // Assume GM4.0
        debug('Using GM4.0 GM.xmlHttpRequest');
        gmRequest = GM.xmlHttpRequest;
    } else {
        debug('Using old-style GM_xmlhttpRequest');
        gmRequest = GM_xmlhttpRequest;
    }

    unsafeWindow.onchatmutation = function (mutationsList, chatObserver) {
        mutationBuffer.push(mutationsList);
    }

    var chatMutation = function (mutationsList, chatObserver) {
        for (const mutation of mutationsList) {
            if (mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach(node => {
                    let chatContent = node.querySelector('.chat-content');
                    chatContent.innerText = chatContent.innerText;
                });
            }
        }
        unsafeWindow.onchatmutation(mutationsList, chatObserver);
    };
    var chatObserver;
    (chatObserver = new MutationObserver((a, b) => chatMutation(a, b))).observe(unsafeWindow.document.getElementById('chat-messages'), { childList: true });

    unsafeWindow.chatMutationBuffer = mutationBuffer;
    unsafeWindow.chatObserver = chatObserver;
    unsafeWindow.debug = debug;
    unsafeWindow.gmFetch = gmFetch;

    loadResources();
    async function loadResources() {
        for (const resource of resources) {
            debug('Loding: ', resource);
            try {
                var response = await gmFetch(resource[1]);
                if (resource[0] === 'json') {
                    unsafeWindow[resource[2]] = JSON.parse(response.responseText);
                }
                else {
                    const e = unsafeWindow.document.createElement(resource[0]);
                    e.innerHTML = response.responseText;
                    unsafeWindow.document.body.appendChild(e);
                }
            } catch (err) {
                var errStr = '';
                try { errStr = err + ''; } catch (e) { }
                debug('Error fetching "' + resource[1] + '":' + errStr);
            }
        }
    }

    function gmFetch(url) {
        return new Promise((resolve, reject) => {
            gmRequest({
                method: "GET",
                url,
                onload: (response) => resolve(response),
                onerror: (response) => reject(response)
            });
        });
    }

    function debug() {
        try {
            unsafeWindow.console.log('[puzzle chat]', ...arguments);
        } catch (error) {
            unsafeWindow.console.error(error);
        }
    }
})();