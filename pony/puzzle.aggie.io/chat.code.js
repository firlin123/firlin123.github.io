var puzzleAggieIoUserScriptVersion = window.puzzleAggieIoUserScriptVersion ?? '0.x';
if (compareVersion(puzzleAggieIoUserScriptVersion, '1.0.1') === -1) {
    oldVersion(puzzleAggieIoUserScriptVersion);
    throw 'Old userscript version';
}

// General vars
var chatMessagesElm = document.getElementById('chat-messages') ?? createElement('div');

// Chat history vars
var imSender = false;
var showWsLog = localStorage.showWsLog === 'true';
var chatLogElm = document.getElementById('chat-log') ?? createElement('div');
var ws = null;
var roomName = window.ROOM_NAME ?? 'no';
var userName = localStorage.name;
var userColor = document.getElementsByClassName('user')[0].firstChild.style.backgroundColor;
if (userColor.startsWith('rgb')) userColor = rgbToHex(userColor);//localStorage.color;
var newUser = (userName == null || userColor == null);
var newUserNeedProcessing = false;
var messageQueue = [];
var users = [];
var knownUsers = [];
var extensionUsers = [];
var imSenderPendingMessages = [];
var imSenderPending = false;
var processMessage = msgToQueue;

// Emotes vars
var chatMutationBuffer = [];
var chatMutationFunc = (m, o) => chatMutationBuffer.push(m);
var emotesModalElm;
var chatObserver;
var chatEmotes = [];
var chatInputElm = document.getElementById('chat-input') ?? createElement('input');
var chatBoxElm = document.getElementById('chat-box') ?? createElement('form');
var sidePanelElm = document.getElementById('side-panel') ?? createElement('div', { innerNodes: [chatBoxElm] });
var emotesElm = createElement('button', {
    innerText: 'Emotes List', className: 'btn btn-outline-light btn-sm mx-2 d-none', id: 'emotes'
}, {
    'data-bs-toggle': 'modal', 'data-bs-target': '#emotesModal'
});

// Chat History code
usersFromDocument();

WebSocket.prototype.realSend = WebSocket.prototype.send;
WebSocket.prototype.send = wsSend;
chatHistoryInit();


// Emotes code
(chatObserver = new MutationObserver((a, b) => chatMutationFunc(a, b))).observe(chatMessagesElm, { childList: true });
(async function () {
    try {
        var responce = await (await gmFetch('https://data.firlin123.workers.dev/puzzle.aggie.io/chatemotes')).json();
        if (responce.error != null) { console.log('Error ' + responce.error) }
        else chatEmotes = responce;
    } catch (e) { console.log('Error fetching emotes'); }
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
})();

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

