const caseSensitive = false;
var myDictionaryReady = false;
var _myDictionary = null;
document.body.insertAdjacentHTML('beforeend', 
    `<iframe style="display:none" src="${window.myHost}/pony/StarryEyesCYOA/dictionary.html?ts=${Date.now()}">
    </iframe>`)
var myDictionaryFrame = document.body.lastElementChild;
window.addEventListener("message", receiveMessage, false);
function receiveMessage(event) {
    if (event.origin == myHost) {
        _myDictionary = event.data;
        myDictionaryReady = true;
        updateDictionaryList();
    }
}
myDictionaryFrame.addEventListener('load', () => {
    if (localStorage['myDictionary']) {
        receiveMessage({ 'origin': myHost, 'data': JSON.parse(localStorage['myDictionary']) });
        myDictionaryFrame.contentWindow.postMessage(_myDictionary, myHost);
        localStorage.removeItem('myDictionary');
        alert('Starry Eyes CYOA translator: Dictionary imported!');
    } else {
        myDictionaryFrame.contentWindow.postMessage(null, myHost);
    }
});

function myDictionary(newDict = null) {
    if (myDictionaryReady) {
        if (newDict != null) {
            _myDictionary = newDict;
            myDictionaryFrame.contentWindow.postMessage(newDict, myHost)
        }
        return _myDictionary;
    }
    else {
        if (newDict != null) return newDict;
        else[];
    }
}

function myDictionaryPush(dict) {
    _myDictionary.push(dict);
    myDictionaryFrame.contentWindow.postMessage(_myDictionary, myHost);
}

function myDictionaryUpdate(){
    myDictionaryFrame.contentWindow.postMessage(_myDictionary, myHost);
}

//***floating window***//

const fwP = localStorage['fwP'] ? JSON.parse(localStorage['fwP']) : {
    X: 100,
    Y: 50,
    W: 350,
    H: 200,
    Opacity: 1,
    Id: 3
};

const searchCss = (document.querySelector("blockquote") ? "blockquote" : "article>.text,article>.post_wrapper>.text");

document.body.insertAdjacentHTML('beforeend',
    `<div id="fw" style="position: fixed; left: ${fwP.X}px; top: ${fwP.Y}px; height: ${fwP.H}px; width: ${fwP.W}px; opacity: ${fwP.Opacity}; z-index: 9999999;">
	<div id="fwHideBtn" onclick="fwHide()"></div>
	<div id="fwContent"></div>
</div>
<div id="fwRestoreBtn" class="" onclick="fwRestore()"></div>`);

const fw = document.querySelector("#fw");
const fwContent = document.querySelector("#fwContent");
const fwRestoreBtn = document.querySelector("#fwRestoreBtn");
fwContent.innerHTML = `
<div id="dictionaryHeader">
  <div id="dictionaryButtons">
    <button onclick="retranslate()">(Re)Translate</button>
    <button onclick="myRestore()">Restore</button>
    <button onclick="showHideDict()">Show/Hide dict</button>
  </div>
  <div id="dictContainer" class="hidden"><textarea></textarea><button onclick="myImport()">Import</button></div>
</div>
<div id="dictionaryList"></div>
`;

const dictContainer = document.querySelector("#dictContainer");
const dictContainerTextarea = document.querySelector("#dictContainer>textarea");
const dictionaryList = document.querySelector("#dictionaryList");

function divToDict(dictInputWord, dictInputTranslation, dictInputColor) {
    return { word: dictInputWord.value, translation: createParam(dictInputTranslation.value, dictInputColor.value) };
}

