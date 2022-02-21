"use strict";
const fakeConsoleLog = false;
const iframeProto = 'http:';
const iframePath = 'CyTube_Replay/iframe';
var currentEventsLog;
var pausedAt;
var childOrigin;
var eventsTimeDiff;
var playerTimeout;
var lastEvent;
var inputFileElm = document.getElementById('inputFile');
var inputFolderElm = document.getElementById('inputFolder');
var loadingElm = document.getElementById('loading');
var selectFileElm = document.getElementById('selectFile');
var playPauseElm = document.getElementById('playPause');
var speedXElm = document.getElementById('speedX');
var selectSkipToElm = document.getElementById('selectSkipTo');
var outElm = document.getElementById('out');
var iframeElm = document.getElementById('iframe');
var currentReplayFile = {};
var playing = false;
var child = iframeElm.contentWindow;
var replayFiles = [];
var otherFiles = [];
var replay = false;
var replayEmitLog = [];
var speedX = 1;
var blobIds = 0;
var skip = {
    toEvent: null,
    stackI: 0,
    users: {},
    polls: [{}],
    usercount: null,
    drinkCount: null
}
// //time events
// var eventsTiming = {
//     lastEventName: null,
//     lastEventTime: null,
//     time: {},
//     count: {},
//     avgTime: {}
// }

inputFileElm.addEventListener('change', inputFileChange);
inputFolderElm.addEventListener('change', inputFileChange);
selectFileElm.addEventListener('change', selectFileChange);
window.addEventListener('message', onMessage);
playPauseElm.addEventListener('click', playPauseClick);
selectSkipToElm.addEventListener('change', selectSkipToChange);
speedXElm.addEventListener('input', speedXInput);

async function inputFileChange(event) {
    var replayInputFiles = event.target.files;
    if (replayInputFiles.length > 0) {
        var newReplayFiles = [];
        var newOtherFiles = [];
        myHide(event.target);
        myShow(loadingElm);
        for (const replayInputFile of replayInputFiles) {
            loadingElm.innerText = replayInputFile.name;

            var rIFN = replayInputFile.name;
            var path = '/' + (replayInputFile.webkitRelativePath.replace(rIFN, '') ?? '');
            var [currReplayFiles, currOtherFiles] =
                await ((rIFN.toLocaleLowerCase().endsWith('.zip')) ? readReplayZipFile : readReplayFile)(replayInputFile, path);
            newReplayFiles.push(...currReplayFiles);
            newOtherFiles.push(...currOtherFiles);
        }
        attachMaps(newReplayFiles);
        myShow(event.target);
        myHide(loadingElm);

        if (newReplayFiles.length > 0) {
            var optgroups = {};
            var optionI = 0;
            selectFileElm.innerHTML = "";
            for (var replayFile of newReplayFiles) {
                if (optgroups[replayFile.path] == null) {
                    optgroups[replayFile.path] = document.createElement('optgroup');
                    optgroups[replayFile.path].label = replayFile.path;
                    selectFileElm.append(optgroups[replayFile.path]);
                }
                var option = document.createElement('option');
                replayFile.optionValue = option.value = 'file_' + optionI;
                var optionName = document.createElement('span');
                var optionFrom = document.createElement('span');
                var optionTo = document.createElement('span');
                optionName.innerText = replayFile.name;
                var eventsLogStart = replayFile.eventsLog?.[0];
                var eventsLogEnd = replayFile.eventsLog?.[replayFile.eventsLog?.length - 1];
                if (eventsLogStart?.time == null || eventsLogEnd?.time == null) {
                    optionFrom.innerText = "????.??.??";
                    optionTo.innerText = "????.??.??";
                }
                else {
                    var from = new Date(eventsLogStart.time);
                    var to = new Date(eventsLogEnd.time);
                    var diffDay = from.toDateString() !== to.toDateString();
                    optionFrom.innerText = from.toLocaleDateString() + (diffDay ? "" : (" " + from.toLocaleTimeString()));
                    optionTo.innerText = to[(diffDay ? 'toLocaleDateString' : 'toLocaleTimeString')]();
                }

                option.append(optionName);
                option.append(document.createTextNode(" "));
                option.append(optionFrom);
                option.append(document.createTextNode(" - "));
                option.append(optionTo);

                optgroups[replayFile.path].append(option);
                optionI++;
            }
            replayFiles = newReplayFiles;
            otherFiles = newOtherFiles;
            selectFileChange();
        }
        else {
            replayUiError('Replay', 'not replay file');
        }
        event.target.value = null;
    }
    else {
        replayUiError('Replay', 'no file selected');
    }
}

