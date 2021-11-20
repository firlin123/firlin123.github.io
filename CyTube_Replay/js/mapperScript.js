var inputFileElm = document.getElementById('inputFile');
var inputFolderElm = document.getElementById('inputFolder');
var outElm = document.getElementById('out');
var loadingElm = document.getElementById('loading');
var selectFileElm = document.getElementById('selectFile');
var otherFilesElm = document.getElementById('otherFiles');
var addFileSelectElm = document.getElementById('addFileSelect');
var currentReplayFile = {};
var folders;
var addFileSelectValue;
var addFileSelecOptionI;

inputFileElm.addEventListener('change', inputFileChange);
inputFolderElm.addEventListener('change', inputFileChange);

async function inputFileChange(event) {
    replayInputFiles = event.target.files;
    if (replayInputFiles.length > 0) {
        var newReplayFiles = [];
        var newOtherFiles = [];
        myHide(selectFileElm);
        myHide(event.target);
        myShow(loadingElm);
        for (const replayInputFile of replayInputFiles) {
            loadingElm.innerText = replayInputFile.name;

            var rIFC = replayInputFiles.length;
            var rIFN = replayInputFile.name;
            var path = '/' + (replayInputFile.webkitRelativePath.replace(rIFN, '') ?? '');
            if (rIFC == 1 && event.target.multiple) path = '/';
            var [currReplayFiles, currOtherFiles] =
                await ((rIFN.toLocaleLowerCase().endsWith('.zip') && rIFC == 1) ? readReplayZipFile : readReplayFile)(replayInputFile, path);
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
            if (replayFiles.length > 1) myShow(selectFileElm);
            otherFilesInit();
            selectFileChange();
        }
        event.target.value = null;
    }
    else {
        replayUiError('Replay', 'no file selected');
    }
}

function otherFilesInit() {
    myShow(otherFilesElm);
    var foldersMap = { '/': true };
    var rPath, oPath;
    for (const file of replayFiles) {
        if (foldersMap[file.path] == null) {
            foldersMap[file.path] = true;
            if (rPath == null) rPath = file.path;
        }
    }
    for (const file of otherFiles) {
        if (foldersMap[file.path] == null) {
            foldersMap[file.path] = true;
            if (oPath == null) oPath = file.path;
        }
    }
    var optionI = 0;
    folders = { '/': 'default' };
    Object.keys(foldersMap).sort().map(
        p => folders[p] = folders[p] ?? ('folder_' + optionI++)
    );
    addFileSelectValue = folders[oPath ?? (rPath ?? '/')];
    for (const opt in folders) {
        addFileSelectElm.append(createElement('option', { innerText: opt, value: folders[opt] }));
    }
    addFileSelectElm.value = addFileSelectValue;
    otherFiles.forEach(file => {
        /*<div class="col-12 col-lg-6 col-xxl-4 p-2">
                <div class="input-group">
                    <span class="input-group-text">File</span>
                    <select class="form-select" style="max-width:8rem">
                        <option>/videos</option>
                        <option>/kek/123</option>
                    </select>
                    <input class="form-control" placeholder="file_name.mp4" value="/videos/file1.mp4">
                    <button class="btn btn-primary">As video</button>
                    <button class="btn btn-danger">Remove</button>
                </div>
                <video class="d-none border col-12 mt-2 p-2 rounded-3" controls
                    src="http://0.0.0.0:8001/CyTube_Replay_data/MlpRewatch/2021.10.24/videos/stickmare.mp4"></video>
            </div> */
        var fileElm = createElement('div', { className: 'col-12 col-xl-6 p-2' });
        var inputGroupElm = createElement('div', { className: 'input-group' });
        var videoElm = createElement('video', { className: 'd-none border col-12 my-2 p-2 rounded-3', controls: true })
        var selectElm = createElement('select', { className: 'form-select' }, { 'style': 'max-width:8rem' })

        for (const opt in folders) {
            selectElm.append(createElement('option', { innerText: opt, value: folders[opt] }));
        }
        selectElm.value = folders[file.path];
        //inputGroupElm.append(createElement('span', { className: 'input-group-text', innerText: 'File' }));
        inputGroupElm.append(selectElm);
        inputGroupElm.append(createElement('input', {
            className: 'form-control', placeholder: 'sample_file.mp4', value: file.name
        }));
        var blobUrl;
        inputGroupElm.append(createElement('button', {
            className: 'btn btn-primary', innerText: 'As video', onclick: async e => {
                if (blobUrl == null) {
                    if (!(myGetMain(loadingElm).classList.contains('d-none'))) return;
                    if (file.file instanceof File)
                        file.blob = file.file;
                    else {
                        loadingElm.innerText = file.name;
                        myShow(loadingElm);
                        var wasShown = myHide(selectFileElm);
                        myHide(inputFileElm);
                        e.target.disabled = true;
                        file.blob = await file.file.async('blob');
                        e.target.disabled = false;
                        myHide(loadingElm);
                        wasShown ? myShow(selectFileElm) : 0;
                        myShow(inputFileElm);
                    }
                    blobUrl = URL.createObjectURL(file.blob);
                    videoElm.src = blobUrl;
                    fileElm.insertAdjacentElement('afterend', videoElm);
                    //fileElm.append(videoElm);
                }
                if (!(videoElm.classList.contains('d-none'))) {
                    videoElm.pause();
                    e.target.innerText = 'Show';
                }
                else e.target.innerText = 'Hide';
                videoElm.classList.toggle('d-none');
            }
        }));
        inputGroupElm.append(createElement('button', {
            className: 'btn btn-danger', innerText: 'Remove'
        }));

        fileElm.append(inputGroupElm);
        otherFilesElm.append(fileElm);
    });
}
function selectFileChange() {
    var optionValue = selectFileElm.value;
    var seletedReplayFile = replayFiles.find(r => r.optionValue == optionValue);
    if (seletedReplayFile != null && seletedReplayFile != currentReplayFile) {
        loadReplayFile(seletedReplayFile);
    }
}

function loadReplayFile(loadingReplayFile) {

}

function attachMaps(replayFiles) {
    for (var i = replayFiles.length - 1; i >= 0; i--) {
        const currentFile = replayFiles[i];
        switch (currentFile.replayFileType) {
            case 'map':
                replayFile = replayFiles.find(file => (
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

async function readReplayZipFile(zipFile, pathPrefix) {
    if (typeof JSZip === 'undefined') {
        loadingElm.innerText = 'jszip_3.7.1.min.js';
        await loadScript('./js/jszip_3.7.1.min.js');
        loadingElm.innerText = zipFile.name;
    }
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
        case 'out': return element;
            break;
        case 'otherFiles':
        case 'playPause':
        case 'selectFile': return element.parentElement;
            break;
        case 'loading':
        case 'inputFile':
        case 'inputFolder': return element.parentElement.parentElement;
            break;
        default:
            console.trace();
            throw 'Unknown element';
    }
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

function createElement(tag, options = {}, attributes = {}) {
    var element = document.createElement(tag);
    for (const option in options) {
        element[option] = options[option];
    }
    for (const attribute in attributes) {
        element.setAttribute(attribute, attributes[attribute]);
    }
    return element;
}