function oldVersion() {
    document.getElementById('chat').append(createElement('div', {
        innerNodes: [
            'Old version of emotes script.',
            createElement('br'),
            'Click ',
            createElement('a', {
                innerText: 'here', style: 'color:#fff',
                href: 'https://firlin123.github.io/pony/puzzle.aggie.io/chat.user.js',
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

// Chat history functions
function wsSend(data) {
    var args = arguments;
    if (ws != this) {
        ws = this;
        ws.realOnmessage = ws.onmessage;
        ws.onmessage = wsMessage;
        usersFromDocument();
        checkUsers();
    }
    if (typeof data === 'string' && data !== '') {
        try {
            json = JSON.parse(data);
            if (json.type === 'user') {
                userName = json.name;
                userColor = document.getElementsByClassName('user')[0].firstChild.style.backgroundColor;
                if (userColor.startsWith('rgb')) userColor = rgbToHex(userColor);//json.color;
                updateExtensionUsers();
                if (newUser && !newUserNeedProcessing) {
                    newUserNeedProcessing = true;
                }
                if (imSender) {
                    json.name = '\u034f' + json.name;
                    args[0] = JSON.stringify(json);
                }
            }
            if (showWsLog) console.log('>>', json);
        } catch (e) { console.log(e); }
    }
    WebSocket.prototype.realSend.apply(this, args);
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

function wsMessage(e) {
    var cancelled = false;
    var args = arguments;
    var usersEvent = false;
    if (typeof e.data === 'string' && e.data !== '') {
        try {
            json = JSON.parse(e.data);
            if (json.type === 'chat') {
                if (json.name.startsWith('\u034f')) {
                    json.name = json.name.substring(1);
                    Object.defineProperty(args[0], "data", { value: JSON.stringify(json) });
                }
                var message = {
                    time: Date.now(),
                    text: json.message,
                    userId: json.id,
                    userName: json.name,
                    userColor: json.color
                };
                if (imSenderPending) imSenderPendingMessages.push(message);
                else processMessage(message);
            }
            else if (json.type == 'users') {
                usersEvent = true;
                users = json.users;
                updateKnownUsers();
                if (newUserNeedProcessing) {
                    newUserNeedProcessing = false;
                    (async () => {
                        while (messageQueue.length > 0) {
                            const message = messageQueue.shift();
                            await addMessage(message);
                        }
                        newUser = false;
                        checkUsers();
                        processMessage = mgsToServ;
                    })();
                }
                else checkUsers();
                data = JSON.parse(e.data);
                data.users.forEach(u => (u.name = u.name.startsWith('\u034f') ? u.name.substring(1) : u.name));
                Object.defineProperty(args[0], "data", { value: JSON.stringify(data) });
            }
            if (showWsLog) console.log('<<', json);
        } catch (e) { console.log(e); }
    }
    if (!cancelled) ws.realOnmessage.apply(this, args);
    if (usersEvent) {
        updateExtensionUsersElms();
    }
}

function updateKnownUsers() {
    var knownUsersChanged = false;
    users.forEach(user => {
        var uName = user.name.startsWith('\u034f') ? user.name.substring(1) : user.name;
        var uColor = user.color;
        if (!(knownUsers.some(u => u.name === uName && u.color === uColor))) {
            knownUsers.push({ 'name': uName, 'color': uColor });
            knownUsersChanged = true;
        }
    });
    if (knownUsersChanged) updateExtensionUsers();
}

async function updateExtensionUsers() {
    var data = new FormData();
    data.append('type', 'getUsers');
    data.append('room', roomName);
    data.append('userName', userName ?? 'no');
    data.append('userColor', userColor ?? 'no');
    try {
        const responce = await (await gmFetch(
            'https://data.firlin123.workers.dev/puzzle.aggie.io/chathistory',
            { method: "POST", data })
        ).json();
        if (responce.error != null) console.log('Error ' + responce.error);
        else {
            extensionUsers = responce;
        }
    } catch (e) { console.log('Error getting extension users') }
    updateExtensionUsersElms();
}

function updateExtensionUsersElms() {
    const userElms = Array.from(document.getElementsByClassName('user'));
    for (const extensionUser of extensionUsers) {
        var eName = extensionUser.name;
        var eColor = extensionUser.color;
        if (!(knownUsers.some(u => u.name === eName && u.color === eColor))) {
            knownUsers.push({ 'name': eName, 'color': eColor });
        }
        var matchingUsersElms = userElms.filter(userElm => {
            var elName = userElm.lastChild.textContent;
            if (elName.startsWith('\u034f')) elName = elName.substring(1);
            var elColor = userElm.firstChild.style.backgroundColor;
            if (elColor.startsWith('rgb')) elColor = rgbToHex(elColor);
            return eName === elName && eColor === elColor;
        });
        matchingUsersElms.forEach(mUE => {
            var ext = createElement('span', {
                className: 'emote-user', title: 'This user has emotes plugin', innerText: '(emt)',
            });
            preventAppEvents(ext);
            mUE.insertAdjacentElement('beforeEnd', ext);
        });
    }
}

function checkUsers() {
    if (!newUser) {
        var senders = users.filter(u => u.name.startsWith('\u034f'));
        var containMe = senders.some(s => (s.name === '\u034f' + userName && s.color === userColor));
        if (senders.length > 1) {
            if (containMe && imSender) {
                imSender = false;
                ws.realSend(JSON.stringify({ type: "user", name: userName, color: userColor }));
            }
        }
        else if (senders.length == 0) {
            if (!imSenderPending) {
                imSenderPending = true;
                setTimeout(() => {
                    if (users.filter(u => u.name.startsWith('\u034f')).length == 0) {
                        imSender = true;
                        ws.realSend(JSON.stringify({ type: "user", name: '\u034f' + userName, color: userColor }));
                        imSenderPendingMessages.forEach(processMessage);
                    }
                    imSenderPendingMessages = [];
                    imSenderPending = false;
                }, Math.floor(Math.random() * 100))
            }
        }
    }
}

async function addMessage(message) {
    var data = new FormData();
    data.append('type', 'addMessage');
    data.append('room', roomName);
    data.append('time', message.time);
    data.append('text', message.text);
    data.append('userId', message.userId);
    data.append('userName', message.userName);
    data.append('userColor', message.userColor);
    try {
        const responce = await (await gmFetch(
            'https://data.firlin123.workers.dev/puzzle.aggie.io/chathistory',
            { method: "POST", data })
        ).json();
        if (responce.error != null) console.log('Error ' + responce.error);
    } catch (e) { console.log('Error sending message') }
}

function msgToQueue(message) {
    messageQueue.push(message);
}

async function mgsToServ(message) {
    if (imSender) {
        processMessage = msgToQueue;
        while (messageQueue.length > 0) {
            const messageQ = messageQueue.shift();
            await addMessage(messageQ);
        }
        await addMessage(message);
        processMessage = mgsToServ;
    }
}

async function chatHistoryInit() {
    const data = new FormData();
    data.append('type', 'getHistory');
    data.append('room', roomName);
    try {
        const responce = await (await gmFetch(
            'https://data.firlin123.workers.dev/puzzle.aggie.io/chathistory',
            { method: 'POST', data }
        )).json();
        if (responce.error != null) console.log('Error ' + responce.error);
        else {
            appendMessageHistory(responce);
            if (!newUser) {
                while (messageQueue.length > 0) {
                    const message = messageQueue.shift();
                    await addMessage(message);
                }
                processMessage = mgsToServ;
            }
        }
    }
    catch (e) { console.log('Error fetching chat history') }
}

function appendMessageHistory(messages) {
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
                            innerText: message.userName,
                            style: 'color:' + message.userColor
                        }),
                        createElement("div", {
                            className: 'chat-content',
                            innerText: message.text,
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

function usersFromDocument() {
    users = [];
    for (userElm of document.getElementsByClassName('user')) {
        const color = userElm.firstChild.style.backgroundColor;
        var nameStr = userElm.lastChild.textContent;
        userElm.lastChild.textContent = nameStr = nameStr.startsWith('\u034f') ? nameStr.substring(1) : nameStr;
        var user = {
            'name': nameStr,
            'color': color.startsWith('rgb') ? rgbToHex(color) : color
        }
        users.push(user);
    }
    updateKnownUsers();
}

// Emotes functions
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
    var bootstrapMinJs =
        "/*!" +
        "  * Bootstrap v5.0.2 (https://getbootstrap.com/)" +
        "  * Copyright 2011-2021 The Bootstrap Authors (https://github.com/twbs/bootstrap/graphs/contributors)" +
        "  * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)" +
        "  */" +
        "!function(t,e){\"object\"==typeof exports&&\"undefined\"!=typeof module?module.exports=e(require(\"@popperjs/core\")):\"function\"==typeof define&&define.amd?define([\"@" +
        "popperjs/core\"],e):(t=\"undefined\"!=typeof globalThis?globalThis:t||self).bootstrap=e(t.Popper)}(this,(function(t){\"use strict\";function e(t){if(t&&t.__esModule)" +
        "return t;var e=Object.create(null);return t&&Object.keys(t).forEach((function(s){if(\"default\"!==s){var i=Object.getOwnPropertyDescriptor(t,s);Object.definePrope" +
        "rty(e,s,i.get?i:{enumerable:!0,get:function(){return t[s]}})}})),e.default=t,Object.freeze(e)}var s=e(t);const i={find:(t,e=document.documentElement)=>[].concat" +
        "(...Element.prototype.querySelectorAll.call(e,t)),findOne:(t,e=document.documentElement)=>Element.prototype.querySelector.call(e,t),children:(t,e)=>[].concat(.." +
        ".t.children).filter(t=>t.matches(e)),parents(t,e){const s=[];let i=t.parentNode;for(;i&&i.nodeType===Node.ELEMENT_NODE&&3!==i.nodeType;)i.matches(e)&&s.push(i)," +
        "i=i.parentNode;return s},prev(t,e){let s=t.previousElementSibling;for(;s;){if(s.matches(e))return[s];s=s.previousElementSibling}return[]},next(t,e){let s=t.next" +
        "ElementSibling;for(;s;){if(s.matches(e))return[s];s=s.nextElementSibling}return[]}},n=t=>{do{t+=Math.floor(1e6*Math.random())}while(document.getElementById(t));" +
        "return t},o=t=>{let e=t.getAttribute(\"data-bs-target\");if(!e||\"#\"===e){let s=t.getAttribute(\"href\");if(!s||!s.includes(\"#\")&&!s.startsWith(\".\"))return null;s.in" +
        "cludes(\"#\")&&!s.startsWith(\"#\")&&(s=\"#\"+s.split(\"#\")[1]),e=s&&\"#\"!==s?s.trim():null}return e},r=t=>{const e=o(t);return e&&document.querySelector(e)?e:null},a=t" +
        "=>{const e=o(t);return e?document.querySelector(e):null},l=t=>{t.dispatchEvent(new Event(\"transitionend\"))},c=t=>!(!t||\"object\"!=typeof t)&&(void 0!==t.jquery&&" +
        "(t=t[0]),void 0!==t.nodeType),h=t=>c(t)?t.jquery?t[0]:t:\"string\"==typeof t&&t.length>0?i.findOne(t):null,d=(t,e,s)=>{Object.keys(s).forEach(i=>{const n=s[i],o=e" +
        "[i],r=o&&c(o)?\"element\":null==(a=o)?\"\"+a:{}.toString.call(a).match(/\\s([a-z]+)/i)[1].toLowerCase();var a;if(!new RegExp(n).test(r))throw new TypeError(`${t.toUp" +
        "perCase()}: Option \"${i}\" provided type \"${r}\" but expected type \"${n}\".`)})},u=t=>!(!c(t)||0===t.getClientRects().length)&&\"visible\"===getComputedStyle(t).getP" +
        "ropertyValue(\"visibility\"),g=t=>!t||t.nodeType!==Node.ELEMENT_NODE||!!t.classList.contains(\"disabled\")||(void 0!==t.disabled?t.disabled:t.hasAttribute(\"disabled" +
        "\")&&\"false\"!==t.getAttribute(\"disabled\")),p=t=>{if(!document.documentElement.attachShadow)return null;if(\"function\"==typeof t.getRootNode){const e=t.getRootNode" +
        "();return e instanceof ShadowRoot?e:null}return t instanceof ShadowRoot?t:t.parentNode?p(t.parentNode):null},f=()=>{},m=t=>t.offsetHeight,_=()=>{const{jQuery:t}" +
        "=window;return t&&!document.body.hasAttribute(\"data-bs-no-jquery\")?t:null},b=[],v=()=>\"rtl\"===document.documentElement.dir,y=t=>{var e;e=()=>{const e=_();if(e){" +
        "const s=t.NAME,i=e.fn[s];e.fn[s]=t.jQueryInterface,e.fn[s].Constructor=t,e.fn[s].noConflict=()=>(e.fn[s]=i,t.jQueryInterface)}},\"loading\"===document.readyState?" +
        "(b.length||document.addEventListener(\"DOMContentLoaded\",()=>{b.forEach(t=>t())}),b.push(e)):e()},w=t=>{\"function\"==typeof t&&t()},E=(t,e,s=!0)=>{if(!s)return vo" +
        "id w(t);const i=(t=>{if(!t)return 0;let{transitionDuration:e,transitionDelay:s}=window.getComputedStyle(t);const i=Number.parseFloat(e),n=Number.parseFloat(s);r" +
        "eturn i||n?(e=e.split(\",\")[0],s=s.split(\",\")[0],1e3*(Number.parseFloat(e)+Number.parseFloat(s))):0})(e)+5;let n=!1;const o=({target:s})=>{s===e&&(n=!0,e.removeE" +
        "ventListener(\"transitionend\",o),w(t))};e.addEventListener(\"transitionend\",o),setTimeout(()=>{n||l(e)},i)},A=(t,e,s,i)=>{let n=t.indexOf(e);if(-1===n)return t[!s" +
        "&&i?t.length-1:0];const o=t.length;return n+=s?1:-1,i&&(n=(n+o)%o),t[Math.max(0,Math.min(n,o-1))]},T=/[^.]*(?=\\..*)\\.|.*/,C=/\\..*/,k=/::\\d+$/,L={};let O=1;const" +
        " D={mouseenter:\"mouseover\",mouseleave:\"mouseout\"},I=/^(mouseenter|mouseleave)/i,N=new Set([\"click\",\"dblclick\",\"mouseup\",\"mousedown\",\"contextmenu\",\"mousewheel\",\"" +
        "DOMMouseScroll\",\"mouseover\",\"mouseout\",\"mousemove\",\"selectstart\",\"selectend\",\"keydown\",\"keypress\",\"keyup\",\"orientationchange\",\"touchstart\",\"touchmove\",\"touchend" +
        "\",\"touchcancel\",\"pointerdown\",\"pointermove\",\"pointerup\",\"pointerleave\",\"pointercancel\",\"gesturestart\",\"gesturechange\",\"gestureend\",\"focus\",\"blur\",\"change\",\"rese" +
        "t\",\"select\",\"submit\",\"focusin\",\"focusout\",\"load\",\"unload\",\"beforeunload\",\"resize\",\"move\",\"DOMContentLoaded\",\"readystatechange\",\"error\",\"abort\",\"scroll\"]);functi" +
        "on S(t,e){return e&&`${e}::${O++}`||t.uidEvent||O++}function x(t){const e=S(t);return t.uidEvent=e,L[e]=L[e]||{},L[e]}function M(t,e,s=null){const i=Object.keys" +
        "(t);for(let n=0,o=i.length;n<o;n++){const o=t[i[n]];if(o.originalHandler===e&&o.delegationSelector===s)return o}return null}function P(t,e,s){const i=\"string\"==" +
        "typeof e,n=i?s:e;let o=R(t);return N.has(o)||(o=t),[i,n,o]}function j(t,e,s,i,n){if(\"string\"!=typeof e||!t)return;if(s||(s=i,i=null),I.test(e)){const t=t=>funct" +
        "ion(e){if(!e.relatedTarget||e.relatedTarget!==e.delegateTarget&&!e.delegateTarget.contains(e.relatedTarget))return t.call(this,e)};i?i=t(i):s=t(s)}const[o,r,a]=" +
        "P(e,s,i),l=x(t),c=l[a]||(l[a]={}),h=M(c,r,o?s:null);if(h)return void(h.oneOff=h.oneOff&&n);const d=S(r,e.replace(T,\"\")),u=o?function(t,e,s){return function i(n)" +
        "{const o=t.querySelectorAll(e);for(let{target:r}=n;r&&r!==this;r=r.parentNode)for(let a=o.length;a--;)if(o[a]===r)return n.delegateTarget=r,i.oneOff&&B.off(t,n." +
        "type,e,s),s.apply(r,[n]);return null}}(t,s,i):function(t,e){return function s(i){return i.delegateTarget=t,s.oneOff&&B.off(t,i.type,e),e.apply(t,[i])}}(t,s);u.d" +
        "elegationSelector=o?s:null,u.originalHandler=r,u.oneOff=n,u.uidEvent=d,c[d]=u,t.addEventListener(a,u,o)}function H(t,e,s,i,n){const o=M(e[s],i,n);o&&(t.removeEv" +
        "entListener(s,o,Boolean(n)),delete e[s][o.uidEvent])}function R(t){return t=t.replace(C,\"\"),D[t]||t}const B={on(t,e,s,i){j(t,e,s,i,!1)},one(t,e,s,i){j(t,e,s,i,!" +
        "0)},off(t,e,s,i){if(\"string\"!=typeof e||!t)return;const[n,o,r]=P(e,s,i),a=r!==e,l=x(t),c=e.startsWith(\".\");if(void 0!==o){if(!l||!l[r])return;return void H(t,l," +
        "r,o,n?s:null)}c&&Object.keys(l).forEach(s=>{!function(t,e,s,i){const n=e[s]||{};Object.keys(n).forEach(o=>{if(o.includes(i)){const i=n[o];H(t,e,s,i.originalHand" +
        "ler,i.delegationSelector)}})}(t,l,s,e.slice(1))});const h=l[r]||{};Object.keys(h).forEach(s=>{const i=s.replace(k,\"\");if(!a||e.includes(i)){const e=h[s];H(t,l,r" +
        ",e.originalHandler,e.delegationSelector)}})},trigger(t,e,s){if(\"string\"!=typeof e||!t)return null;const i=_(),n=R(e),o=e!==n,r=N.has(n);let a,l=!0,c=!0,h=!1,d=n" +
        "ull;return o&&i&&(a=i.Event(e,s),i(t).trigger(a),l=!a.isPropagationStopped(),c=!a.isImmediatePropagationStopped(),h=a.isDefaultPrevented()),r?(d=document.create" +
        "Event(\"HTMLEvents\"),d.initEvent(n,l,!0)):d=new CustomEvent(e,{bubbles:l,cancelable:!0}),void 0!==s&&Object.keys(s).forEach(t=>{Object.defineProperty(d,t,{get:()" +
        "=>s[t]})}),h&&d.preventDefault(),c&&t.dispatchEvent(d),d.defaultPrevented&&void 0!==a&&a.preventDefault(),d}},$=new Map;var W={set(t,e,s){$.has(t)||$.set(t,new " +
        "Map);const i=$.get(t);i.has(e)||0===i.size?i.set(e,s):console.error(`Bootstrap doesn't allow more than one instance per element. Bound instance: ${Array.from(i." +
        "keys())[0]}.`)},get:(t,e)=>$.has(t)&&$.get(t).get(e)||null,remove(t,e){if(!$.has(t))return;const s=$.get(t);s.delete(e),0===s.size&&$.delete(t)}};class q{constr" +
        "uctor(t){(t=h(t))&&(this._element=t,W.set(this._element,this.constructor.DATA_KEY,this))}dispose(){W.remove(this._element,this.constructor.DATA_KEY),B.off(this." +
        "_element,this.constructor.EVENT_KEY),Object.getOwnPropertyNames(this).forEach(t=>{this[t]=null})}_queueCallback(t,e,s=!0){E(t,e,s)}static getInstance(t){return " +
        "W.get(t,this.DATA_KEY)}static getOrCreateInstance(t,e={}){return this.getInstance(t)||new this(t,\"object\"==typeof e?e:null)}static get VERSION(){return\"5.0.2\"}s" +
        "tatic get NAME(){throw new Error('You have to implement the static method \"NAME\", for each component!')}static get DATA_KEY(){return\"bs.\"+this.NAME}static get E" +
        "VENT_KEY(){return\".\"+this.DATA_KEY}}class z extends q{static get NAME(){return\"alert\"}close(t){const e=t?this._getRootElement(t):this._element,s=this._triggerCl" +
        "oseEvent(e);null===s||s.defaultPrevented||this._removeElement(e)}_getRootElement(t){return a(t)||t.closest(\".alert\")}_triggerCloseEvent(t){return B.trigger(t,\"c" +
        "lose.bs.alert\")}_removeElement(t){t.classList.remove(\"show\");const e=t.classList.contains(\"fade\");this._queueCallback(()=>this._destroyElement(t),t,e)}_destroyE" +
        "lement(t){t.remove(),B.trigger(t,\"closed.bs.alert\")}static jQueryInterface(t){return this.each((function(){const e=z.getOrCreateInstance(this);\"close\"===t&&e[t]" +
        "(this)}))}static handleDismiss(t){return function(e){e&&e.preventDefault(),t.close(this)}}}B.on(document,\"click.bs.alert.data-api\",'[data-bs-dismiss=\"alert\"]',z" +
        ".handleDismiss(new z)),y(z);class F extends q{static get NAME(){return\"button\"}toggle(){this._element.setAttribute(\"aria-pressed\",this._element.classList.toggle" +
        "(\"active\"))}static jQueryInterface(t){return this.each((function(){const e=F.getOrCreateInstance(this);\"toggle\"===t&&e[t]()}))}}function U(t){return\"true\"===t||" +
        "\"false\"!==t&&(t===Number(t).toString()?Number(t):\"\"===t||\"null\"===t?null:t)}function K(t){return t.replace(/[A-Z]/g,t=>\"-\"+t.toLowerCase())}B.on(document,\"click" +
        ".bs.button.data-api\",'[data-bs-toggle=\"button\"]',t=>{t.preventDefault();const e=t.target.closest('[data-bs-toggle=\"button\"]');F.getOrCreateInstance(e).toggle()}" +
        "),y(F);const V={setDataAttribute(t,e,s){t.setAttribute(\"data-bs-\"+K(e),s)},removeDataAttribute(t,e){t.removeAttribute(\"data-bs-\"+K(e))},getDataAttributes(t){if(" +
        "!t)return{};const e={};return Object.keys(t.dataset).filter(t=>t.startsWith(\"bs\")).forEach(s=>{let i=s.replace(/^bs/,\"\");i=i.charAt(0).toLowerCase()+i.slice(1,i" +
        ".length),e[i]=U(t.dataset[s])}),e},getDataAttribute:(t,e)=>U(t.getAttribute(\"data-bs-\"+K(e))),offset(t){const e=t.getBoundingClientRect();return{top:e.top+docum" +
        "ent.body.scrollTop,left:e.left+document.body.scrollLeft}},position:t=>({top:t.offsetTop,left:t.offsetLeft})},Q={interval:5e3,keyboard:!0,slide:!1,pause:\"hover\"," +
        "wrap:!0,touch:!0},X={interval:\"(number|boolean)\",keyboard:\"boolean\",slide:\"(boolean|string)\",pause:\"(string|boolean)\",wrap:\"boolean\",touch:\"boolean\"},Y=\"next\",G" +
        "=\"prev\",Z=\"left\",J=\"right\",tt={ArrowLeft:J,ArrowRight:Z};class et extends q{constructor(t,e){super(t),this._items=null,this._interval=null,this._activeElement=n" +
        "ull,this._isPaused=!1,this._isSliding=!1,this.touchTimeout=null,this.touchStartX=0,this.touchDeltaX=0,this._config=this._getConfig(e),this._indicatorsElement=i." +
        "findOne(\".carousel-indicators\",this._element),this._touchSupported=\"ontouchstart\"in document.documentElement||navigator.maxTouchPoints>0,this._pointerEvent=Bool" +
        "ean(window.PointerEvent),this._addEventListeners()}static get Default(){return Q}static get NAME(){return\"carousel\"}next(){this._slide(Y)}nextWhenVisible(){!doc" +
        "ument.hidden&&u(this._element)&&this.next()}prev(){this._slide(G)}pause(t){t||(this._isPaused=!0),i.findOne(\".carousel-item-next, .carousel-item-prev\",this._ele" +
        "ment)&&(l(this._element),this.cycle(!0)),clearInterval(this._interval),this._interval=null}cycle(t){t||(this._isPaused=!1),this._interval&&(clearInterval(this._" +
        "interval),this._interval=null),this._config&&this._config.interval&&!this._isPaused&&(this._updateInterval(),this._interval=setInterval((document.visibilityStat" +
        "e?this.nextWhenVisible:this.next).bind(this),this._config.interval))}to(t){this._activeElement=i.findOne(\".active.carousel-item\",this._element);const e=this._ge" +
        "tItemIndex(this._activeElement);if(t>this._items.length-1||t<0)return;if(this._isSliding)return void B.one(this._element,\"slid.bs.carousel\",()=>this.to(t));if(e" +
        "===t)return this.pause(),void this.cycle();const s=t>e?Y:G;this._slide(s,this._items[t])}_getConfig(t){return t={...Q,...V.getDataAttributes(this._element),...\"" +
        "object\"==typeof t?t:{}},d(\"carousel\",t,X),t}_handleSwipe(){const t=Math.abs(this.touchDeltaX);if(t<=40)return;const e=t/this.touchDeltaX;this.touchDeltaX=0,e&&t" +
        "his._slide(e>0?J:Z)}_addEventListeners(){this._config.keyboard&&B.on(this._element,\"keydown.bs.carousel\",t=>this._keydown(t)),\"hover\"===this._config.pause&&(B.o" +
        "n(this._element,\"mouseenter.bs.carousel\",t=>this.pause(t)),B.on(this._element,\"mouseleave.bs.carousel\",t=>this.cycle(t))),this._config.touch&&this._touchSupport" +
        "ed&&this._addTouchEventListeners()}_addTouchEventListeners(){const t=t=>{!this._pointerEvent||\"pen\"!==t.pointerType&&\"touch\"!==t.pointerType?this._pointerEvent|" +
        "|(this.touchStartX=t.touches[0].clientX):this.touchStartX=t.clientX},e=t=>{this.touchDeltaX=t.touches&&t.touches.length>1?0:t.touches[0].clientX-this.touchStart" +
        "X},s=t=>{!this._pointerEvent||\"pen\"!==t.pointerType&&\"touch\"!==t.pointerType||(this.touchDeltaX=t.clientX-this.touchStartX),this._handleSwipe(),\"hover\"===this._" +
        "config.pause&&(this.pause(),this.touchTimeout&&clearTimeout(this.touchTimeout),this.touchTimeout=setTimeout(t=>this.cycle(t),500+this._config.interval))};i.find" +
        "(\".carousel-item img\",this._element).forEach(t=>{B.on(t,\"dragstart.bs.carousel\",t=>t.preventDefault())}),this._pointerEvent?(B.on(this._element,\"pointerdown.bs." +
        "carousel\",e=>t(e)),B.on(this._element,\"pointerup.bs.carousel\",t=>s(t)),this._element.classList.add(\"pointer-event\")):(B.on(this._element,\"touchstart.bs.carousel" +
        "\",e=>t(e)),B.on(this._element,\"touchmove.bs.carousel\",t=>e(t)),B.on(this._element,\"touchend.bs.carousel\",t=>s(t)))}_keydown(t){if(/input|textarea/i.test(t.targe" +
        "t.tagName))return;const e=tt[t.key];e&&(t.preventDefault(),this._slide(e))}_getItemIndex(t){return this._items=t&&t.parentNode?i.find(\".carousel-item\",t.parentN" +
        "ode):[],this._items.indexOf(t)}_getItemByOrder(t,e){const s=t===Y;return A(this._items,e,s,this._config.wrap)}_triggerSlideEvent(t,e){const s=this._getItemIndex" +
        "(t),n=this._getItemIndex(i.findOne(\".active.carousel-item\",this._element));return B.trigger(this._element,\"slide.bs.carousel\",{relatedTarget:t,direction:e,from:" +
        "n,to:s})}_setActiveIndicatorElement(t){if(this._indicatorsElement){const e=i.findOne(\".active\",this._indicatorsElement);e.classList.remove(\"active\"),e.removeAtt" +
        "ribute(\"aria-current\");const s=i.find(\"[data-bs-target]\",this._indicatorsElement);for(let e=0;e<s.length;e++)if(Number.parseInt(s[e].getAttribute(\"data-bs-slide" +
        "-to\"),10)===this._getItemIndex(t)){s[e].classList.add(\"active\"),s[e].setAttribute(\"aria-current\",\"true\");break}}}_updateInterval(){const t=this._activeElement||" +
        "i.findOne(\".active.carousel-item\",this._element);if(!t)return;const e=Number.parseInt(t.getAttribute(\"data-bs-interval\"),10);e?(this._config.defaultInterval=thi" +
        "s._config.defaultInterval||this._config.interval,this._config.interval=e):this._config.interval=this._config.defaultInterval||this._config.interval}_slide(t,e){" +
        "const s=this._directionToOrder(t),n=i.findOne(\".active.carousel-item\",this._element),o=this._getItemIndex(n),r=e||this._getItemByOrder(s,n),a=this._getItemIndex" +
        "(r),l=Boolean(this._interval),c=s===Y,h=c?\"carousel-item-start\":\"carousel-item-end\",d=c?\"carousel-item-next\":\"carousel-item-prev\",u=this._orderToDirection(s);if" +
        "(r&&r.classList.contains(\"active\"))return void(this._isSliding=!1);if(this._isSliding)return;if(this._triggerSlideEvent(r,u).defaultPrevented)return;if(!n||!r)r" +
        "eturn;this._isSliding=!0,l&&this.pause(),this._setActiveIndicatorElement(r),this._activeElement=r;const g=()=>{B.trigger(this._element,\"slid.bs.carousel\",{relat" +
        "edTarget:r,direction:u,from:o,to:a})};if(this._element.classList.contains(\"slide\")){r.classList.add(d),m(r),n.classList.add(h),r.classList.add(h);const t=()=>{r" +
        ".classList.remove(h,d),r.classList.add(\"active\"),n.classList.remove(\"active\",d,h),this._isSliding=!1,setTimeout(g,0)};this._queueCallback(t,n,!0)}else n.classLi" +
        "st.remove(\"active\"),r.classList.add(\"active\"),this._isSliding=!1,g();l&&this.cycle()}_directionToOrder(t){return[J,Z].includes(t)?v()?t===Z?G:Y:t===Z?Y:G:t}_ord" +
        "erToDirection(t){return[Y,G].includes(t)?v()?t===G?Z:J:t===G?J:Z:t}static carouselInterface(t,e){const s=et.getOrCreateInstance(t,e);let{_config:i}=s;\"object\"==" +
        "typeof e&&(i={...i,...e});const n=\"string\"==typeof e?e:i.slide;if(\"number\"==typeof e)s.to(e);else if(\"string\"==typeof n){if(void 0===s[n])throw new TypeError(`N" +
        "o method named \"${n}\"`);s[n]()}else i.interval&&i.ride&&(s.pause(),s.cycle())}static jQueryInterface(t){return this.each((function(){et.carouselInterface(this,t" +
        ")}))}static dataApiClickHandler(t){const e=a(this);if(!e||!e.classList.contains(\"carousel\"))return;const s={...V.getDataAttributes(e),...V.getDataAttributes(thi" +
        "s)},i=this.getAttribute(\"data-bs-slide-to\");i&&(s.interval=!1),et.carouselInterface(e,s),i&&et.getInstance(e).to(i),t.preventDefault()}}B.on(document,\"click.bs." +
        "carousel.data-api\",\"[data-bs-slide], [data-bs-slide-to]\",et.dataApiClickHandler),B.on(window,\"load.bs.carousel.data-api\",()=>{const t=i.find('[data-bs-ride=\"car" +
        "ousel\"]');for(let e=0,s=t.length;e<s;e++)et.carouselInterface(t[e],et.getInstance(t[e]))}),y(et);const st={toggle:!0,parent:\"\"},it={toggle:\"boolean\",parent:\"(st" +
        "ring|element)\"};class nt extends q{constructor(t,e){super(t),this._isTransitioning=!1,this._config=this._getConfig(e),this._triggerArray=i.find(`[data-bs-toggle" +
        "=\"collapse\"][href=\"#${this._element.id}\"],[data-bs-toggle=\"collapse\"][data-bs-target=\"#${this._element.id}\"]`);const s=i.find('[data-bs-toggle=\"collapse\"]');for" +
        "(let t=0,e=s.length;t<e;t++){const e=s[t],n=r(e),o=i.find(n).filter(t=>t===this._element);null!==n&&o.length&&(this._selector=n,this._triggerArray.push(e))}this" +
        "._parent=this._config.parent?this._getParent():null,this._config.parent||this._addAriaAndCollapsedClass(this._element,this._triggerArray),this._config.toggle&&t" +
        "his.toggle()}static get Default(){return st}static get NAME(){return\"collapse\"}toggle(){this._element.classList.contains(\"show\")?this.hide():this.show()}show(){" +
        "if(this._isTransitioning||this._element.classList.contains(\"show\"))return;let t,e;this._parent&&(t=i.find(\".show, .collapsing\",this._parent).filter(t=>\"string\"=" +
        "=typeof this._config.parent?t.getAttribute(\"data-bs-parent\")===this._config.parent:t.classList.contains(\"collapse\")),0===t.length&&(t=null));const s=i.findOne(t" +
        "his._selector);if(t){const i=t.find(t=>s!==t);if(e=i?nt.getInstance(i):null,e&&e._isTransitioning)return}if(B.trigger(this._element,\"show.bs.collapse\").defaultP" +
        "revented)return;t&&t.forEach(t=>{s!==t&&nt.collapseInterface(t,\"hide\"),e||W.set(t,\"bs.collapse\",null)});const n=this._getDimension();this._element.classList.rem" +
        "ove(\"collapse\"),this._element.classList.add(\"collapsing\"),this._element.style[n]=0,this._triggerArray.length&&this._triggerArray.forEach(t=>{t.classList.remove(" +
        "\"collapsed\"),t.setAttribute(\"aria-expanded\",!0)}),this.setTransitioning(!0);const o=\"scroll\"+(n[0].toUpperCase()+n.slice(1));this._queueCallback(()=>{this._elem" +
        "ent.classList.remove(\"collapsing\"),this._element.classList.add(\"collapse\",\"show\"),this._element.style[n]=\"\",this.setTransitioning(!1),B.trigger(this._element,\"s" +
        "hown.bs.collapse\")},this._element,!0),this._element.style[n]=this._element[o]+\"px\"}hide(){if(this._isTransitioning||!this._element.classList.contains(\"show\"))re" +
        "turn;if(B.trigger(this._element,\"hide.bs.collapse\").defaultPrevented)return;const t=this._getDimension();this._element.style[t]=this._element.getBoundingClientR" +
        "ect()[t]+\"px\",m(this._element),this._element.classList.add(\"collapsing\"),this._element.classList.remove(\"collapse\",\"show\");const e=this._triggerArray.length;if(" +
        "e>0)for(let t=0;t<e;t++){const e=this._triggerArray[t],s=a(e);s&&!s.classList.contains(\"show\")&&(e.classList.add(\"collapsed\"),e.setAttribute(\"aria-expanded\",!1)" +
        ")}this.setTransitioning(!0),this._element.style[t]=\"\",this._queueCallback(()=>{this.setTransitioning(!1),this._element.classList.remove(\"collapsing\"),this._elem" +
        "ent.classList.add(\"collapse\"),B.trigger(this._element,\"hidden.bs.collapse\")},this._element,!0)}setTransitioning(t){this._isTransitioning=t}_getConfig(t){return(" +
        "t={...st,...t}).toggle=Boolean(t.toggle),d(\"collapse\",t,it),t}_getDimension(){return this._element.classList.contains(\"width\")?\"width\":\"height\"}_getParent(){let" +
        "{parent:t}=this._config;t=h(t);const e=`[data-bs-toggle=\"collapse\"][data-bs-parent=\"${t}\"]`;return i.find(e,t).forEach(t=>{const e=a(t);this._addAriaAndCollapse" +
        "dClass(e,[t])}),t}_addAriaAndCollapsedClass(t,e){if(!t||!e.length)return;const s=t.classList.contains(\"show\");e.forEach(t=>{s?t.classList.remove(\"collapsed\"):t." +
        "classList.add(\"collapsed\"),t.setAttribute(\"aria-expanded\",s)})}static collapseInterface(t,e){let s=nt.getInstance(t);const i={...st,...V.getDataAttributes(t),.." +
        ".\"object\"==typeof e&&e?e:{}};if(!s&&i.toggle&&\"string\"==typeof e&&/show|hide/.test(e)&&(i.toggle=!1),s||(s=new nt(t,i)),\"string\"==typeof e){if(void 0===s[e])thr" +
        "ow new TypeError(`No method named \"${e}\"`);s[e]()}}static jQueryInterface(t){return this.each((function(){nt.collapseInterface(this,t)}))}}B.on(document,\"click." +
        "bs.collapse.data-api\",'[data-bs-toggle=\"collapse\"]',(function(t){(\"A\"===t.target.tagName||t.delegateTarget&&\"A\"===t.delegateTarget.tagName)&&t.preventDefault();" +
        "const e=V.getDataAttributes(this),s=r(this);i.find(s).forEach(t=>{const s=nt.getInstance(t);let i;s?(null===s._parent&&\"string\"==typeof e.parent&&(s._config.par" +
        "ent=e.parent,s._parent=s._getParent()),i=\"toggle\"):i=e,nt.collapseInterface(t,i)})})),y(nt);const ot=new RegExp(\"ArrowUp|ArrowDown|Escape\"),rt=v()?\"top-end\":\"to" +
        "p-start\",at=v()?\"top-start\":\"top-end\",lt=v()?\"bottom-end\":\"bottom-start\",ct=v()?\"bottom-start\":\"bottom-end\",ht=v()?\"left-start\":\"right-start\",dt=v()?\"right-star" +
        "t\":\"left-start\",ut={offset:[0,2],boundary:\"clippingParents\",reference:\"toggle\",display:\"dynamic\",popperConfig:null,autoClose:!0},gt={offset:\"(array|string|funct" +
        "ion)\",boundary:\"(string|element)\",reference:\"(string|element|object)\",display:\"string\",popperConfig:\"(null|object|function)\",autoClose:\"(boolean|string)\"};class" +
        " pt extends q{constructor(t,e){super(t),this._popper=null,this._config=this._getConfig(e),this._menu=this._getMenuElement(),this._inNavbar=this._detectNavbar()," +
        "this._addEventListeners()}static get Default(){return ut}static get DefaultType(){return gt}static get NAME(){return\"dropdown\"}toggle(){g(this._element)||(this." +
        "_element.classList.contains(\"show\")?this.hide():this.show())}show(){if(g(this._element)||this._menu.classList.contains(\"show\"))return;const t=pt.getParentFromEl" +
        "ement(this._element),e={relatedTarget:this._element};if(!B.trigger(this._element,\"show.bs.dropdown\",e).defaultPrevented){if(this._inNavbar)V.setDataAttribute(th" +
        "is._menu,\"popper\",\"none\");else{if(void 0===s)throw new TypeError(\"Bootstrap's dropdowns require Popper (https://popper.js.org)\");let e=this._element;\"parent\"===" +
        "this._config.reference?e=t:c(this._config.reference)?e=h(this._config.reference):\"object\"==typeof this._config.reference&&(e=this._config.reference);const i=thi" +
        "s._getPopperConfig(),n=i.modifiers.find(t=>\"applyStyles\"===t.name&&!1===t.enabled);this._popper=s.createPopper(e,this._menu,i),n&&V.setDataAttribute(this._menu," +
        "\"popper\",\"static\")}\"ontouchstart\"in document.documentElement&&!t.closest(\".navbar-nav\")&&[].concat(...document.body.children).forEach(t=>B.on(t,\"mouseover\",f))," +
        "this._element.focus(),this._element.setAttribute(\"aria-expanded\",!0),this._menu.classList.toggle(\"show\"),this._element.classList.toggle(\"show\"),B.trigger(this._" +
        "element,\"shown.bs.dropdown\",e)}}hide(){if(g(this._element)||!this._menu.classList.contains(\"show\"))return;const t={relatedTarget:this._element};this._completeHi" +
        "de(t)}dispose(){this._popper&&this._popper.destroy(),super.dispose()}update(){this._inNavbar=this._detectNavbar(),this._popper&&this._popper.update()}_addEventL" +
        "isteners(){B.on(this._element,\"click.bs.dropdown\",t=>{t.preventDefault(),this.toggle()})}_completeHide(t){B.trigger(this._element,\"hide.bs.dropdown\",t).defaultP" +
        "revented||(\"ontouchstart\"in document.documentElement&&[].concat(...document.body.children).forEach(t=>B.off(t,\"mouseover\",f)),this._popper&&this._popper.destroy" +
        "(),this._menu.classList.remove(\"show\"),this._element.classList.remove(\"show\"),this._element.setAttribute(\"aria-expanded\",\"false\"),V.removeDataAttribute(this._me" +
        "nu,\"popper\"),B.trigger(this._element,\"hidden.bs.dropdown\",t))}_getConfig(t){if(t={...this.constructor.Default,...V.getDataAttributes(this._element),...t},d(\"dro" +
        "pdown\",t,this.constructor.DefaultType),\"object\"==typeof t.reference&&!c(t.reference)&&\"function\"!=typeof t.reference.getBoundingClientRect)throw new TypeError(\"" +
        "dropdown\".toUpperCase()+': Option \"reference\" provided type \"object\" without a required \"getBoundingClientRect\" method.');return t}_getMenuElement(){return i.ne" +
        "xt(this._element,\".dropdown-menu\")[0]}_getPlacement(){const t=this._element.parentNode;if(t.classList.contains(\"dropend\"))return ht;if(t.classList.contains(\"dro" +
        "pstart\"))return dt;const e=\"end\"===getComputedStyle(this._menu).getPropertyValue(\"--bs-position\").trim();return t.classList.contains(\"dropup\")?e?at:rt:e?ct:lt}_" +
        "detectNavbar(){return null!==this._element.closest(\".navbar\")}_getOffset(){const{offset:t}=this._config;return\"string\"==typeof t?t.split(\",\").map(t=>Number.pars" +
        "eInt(t,10)):\"function\"==typeof t?e=>t(e,this._element):t}_getPopperConfig(){const t={placement:this._getPlacement(),modifiers:[{name:\"preventOverflow\",options:{" +
        "boundary:this._config.boundary}},{name:\"offset\",options:{offset:this._getOffset()}}]};return\"static\"===this._config.display&&(t.modifiers=[{name:\"applyStyles\",e" +
        "nabled:!1}]),{...t,...\"function\"==typeof this._config.popperConfig?this._config.popperConfig(t):this._config.popperConfig}}_selectMenuItem({key:t,target:e}){con" +
        "st s=i.find(\".dropdown-menu .dropdown-item:not(.disabled):not(:disabled)\",this._menu).filter(u);s.length&&A(s,e,\"ArrowDown\"===t,!s.includes(e)).focus()}static d" +
        "ropdownInterface(t,e){const s=pt.getOrCreateInstance(t,e);if(\"string\"==typeof e){if(void 0===s[e])throw new TypeError(`No method named \"${e}\"`);s[e]()}}static j" +
        "QueryInterface(t){return this.each((function(){pt.dropdownInterface(this,t)}))}static clearMenus(t){if(t&&(2===t.button||\"keyup\"===t.type&&\"Tab\"!==t.key))return" +
        ";const e=i.find('[data-bs-toggle=\"dropdown\"]');for(let s=0,i=e.length;s<i;s++){const i=pt.getInstance(e[s]);if(!i||!1===i._config.autoClose)continue;if(!i._elem" +
        "ent.classList.contains(\"show\"))continue;const n={relatedTarget:i._element};if(t){const e=t.composedPath(),s=e.includes(i._menu);if(e.includes(i._element)||\"insi" +
        "de\"===i._config.autoClose&&!s||\"outside\"===i._config.autoClose&&s)continue;if(i._menu.contains(t.target)&&(\"keyup\"===t.type&&\"Tab\"===t.key||/input|select|option" +
        "|textarea|form/i.test(t.target.tagName)))continue;\"click\"===t.type&&(n.clickEvent=t)}i._completeHide(n)}}static getParentFromElement(t){return a(t)||t.parentNod" +
        "e}static dataApiKeydownHandler(t){if(/input|textarea/i.test(t.target.tagName)?\"Space\"===t.key||\"Escape\"!==t.key&&(\"ArrowDown\"!==t.key&&\"ArrowUp\"!==t.key||t.targ" +
        "et.closest(\".dropdown-menu\")):!ot.test(t.key))return;const e=this.classList.contains(\"show\");if(!e&&\"Escape\"===t.key)return;if(t.preventDefault(),t.stopPropagat" +
        "ion(),g(this))return;const s=()=>this.matches('[data-bs-toggle=\"dropdown\"]')?this:i.prev(this,'[data-bs-toggle=\"dropdown\"]')[0];return\"Escape\"===t.key?(s().focu" +
        "s(),void pt.clearMenus()):\"ArrowUp\"===t.key||\"ArrowDown\"===t.key?(e||s().click(),void pt.getInstance(s())._selectMenuItem(t)):void(e&&\"Space\"!==t.key||pt.clearM" +
        "enus())}}B.on(document,\"keydown.bs.dropdown.data-api\",'[data-bs-toggle=\"dropdown\"]',pt.dataApiKeydownHandler),B.on(document,\"keydown.bs.dropdown.data-api\",\".dro" +
        "pdown-menu\",pt.dataApiKeydownHandler),B.on(document,\"click.bs.dropdown.data-api\",pt.clearMenus),B.on(document,\"keyup.bs.dropdown.data-api\",pt.clearMenus),B.on(d" +
        "ocument,\"click.bs.dropdown.data-api\",'[data-bs-toggle=\"dropdown\"]',(function(t){t.preventDefault(),pt.dropdownInterface(this)})),y(pt);class ft{constructor(){th" +
        "is._element=document.body}getWidth(){const t=document.documentElement.clientWidth;return Math.abs(window.innerWidth-t)}hide(){const t=this.getWidth();this._disa" +
        "bleOverFlow(),this._setElementAttributes(this._element,\"paddingRight\",e=>e+t),this._setElementAttributes(\".fixed-top, .fixed-bottom, .is-fixed, .sticky-top\",\"pa" +
        "ddingRight\",e=>e+t),this._setElementAttributes(\".sticky-top\",\"marginRight\",e=>e-t)}_disableOverFlow(){this._saveInitialAttribute(this._element,\"overflow\"),this." +
        "_element.style.overflow=\"hidden\"}_setElementAttributes(t,e,s){const i=this.getWidth();this._applyManipulationCallback(t,t=>{if(t!==this._element&&window.innerWi" +
        "dth>t.clientWidth+i)return;this._saveInitialAttribute(t,e);const n=window.getComputedStyle(t)[e];t.style[e]=s(Number.parseFloat(n))+\"px\"})}reset(){this._resetEl" +
        "ementAttributes(this._element,\"overflow\"),this._resetElementAttributes(this._element,\"paddingRight\"),this._resetElementAttributes(\".fixed-top, .fixed-bottom, .i" +
        "s-fixed, .sticky-top\",\"paddingRight\"),this._resetElementAttributes(\".sticky-top\",\"marginRight\")}_saveInitialAttribute(t,e){const s=t.style[e];s&&V.setDataAttrib" +
        "ute(t,e,s)}_resetElementAttributes(t,e){this._applyManipulationCallback(t,t=>{const s=V.getDataAttribute(t,e);void 0===s?t.style.removeProperty(e):(V.removeData" +
        "Attribute(t,e),t.style[e]=s)})}_applyManipulationCallback(t,e){c(t)?e(t):i.find(t,this._element).forEach(e)}isOverflowing(){return this.getWidth()>0}}const mt={" +
        "isVisible:!0,isAnimated:!1,rootElement:\"body\",clickCallback:null},_t={isVisible:\"boolean\",isAnimated:\"boolean\",rootElement:\"(element|string)\",clickCallback:\"(fu" +
        "nction|null)\"};class bt{constructor(t){this._config=this._getConfig(t),this._isAppended=!1,this._element=null}show(t){this._config.isVisible?(this._append(),thi" +
        "s._config.isAnimated&&m(this._getElement()),this._getElement().classList.add(\"show\"),this._emulateAnimation(()=>{w(t)})):w(t)}hide(t){this._config.isVisible?(th" +
        "is._getElement().classList.remove(\"show\"),this._emulateAnimation(()=>{this.dispose(),w(t)})):w(t)}_getElement(){if(!this._element){const t=document.createElemen" +
        "t(\"div\");t.className=\"modal-backdrop\",this._config.isAnimated&&t.classList.add(\"fade\"),this._element=t}return this._element}_getConfig(t){return(t={...mt,...\"ob" +
        "ject\"==typeof t?t:{}}).rootElement=h(t.rootElement),d(\"backdrop\",t,_t),t}_append(){this._isAppended||(this._config.rootElement.appendChild(this._getElement()),B" +
        ".on(this._getElement(),\"mousedown.bs.backdrop\",()=>{w(this._config.clickCallback)}),this._isAppended=!0)}dispose(){this._isAppended&&(B.off(this._element,\"mouse" +
        "down.bs.backdrop\"),this._element.remove(),this._isAppended=!1)}_emulateAnimation(t){E(t,this._getElement(),this._config.isAnimated)}}const vt={backdrop:!0,keybo" +
        "ard:!0,focus:!0},yt={backdrop:\"(boolean|string)\",keyboard:\"boolean\",focus:\"boolean\"};class wt extends q{constructor(t,e){super(t),this._config=this._getConfig(e" +
        "),this._dialog=i.findOne(\".modal-dialog\",this._element),this._backdrop=this._initializeBackDrop(),this._isShown=!1,this._ignoreBackdropClick=!1,this._isTransiti" +
        "oning=!1,this._scrollBar=new ft}static get Default(){return vt}static get NAME(){return\"modal\"}toggle(t){return this._isShown?this.hide():this.show(t)}show(t){t" +
        "his._isShown||this._isTransitioning||B.trigger(this._element,\"show.bs.modal\",{relatedTarget:t}).defaultPrevented||(this._isShown=!0,this._isAnimated()&&(this._i" +
        "sTransitioning=!0),this._scrollBar.hide(),document.body.classList.add(\"modal-open\"),this._adjustDialog(),this._setEscapeEvent(),this._setResizeEvent(),B.on(this" +
        "._element,\"click.dismiss.bs.modal\",'[data-bs-dismiss=\"modal\"]',t=>this.hide(t)),B.on(this._dialog,\"mousedown.dismiss.bs.modal\",()=>{B.one(this._element,\"mouseup" +
        ".dismiss.bs.modal\",t=>{t.target===this._element&&(this._ignoreBackdropClick=!0)})}),this._showBackdrop(()=>this._showElement(t)))}hide(t){if(t&&[\"A\",\"AREA\"].inc" +
        "ludes(t.target.tagName)&&t.preventDefault(),!this._isShown||this._isTransitioning)return;if(B.trigger(this._element,\"hide.bs.modal\").defaultPrevented)return;thi" +
        "s._isShown=!1;const e=this._isAnimated();e&&(this._isTransitioning=!0),this._setEscapeEvent(),this._setResizeEvent(),B.off(document,\"focusin.bs.modal\"),this._el" +
        "ement.classList.remove(\"show\"),B.off(this._element,\"click.dismiss.bs.modal\"),B.off(this._dialog,\"mousedown.dismiss.bs.modal\"),this._queueCallback(()=>this._hide" +
        "Modal(),this._element,e)}dispose(){[window,this._dialog].forEach(t=>B.off(t,\".bs.modal\")),this._backdrop.dispose(),super.dispose(),B.off(document,\"focusin.bs.mo" +
        "dal\")}handleUpdate(){this._adjustDialog()}_initializeBackDrop(){return new bt({isVisible:Boolean(this._config.backdrop),isAnimated:this._isAnimated()})}_getConf" +
        "ig(t){return t={...vt,...V.getDataAttributes(this._element),...\"object\"==typeof t?t:{}},d(\"modal\",t,yt),t}_showElement(t){const e=this._isAnimated(),s=i.findOne" +
        "(\".modal-body\",this._dialog);this._element.parentNode&&this._element.parentNode.nodeType===Node.ELEMENT_NODE||document.body.appendChild(this._element),this._ele" +
        "ment.style.display=\"block\",this._element.removeAttribute(\"aria-hidden\"),this._element.setAttribute(\"aria-modal\",!0),this._element.setAttribute(\"role\",\"dialog\")," +
        "this._element.scrollTop=0,s&&(s.scrollTop=0),e&&m(this._element),this._element.classList.add(\"show\"),this._config.focus&&this._enforceFocus(),this._queueCallbac" +
        "k(()=>{this._config.focus&&this._element.focus(),this._isTransitioning=!1,B.trigger(this._element,\"shown.bs.modal\",{relatedTarget:t})},this._dialog,e)}_enforceF" +
        "ocus(){B.off(document,\"focusin.bs.modal\"),B.on(document,\"focusin.bs.modal\",t=>{document===t.target||this._element===t.target||this._element.contains(t.target)||" +
        "this._element.focus()})}_setEscapeEvent(){this._isShown?B.on(this._element,\"keydown.dismiss.bs.modal\",t=>{this._config.keyboard&&\"Escape\"===t.key?(t.preventDefa" +
        "ult(),this.hide()):this._config.keyboard||\"Escape\"!==t.key||this._triggerBackdropTransition()}):B.off(this._element,\"keydown.dismiss.bs.modal\")}_setResizeEvent(" +
        "){this._isShown?B.on(window,\"resize.bs.modal\",()=>this._adjustDialog()):B.off(window,\"resize.bs.modal\")}_hideModal(){this._element.style.display=\"none\",this._el" +
        "ement.setAttribute(\"aria-hidden\",!0),this._element.removeAttribute(\"aria-modal\"),this._element.removeAttribute(\"role\"),this._isTransitioning=!1,this._backdrop.h" +
        "ide(()=>{document.body.classList.remove(\"modal-open\"),this._resetAdjustments(),this._scrollBar.reset(),B.trigger(this._element,\"hidden.bs.modal\")})}_showBackdro" +
        "p(t){B.on(this._element,\"click.dismiss.bs.modal\",t=>{this._ignoreBackdropClick?this._ignoreBackdropClick=!1:t.target===t.currentTarget&&(!0===this._config.backd" +
        "rop?this.hide():\"static\"===this._config.backdrop&&this._triggerBackdropTransition())}),this._backdrop.show(t)}_isAnimated(){return this._element.classList.conta" +
        "ins(\"fade\")}_triggerBackdropTransition(){if(B.trigger(this._element,\"hidePrevented.bs.modal\").defaultPrevented)return;const{classList:t,scrollHeight:e,style:s}=" +
        "this._element,i=e>document.documentElement.clientHeight;!i&&\"hidden\"===s.overflowY||t.contains(\"modal-static\")||(i||(s.overflowY=\"hidden\"),t.add(\"modal-static\")" +
        ",this._queueCallback(()=>{t.remove(\"modal-static\"),i||this._queueCallback(()=>{s.overflowY=\"\"},this._dialog)},this._dialog),this._element.focus())}_adjustDialog" +
        "(){const t=this._element.scrollHeight>document.documentElement.clientHeight,e=this._scrollBar.getWidth(),s=e>0;(!s&&t&&!v()||s&&!t&&v())&&(this._element.style.p" +
        "addingLeft=e+\"px\"),(s&&!t&&!v()||!s&&t&&v())&&(this._element.style.paddingRight=e+\"px\")}_resetAdjustments(){this._element.style.paddingLeft=\"\",this._element.sty" +
        "le.paddingRight=\"\"}static jQueryInterface(t,e){return this.each((function(){const s=wt.getOrCreateInstance(this,t);if(\"string\"==typeof t){if(void 0===s[t])throw" +
        " new TypeError(`No method named \"${t}\"`);s[t](e)}}))}}B.on(document,\"click.bs.modal.data-api\",'[data-bs-toggle=\"modal\"]',(function(t){const e=a(this);[\"A\",\"AREA" +
        "\"].includes(this.tagName)&&t.preventDefault(),B.one(e,\"show.bs.modal\",t=>{t.defaultPrevented||B.one(e,\"hidden.bs.modal\",()=>{u(this)&&this.focus()})}),wt.getOrC" +
        "reateInstance(e).toggle(this)})),y(wt);const Et={backdrop:!0,keyboard:!0,scroll:!1},At={backdrop:\"boolean\",keyboard:\"boolean\",scroll:\"boolean\"};class Tt extends" +
        " q{constructor(t,e){super(t),this._config=this._getConfig(e),this._isShown=!1,this._backdrop=this._initializeBackDrop(),this._addEventListeners()}static get NAM" +
        "E(){return\"offcanvas\"}static get Default(){return Et}toggle(t){return this._isShown?this.hide():this.show(t)}show(t){this._isShown||B.trigger(this._element,\"sho" +
        "w.bs.offcanvas\",{relatedTarget:t}).defaultPrevented||(this._isShown=!0,this._element.style.visibility=\"visible\",this._backdrop.show(),this._config.scroll||((new" +
        " ft).hide(),this._enforceFocusOnElement(this._element)),this._element.removeAttribute(\"aria-hidden\"),this._element.setAttribute(\"aria-modal\",!0),this._element.s" +
        "etAttribute(\"role\",\"dialog\"),this._element.classList.add(\"show\"),this._queueCallback(()=>{B.trigger(this._element,\"shown.bs.offcanvas\",{relatedTarget:t})},this." +
        "_element,!0))}hide(){this._isShown&&(B.trigger(this._element,\"hide.bs.offcanvas\").defaultPrevented||(B.off(document,\"focusin.bs.offcanvas\"),this._element.blur()" +
        ",this._isShown=!1,this._element.classList.remove(\"show\"),this._backdrop.hide(),this._queueCallback(()=>{this._element.setAttribute(\"aria-hidden\",!0),this._eleme" +
        "nt.removeAttribute(\"aria-modal\"),this._element.removeAttribute(\"role\"),this._element.style.visibility=\"hidden\",this._config.scroll||(new ft).reset(),B.trigger(t" +
        "his._element,\"hidden.bs.offcanvas\")},this._element,!0)))}dispose(){this._backdrop.dispose(),super.dispose(),B.off(document,\"focusin.bs.offcanvas\")}_getConfig(t)" +
        "{return t={...Et,...V.getDataAttributes(this._element),...\"object\"==typeof t?t:{}},d(\"offcanvas\",t,At),t}_initializeBackDrop(){return new bt({isVisible:this._co" +
        "nfig.backdrop,isAnimated:!0,rootElement:this._element.parentNode,clickCallback:()=>this.hide()})}_enforceFocusOnElement(t){B.off(document,\"focusin.bs.offcanvas\"" +
        "),B.on(document,\"focusin.bs.offcanvas\",e=>{document===e.target||t===e.target||t.contains(e.target)||t.focus()}),t.focus()}_addEventListeners(){B.on(this._elemen" +
        "t,\"click.dismiss.bs.offcanvas\",'[data-bs-dismiss=\"offcanvas\"]',()=>this.hide()),B.on(this._element,\"keydown.dismiss.bs.offcanvas\",t=>{this._config.keyboard&&\"Es" +
        "cape\"===t.key&&this.hide()})}static jQueryInterface(t){return this.each((function(){const e=Tt.getOrCreateInstance(this,t);if(\"string\"==typeof t){if(void 0===e[" +
        "t]||t.startsWith(\"_\")||\"constructor\"===t)throw new TypeError(`No method named \"${t}\"`);e[t](this)}}))}}B.on(document,\"click.bs.offcanvas.data-api\",'[data-bs-tog" +
        "gle=\"offcanvas\"]',(function(t){const e=a(this);if([\"A\",\"AREA\"].includes(this.tagName)&&t.preventDefault(),g(this))return;B.one(e,\"hidden.bs.offcanvas\",()=>{u(th" +
        "is)&&this.focus()});const s=i.findOne(\".offcanvas.show\");s&&s!==e&&Tt.getInstance(s).hide(),Tt.getOrCreateInstance(e).toggle(this)})),B.on(window,\"load.bs.offca" +
        "nvas.data-api\",()=>i.find(\".offcanvas.show\").forEach(t=>Tt.getOrCreateInstance(t).show())),y(Tt);const Ct=new Set([\"background\",\"cite\",\"href\",\"itemtype\",\"longde" +
        "sc\",\"poster\",\"src\",\"xlink:href\"]),kt=/^(?:(?:https?|mailto|ftp|tel|file):|[^#&/:?]*(?:[#/?]|$))/i,Lt=/^data:(?:image\\/(?:bmp|gif|jpeg|jpg|png|tiff|webp)|video\\/" +
        "(?:mpeg|mp4|ogg|webm)|audio\\/(?:mp3|oga|ogg|opus));base64,[\\d+/a-z]+=*$/i,Ot=(t,e)=>{const s=t.nodeName.toLowerCase();if(e.includes(s))return!Ct.has(s)||Boolean" +
        "(kt.test(t.nodeValue)||Lt.test(t.nodeValue));const i=e.filter(t=>t instanceof RegExp);for(let t=0,e=i.length;t<e;t++)if(i[t].test(s))return!0;return!1};function" +
        " Dt(t,e,s){if(!t.length)return t;if(s&&\"function\"==typeof s)return s(t);const i=(new window.DOMParser).parseFromString(t,\"text/html\"),n=Object.keys(e),o=[].conc" +
        "at(...i.body.querySelectorAll(\"*\"));for(let t=0,s=o.length;t<s;t++){const s=o[t],i=s.nodeName.toLowerCase();if(!n.includes(i)){s.remove();continue}const r=[].co" +
        "ncat(...s.attributes),a=[].concat(e[\"*\"]||[],e[i]||[]);r.forEach(t=>{Ot(t,a)||s.removeAttribute(t.nodeName)})}return i.body.innerHTML}const It=new RegExp(\"(^|\\\\" +
        "s)bs-tooltip\\\\S+\",\"g\"),Nt=new Set([\"sanitize\",\"allowList\",\"sanitizeFn\"]),St={animation:\"boolean\",template:\"string\",title:\"(string|element|function)\",trigger:\"st" +
        "ring\",delay:\"(number|object)\",html:\"boolean\",selector:\"(string|boolean)\",placement:\"(string|function)\",offset:\"(array|string|function)\",container:\"(string|eleme" +
        "nt|boolean)\",fallbackPlacements:\"array\",boundary:\"(string|element)\",customClass:\"(string|function)\",sanitize:\"boolean\",sanitizeFn:\"(null|function)\",allowList:\"o" +
        "bject\",popperConfig:\"(null|object|function)\"},xt={AUTO:\"auto\",TOP:\"top\",RIGHT:v()?\"left\":\"right\",BOTTOM:\"bottom\",LEFT:v()?\"right\":\"left\"},Mt={animation:!0,templ" +
        "ate:'<div class=\"tooltip\" role=\"tooltip\"><div class=\"tooltip-arrow\"></div><div class=\"tooltip-inner\"></div></div>',trigger:\"hover focus\",title:\"\",delay:0,html:!" +
        "1,selector:!1,placement:\"top\",offset:[0,0],container:!1,fallbackPlacements:[\"top\",\"right\",\"bottom\",\"left\"],boundary:\"clippingParents\",customClass:\"\",sanitize:!0" +
        ",sanitizeFn:null,allowList:{\"*\":[\"class\",\"dir\",\"id\",\"lang\",\"role\",/^aria-[\\w-]*$/i],a:[\"target\",\"href\",\"title\",\"rel\"],area:[],b:[],br:[],col:[],code:[],div:[],e" +
        "m:[],hr:[],h1:[],h2:[],h3:[],h4:[],h5:[],h6:[],i:[],img:[\"src\",\"srcset\",\"alt\",\"title\",\"width\",\"height\"],li:[],ol:[],p:[],pre:[],s:[],small:[],span:[],sub:[],sup" +
        ":[],strong:[],u:[],ul:[]},popperConfig:null},Pt={HIDE:\"hide.bs.tooltip\",HIDDEN:\"hidden.bs.tooltip\",SHOW:\"show.bs.tooltip\",SHOWN:\"shown.bs.tooltip\",INSERTED:\"ins" +
        "erted.bs.tooltip\",CLICK:\"click.bs.tooltip\",FOCUSIN:\"focusin.bs.tooltip\",FOCUSOUT:\"focusout.bs.tooltip\",MOUSEENTER:\"mouseenter.bs.tooltip\",MOUSELEAVE:\"mouseleave" +
        ".bs.tooltip\"};class jt extends q{constructor(t,e){if(void 0===s)throw new TypeError(\"Bootstrap's tooltips require Popper (https://popper.js.org)\");super(t),this" +
        "._isEnabled=!0,this._timeout=0,this._hoverState=\"\",this._activeTrigger={},this._popper=null,this._config=this._getConfig(e),this.tip=null,this._setListeners()}s" +
        "tatic get Default(){return Mt}static get NAME(){return\"tooltip\"}static get Event(){return Pt}static get DefaultType(){return St}enable(){this._isEnabled=!0}disa" +
        "ble(){this._isEnabled=!1}toggleEnabled(){this._isEnabled=!this._isEnabled}toggle(t){if(this._isEnabled)if(t){const e=this._initializeOnDelegatedTarget(t);e._act" +
        "iveTrigger.click=!e._activeTrigger.click,e._isWithActiveTrigger()?e._enter(null,e):e._leave(null,e)}else{if(this.getTipElement().classList.contains(\"show\"))retu" +
        "rn void this._leave(null,this);this._enter(null,this)}}dispose(){clearTimeout(this._timeout),B.off(this._element.closest(\".modal\"),\"hide.bs.modal\",this._hideMod" +
        "alHandler),this.tip&&this.tip.remove(),this._popper&&this._popper.destroy(),super.dispose()}show(){if(\"none\"===this._element.style.display)throw new Error(\"Plea" +
        "se use show on visible elements\");if(!this.isWithContent()||!this._isEnabled)return;const t=B.trigger(this._element,this.constructor.Event.SHOW),e=p(this._eleme" +
        "nt),i=null===e?this._element.ownerDocument.documentElement.contains(this._element):e.contains(this._element);if(t.defaultPrevented||!i)return;const o=this.getTi" +
        "pElement(),r=n(this.constructor.NAME);o.setAttribute(\"id\",r),this._element.setAttribute(\"aria-describedby\",r),this.setContent(),this._config.animation&&o.classL" +
        "ist.add(\"fade\");const a=\"function\"==typeof this._config.placement?this._config.placement.call(this,o,this._element):this._config.placement,l=this._getAttachment" +
        "(a);this._addAttachmentClass(l);const{container:c}=this._config;W.set(o,this.constructor.DATA_KEY,this),this._element.ownerDocument.documentElement.contains(thi" +
        "s.tip)||(c.appendChild(o),B.trigger(this._element,this.constructor.Event.INSERTED)),this._popper?this._popper.update():this._popper=s.createPopper(this._element" +
        ",o,this._getPopperConfig(l)),o.classList.add(\"show\");const h=\"function\"==typeof this._config.customClass?this._config.customClass():this._config.customClass;h&&" +
        "o.classList.add(...h.split(\" \")),\"ontouchstart\"in document.documentElement&&[].concat(...document.body.children).forEach(t=>{B.on(t,\"mouseover\",f)});const d=thi" +
        "s.tip.classList.contains(\"fade\");this._queueCallback(()=>{const t=this._hoverState;this._hoverState=null,B.trigger(this._element,this.constructor.Event.SHOWN),\"" +
        "out\"===t&&this._leave(null,this)},this.tip,d)}hide(){if(!this._popper)return;const t=this.getTipElement();if(B.trigger(this._element,this.constructor.Event.HIDE" +
        ").defaultPrevented)return;t.classList.remove(\"show\"),\"ontouchstart\"in document.documentElement&&[].concat(...document.body.children).forEach(t=>B.off(t,\"mouseov" +
        "er\",f)),this._activeTrigger.click=!1,this._activeTrigger.focus=!1,this._activeTrigger.hover=!1;const e=this.tip.classList.contains(\"fade\");this._queueCallback((" +
        ")=>{this._isWithActiveTrigger()||(\"show\"!==this._hoverState&&t.remove(),this._cleanTipClass(),this._element.removeAttribute(\"aria-describedby\"),B.trigger(this._" +
        "element,this.constructor.Event.HIDDEN),this._popper&&(this._popper.destroy(),this._popper=null))},this.tip,e),this._hoverState=\"\"}update(){null!==this._popper&&" +
        "this._popper.update()}isWithContent(){return Boolean(this.getTitle())}getTipElement(){if(this.tip)return this.tip;const t=document.createElement(\"div\");return t" +
        ".innerHTML=this._config.template,this.tip=t.children[0],this.tip}setContent(){const t=this.getTipElement();this.setElementContent(i.findOne(\".tooltip-inner\",t)," +
        "this.getTitle()),t.classList.remove(\"fade\",\"show\")}setElementContent(t,e){if(null!==t)return c(e)?(e=h(e),void(this._config.html?e.parentNode!==t&&(t.innerHTML=" +
        "\"\",t.appendChild(e)):t.textContent=e.textContent)):void(this._config.html?(this._config.sanitize&&(e=Dt(e,this._config.allowList,this._config.sanitizeFn)),t.inn" +
        "erHTML=e):t.textContent=e)}getTitle(){let t=this._element.getAttribute(\"data-bs-original-title\");return t||(t=\"function\"==typeof this._config.title?this._config" +
        ".title.call(this._element):this._config.title),t}updateAttachment(t){return\"right\"===t?\"end\":\"left\"===t?\"start\":t}_initializeOnDelegatedTarget(t,e){const s=this" +
        ".constructor.DATA_KEY;return(e=e||W.get(t.delegateTarget,s))||(e=new this.constructor(t.delegateTarget,this._getDelegateConfig()),W.set(t.delegateTarget,s,e)),e" +
        "}_getOffset(){const{offset:t}=this._config;return\"string\"==typeof t?t.split(\",\").map(t=>Number.parseInt(t,10)):\"function\"==typeof t?e=>t(e,this._element):t}_get" +
        "PopperConfig(t){const e={placement:t,modifiers:[{name:\"flip\",options:{fallbackPlacements:this._config.fallbackPlacements}},{name:\"offset\",options:{offset:this._" +
        "getOffset()}},{name:\"preventOverflow\",options:{boundary:this._config.boundary}},{name:\"arrow\",options:{element:`.${this.constructor.NAME}-arrow`}},{name:\"onChan" +
        "ge\",enabled:!0,phase:\"afterWrite\",fn:t=>this._handlePopperPlacementChange(t)}],onFirstUpdate:t=>{t.options.placement!==t.placement&&this._handlePopperPlacementC" +
        "hange(t)}};return{...e,...\"function\"==typeof this._config.popperConfig?this._config.popperConfig(e):this._config.popperConfig}}_addAttachmentClass(t){this.getTi" +
        "pElement().classList.add(\"bs-tooltip-\"+this.updateAttachment(t))}_getAttachment(t){return xt[t.toUpperCase()]}_setListeners(){this._config.trigger.split(\" \").fo" +
        "rEach(t=>{if(\"click\"===t)B.on(this._element,this.constructor.Event.CLICK,this._config.selector,t=>this.toggle(t));else if(\"manual\"!==t){const e=\"hover\"===t?this" +
        ".constructor.Event.MOUSEENTER:this.constructor.Event.FOCUSIN,s=\"hover\"===t?this.constructor.Event.MOUSELEAVE:this.constructor.Event.FOCUSOUT;B.on(this._element," +
        "e,this._config.selector,t=>this._enter(t)),B.on(this._element,s,this._config.selector,t=>this._leave(t))}}),this._hideModalHandler=()=>{this._element&&this.hide" +
        "()},B.on(this._element.closest(\".modal\"),\"hide.bs.modal\",this._hideModalHandler),this._config.selector?this._config={...this._config,trigger:\"manual\",selector:\"" +
        "\"}:this._fixTitle()}_fixTitle(){const t=this._element.getAttribute(\"title\"),e=typeof this._element.getAttribute(\"data-bs-original-title\");(t||\"string\"!==e)&&(th" +
        "is._element.setAttribute(\"data-bs-original-title\",t||\"\"),!t||this._element.getAttribute(\"aria-label\")||this._element.textContent||this._element.setAttribute(\"ar" +
        "ia-label\",t),this._element.setAttribute(\"title\",\"\"))}_enter(t,e){e=this._initializeOnDelegatedTarget(t,e),t&&(e._activeTrigger[\"focusin\"===t.type?\"focus\":\"hover" +
        "\"]=!0),e.getTipElement().classList.contains(\"show\")||\"show\"===e._hoverState?e._hoverState=\"show\":(clearTimeout(e._timeout),e._hoverState=\"show\",e._config.delay&" +
        "&e._config.delay.show?e._timeout=setTimeout(()=>{\"show\"===e._hoverState&&e.show()},e._config.delay.show):e.show())}_leave(t,e){e=this._initializeOnDelegatedTarg" +
        "et(t,e),t&&(e._activeTrigger[\"focusout\"===t.type?\"focus\":\"hover\"]=e._element.contains(t.relatedTarget)),e._isWithActiveTrigger()||(clearTimeout(e._timeout),e._h" +
        "overState=\"out\",e._config.delay&&e._config.delay.hide?e._timeout=setTimeout(()=>{\"out\"===e._hoverState&&e.hide()},e._config.delay.hide):e.hide())}_isWithActiveT" +
        "rigger(){for(const t in this._activeTrigger)if(this._activeTrigger[t])return!0;return!1}_getConfig(t){const e=V.getDataAttributes(this._element);return Object.k" +
        "eys(e).forEach(t=>{Nt.has(t)&&delete e[t]}),(t={...this.constructor.Default,...e,...\"object\"==typeof t&&t?t:{}}).container=!1===t.container?document.body:h(t.co" +
        "ntainer),\"number\"==typeof t.delay&&(t.delay={show:t.delay,hide:t.delay}),\"number\"==typeof t.title&&(t.title=t.title.toString()),\"number\"==typeof t.content&&(t.c" +
        "ontent=t.content.toString()),d(\"tooltip\",t,this.constructor.DefaultType),t.sanitize&&(t.template=Dt(t.template,t.allowList,t.sanitizeFn)),t}_getDelegateConfig()" +
        "{const t={};if(this._config)for(const e in this._config)this.constructor.Default[e]!==this._config[e]&&(t[e]=this._config[e]);return t}_cleanTipClass(){const t=" +
        "this.getTipElement(),e=t.getAttribute(\"class\").match(It);null!==e&&e.length>0&&e.map(t=>t.trim()).forEach(e=>t.classList.remove(e))}_handlePopperPlacementChange" +
        "(t){const{state:e}=t;e&&(this.tip=e.elements.popper,this._cleanTipClass(),this._addAttachmentClass(this._getAttachment(e.placement)))}static jQueryInterface(t){" +
        "return this.each((function(){const e=jt.getOrCreateInstance(this,t);if(\"string\"==typeof t){if(void 0===e[t])throw new TypeError(`No method named \"${t}\"`);e[t]()" +
        "}}))}}y(jt);const Ht=new RegExp(\"(^|\\\\s)bs-popover\\\\S+\",\"g\"),Rt={...jt.Default,placement:\"right\",offset:[0,8],trigger:\"click\",content:\"\",template:'<div class=\"p" +
        "opover\" role=\"tooltip\"><div class=\"popover-arrow\"></div><h3 class=\"popover-header\"></h3><div class=\"popover-body\"></div></div>'},Bt={...jt.DefaultType,content:\"" +
        "(string|element|function)\"},$t={HIDE:\"hide.bs.popover\",HIDDEN:\"hidden.bs.popover\",SHOW:\"show.bs.popover\",SHOWN:\"shown.bs.popover\",INSERTED:\"inserted.bs.popover\"" +
        ",CLICK:\"click.bs.popover\",FOCUSIN:\"focusin.bs.popover\",FOCUSOUT:\"focusout.bs.popover\",MOUSEENTER:\"mouseenter.bs.popover\",MOUSELEAVE:\"mouseleave.bs.popover\"};cla" +
        "ss Wt extends jt{static get Default(){return Rt}static get NAME(){return\"popover\"}static get Event(){return $t}static get DefaultType(){return Bt}isWithContent(" +
        "){return this.getTitle()||this._getContent()}getTipElement(){return this.tip||(this.tip=super.getTipElement(),this.getTitle()||i.findOne(\".popover-header\",this." +
        "tip).remove(),this._getContent()||i.findOne(\".popover-body\",this.tip).remove()),this.tip}setContent(){const t=this.getTipElement();this.setElementContent(i.find" +
        "One(\".popover-header\",t),this.getTitle());let e=this._getContent();\"function\"==typeof e&&(e=e.call(this._element)),this.setElementContent(i.findOne(\".popover-bo" +
        "dy\",t),e),t.classList.remove(\"fade\",\"show\")}_addAttachmentClass(t){this.getTipElement().classList.add(\"bs-popover-\"+this.updateAttachment(t))}_getContent(){retu" +
        "rn this._element.getAttribute(\"data-bs-content\")||this._config.content}_cleanTipClass(){const t=this.getTipElement(),e=t.getAttribute(\"class\").match(Ht);null!==" +
        "e&&e.length>0&&e.map(t=>t.trim()).forEach(e=>t.classList.remove(e))}static jQueryInterface(t){return this.each((function(){const e=Wt.getOrCreateInstance(this,t" +
        ");if(\"string\"==typeof t){if(void 0===e[t])throw new TypeError(`No method named \"${t}\"`);e[t]()}}))}}y(Wt);const qt={offset:10,method:\"auto\",target:\"\"},zt={offse" +
        "t:\"number\",method:\"string\",target:\"(string|element)\"};class Ft extends q{constructor(t,e){super(t),this._scrollElement=\"BODY\"===this._element.tagName?window:thi" +
        "s._element,this._config=this._getConfig(e),this._selector=`${this._config.target} .nav-link, ${this._config.target} .list-group-item, ${this._config.target} .dr" +
        "opdown-item`,this._offsets=[],this._targets=[],this._activeTarget=null,this._scrollHeight=0,B.on(this._scrollElement,\"scroll.bs.scrollspy\",()=>this._process())," +
        "this.refresh(),this._process()}static get Default(){return qt}static get NAME(){return\"scrollspy\"}refresh(){const t=this._scrollElement===this._scrollElement.wi" +
        "ndow?\"offset\":\"position\",e=\"auto\"===this._config.method?t:this._config.method,s=\"position\"===e?this._getScrollTop():0;this._offsets=[],this._targets=[],this._sc" +
        "rollHeight=this._getScrollHeight(),i.find(this._selector).map(t=>{const n=r(t),o=n?i.findOne(n):null;if(o){const t=o.getBoundingClientRect();if(t.width||t.heigh" +
        "t)return[V[e](o).top+s,n]}return null}).filter(t=>t).sort((t,e)=>t[0]-e[0]).forEach(t=>{this._offsets.push(t[0]),this._targets.push(t[1])})}dispose(){B.off(this" +
        "._scrollElement,\".bs.scrollspy\"),super.dispose()}_getConfig(t){if(\"string\"!=typeof(t={...qt,...V.getDataAttributes(this._element),...\"object\"==typeof t&&t?t:{}}" +
        ").target&&c(t.target)){let{id:e}=t.target;e||(e=n(\"scrollspy\"),t.target.id=e),t.target=\"#\"+e}return d(\"scrollspy\",t,zt),t}_getScrollTop(){return this._scrollEle" +
        "ment===window?this._scrollElement.pageYOffset:this._scrollElement.scrollTop}_getScrollHeight(){return this._scrollElement.scrollHeight||Math.max(document.body.s" +
        "crollHeight,document.documentElement.scrollHeight)}_getOffsetHeight(){return this._scrollElement===window?window.innerHeight:this._scrollElement.getBoundingClie" +
        "ntRect().height}_process(){const t=this._getScrollTop()+this._config.offset,e=this._getScrollHeight(),s=this._config.offset+e-this._getOffsetHeight();if(this._s" +
        "crollHeight!==e&&this.refresh(),t>=s){const t=this._targets[this._targets.length-1];this._activeTarget!==t&&this._activate(t)}else{if(this._activeTarget&&t<this" +
        "._offsets[0]&&this._offsets[0]>0)return this._activeTarget=null,void this._clear();for(let e=this._offsets.length;e--;)this._activeTarget!==this._targets[e]&&t>" +
        "=this._offsets[e]&&(void 0===this._offsets[e+1]||t<this._offsets[e+1])&&this._activate(this._targets[e])}}_activate(t){this._activeTarget=t,this._clear();const " +
        "e=this._selector.split(\",\").map(e=>`${e}[data-bs-target=\"${t}\"],${e}[href=\"${t}\"]`),s=i.findOne(e.join(\",\"));s.classList.contains(\"dropdown-item\")?(i.findOne(\"." +
        "dropdown-toggle\",s.closest(\".dropdown\")).classList.add(\"active\"),s.classList.add(\"active\")):(s.classList.add(\"active\"),i.parents(s,\".nav, .list-group\").forEach(" +
        "t=>{i.prev(t,\".nav-link, .list-group-item\").forEach(t=>t.classList.add(\"active\")),i.prev(t,\".nav-item\").forEach(t=>{i.children(t,\".nav-link\").forEach(t=>t.class" +
        "List.add(\"active\"))})})),B.trigger(this._scrollElement,\"activate.bs.scrollspy\",{relatedTarget:t})}_clear(){i.find(this._selector).filter(t=>t.classList.contains" +
        "(\"active\")).forEach(t=>t.classList.remove(\"active\"))}static jQueryInterface(t){return this.each((function(){const e=Ft.getOrCreateInstance(this,t);if(\"string\"==" +
        "typeof t){if(void 0===e[t])throw new TypeError(`No method named \"${t}\"`);e[t]()}}))}}B.on(window,\"load.bs.scrollspy.data-api\",()=>{i.find('[data-bs-spy=\"scroll\"" +
        "]').forEach(t=>new Ft(t))}),y(Ft);class Ut extends q{static get NAME(){return\"tab\"}show(){if(this._element.parentNode&&this._element.parentNode.nodeType===Node." +
        "ELEMENT_NODE&&this._element.classList.contains(\"active\"))return;let t;const e=a(this._element),s=this._element.closest(\".nav, .list-group\");if(s){const e=\"UL\"==" +
        "=s.nodeName||\"OL\"===s.nodeName?\":scope > li > .active\":\".active\";t=i.find(e,s),t=t[t.length-1]}const n=t?B.trigger(t,\"hide.bs.tab\",{relatedTarget:this._element}" +
        "):null;if(B.trigger(this._element,\"show.bs.tab\",{relatedTarget:t}).defaultPrevented||null!==n&&n.defaultPrevented)return;this._activate(this._element,s);const o" +
        "=()=>{B.trigger(t,\"hidden.bs.tab\",{relatedTarget:this._element}),B.trigger(this._element,\"shown.bs.tab\",{relatedTarget:t})};e?this._activate(e,e.parentNode,o):o" +
        "()}_activate(t,e,s){const n=(!e||\"UL\"!==e.nodeName&&\"OL\"!==e.nodeName?i.children(e,\".active\"):i.find(\":scope > li > .active\",e))[0],o=s&&n&&n.classList.contains" +
        "(\"fade\"),r=()=>this._transitionComplete(t,n,s);n&&o?(n.classList.remove(\"show\"),this._queueCallback(r,t,!0)):r()}_transitionComplete(t,e,s){if(e){e.classList.re" +
        "move(\"active\");const t=i.findOne(\":scope > .dropdown-menu .active\",e.parentNode);t&&t.classList.remove(\"active\"),\"tab\"===e.getAttribute(\"role\")&&e.setAttribute(" +
        "\"aria-selected\",!1)}t.classList.add(\"active\"),\"tab\"===t.getAttribute(\"role\")&&t.setAttribute(\"aria-selected\",!0),m(t),t.classList.contains(\"fade\")&&t.classList." +
        "add(\"show\");let n=t.parentNode;if(n&&\"LI\"===n.nodeName&&(n=n.parentNode),n&&n.classList.contains(\"dropdown-menu\")){const e=t.closest(\".dropdown\");e&&i.find(\".dr" +
        "opdown-toggle\",e).forEach(t=>t.classList.add(\"active\")),t.setAttribute(\"aria-expanded\",!0)}s&&s()}static jQueryInterface(t){return this.each((function(){const e" +
        "=Ut.getOrCreateInstance(this);if(\"string\"==typeof t){if(void 0===e[t])throw new TypeError(`No method named \"${t}\"`);e[t]()}}))}}B.on(document,\"click.bs.tab.data" +
        "-api\",'[data-bs-toggle=\"tab\"], [data-bs-toggle=\"pill\"], [data-bs-toggle=\"list\"]',(function(t){[\"A\",\"AREA\"].includes(this.tagName)&&t.preventDefault(),g(this)||U" +
        "t.getOrCreateInstance(this).show()})),y(Ut);const Kt={animation:\"boolean\",autohide:\"boolean\",delay:\"number\"},Vt={animation:!0,autohide:!0,delay:5e3};class Qt ex" +
        "tends q{constructor(t,e){super(t),this._config=this._getConfig(e),this._timeout=null,this._hasMouseInteraction=!1,this._hasKeyboardInteraction=!1,this._setListe" +
        "ners()}static get DefaultType(){return Kt}static get Default(){return Vt}static get NAME(){return\"toast\"}show(){B.trigger(this._element,\"show.bs.toast\").default" +
        "Prevented||(this._clearTimeout(),this._config.animation&&this._element.classList.add(\"fade\"),this._element.classList.remove(\"hide\"),m(this._element),this._eleme" +
        "nt.classList.add(\"showing\"),this._queueCallback(()=>{this._element.classList.remove(\"showing\"),this._element.classList.add(\"show\"),B.trigger(this._element,\"show" +
        "n.bs.toast\"),this._maybeScheduleHide()},this._element,this._config.animation))}hide(){this._element.classList.contains(\"show\")&&(B.trigger(this._element,\"hide.b" +
        "s.toast\").defaultPrevented||(this._element.classList.remove(\"show\"),this._queueCallback(()=>{this._element.classList.add(\"hide\"),B.trigger(this._element,\"hidden" +
        ".bs.toast\")},this._element,this._config.animation)))}dispose(){this._clearTimeout(),this._element.classList.contains(\"show\")&&this._element.classList.remove(\"sh" +
        "ow\"),super.dispose()}_getConfig(t){return t={...Vt,...V.getDataAttributes(this._element),...\"object\"==typeof t&&t?t:{}},d(\"toast\",t,this.constructor.DefaultType" +
        "),t}_maybeScheduleHide(){this._config.autohide&&(this._hasMouseInteraction||this._hasKeyboardInteraction||(this._timeout=setTimeout(()=>{this.hide()},this._conf" +
        "ig.delay)))}_onInteraction(t,e){switch(t.type){case\"mouseover\":case\"mouseout\":this._hasMouseInteraction=e;break;case\"focusin\":case\"focusout\":this._hasKeyboardIn" +
        "teraction=e}if(e)return void this._clearTimeout();const s=t.relatedTarget;this._element===s||this._element.contains(s)||this._maybeScheduleHide()}_setListeners(" +
        "){B.on(this._element,\"click.dismiss.bs.toast\",'[data-bs-dismiss=\"toast\"]',()=>this.hide()),B.on(this._element,\"mouseover.bs.toast\",t=>this._onInteraction(t,!0))" +
        ",B.on(this._element,\"mouseout.bs.toast\",t=>this._onInteraction(t,!1)),B.on(this._element,\"focusin.bs.toast\",t=>this._onInteraction(t,!0)),B.on(this._element,\"fo" +
        "cusout.bs.toast\",t=>this._onInteraction(t,!1))}_clearTimeout(){clearTimeout(this._timeout),this._timeout=null}static jQueryInterface(t){return this.each((functi" +
        "on(){const e=Qt.getOrCreateInstance(this,t);if(\"string\"==typeof t){if(void 0===e[t])throw new TypeError(`No method named \"${t}\"`);e[t](this)}}))}}return y(Qt),{" +
        "Alert:z,Button:F,Carousel:et,Collapse:nt,Dropdown:pt,Modal:wt,Offcanvas:Tt,Popover:Wt,ScrollSpy:Ft,Tab:Ut,Toast:Qt,Tooltip:jt}}));";
    window.eval(bootstrapMinJs);
}