function dictToDiv(entry, add = false) {
    const dictDiv = document.createElement("div");
    const dictDivP1 = document.createElement("div");
    const dictDivP2 = document.createElement("div");
    const dictInputWord = document.createElement("input");
    const dictInputTranslation = document.createElement("input");
    const dictInputColor = document.createElement("input");
    const dictButton = document.createElement("button");

    dictInputColor.type = "color";
    dictDiv.classList.add("dictionaryEntry");
    dictInputWord.value = entry ? entry.word : "";
    dictInputTranslation.value = entry ? entry.translation.text : "";
    dictInputColor.value = add ? "#ffc8c8" : entry.translation.color;
    dictButton.innerText = add ? "+" : "X";
    dictButton.addEventListener("click",
        add ?
            () => {
                if (!myDictionaryReady) return;
                if (dictInputWord.value.trim() == "") {
                    alert("Input word!");
                }
                else {
                    const dict = divToDict(dictInputWord, dictInputTranslation, dictInputColor);
                    myDictionaryPush(dict);
                    dictDiv.insertAdjacentElement("beforebegin", dictToDiv(dict));
                    updateDictContainerTextarea();
                }
            } :
            () => {
                if (!myDictionaryReady) return;
                dictDiv.remove();
                myDictionary(myDictionary().filter((e) => e != entry));
                updateDictContainerTextarea();
            });
    if (!add) {
        dictInputWord.addEventListener("input", () => {
            entry.word = dictInputWord.value;
            myDictionaryUpdate();
            updateDictContainerTextarea();
        });
        dictInputTranslation.addEventListener("input", () => {
            entry.translation.text = dictInputTranslation.value;
            myDictionaryUpdate();
            updateDictContainerTextarea();
        });
        dictInputColor.addEventListener("input", () => {
            entry.translation.color = dictInputColor.value;
            myDictionaryUpdate();
            updateDictContainerTextarea();
        });
    }
    dictDivP1.classList.add("dictDivP1");
    dictDivP2.classList.add("dictDivP2");

    dictDivP1.append(dictInputWord);
    dictDivP1.append(" > ");
    dictDivP1.append(dictInputTranslation);
    dictDivP2.append(" Color: ");
    dictDivP2.append(dictInputColor);
    dictDivP2.append(dictButton);

    dictDiv.append(dictDivP1);
    dictDiv.append(dictDivP2);
    return dictDiv;
}

function updateDictionaryList() {
    if (!myDictionaryReady) return;
    dictionaryList.innerHTML = "";
    for (const entry of myDictionary()) {
        dictionaryList.append(dictToDiv(entry))
    }
    dictionaryList.append(dictToDiv(null, true));
}

function showHideDict() {
    if (dictContainer.classList.contains("hidden")) {
        updateDictContainerTextarea();
        dictContainer.classList.remove("hidden");
    }
    else {
        dictContainer.classList.add("hidden")
    }
}

function updateDictContainerTextarea() {
    if (!myDictionaryReady) return;
    //dictContainerTextarea.value = "[\n";//JSON.stringify(myDictionary(), null, "   ");
    let val = "[\n"
    let first = true;
    for (const ent of myDictionary()) {
        if (first) first = false;
        else val += ",\n";
        val += ("  " + JSON.stringify(ent));
    }
    val += "\n]";
    dictContainerTextarea.value = val;
}

//***floating window***//

function retranslate() {
    myRestore();
    myTranslate();
}

function myTranslate() {
    if (!myDictionaryReady) return;
    for (const a of document.querySelectorAll(searchCss)) {
        var innerTextNodes = findAllChildTextNodes(a);
        for (const innerTextNode of innerTextNodes) {
            replaceText(innerTextNode, myDictionary());
        }
    }

}

function myRestore() {
    for (const neww of document.querySelectorAll(".myTranslateNewText"))
        neww.remove();
    for (const orig of document.querySelectorAll(".myTranslateOrigText"))
        orig.parentNode.replaceChild(orig.childNodes[0], orig);
}

function myImport() {
    if (!myDictionaryReady) return;
    try {
        const md = JSON.parse(dictContainerTextarea.value);
        myDictionary(md);
        updateDictionaryList();
    }
    catch (e) {
        alert("Exception: " + e);
        console.log(e);
    }
}

function fwHide() {
    fw.classList.add("hidden");
    //fwRestoreBtn.classList.remove("hidden");
}

