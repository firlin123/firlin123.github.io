// ==UserScript==
// @name         puzzle.aggie.io chat linkify
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  turn url in puzzle.aggie.io chat to links
// @author       You
// @match        https://puzzle.aggie.io/*
// @icon         https://www.google.com/s2/favicons?domain=puzzle.aggie.io
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
    var chatMutation = function (mutationsList, chatObserver) {
        for (const mutation of mutationsList) {
            if (mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach(node => {
                    let chatContent = node.querySelector('.chat-content');
                    if (chatContent) {
                        chatContent.innerHTML = chatContent.innerHTML.replaceAll(/([-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&\/=]*))/g, '<a href="$2" target="_blank">$1</a>');
                    }
                });
            }
        }
    };
    var chatObserver;
    (chatObserver = new MutationObserver((a, b) => chatMutation(a, b))).observe(document.getElementById('chat-messages'), { childList: true });
    // Your code here...
})();