function myShow(element) {
    var mainElem = myGetMain(element);
    if (!(mainElem.classList.contains('d-none'))) return false;
    mainElem.classList.remove('d-none');
    return true;
}
function myHide(element) {
    var mainElem = myGetMain(element);
    if (mainElem.classList.contains('d-none')) return false;
    mainElem.classList.add('d-none');
    return true;
}
function myGetMain(element) {
    switch (element?.id) {
        case 'iframe':
        case 'out': return element;
            break;
        case 'selectSkipTo':
        case 'playPause':
        case 'selectFile': return element.parentElement;
            break;
        case 'speedX':
        case 'loading':
        case 'inputFile':
        case 'inputFolder': return element.parentElement.parentElement;
            break;
        default:
            console.trace();
            throw 'Unknown element';
    }
}

async function readFile(fileFullName, anyJsonName, textFunction, pathPrefix, replayFiles, otherFiles, file) {
    var rex = new RegExp('((^.*?)(_[\\d]{14})' + (anyJsonName ? '?' : '') + ')(\\.map)?\\.json$');
    var [fileMatch, filePath, fileName] = fileFullName.match(/(^.*\/)*(.*)$/) ?? [];
    var [jsonMatch, jsonFileName, jsonName] = fileName.match(rex) ?? [];
    var text = (jsonMatch ? (await textFunction()) : '{}');
    var json = JSON.parse(text);

    json.path = pathPrefix + (filePath ?? '');
    switch (json.replayFileType ?? '') {
        case 'data':
        case 'map':
            json.name = jsonName;
            json.fileName = jsonFileName;
            replayFiles.push(json);
            break;
        default:
            json.name = fileName;
            json.file = file;
            otherFiles.push(json);
            break;
    }
}

async function readReplayZipFile(zipFile, zipPathPrefix) {
    if (typeof JSZip === 'undefined') {
        loadingElm.innerText = 'jszip_3.7.1.min.js';
        await loadScript('./js/jszip_3.7.1.min.js');
        loadingElm.innerText = zipFile.name;
    }
    var pathPrefix = zipPathPrefix + zipFile.name + '/';
    var zip = await JSZip.loadAsync(zipFile);
    var files = [];
    zip.forEach((path, file) => {
        if (!file.dir) files.push([path, file]);
    });
    var replayFiles = [];
    var otherFiles = [];
    for (const fileArr of files) {
        var [path, file] = fileArr;
        loadingElm.innerText = (path.match(/(^.*\/)*(.*)$/) ?? [0, 0, ''])[2];
        await readFile(path, false, async () => file.async('string'), pathPrefix, replayFiles, otherFiles, file);
    }
    return [replayFiles, otherFiles];
}

async function readReplayFile(file, pathPrefix) {
    var replayFiles = [];
    var otherFiles = [];
    await readFile(file.name, true, async () => readFileAsText(file), pathPrefix, replayFiles, otherFiles, file);
    return [replayFiles, otherFiles];

}

function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        var r = new FileReader();
        r.onload = e => resolve(e.target.result);
        r.onerror = e => reject(e.target.error);
        r.readAsText(file, 'UTF-8');
    });
}

