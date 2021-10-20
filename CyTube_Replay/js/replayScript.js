var windowId = Date.now();
var replayJson = {};
var replayEmitLog = [];
var replayPaused = true;
var playerTimeout;
var lastEvent;
var eventsTimeDiff;
var lastEventTimeoutLeft;
var playerTimeout;
var playerEvtLog;
var speedX = 1;
var replayFileElm = document.getElementById('replayFile');
var lodingFilenameElm = document.getElementById('lodingFilename');
var replayButtonElm = document.getElementById('replayButton');
var replayOutElm = document.getElementById('replayOut');
var replayFrameElm = document.getElementById('replayFrame');
var speedXElm = document.getElementById('speedX');
var child = replayFrameElm.contentWindow;
window.addEventListener('message', onMessage);

replayFileElm.addEventListener('change', replayFileLoad);
replayButtonElm.addEventListener('click', replayButtonClick);
speedXElm.addEventListener('change', speedXChange);

function onMessage(event) {
    var data = event.data ?? {};
    if (data.replayMessage) {
        receiveMessage(data.replayMessage.type, data.replayMessage.data);
    }
}

function sendMessage(type, data = null) {
    child.postMessage({ replayMessage: { type, data } });
}

function receiveMessage(type, data) {
    switch (type) {
        case 'replay_emit':
            replayAddEmitLog(data);
            break;
        case 'replay_window_loaded':
            replayButtonElm.parentElement.classList.remove('d-none');
            speedXElm.parentElement.parentElement.classList.remove('d-none');
            lodingFilenameElm.parentElement.parentElement.classList.add('d-none');
            break;
        default:
            break;
    }
}

function replayButtonClick(event) {
    replayPaused = !replayPaused;
    if (!replayPaused) {
        play();
    }
    else {
        pause();
    }
}

function speedXChange(event) {
    try {
        speedX = parseInt(speedXElm.value);
        if (speedX < 1 || speedX > 999) {
            speedX = 1;
        }
    }
    catch {
        speedX = 1;
    }
}

function play(start = true) {
    if (playerEvtLog == null) {
        playerEvtLog = Array.from(replayJson.eventsLog);
        lastEventTimeoutLeft = 1000;
        lastEvent = playerEvtLog[0];
    }
    if (playerEvtLog.length <= 0) {
        pause(true);
    }
    else {
        if (start) {
            eventsTimeDiff = Date.now() - playerEvtLog[0].time;
            replayButtonElm.innerText = "Pause";
            sendMessage('replay_play');
        }
        if (lastEventTimeoutLeft == 0) {
            lastEvent = playerEvtLog.shift();
        }

        var timeUntilEvent = (lastEvent.time + eventsTimeDiff + lastEventTimeoutLeft) - Date.now();
        if (speedX != 1) {
            eventsTimeDiff -= timeUntilEvent - Math.floor(timeUntilEvent / speedX);
            timeUntilEvent = Math.floor(timeUntilEvent / speedX);
            //console.log(timeUntilEvent);
        }
        playerTimeout = window.setTimeout(_ => {
            lastEventTimeoutLeft = 0;
            sendMessage('replay_on', { event: lastEvent.event, data: lastEvent.data });
            play(false);
        }, timeUntilEvent);
    }
}

function pause(end = false) {
    if (end) {
        replayButtonElm.innerText = "End";
        replayButtonElm.classList.add('disabled');
        replayButtonElm.disabled = true;
    }
    else {
        replayButtonElm.innerText = "Play";
        if (playerTimeout != null) {
            window.clearTimeout(playerTimeout);
            playerTimeout = null;
            var now = Date.now();
            lastEventTimeoutLeft = (lastEvent.time + eventsTimeDiff + lastEventTimeoutLeft) - now;
            sendMessage('replay_pause');
        }
    }
}

function replayFileLoad(event) {
    replayOutElm.classList.add('d-none');
    replayFile = replayFileElm.files[0];
    if (replayFile) {
        replayFileElm.parentElement.classList.add('d-none');
        lodingFilenameElm.parentElement.parentElement.classList.remove('d-none');
        lodingFilenameElm.innerText = replayFile.name;
        var reader = new FileReader();
        reader.onload = function (event) {
            try {
                replayJson = JSON.parse(event.target.result);
                if (typeof replayJson.channelPath === 'string' && typeof replayJson.channelName === 'string') {
                    if (replayJson.channelPath.length > 0 && replayJson.channelName.length > 0) {
                        try {
                            child.toString();
                        }
                        catch {
                            localStorage['channelPath'] = replayJson.channelPath;
                            localStorage['channelName'] = replayJson.channelName;
                            setUpLocalStoragePostMessage();
                        }
                        replayFrameElm.classList.remove('d-none');
                        replayFrameElm.src = './iframe/index.html#' + windowId;
                    }
                    else {
                        replayFileElm.parentElement.classList.remove('d-none');
                        lodingFilenameElm.parentElement.parentElement.classList.add('d-none');
                        replayUiError(replayFile.name, 'channelName or channelPath empty');
                    }
                }
                else {
                    replayFileElm.parentElement.classList.remove('d-none');
                    lodingFilenameElm.parentElement.parentElement.classList.add('d-none');
                    replayUiError(replayFile.name, 'channelName or channelPath missing');
                }
            }
            catch (err) {
                replayFileElm.parentElement.classList.remove('d-none');
                lodingFilenameElm.parentElement.parentElement.classList.add('d-none');
                replayUiError(replayFile.name, err);
            }
        }
        reader.onerror = function (event) {
            replayFileElm.parentElement.classList.remove('d-none');
            lodingFilenameElm.parentElement.parentElement.classList.add('d-none');
            replayUiError(replayFile.name, 'error reading replay file');
        }
        reader.readAsText(replayFile, 'UTF-8');
        replayFileElm.value = null;
    }
    else {
        replayUiError('Replay', 'no file selected');
    }
}

function getChannelPath() {
    return replayJson.channelPath;
}

function getChannelName() {
    return replayJson.channelName;
}

function setUpLocalStoragePostMessage() {
    child = {w: child};
    var prefix = 'postMessageChild_' + windowId + "_";
    child.postMessage = function (data) {
        localStorage['postMessageParent_' + windowId + "_" + Date.now()] = JSON.stringify(data);
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

function replayUiError(type, message) {
    //todo nice ui
    replayOutElm.classList.remove('d-none');
    replayOutElm.innerText = type + ': ' + message;
}

function replayUiMessage(type, message) {
    //todo nice ui
    replayOutElm.classList.remove('d-none');
    replayOutElm.innerText = type + ': ' + message;
}

function replayAddEmitLog(data) {
    //todo any/nice ui
    replayEmitLog.push({ date: Date.now(), data });
}