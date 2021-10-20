var windowId;
var parent = window.parent;
var replayIframe = true;
window.addEventListener('message', onMessage);
window.addEventListener('load', function (event) {
    sendMessage('replay_window_loaded');
});

function onMessage(event) {
    var data = event.data ?? {};
    if (data.replayMessage) {
        receiveMessage(data.replayMessage.type, data.replayMessage.data);
    }
}

var CHANNELPATH;
var CHANNELNAME;

try {
    CHANNELPATH = parent.getChannelPath?.() ?? 'r';
    CHANNELNAME = parent.getChannelName?.() ?? 'replay';
}
catch {
    CHANNELPATH = localStorage['channelPath'] ?? 'r';
    CHANNELNAME = localStorage['channelName?'] ?? 'replay';
    localStorage.removeItem('channelPath');
    localStorage.removeItem('channelName');
    setUpLocalStoragePostMessage();
}

function receiveMessage(type, data) {
    switch (type) {
        case "replay_pause":
            PLAYER?.pause?.();
            break;
        case "replay_play":
            PLAYER?.play?.();
            break;
        case "replay_on":
            fake_io_on_exec(data.event, data.data);
            break;
        default:
            break;
    }
}
function sendMessage(type, data = null) {
    parent.postMessage({ replayMessage: { type, data } });
}

function setUpLocalStoragePostMessage() {
    parent = { w: parent };
    try {
        windowId = parseInt(window.location.href.match(/[\d]+$/));
    }
    catch {
        windowId = Date.now();
    }
    var prefix = 'postMessageParent_' + windowId + "_";
    parent.postMessage = function (data) {
        localStorage['postMessageChild_' + windowId + "_" + Date.now()] = JSON.stringify(data);
    }
    window.addEventListener('storage', function (event) {
        if(event.key?.startsWith(prefix)){
            try{
                var data = JSON.parse(event.newValue);
                onMessage({data});
            }
            catch (err) {
                console.error(err);
            }
            localStorage.removeItem(event.key);
        }
    });
}

var fake_console_log_log = [];
var fake_console_info_log = [];
console.real_log = console.log;
console.real_info = console.info;
console.log = fake_console_log;
console.info = fake_console_info;
function fake_console_log() {
    fake_console_log_log.push({
        time: Date.now(),
        message: [...arguments],
        messageJson: JSON.stringify([...arguments])
    });
}
function fake_console_info() {
    fake_console_info_log.push({
        time: Date.now(),
        message: [...arguments],
        messageJson: JSON.stringify([...arguments])
    });
}


var fake_io_on_subs = {};
function fake_io() {
    var p = new Proxy({
        on: fake_io_on,
        once: fake_io_once,
        emit: fake_io_emit,
        listeners: fake_io_listeners,
    }, {
        get: function (target, prop) {
            switch (prop) {
                case 'on':
                case 'once':
                case 'emit':
                case 'listeners':
                case 'constructor':
                    break;
                default:
                    //console.trace();
                    console.real_log({ type: 'get', target, prop });
                    break;
            }
            return Reflect.get(target, prop);
        },
        set: function (target, prop, value) {
            console.log({ type: 'set', target, prop, value });
            return Reflect.set(target, prop, value);
        }
    });
    return p;
}
function fake_io_on(key, func) {
    fake_io_on_subs[key] = fake_io_on_subs[key] ?? [];
    fake_io_on_subs[key].push(func);
}
function fake_io_once(key, func) {
    fake_io_on_subs[key] = fake_io_on_subs[key] ?? [];
    var fired = false;
    fake_io_on_subs[key].push(function () {
        if (!fired) {
            fired = true;
            func.apply(this, arguments);
        }
    });
}
function fake_io_emit() {
    sendMessage('replay_emit', [...arguments]);
}
function fake_io_on_exec(key, data) {
    fake_io_on_subs[key] = fake_io_on_subs[key] ?? [];
    for (var i = fake_io_on_subs[key].length - 1; i >= 0; i--) {
        try {
            const eventHandler = fake_io_on_subs[key][i];
            eventHandler.apply(this, data);
        }
        catch (err) {
            console.real_log(err);
        }
    }
}
function fake_io_listeners(key) {
    fake_io_on_subs[key] = fake_io_on_subs[key] ?? [];
    return fake_io_on_subs[key];
}