function loadScript(url) {
    return new Promise((resolve, reject) => {
        var script = document.createElement('script');
        script.src = url;
        script.onload = () => resolve();
        script.onerror = function (event) {
            reject(event.error);
        }
        document.body.append(script);
    });
}

function attachMaps(replayFiles) {
    for (var i = replayFiles.length - 1; i >= 0; i--) {
        const currentFile = replayFiles[i];
        switch (currentFile.replayFileType) {
            case 'map':
                var replayFile = replayFiles.find(file => (
                    file.fileName === currentFile.fileName &&
                    file.path === currentFile.path &&
                    file.replayFileType == 'data'
                ));
                if (replayFile != null) {
                    if (replayFile.map == null) replayFile.map = [];
                    replayFile.map.push(...currentFile.map);
                    replayFile.map.path = currentFile.path;
                }
                replayFiles.splice(i, 1);
                break;
            default:
                break;
        }
    }
}

async function selectFileChange() {
    var optionValue = selectFileElm.value;
    var seletedReplayFile = replayFiles.find(r => r.optionValue == optionValue);
    if (seletedReplayFile != null && seletedReplayFile != currentReplayFile) {
        myHide(selectFileElm);
        myHide(playPauseElm);
        myHide(speedXElm);
        myHide(selectSkipToElm);
        myShow(loadingElm);
        loadingElm.innerText = seletedReplayFile.fileName;
        pause();
        try {
            await loadReplayFile(seletedReplayFile);
            fillSkipTo();
            myShow(playPauseElm);
            myShow(speedXElm);
        } catch (err) {
            replayUiError(seletedReplayFile.fileName, err);
        }
        myHide(loadingElm);
        if (replayFiles.length > 1) myShow(selectFileElm);
    }
}

function pause(end = false) {
    if (playing) {
        playing = false;
        sendMessage('replay_pause');
        pauseEvents();
        playPauseElm.innerText = 'Play';
        myHide(selectSkipToElm);
    }
}

function replayUiError(type, message) {
    //todo nice ui
    var msgElm = document.createElement('div');

    msgElm.innerText = type + ': ' + message;
    msgElm.classList.add('pb-2');
    msgElm.classList.add('text-danger');
    outElm.append(msgElm);
    setTimeout(_ => {
        msgElm.classList.add('fade');
        setTimeout(_ => msgElm.remove(), 200);
    }, 5000);
}

function replayUiMessage(type, message) {
    //todo nice ui
    var msgElm = document.createElement('div');

    msgElm.innerText = type + ': ' + message;
    msgElm.classList.add('pb-2');
    outElm.append(msgElm);
    setTimeout(_ => {
        msgElm.classList.add('fade');
        setTimeout(_ => msgElm.remove(), 200);
    }, 5000);
}

function replayAddEmitLog(data) {
    //todo any/nice ui
    replayEmitLog.push({ date: Date.now(), data });
}

async function loadReplayFile(loadingReplayFile) {
    var loadingEventsLog;
    loadingEventsLog = Array.from(loadingReplayFile.eventsLog);
    if (loadingReplayFile.map != null && loadingReplayFile.map?.length > 0)
        mapEvents(loadingReplayFile.map, loadingEventsLog);
    if (loadingEventsLog.length > 0 || typeof loadingReplayFile.channelPath === 'string' && typeof loadingReplayFile.channelName === 'string') {
        replay = false;
        playPauseElm.innerText = 'Play';
        currentEventsLog = loadingEventsLog;
        currentReplayFile = loadingReplayFile;
        pausedAt = null;
        skip.toEvent = null;
        myShow(iframeElm);
        var hashArgs = [
            currentReplayFile.channelPath,
            currentReplayFile.channelName,
            fakeConsoleLog ? 1 : 0,
            window.location.origin,
            window.hasDriveUserscript ? 1 : 0
        ]
        if (window.hasDriveUserscript) {
            hashArgs.push(window.driveUserscriptVersion);
        }
        var hash = JSON.stringify(hashArgs);
        hash = "#" + encodeURIComponent(hash.substr(1, hash.length - 2));
        var url = iframeProto + '//0.0.0.0:8003/' + iframePath + '/index.html?_=' + Date.now() + hash;
        await loadIframe(url);
    } else {
        throw 'empty eventsLog, channelName or channelPath';
    }
}

