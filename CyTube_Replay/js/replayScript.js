var replayFramePath = 'CyTube_Replay/iframe';
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
var childOrigin;
var fakeConsoleLog = false;

window.addEventListener('message', onMessage);

replayFileElm.addEventListener('change', replayFileLoad);
replayButtonElm.addEventListener('click', replayButtonClick);
speedXElm.addEventListener('input', speedXChange);

function onMessage(event) {
    var data = event.data ?? {};
    if (data.replayMessage) {
        receiveMessage(data.replayMessage.type, data.replayMessage.data);
    }
}

function sendMessage(type, data = null) {
    child.postMessage({ replayMessage: { type, data } }, childOrigin);
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
            playerEvtLog = Array.from(replayJson.eventsLog);
            childOrigin = data;
            break;
        default:
            break;
    }
}

function replayButtonClick(event) {
    if (playing) {
        pause();
    }
    else {
        play();
    }
}

function speedXChange(event) {
    var prevSpeedX = speedX;
    try {
        speedX = Math.floor(parseFloat(speedXElm.value) * 4) / 4;
        if (speedX > 25) {
            speedXElm.min = "25";
            speedXElm.step = "25";
            speedX = Math.ceil(speedX / 25) * 25;
            speedXElm.value = speedX;
        }
        else if (speedX > 5) {
            speedXElm.min = "5";
            speedXElm.step = "5";
            speedX = Math.ceil(speedX / 5) * 5;
            speedXElm.value = speedX;
        }
        else if (speedX > 2) {
            speedXElm.min = "1";
            speedXElm.step = "1";
            speedX = Math.ceil(speedX);
            speedXElm.value = speedX;
        }
        else {
            speedXElm.min = "0.25";
            speedXElm.step = "0.25";
        }
        if (speedX < 0.25 || speedX > 999) {
            speedX = 1;
        }
    }
    catch {
        speedX = 1;
    }
    if (prevSpeedX != speedX) {
        if (playing) {
            pauseEvents();
            eventsTimeDiff += (Date.now() - pausedAt);
            pausedAt = null;
            playEvents();
        }
        sendMessage('replay_speed', speedX);
    }
}
var pausedAt;
var playing = false;
var replay = false;
function playEvents() {
    if (playerEvtLog.length <= 0) {
        pause();
    }
    else {
        var timeUntilEvent = (playerEvtLog[0].time + eventsTimeDiff) - Date.now();
        if (speedX != 1) {
            eventsTimeDiff -= timeUntilEvent - Math.floor(timeUntilEvent / speedX);
            timeUntilEvent = Math.floor(timeUntilEvent / speedX);
        }
        playerTimeout = window.setTimeout(_ => {
            lastEvent = playerEvtLog.shift();
            sendMessage('replay_on', { event: lastEvent.event, data: lastEvent.data });
            playEvents();
        }, timeUntilEvent);
    }
}

function pauseEvents() {
    window.clearTimeout(playerTimeout);
    pausedAt = Date.now();
}

function play() {
    if (!playing) {
        if (replay) {
            replay = false;
            lodingFilenameElm.parentElement.parentElement.classList.remove('d-none');
            speedXElm.parentElement.parentElement.classList.add('d-none');
            replayButtonElm.parentElement.classList.add('d-none');
            replayButtonElm.innerText = "Play";
            sendMessage('replay_reload');
        }
        else {
            playing = true;
            if (pausedAt != null) {
                eventsTimeDiff += (Date.now() - pausedAt);
                pausedAt = null;
            }
            else {
                eventsTimeDiff = Date.now() - playerEvtLog[0].time;
            }
            replayButtonElm.innerText = "Pause";
            sendMessage('replay_play');

            playEvents();
        }
    }
}

function pause(end = false) {
    if (playing) {
        playing = false;
        pauseEvents();
        if (playerEvtLog.length <= 0) {
            replayButtonElm.innerText = "Replay";
            replay = true;
            pausedAt = null;
        }
        else {
            replayButtonElm.innerText = "Play";
        }
        sendMessage('replay_pause');
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
                        replayFrameElm.classList.remove('d-none');
                        var hashArgs = [
                            replayJson.channelPath,
                            replayJson.channelName,
                            fakeConsoleLog ? 1 : 0,
                            window.location.origin,
                            window.hasDriveUserscript ? 1 : 0
                        ]
                        if(window.hasDriveUserscript) {
                            hashArgs.push(window.driveUserscriptVersion);
                        }
                        var hash = JSON.stringify(hashArgs);
                        hash = "#" + encodeURIComponent(hash.substr(1, hash.length - 2));
                        replayFrameElm.src = 'https://redir.firlin123.workers.dev/' + replayFramePath + '/index.html?_=' + Date.now() + hash;
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