function fwRestore() {
    fw.classList.toggle("hidden");
    //fwRestoreBtn.classList.add("hidden");
}

//****floating window****//

window.addEventListener('beforeunload', (e) => {
    localStorage['fwP'] = JSON.stringify(fwP);
});

let draggingAny = false;
let draggingTop = false;
let draggingLeft = false;
let draggingBottom = false;
let draggingRight = false;
let dragStart = false;
let dragEnd = false;
let dragShift = false;
let dragOffset = 5;
let dragElement = null;
let dragX = 0;
let dragY = 0;
let previousDragX = 0;
let previousDragY = 0;
let previousDragWidth = fwP.W;
let previousDragHeight = fwP.H;

document.addEventListener('mousemove', (e) => {
    if (dragElement == fw || e.target == fw) {
        e.preventDefault();
    }
    if (e.target == fw && !dragStart) {

        var hoverW = e.layerX < dragOffset; //w
        var hoverN = e.layerY < dragOffset //n
        var hoverE = fwP.W - e.layerX < dragOffset; //e
        var hoverS = fwP.H - e.layerY < dragOffset; //s
        var hoverAny = (hoverS || hoverE || hoverN || hoverW);
        const cursor = (hoverN ? "n" : "") + (hoverS ? "s" : "") + (hoverW ? "w" : "") + (hoverE ? "e" : "") + "-resize";
        fw.style.cursor = hoverAny ? cursor : null;
    }
    else {
        fw.style.cursor = null;
    }
    if (e.buttons > 0) {
        if (!dragStart) {
            //console.log("dragStart");
            dragStart = true;
            dragEnd = false;
            dragElement = e.target;
            if (e.target == fw) {
                dragX = e.clientX;
                dragY = e.clientY;

                draggingLeft = e.layerX < dragOffset; //w
                draggingTop = e.layerY < dragOffset //n
                draggingRight = fwP.W - e.layerX < dragOffset; //e
                draggingBottom = fwP.H - e.layerY < dragOffset; //s
                draggingAny = (draggingLeft || draggingRight || draggingTop || draggingBottom);
                dragShift = e.shiftKey;
            }
        }
        if (dragElement == fw) {
            let diffX = dragX - e.clientX;
            let diffY = dragY - e.clientY;

            let calcWidth = draggingLeft ? (previousDragWidth + diffX) : (draggingRight ? (previousDragWidth - diffX) : fwP.W);
            let calcHeight = draggingTop ? (previousDragHeight + diffY) : (draggingBottom ? (previousDragHeight - diffY) : fwP.H);
            let calcX = (draggingLeft || !draggingAny) ? (previousDragX - diffX) : fwP.X;
            let calcY = (draggingTop || !draggingAny) ? (previousDragY - diffY) : fwP.Y;

            if (dragShift) {
                let shiftHeight = calcWidth / previousDragWidth * previousDragHeight;
                let shiftWidth = calcHeight / previousDragHeight * previousDragWidth;
                if ((draggingRight || draggingLeft) && !(draggingTop || draggingBottom)) {
                    if (draggingLeft) {
                        calcX = calcX + (calcHeight - shiftHeight);
                    }
                    calcHeight = shiftHeight;
                }
                else if ((draggingBottom || draggingTop) && !(draggingRight || draggingLeft)) {
                    if (draggingTop) {
                        calcY = calcY + (calcWidth - shiftWidth);
                    }
                    calcWidth = shiftWidth;
                }
                else {
                    if (shiftWidth < calcWidth) {
                        if (draggingLeft) {
                            calcX = calcX + (calcWidth - shiftWidth);
                        }
                        calcWidth = shiftWidth;

                    }
                    else {
                        if (draggingTop) {
                            calcY = calcY + (calcHeight - shiftHeight);
                        }
                        calcHeight = shiftHeight;

                    }
                }
            }

            fw.style.left = (fwP.X = calcX) + 'px';
            fw.style.top = (fwP.Y = calcY) + 'px';
            fw.style.width = (fwP.W = calcWidth) + 'px';
            fw.style.height = (fwP.H = calcHeight) + 'px';
        }
    }
    else {
        if (!dragEnd) {
            //console.log("dragEnd");
            dragEnd = true;
            dragStart = false;

            previousDragX = fwP.X;
            previousDragY = fwP.Y;
            previousDragWidth = fwP.W;
            previousDragHeight = fwP.H;

            draggingAny = draggingTop = draggingLeft = draggingBottom = draggingRight = dragShift = false;
            dragElement = null;
        }
    }
});