function mapEvents(map, events) {
    for (const mapEntry of map) {
        switch (mapEntry.type) {
            case 'changeMedia':
                for (let i = events.length - 1; i >= 0; i--) {
                    var event = events[i];
                    if (event.type === 'changeMedia') {
                        if (event.data[0].id === mapEntry.search.id && event.data[0].type === mapEntry.search.type) {
                            var newEvent = JSON.parse(JSON.stringify(event));
                            newEvent.data[0].id = mapEntry.replace.id;
                            newEvent.data[0].type = mapEntry.replace.type;
                            if (mapEntry.replace.meta != null)
                                newEvent.data[0].meta = mapEntry.replace.meta;
                            if (mapEntry.replace.type === 'replay_local') {
                                //todo ../.
                                var fileFullName = map.path + mapEntry.replace.id;
                                var file = otherFiles.find(f => fileFullName === (f.path + f.name));
                                if (file != null) {
                                    newEvent.file = file;
                                    newEvent.beforeSending = localFileBeforeSend;
                                    events[i] = newEvent;
                                }
                                else {
                                    replayUiError("Map", "Missing mapped local file: " + fileFullName);
                                }
                            }
                            else {
                                events[i] = newEvent;
                            }
                        }
                    }
                }
                break;
            default:
                break;
        }
    }
}

function loadIframe(url) {
    return new Promise((resolve, reject) => {
        iframeElm.onReplayLoad = () => resolve();
        iframeElm.onerror = function (event) {
            reject(event.error);
        }
        iframeElm.src = url;
    });
}

function onMessage(event) {
    var data = event.data ?? {};
    if (data.replayMessage) {
        receiveMessage(data.replayMessage.type, data.replayMessage.data);
    }
}

function receiveMessage(type, data) {
    switch (type) {
        case 'replay_emit':
            replayAddEmitLog(data);
            break;
        case 'replay_window_loaded':
            childOrigin = data;
            if (typeof iframeElm.onReplayLoad === 'function') iframeElm.onReplayLoad();
            break;
        default:
            break;
    }
}

function fillSkipTo() {
    selectSkipToElm.querySelectorAll("*:not(:first-child)").forEach(_ => _.remove());
    var optionI = 0;
    for (const event of currentEventsLog) {
        if (event.type == 'changeMedia') {
            var optionElm = document.createElement('option');
            event.skipOption = optionElm.value = 'skip_' + optionI++;
            optionElm.innerText = event.data[0].title;
            selectSkipToElm.append(optionElm);
        }
    }
}

function playPauseClick(event) {
    if (playing) {
        pause();
    }
    else {
        play();
    }
}

function play() {
    if (replay) {
        loadReplayFile(currentReplayFile);
    }
    else if (!playing) {
        playing = true;
        if (pausedAt != null) {
            eventsTimeDiff += (Date.now() - pausedAt);
            pausedAt = null;
        }
        else {
            eventsTimeDiff = Date.now() - currentEventsLog[0].time;
        }
        sendMessage('replay_play');
        playEvents();
        playPauseElm.innerText = 'Pause';
        myShow(selectSkipToElm);
    }
}

function sendMessage(type, data = null) {
    child.postMessage({ replayMessage: { type, data } }, childOrigin);
}

