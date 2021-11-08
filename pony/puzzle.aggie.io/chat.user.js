// ==UserScript==
// @name         puzzle.aggie.io chat
// @namespace    http://tampermonkey.net/
// @version      1.1.3
// @description  puzzle.aggie.io chat
// @author       firlin123
// @match        https://puzzle.aggie.io/*
// @icon         https://www.google.com/s2/favicons?domain=puzzle.aggie.io
// @grant        none
// @homepage     https://firlin123.github.io
// @updateURL    https://firlin123.github.io/pony/puzzle.aggie.io/chat.user.js
// @downloadURL  https://firlin123.github.io/pony/puzzle.aggie.io/chat.user.js
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    // General vars&constants
    const puzzleAggieIoUserScriptVersion = '1.1.3';
    const dataServer = 'data.firlin123.workers.dev';
    const resourceServer = 'firlin123.github.io';
    const shownLogs = JSON.parse(localStorage.shownLogs ?? '{}');
    var chatMessagesElm = document.getElementById('chat-messages') ?? createElement('div');
    var chatLogElm = document.getElementById('chat-log') ?? createElement('div');
    var isOldVersion = false;

    // Message history vars&constants
    const room = nullOrEmptyReplace(window.location.pathname.substring(1), 'no');
    const me = {
        id: -1,
        name: '',
        color: '',
    };
    const knownUsers = [];
    const lockQueue = [];
    window.scriptUsers = [];
    window.currentUsers = [];
    window.currentWS = null;
    window.senderId = null;

    // Emotes vars&constants
    var windowLoaded = false;
    var promiseFinished = false;
    var chatEmotes = [];
    var chatMutationBuffer = [];
    var chatMutationFunc = (m, o) => chatMutationBuffer.push(m);
    var emotesModalElm;
    var chatObserver;
    var chatInputElm = document.getElementById('chat-input') ?? createElement('input');
    var chatBoxElm = document.getElementById('chat-box') ?? createElement('form');
    var sidePanelElm = document.getElementById('side-panel') ?? createElement('div', { innerNodes: [chatBoxElm] });
    var emotesElm = createElement('button', {
        innerText: 'Emotes List', className: 'btn btn-outline-light btn-sm mx-2 d-none', id: 'emotes'
    }, {
        'data-bs-toggle': 'modal', 'data-bs-target': '#emotesModal'
    });

    // General code
    checkOldVersion();

    // Message history code
    window.knownUsers = knownUsers;
    window.lockQueue = lockQueue;
    window.me = me;
    window.saveShownLogs = saveShownLogs;
    window.shownLogs = shownLogs;
    getChatMessages();

    window.RealWebSocket = window.WebSocket;
    window.WebSocket = FakeWebSocket;

    // Emotes code
    fetch('https://' + dataServer + '/puzzle.aggie.io/chatemotes').then(r => r.json()).then(json => {
        if (!promiseFinished) {
            promiseFinished = true;
            chatEmotes = json;
            if (windowLoaded) {
                emotesInit();
            }
        }
    }).catch(e => log('fetch_err', 'Error getting emotes', e));
    window.addEventListener('load', async () => {
        if (!windowLoaded) {
            document.body.append(createElement('link', { rel: 'stylesheet', href: 'https://' + resourceServer + '/pony/puzzle.aggie.io/chat.style.css?_=' + Date.now() }));
            chatMessagesElm = document.getElementById('chat-messages') ?? chatMessagesElm;
            chatLogElm = document.getElementById('chat-log') ?? chatLogElm;
            chatInputElm = document.getElementById('chat-input') ?? chatInputElm;
            chatBoxElm = document.getElementById('chat-box') ?? chatBoxElm;
            sidePanelElm = document.getElementById('side-panel') ?? sidePanelElm;

            (chatObserver = new MutationObserver((a, b) => chatMutationFunc(a, b))).observe(chatMessagesElm, { childList: true });
            windowLoaded = true;
            if (promiseFinished) {
                emotesInit();
            }
        }
    });

    // General functions
    function createElement(tag, options = {}, attributes = {}) {
        var element = document.createElement(tag);
        for (const option in options) {
            if (option === 'innerNodes') {
                options[option].forEach(e => {
                    if (typeof e === 'string')
                        element.append(document.createTextNode(e))
                    else
                        element.append(e)
                });
            } else {
                element[option] = options[option];
            }
        }
        for (const attribute in attributes) {
            element.setAttribute(attribute, attributes[attribute]);
        }
        return element;
    }

    function log(ll) {
        if (shownLogs.any ?? false) {
            if (shownLogs[ll] ?? true) console.log('[' + ll + ']:', ...Array.from(arguments).slice(1));
        }
    }

    function saveShownLogs() {
        localStorage.shownLogs = JSON.stringify(shownLogs);
    }

    function oldVersion(newUrl) {
        isOldVersion = true;
        document.getElementById('chat').append(createElement('div', {
            innerNodes: [
                'Old version of emotes script.',
                createElement('br'),
                'Click ',
                createElement('a', {
                    innerText: 'here', style: 'color:#fff',
                    href: newUrl,
                }),
                ' to update',
                createElement('button', {
                    innerText: '×',
                    style: 'position:absolute;right:.4rem;top:0;color:#fff;font-size:1.5rem',
                    onclick: e => e.target.parentElement.remove()
                })
            ],
            style: 'padding:.5rem;background:#111;border-radius:.5rem;margin-right:.3rem;position:relative',
            id: 'oldVersion'
        }));
    }

    function compareVersion(v1, v2) {
        if (typeof v1 !== 'string') return -1;
        if (typeof v2 !== 'string') return -1;
        v1 = v1.split('.');
        v2 = v2.split('.');
        const k = Math.min(v1.length, v2.length);
        for (let i = 0; i < k; ++i) {
            v1[i] = parseInt(v1[i], 10);
            v2[i] = parseInt(v2[i], 10);
            if (v1[i] > v2[i]) return 1;
            if (v1[i] < v2[i]) return -1;
        }
        return v1.length == v2.length ? 0 : (v1.length < v2.length ? -1 : 1);
    }

    async function checkOldVersion() {
        const data = new FormData();
        data.append('type', 'getLatest');
        data.append('room', room);
        const lock = await qLock();
        try {
            log('fetch', 'getLatest');
            const responce = await (await fetch(
                'https://' + dataServer + '/puzzle.aggie.io/chatversion',
                { method: "POST", body: data })
            ).json();
            if (responce.error != null) log('fetch_err', 'Error ' + responce.error);
            else {
                if (compareVersion(puzzleAggieIoUserScriptVersion, responce.version) === -1) {
                    oldVersion(responce.url);
                }
            }
        } catch (e) { log('fetch_err', 'Error getting latest version', e) }
        qUnlock(lock);
    }

    // Message history functions
    function nullOrEmptyReplace(string, replacement = '') {
        return (string ?? '') === '' ? replacement : string;
    }

    function FakeWebSocket() {
        window.currentWS = new window.RealWebSocket(...arguments);
        currentWS.realSend = currentWS.send;
        currentWS.send = fakeSend;
        return currentWS;
    }

    function fakeSend(data) {
        if (currentWS.onmessage != fakeOnMessage) {
            currentWS.realOnMessage = currentWS.onmessage;
            currentWS.onmessage = fakeOnMessage;
        }
        if (data !== '' && typeof data === 'string') {
            var json = JSON.parse(data);
            log('socket_send', json);
        }
        currentWS.realSend(data);
    }

    function fakeOnMessage(event) {
        var wasUsersEvent = false;
        var data = event.data;
        if (data !== '' && typeof data === 'string') {
            var json = JSON.parse(data);
            switch (json.type) {
                case 'me':
                    meUpdate(me, json.id);
                    break;
                case 'users':
                    wasUsersEvent = true;
                    json.users.map(u => (u.id === me.id) ? meUpdate(u, u.id) : 0);
                    checkCurrentUsers(json.users);
                    checkKnownUsers(json.users);
                    break;
                case 'chat':
                    const message = { time: Date.now(), message: json.message, id: json.id, name: json.name, color: json.color };
                    sendMessage(message);
                    break;
            }
            log('socket_recv', json);
        }
        currentWS.realOnMessage(event);
        if (wasUsersEvent) {
            updateScriptUserElms();
        }
    }

    async function getChatMessages() {
        const data = new FormData();
        data.append('type', 'getMessages');
        data.append('room', room);
        const lock = await qLock();
        try {
            log('fetch', 'getMessages');
            const responce = await (await fetch(
                'https://' + dataServer + '/puzzle.aggie.io/chatmessages',
                { method: "POST", body: data })
            ).json();
            if (responce.error != null) log('fetch_err', 'Error ' + responce.error);
            else {
                appendMessages(responce);
            }
        } catch (e) { log('fetch_err', 'Error getting chat messages', e) }
        qUnlock(lock);
    }

    async function sendMessage(message) {
        //await any unfinished tasks that might update senderId
        const lock = await qLock();
        qUnlock(lock);
        if (me.id === senderId) {
            const data = new FormData();
            data.append('type', 'chatMessage');
            data.append('room', room);
            data.append('time', message.time);
            data.append('message', message.message);
            data.append('id', message.id);
            data.append('name', message.name);
            data.append('color', message.color);
            const lock = await qLock();
            try {
                if (isOldVersion) throw 'Old version';
                log('fetch', 'chatMessage');
                const responce = await (await fetch(
                    'https://' + dataServer + '/puzzle.aggie.io/chatmessages',
                    { method: "POST", body: data })
                ).json();
                if (responce.error != null) log('fetch_err', 'Error ' + responce.error);
            } catch (e) { log('fetch_err', 'Error sending message', e) }
            qUnlock(lock);
        }
    }

    async function meUpdate(user, id) {
        const data = new FormData();
        var update = false;
        data.append('type', 'updateUser');
        data.append('room', room);
        if (me.id !== id) {
            update = me.id > 0;
            if (update) {
                data.append('oldId', me.id);
            }
            me.id = id;
        }
        if (!(scriptUsers.some(u => exactSameUser(u, me)))) {
            if (user.name !== '' && user.color !== '') {
                update = true;
                //debugger;
            }
        }
        if (me.name !== user.name || me.color !== user.color || update) {
            update = true;
            data.append('id', me.id);
            data.append('name', me.name = user.name);
            data.append('color', me.color = user.color);
        }
        if (update) {
            const lock = await qLock();
            try {
                if (isOldVersion) throw 'Old version';
                log('fetch', 'meUpdate');
                const responce = await (await fetch(
                    'https://' + dataServer + '/puzzle.aggie.io/chatusers',
                    { method: "POST", body: data })
                ).json();
                if (responce.error != null) log('fetch_err', 'Error ' + responce.error);
                else {
                    window.senderId = responce.senderId;
                    window.scriptUsers = responce.users;
                    meUpdate(me, me.id);
                    checkCurrentUsers(currentUsers);
                }
            } catch (e) { log('fetch_err', 'Error updating script users', e) }
            qUnlock(lock);
        }
    }

    function appendMessages(messages) {
        var lastChatMessageElm;
        for (const message of messages) {
            while (chatMessagesElm.childElementCount > 100) chatMessagesElm.removeChild(chatMessagesElm.firstChild);
            const date = new Date(message.time);
            const hours = date.getHours();
            const minutes = date.getMinutes();
            const dateStr = (hours < 10 ? ("0" + hours) : hours) + ":" + (minutes < 10 ? ("0" + minutes) : minutes);
            const chatMessageElm = createElement('div', {
                className: 'chat-message',
                innerNodes: [
                    createElement("div", {
                        innerNodes: [
                            createElement('div', {
                                className: 'chat-date',
                                innerText: dateStr
                            }),
                            createElement("div", {
                                className: 'chat-user',
                                innerText: message.name,
                                style: 'color:' + message.color
                            }),
                            createElement("div", {
                                className: 'chat-content',
                                innerText: message.message,
                            }),
                        ]
                    })
                ]
            });
            if (lastChatMessageElm == null) {
                chatMessagesElm.prepend(chatMessageElm);
            }
            else {
                lastChatMessageElm.insertAdjacentElement('afterend', chatMessageElm);
            }
            lastChatMessageElm = chatMessageElm;
            setTimeout((function () { return chatLogElm.scrollTop = 1e6 }));
        }
    }

    function exactSameUser(user1, user2) {
        return user1.id === user2.id ? (user1.color === user2.color ? user1.name === user2.name : false) : false;
    }
    function cloneUser(user) {
        return { id: user.id, name: user.name, color: user.color };
    }

    function checkCurrentUsers(newUsers) {
        var removedUsers = [];
        for (const user of currentUsers) {
            if (!(newUsers.some(u => u.id === user.id))) {
                removedUsers.push(user);
            }
        }
        var removedScriptUsers = [];
        for (const user of removedUsers) {
            if (window.scriptUsers.some(u => u.id === user.id)) {
                removedScriptUsers.push(user);
            }
        }
        for (const user of window.scriptUsers) {
            if (!(newUsers.some(u => exactSameUser(u, user)))) {
                removedScriptUsers.push(user);
            }
        }
        if (removedScriptUsers.length > 0) {
            scriptUsersRemove(removedScriptUsers);
        }
        window.currentUsers = Array.from(newUsers, cloneUser);
    }

    async function scriptUsersRemove(removedUsers) {
        const data = new FormData();
        data.append('type', 'removeUsers');
        data.append('room', room);
        data.append('users', JSON.stringify(removedUsers));
        const lock = await qLock();
        try {
            if (isOldVersion) throw 'Old version';
            log('fetch', 'scriptUsersRemove');
            const responce = await (await fetch(
                'https://' + dataServer + '/puzzle.aggie.io/chatusers',
                { method: "POST", body: data })
            ).json();
            if (responce.error != null) log('fetch_err', 'Error ' + responce.error);
            else {
                window.senderId = responce.senderId;
                window.scriptUsers = responce.users;
                meUpdate(me, me.id);
            }
        } catch (e) { log('fetch_err', 'Error removing script users', e) }
        qUnlock(lock);
    }

    function checkKnownUsers(newUsers) {
        var addedUsers = [];
        for (const user of newUsers) {
            if (!(knownUsers.some(u => exactSameUser(u, user)))) {
                var newUser = cloneUser(user);
                knownUsers.push(newUser);
                addedUsers.push(newUser);
            }
        }
        if (addedUsers.length > 0) {
            setTimeout(updateScriptUsers, 1000);
        }
    }

    async function updateScriptUsers() {
        const data = new FormData();
        data.append('type', 'getUsers');
        data.append('room', room);
        const lock = await qLock();
        try {
            log('fetch', 'updateScriptUsers');
            const responce = await (await fetch(
                'https://' + dataServer + '/puzzle.aggie.io/chatusers',
                { method: "POST", body: data })
            ).json();
            if (responce.error != null) log('fetch_err', 'Error ' + responce.error);
            else {
                window.senderId = responce.senderId;
                window.scriptUsers = responce.users;
                meUpdate(me, me.id);
                for (const user of knownUsers) {
                    if (window.scriptUsers.some(u => exactSameUser(u, user))) {
                        user.script = true;
                    }
                }
                updateScriptUserElms();
            }
        } catch (e) { log('fetch_err', 'Error getting script users', e) }
        qUnlock(lock);
    }

    function updateScriptUserElms() {
        var userElms = Array.from(document.getElementsByClassName('user'));
        for (const userElm of userElms) {
            var elName = userElm.lastChild.textContent;
            var elColor = userElm.firstChild.style.backgroundColor;
            if (elColor.startsWith('rgb')) elColor = rgbToHex(elColor);
            if (knownUsers.filter(u => u.script).some(u => u.name === elName && u.color === elColor)) {
                if (!(userElm.classList.contains('script-user'))) {
                    userElm.classList.add('script-user');
                }
                var span = createElement('span', {
                    title: 'This user has chat userscript installed', innerText: '(sc)',
                });
                // preventAppEvents(span);
                userElm.insertAdjacentElement('beforeEnd', span);
            }
        }
    }

    function rgbToHex(color) {
        var result = '#000000';
        const matchColors = /rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)/;
        const match = matchColors.exec(color);
        if (match !== null) {
            var r = 0, g = 0, b = 0;
            try {
                r = parseInt(match[1]).toString(16);
                g = parseInt(match[2]).toString(16);
                b = parseInt(match[3]).toString(16);
            } catch (e) { }
            result = '#' + (r.length == 1 ? '0' + r : r) + (g.length == 1 ? '0' + g : g) + (b.length == 1 ? '0' + b : b);
        }
        return result;
    }

    function qLock() {
        return new Promise((resolve, reject) => {
            var qElem = {};
            if (lockQueue.length == 0) {
                qElem.res = () => { };
                lockQueue.push(qElem);
                resolve(qElem);
            }
            else {
                qElem.res = () => resolve(qElem);
                lockQueue.push(qElem);
            }
        });
    }

    function qUnlock(qElem) {
        const i = lockQueue.indexOf(qElem);
        lockQueue.splice(i, 1);
        lockQueue[i]?.res();
    }


    // Emotes functions
    function emotesInit() {
        chatEmotes.forEach(e => e.rex = new RegExp(e.source));
        chatMutationBuffer.forEach(m => chatMutation(m, chatObserver));
        chatMutationFunc = chatMutation;

        chatInputElm.addEventListener('keydown', tabKeyDown);
        chatInputElm.realblur = chatInputElm.blur;
        chatInputElm.blur = () => { chatInputBlur(); chatInputElm.realblur() };
        chatInputElm.realfocus = chatInputElm.focus;
        chatInputElm.focus = () => { chatInputFocus(); chatInputElm.realfocus() };
        sidePanelElm.insertBefore(emotesElm, chatBoxElm);
        emotesModalElm = createEmotesModal();

        preventAppEvents(emotesModalElm);
        preventAppEvents(emotesElm);

        document.body.append(emotesModalElm);
        initBootstrapJs();
    }

    function tabKeyDown(event) {
        if (event.key === 'Tab') {
            var insertText = '\t';
            if (chatInputElm.selectionStart == chatInputElm.selectionEnd) {
                var toCarret = chatInputElm.value.substr(0, chatInputElm.selectionEnd);
                var match = toCarret.match(/(\s|^)(:[\w.]+)$/);
                if (match != null) {
                    insertText = '';
                    var sutableEmotes = chatEmotes.filter(e => e.name.startsWith(match[2]));
                    if (sutableEmotes.length > 0) {
                        var i = match[2].length;
                        var foundEmoteName = null;
                        if (sutableEmotes.length > 1) {
                            var emoteName = sutableEmotes[0].name.substr(0, i) + ':';
                            foundEmoteName = sutableEmotes.find(e => e.name === emoteName)?.name;
                            if (foundEmoteName == null) {
                                while (sameCharInAllEmotes(sutableEmotes, i)) i++;
                                // if (sutableEmotes.length <= 5)
                                //     sutableEmotes.forEach(e => debug('Possible emote ', e.name));
                            }
                        }
                        else foundEmoteName = sutableEmotes[0].name;

                        var to = foundEmoteName?.length ?? i;
                        var txt = foundEmoteName ?? sutableEmotes[0].name;
                        insertText = txt.substring(match[2].length, to);
                        if (insertText.endsWith(':')) insertText += ' ';
                    }
                }
            }
            insertTextAtSelection(insertText);

            event.preventDefault();
        }
    }

    function insertTextAtSelection(text, emote = false) {
        var start = chatInputElm.selectionStart;
        var end = chatInputElm.selectionEnd;
        var allText = chatInputElm.value;
        var sBegin = allText.substring(0, start);
        var sEnd = allText.substring(end, allText.length);
        if (emote) {
            if (sBegin[sBegin.length - 1]?.match(/^\s$/) == null && sBegin.length > 0) text = ' ' + text;
            if (sEnd[0]?.match(/^\s$/) == null && sEnd.length > 0) text += ' ';
        }
        var newText = sBegin + text + sEnd;
        chatInputElm.value = newText;
        chatInputElm.selectionStart = start + text.length;
        chatInputElm.selectionEnd = start + text.length;
    }

    function sameCharInAllEmotes(emotes, i) {
        var char = emotes[0].name[i].toLocaleLowerCase();
        for (const emote of emotes) {
            if (emote.name[i].toLocaleLowerCase() !== char) return false;
        }
        return true;
    }

    function chatMutation(mutationsList, chatObserver) {
        for (const mutation of mutationsList) {
            if (mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach(node => {
                    var contentElm = node.querySelector('.chat-content');
                    var lines = contentElm.innerText.split('\n');
                    contentElm.innerHTML = '';
                    for (const line of lines) {
                        var text = document.createTextNode(line);
                        var emoteTextNodes = [];
                        var matches;
                        if (line.startsWith('>')) {
                            var end = text.splitText(1);
                            contentElm.append(createElement('span', { className: 'greentext', innerNodes: [text, end] }));
                            text = end;
                        } else {
                            contentElm.append(text);
                        }
                        do {
                            matches = [];
                            var match;
                            for (const emote of chatEmotes) {
                                if ((match = text.textContent.match(emote.rex)) != null) matches.push([match, emote]);
                            }
                            if (matches.length > 0) {
                                var minIndex = matches.reduce((p, c) => p[0].index < c[0].index ? p : c);
                                var minIndexMatch = minIndex[0];
                                var length = minIndexMatch[0].substr(minIndexMatch[1].length).length;
                                var start = minIndexMatch.index + minIndexMatch[1].length;
                                var emoteTextNode = text.splitText(start);
                                text = emoteTextNode.splitText(length);
                                emoteTextNodes.push([emoteTextNode, minIndex[1]]);
                            }
                        } while (matches.length > 0);
                        for (const emote of emoteTextNodes) {
                            emote[0].parentElement.replaceChild(createEmote(emote[1]), emote[0]);
                        }
                        var texts = Array.from(text.parentElement.childNodes).filter(n => n.textContent != null);
                        for (var text of texts) {
                            var match;
                            var urlTextNodes = [];
                            do {
                                var match = text.textContent.match(/([hH][tT]{2}[pP][sS]?:\/\/)?([-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&\/=]*))/);
                                if (match != null) {
                                    var length = match[0].length;
                                    var start = match.index;
                                    var urlTextNode = text.splitText(start);
                                    text = urlTextNode.splitText(length);
                                    urlTextNodes.push(urlTextNode);
                                }
                            } while (match != null);
                            for (const url of urlTextNodes) {
                                var urlStr = url.textContent.replace(/^([hH][tT]{2}[pP]([sS])?:\/\/)?/, 'http$2://');
                                url.parentElement.replaceChild(createElement('a', { href: urlStr, innerText: url.textContent, target: '_blank' }), url);
                            }
                        }
                    }
                });
            }
        }
    }

    function createEmote(emote) {
        var emoteElm = document.createElement('img');
        emoteElm.src = emote.image;
        emoteElm.title = emote.name;
        emoteElm.classList.add('puzzle-emote');
        return emoteElm;
    }

    function chatInputFocus() {
        emotesElm.classList.remove('d-none');
    }

    function chatInputBlur() {
        emotesElm.classList.add('d-none');
    }

    function createPageItem(page, text, clickHandler = null, disabled = false) {
        page.itemElm = createElement('li', { className: (disabled ? 'disabled ' : '') + 'page-item' });
        page.linkElm = createElement('a', { className: 'page-link text-center', innerText: text });
        if (typeof clickHandler === 'function') {
            page.linkElm.addEventListener('click', clickHandler);
        }
        page.itemElm.append(page.linkElm);
        return page.itemElm;
    }

    function createPageination(count, showPage) {
        var pages = {
            controls: {
                first: {},
                last: {},
                next: {},
                prev: {}
            },
            pages: [],
            currentI: 0,
            count
        };
        var navElm = createElement('nav', { className: 'me-auto' });
        var paginationElm = createElement('ul', { className: 'pagination' });
        navElm.append(paginationElm);
        paginationElm.append(createPageItem(pages.controls.first, 'First', first, true));
        paginationElm.append(createPageItem(pages.controls.prev, '«', prev, true));
        if (count > 9) {
            pages.controls.dotsLeft = {};
            createPageItem(pages.controls.dotsLeft, '…', null, true);
        }
        for (let i = 0; i < count; i++) {
            var page = { obj: {} };
            createPageItem(page, i + 1, _ => switchToPage(i), i == 0);
            if (i < 8 || count == 9) {
                paginationElm.append(page.itemElm);
            }
            pages.pages.push(page);
        }
        if (count > 9) {
            pages.controls.dotsRight = {};
            paginationElm.append(createPageItem(pages.controls.dotsRight, '…', null, true));
        }
        paginationElm.append(createPageItem(pages.controls.next, '»', next, count <= 1));
        paginationElm.append(createPageItem(pages.controls.last, 'Last', last, count <= 1));
        function first() { switchToPage(0) }
        function prev() { switchToPage(pages.currentI - 1) }
        function next() { switchToPage(pages.currentI + 1) }
        function last() { switchToPage(pages.count - 1) }
        function switchToPage(pageI) {
            if (pageI >= 0 && pageI < pages.count) {
                var elmArr = [];
                var fromI = pageI - 4;
                var toI = pageI + 5;
                if (fromI < 0) {
                    toI -= (fromI - 0);
                    fromI = 0;
                }
                if (toI > pages.count) {
                    fromI -= (toI - pages.count);
                    toI = pages.count;
                }
                if (fromI < 0) fromI = 0;
                elmArr.push(fromI == 0 ? pages.pages[fromI] : pages.controls.dotsLeft);
                for (var i = (fromI + 1); i < (toI - 1); i++) {
                    elmArr.push(pages.pages[i]);
                }
                elmArr.push(toI == pages.count ? pages.pages[(toI - 1)] : pages.controls.dotsRight);

                var currElm = paginationElm.children[2];
                while (currElm != pages.controls.next.itemElm) {
                    var nextElm = currElm.nextElementSibling;
                    paginationElm.removeChild(currElm);
                    currElm = nextElm;
                }
                elmArr.forEach(e => paginationElm.insertBefore(e.itemElm, pages.controls.next.itemElm));

                var action;
                action = (pageI == 0) ? 'add' : 'remove';
                pages.controls.prev.itemElm.classList[action]('disabled');
                pages.controls.first.itemElm.classList[action]('disabled');
                action = (pageI == pages.count - 1) ? 'add' : 'remove';
                pages.controls.next.itemElm.classList[action]('disabled');
                pages.controls.last.itemElm.classList[action]('disabled');

                pages.pages[pages.currentI].itemElm.classList.remove('disabled');
                pages.pages[pageI].itemElm.classList.add('disabled');
                pages.currentI = pageI;
                showPage(pages.pages[pageI].obj, pageI);
            }
        }
        showPage(pages.pages[pages.currentI].obj, pages.currentI);
        return navElm;
    }

    function createChunks(array, chunk) {
        var pages = [];
        var i, j;
        for (i = 0, j = array.length; i < j; i += chunk) {
            var page = array.slice(i, i + chunk);
            pages.push(page);
        }
        return pages;
    }

    function createEmotesModal() {
        var pages = createChunks(chatEmotes, 25);
        var pageCount = pages.length;

        var modal = createElement('div', {
            className: 'fade modal',
            id: 'emotesModal',
            tabIndex: -1
        }, {
            'aria-labelledby': 'emotesModalLabel',
            'aria-hidden': 'true'
        });
        var modalDialog = createElement('div', {
            className: 'modal-dialog modal-dialog-centered modal-lg',
            style: 'min-width:42rem'
        });
        var modalContent = createElement('div', {
            className: 'modal-content bg-dark',
        });
        var modalHeader = createElement('div', {
            className: 'border-secondary modal-header',
        });
        var modalTitile = createElement('div', {
            className: 'modal-title my-auto py-1',
            id: 'emotesModalLabel'
        }, {
            'style': 'font-size:large'
        });
        var modalSearch = createElement('input', {
            className: 'form-control form-control-sm bg-transparent text-light',
            placeholder: 'search emote',
            oninput: searchInput
        });
        var modalClose = createElement('button', {
            type: 'button',
            className: 'btn-close btn-close-white'
        }, {
            'data-bs-dismiss': 'modal',
            'aria-label': 'Close'
        });
        var modalBody = createElement('div', {
            className: 'modal-body'
        });
        var modalFooter = createElement('div', {
            className: 'border-secondary modal-footer',
        });
        var modalPagination = createPageination(pageCount, showPage);
        var modalCloseFooter = createElement('button', {
            type: 'button',
            className: 'btn btn-secondary',
            innerText: 'Close'
        }, {
            'data-bs-dismiss': 'modal'
        });

        modalTitile.append(modalSearch);
        modalHeader.append(modalTitile);
        modalHeader.append(modalClose);
        modalFooter.append(modalPagination);
        modalFooter.append(modalCloseFooter);
        modalContent.append(modalHeader);
        modalContent.append(modalBody);
        modalContent.append(modalFooter);
        modalDialog.append(modalContent);
        modal.append(modalDialog);

        function showPage(pageObj, pageI) {
            if (pages.length > 0) {
                var page = pages[pageI];
                if (pageObj.elm == null) {
                    pageObj.elm = createElement('div', { className: 'd-flex flex-wrap' });
                    for (const emote of page) {
                        if (emote.elm == null) {
                            emote.elm = createElement('div', { className: 'emote-select p-1' });
                            var emoteWrapElm = createElement('div', { className: 'border border-2 border-secondary rounded-3 emote-select-wrapper' });
                            var emoteImgElm = createElement('img', { className: 'emote-select-img', src: emote.image, title: emote.name });
                            emoteWrapElm.append(emoteImgElm);
                            emote.elm.append(emoteWrapElm);
                            emoteWrapElm.addEventListener('click', e => {
                                insertTextAtSelection(emote.name, true);
                                chatInputElm.focus();
                            });
                        }
                        pageObj.elm.append(emote.elm);
                    }
                }
            } else {
                pageObj.elm = createElement('span', { innerText: 'emote not found' });
            }
            if (modalBody.firstElementChild != null) {
                modalBody.removeChild(modalBody.firstElementChild);
            }
            modalBody.append(pageObj.elm);
        }
        var prevSearch = '';
        function searchInput(event) {
            if (prevSearch !== event.target.value.trim().toLocaleLowerCase()) {
                prevSearch = event.target.value.trim().toLocaleLowerCase();
                var newEmotes = chatEmotes.filter(e => e.name.toLocaleLowerCase().includes(prevSearch));
                pages = createChunks(newEmotes, 25);
                pageCount = pages.length;
                var newPagination = createPageination(pageCount <= 0 ? 1 : pageCount, showPage);
                modalPagination.firstElementChild.remove();
                modalPagination.append(newPagination.firstElementChild);
            }
        }
        return modal;
    }

    function preventAppEvents(element) {
        var events = ['mousedown', 'mousemove', 'mouseup', 'touchstart', 'touchmove', 'touchend', 'wheel'];
        events.map(event => element.addEventListener(event, e => e.stopPropagation()));
    }

    function initBootstrapJs() {
        document.body.append(createElement('script', {
            src: 'https://' + resourceServer + '/pony/puzzle.aggie.io/bootstrap_5.0.2.min.js'
        }));
    }
})();