//***floating window***//


function findAllChildTextNodes(current = document.body, result = []) {
    for (const n of current.childNodes) {
        if (n.nodeName == "#text") {
            result.push(n);
        }
        else {
            findAllChildTextNodes(n, result)
        }
    }
    return result;
}

function createParam(text, background = "green") {
    return {
        "text": text,
        "color": background
    };
}

function elementFromTranslation(translation, origTextNode) {
    const element = document.createElement('span');
    element.innerText = translation.text;
    let translated = true;
    let translatedTextNode = element.childNodes[0];
    element.addEventListener("click", () => {
        if (translated) {
            translated = false;
            element.replaceChild(origTextNode, translatedTextNode);
            element.style.background = "rgba(0,0,0,0.1)";
        }
        else {
            translated = true;
            element.replaceChild(translatedTextNode, origTextNode);
            element.style.background = translation.color;
        }
    });
    element.style.background = translation.color;
    return element;
}

function replaceText(textNode, dictionary, orig = true) {
    let position = -1;
    let replaceWithTranslation = null;
    let wordLength = 0;
    for (const entry of dictionary) {
        replaceWithTranslation = entry.translation;
        wordLength = entry.word.length;
        position = caseSensitive ?
            searchWord(entry.word, textNode.textContent) :
            searchWord(entry.word.toLocaleLowerCase(), textNode.textContent.toLocaleLowerCase());
        if (position != -1) {
            break;
        }
    }
    if (position != -1) {
        let parent = textNode.parentElement;
        let head = textNode;
        if (orig) {
            const origText = textNode.textContent;
            const newSpan = document.createElement("span");
            const origSpan = document.createElement("span");
            origSpan.classList.add('hidden');
            origSpan.classList.add('myTranslateOrigText');
            newSpan.classList.add('myTranslateNewText');
            parent.insertBefore(origSpan, textNode);
            parent.insertBefore(newSpan, textNode);
            origSpan.append(textNode);
            newSpan.innerText = origText;

            parent = newSpan;
            head = newSpan.childNodes[0];
        }

        const middle = head.splitText(position);
        const tail = middle.splitText(wordLength);

        const newElement = elementFromTranslation(replaceWithTranslation, middle);
        parent.replaceChild(newElement, middle);

        replaceText(tail, dictionary, false);
        replaceText(head, dictionary, false);
    }
}


//function escapeRegex(string) {
//    return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
//}

const whiteSpcRE = /[^\u0304\u02bb\w\u00c0-\u02b8]/;

function searchWord(word, str) {
    let pos = 0;
    while (true) {
        const subpos = str.substr(pos).search(word);
        if (subpos == -1) return -1;
        const fpos = pos + subpos;
        if (fpos !== 0) {
            //console.log(str[fpos-1], str[fpos-1].codePointAt(0).toString(16));
            if (!whiteSpcRE.test(str[fpos - 1])) {
                pos = fpos + word.length;
                continue;
            }
        }
        if (fpos + word.length != str.length) {
            //console.log(str[fpos+word.length], str[fpos+word.length].codePointAt(0).toString(16));
            if (!whiteSpcRE.test(str[fpos + word.length])) {
                pos = fpos + word.length;
                continue;
            }
            else {
                pos = fpos;
                return pos;
            }
        }
        else {
            pos = fpos;
            return pos;
        }
    }
    //return str.search(RegExp('\\b'+ escapeRegex(word) +'\\b'));
}