function playEvents() {
    if (currentEventsLog.length <= 0) {
        pause();
        eventsEnded();
    }
    else {
        var timeUntilEvent = (currentEventsLog[0].time + eventsTimeDiff) - Date.now();
        if (speedX != 1) {
            eventsTimeDiff -= timeUntilEvent - Math.floor(timeUntilEvent / speedX);
            timeUntilEvent = Math.floor(timeUntilEvent / speedX);
        }
        var skipping = false;
        if (skip.toEvent != null) {
            skipping = skipEvent(currentEventsLog[0]);
            // //time events
            // if (!skipping) {
            //     var now = Date.now();
            //     if (eventsTiming.lastEventName != null) {
            //         if (eventsTiming.lastEventTime == null) eventsTiming.lastEventTime = now;
            //         if (eventsTiming.time[eventsTiming.lastEventName] == null) {
            //             eventsTiming.time[eventsTiming.lastEventName] = 0;
            //             eventsTiming.count[eventsTiming.lastEventName] = 0;
            //         }
            //         eventsTiming.time[eventsTiming.lastEventName] += now - eventsTiming.lastEventTime;
            //         eventsTiming.count[eventsTiming.lastEventName]++;
            //         eventsTiming.avgTime[eventsTiming.lastEventName] = eventsTiming.time[eventsTiming.lastEventName] / eventsTiming.count[eventsTiming.lastEventName];
            //         eventsTiming.lastEventTime = now;
            //     }
            //     eventsTiming.lastEventName = currentEventsLog[0].type;
            //     //console.log(currentEventsLog[0].type, currentEventsLog[0].data[0]);
            // }
        }
        if (!skipping) {
            playerTimeout = window.setTimeout(async _ => {
                lastEvent = currentEventsLog.shift();
                if (typeof lastEvent.beforeSending === 'function') {
                    await lastEvent.beforeSending(lastEvent);
                }
                if (lastEvent.type === 'changeMedia') {
                    selectSkipToElm.querySelector('*[value="' + lastEvent.skipOption + '"]').remove();
                }
                sendMessage('replay_event', { type: lastEvent.type, data: lastEvent.data });
                playEvents();
            }, timeUntilEvent);
        }
        else {
            currentEventsLog.shift();
            if (skip.stackI++ < 1000) {
                playEvents();
            }
            else {
                skip.stackI = 0;
                playerTimeout = window.setTimeout(async _ => playEvents(), 0);
            }
        }
    }
}

function pauseEvents() {
    window.clearTimeout(playerTimeout);
    pausedAt = Date.now();
}

function selectSkipToChange(event) {
    if (skip.toEvent == null) {
        if (eventsTimeDiff == null) {
            play();
            pause();
        }
        selectSkipToElm.disabled = true;
        playPauseElm.disabled = true;
        speedXElm.disabled = true;
        skip.toEvent = currentEventsLog.find(e => e.skipOption == selectSkipToElm.value);
        eventsTimeDiff -= (skip.toEvent.time - currentEventsLog[0].time);
    }
}

