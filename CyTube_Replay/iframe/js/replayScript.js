var hashParsed;
try {
    hashParsed = JSON.parse('[' + decodeURIComponent(location.hash.substr(1)) + ']');
    if (hashParsed.length < 5) throw "hash decode failed";
}
catch (e) {
    hashParsed = ['r', 'replay', 0];
    window.addEventListener('load', function () {
        fake_io_on_exec('connect', []);
        fake_io_on_exec('emoteList', [[]]);
        fake_io_on_exec("chatMsg", [{ "username": "CyTube Replay Error", "msg": e, "meta": {}, "time": Date.now() }]);
        fake_io_on_exec('disconnect', []);
    });
}
var CHANNELPATH = hashParsed[0];
var CHANNELNAME = hashParsed[1];
var fakeConsoleLog = hashParsed[2] == 1;
var parentOrigin = hashParsed[3];
window.hasDriveUserscript = hashParsed[4] == 1;
var parent = window.parent;
var speedX = 1;

if (window.hasDriveUserscript) {
    window.driveUserscriptVersion = hashParsed[5];
    var gGDMjobs = [];
    window.getGoogleDriveMetadata = (id, callback) => {
        gGDMjobs.push({ id, callback });
        parent.postMessage({ gGDM: { id } }, parentOrigin);
    };
    window.addEventListener('message', function (event) {
        var gGDM = event.data?.gGDM;
        if (gGDM?.id) {
            var job = gGDMjobs.find(job => job.id == gGDM.id);
            if (typeof job?.callback === 'function') job.callback.apply(this, gGDM.data);
        }
    });
}

window.addEventListener('message', onMessage);
window.addEventListener('load', function (event) {
    sendMessage('replay_window_loaded', this.location.origin);
});

function onMessage(event) {
    var data = event.data ?? {};
    if (data.blob) {
        var vid = document.createElement('video');
        vid.controls = true;
        vid.src = URL.createObjectURL(data.blob);
        document.body.append(vid);
    }
    if (data.replayMessage) {
        receiveMessage(data.replayMessage.type, data.replayMessage.data);
    }
}

var blobUrls = [];
async function receiveMessage(type, data) {
    switch (type) {
        case "replay_reload":
            window.location.reload();
            break;
        case "replay_speed":
            speedX = (data > 10) ? 10 : data;
            PLAYER?.yt?.setPlaybackRate(speedX);
            PLAYER?.player?.playbackRate(speedX);
            break;
        case "replay_pause":
            PLAYER?.pause?.();
            break;
        case "replay_play":
            PLAYER?.play?.();
            break;
        case "replay_event":
            if (data.type == "changeMedia") {
                if (typeof data.data[0].id !== 'string') {
                    var blobUrl = blobUrls.find(b => b.blobId == data.data[0].blobId);
                    if (blobUrl == null) {
                        blobUrl = {
                            blobId: data.data[0].blobId,
                            url: URL.createObjectURL(data.data[0].id)
                        };
                        blobUrls.push(blobUrl);
                    }
                    data.data[0].id = blobUrl.url;
                } else if (data.data[0].id.startsWith("https://media.xaekai.net/")) {
                    var bcp = JSON.parse(JSON.stringify(data));
                    try {
                        var xaeResp = await fetch(data.data[0].id);
                        var xae = await xaeResp.json();
                        data.data[0].meta.direct = Object.fromEntries(xae.sources.map(a => [a.quality + '', [{ link: a.url, quality: a.quality, contentType: a.contentType }]]));
                    }
                    catch (ex) {
                        data = bcp;
                    }
                }
            }
            if (data.type == "mediaUpdate") {
                PLAYER?.yt?.setPlaybackRate(speedX);
                PLAYER?.player?.playbackRate(speedX);
            }
            fake_io_on_exec(data.type, data.data);
            break;
        default:
            break;
    }
}
function sendMessage(type, data = null) {
    parent.postMessage({ replayMessage: { type, data } }, parentOrigin);
}

var fake_console_log_log = [];
var fake_console_info_log = [];
console.real_log = console.log;
console.real_info = console.info;
if (fakeConsoleLog) {
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