function skipEvent(event) {
    var skipping = true;
    switch (event.type) {
        case 'changeMedia':
            skipping = event !== skip.toEvent;
            if (!skipping) {
                skip.toEvent = null;
                selectSkipToElm.disabled = false;
                playPauseElm.disabled = false;
                speedXElm.disabled = false;
                var time = event.time;
                for (const name in skip.users) {
                    var skipUser = skip.users[name];
                    if (skipUser.added != null) {
                        var data = skipUser.added;
                        currentEventsLog.unshift({ time, type: 'addUser', data });
                    }
                    if (skipUser.rank != null) {
                        var data = [{ name, rank: skipUser.rank }];
                        currentEventsLog.unshift({ time, type: 'setUserRank', data });
                    }
                    if (skipUser.meta != null) {
                        var data = [{ name, meta: skipUser.meta }];
                        currentEventsLog.unshift({ time, type: 'setUserMeta', data });
                    }
                    if (skipUser.afk != null) {
                        var data = [{ name, afk: skipUser.afk }];
                        currentEventsLog.unshift({ time, type: 'setAFK', data });
                    }
                    if (skipUser.left) {
                        var data = [{ name }];
                        currentEventsLog.unshift({ time, type: 'userLeave', data });
                    }
                }
                for (let i = skip.polls.length - 1; i >= 0; i--) {
                    const poll = skip.polls[i];
                    if (poll.poll != null) {
                        if (poll.closed) currentEventsLog.unshift({ time, type: 'closePoll', 'data': [] });
                        var data = [poll.poll];
                        currentEventsLog.unshift({ time, type: 'updatePoll', data });
                    }
                }
                if (skip.usercount != null) {
                    currentEventsLog.unshift({ time, type: 'usercount', 'data': [skip.usercount] });
                }
                if (skip.drinkCount != null) {
                    currentEventsLog.unshift({ time, type: 'drinkCount', 'data': [skip.drinkCount] });
                }
            }
            else {
                selectSkipToElm.querySelector('*[value="' + event.skipOption + '"]').remove();
            }
            break;
        case 'chatMsg':
        case 'mediaUpdate':
            break;
        case 'setUserMeta':
            var currData = event.data[0];
            var skipUser = skip.users[currData.name] ?? {};
            if (skipUser.added != null) {
                skipUser.added.meta = currData.meta;
                skipUser.meta = null;
            }
            else {
                skipUser.meta = currData.meta;
            }
            skip.users[currData.name] = skipUser;
            break;
        case 'setAFK':
            var currData = event.data[0];
            var skipUser = skip.users[currData.name] ?? {};
            skipUser.afk = currData.afk;
            skip.users[currData.name] = skipUser;
            break;
        case 'updatePoll':
            skip.polls[skip.polls.length - 1].poll = event.data[0];
            break;
        case 'closePoll':
            skipping = true;
            skip.polls[skip.polls.length - 1].closed = true;
            skip.polls.push({});
            break;
        case 'usercount':
            skip.usercount = event.data[0];
            break;
        case 'setUserRank':
            var currData = event.data[0];
            var skipUser = skip.users[currData.name] ?? {};
            if (skipUser.added != null) {
                skipUser.added.rank = currData.rank;
                skipUser.rank = null;
            }
            else {
                skipUser.rank = currData.rank;
            }
            skip.users[currData.name] = skipUser;
            break;
        case 'userLeave':
            var currData = event.data[0];
            var skipUser = skip.users[currData.name] ?? {};
            skipUser = {};
            skipUser.left = true;
            skip.users[currData.name] = skipUser;
            break;
        case 'addUser':
            var currData = event.data[0];
            var skipUser = skip.users[currData.name] ?? {};
            skipUser.added = currData;
            skip.users[currData.name] = skipUser;
            break;
        case 'drinkCount':
            skip.drinkCount = event.data[0];
            break;
        default:
            skipping = false;
            break;
    }
    return skipping;
}

function speedXInput(event) {
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

function eventsEnded() {
    playPauseElm.innerText = "Replay";
    replay = true;
    pausedAt = null;
}

async function localFileBeforeSend(event) {
    pausedAt = Date.now();
    sendMessage('replay_pause');
    myHide(selectSkipToElm);
    myHide(inputFileElm);
    var wasShown = myHide(selectFileElm);
    myHide(speedXElm);
    myHide(playPauseElm);
    myShow(loadingElm);
    loadingElm.innerText = event.file.name;

    if (event.file.blob == null) {
        if (event.file.file instanceof File)
            event.file.blob = event.file.file;
        else
            event.file.blob = await event.file.file.async('blob');
        event.file.blobId = blobIds++;
    }
    event.data[0].type = "fi";
    event.data[0].id = event.file.blob;
    event.data[0].blobId = event.file.blobId;

    myHide(loadingElm);
    myShow(selectSkipToElm);
    myShow(inputFileElm);
    if (wasShown) myShow(selectFileElm);
    myShow(speedXElm);
    myShow(playPauseElm);

    eventsTimeDiff += (Date.now() - pausedAt);
    pausedAt = null;
    sendMessage('replay_play');
}
