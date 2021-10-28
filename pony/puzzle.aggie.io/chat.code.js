debug('CODE INIT');

var chatInput = document.getElementById('chat-input');
chatInput.addEventListener('keydown', tabKeyDown);
chatMutationBuffer.forEach(m => chatMutation(m, chatObserver));
chatMutationBuffer = [];
window.onchatmutation = chatMutation;
chatEmotes.forEach(e => e.rex = new RegExp(e.source));

function tabKeyDown(event) {
    if (event.key === 'Tab') {
        var sStart = chatInput.selectionStart;
        var sEnd = chatInput.selectionEnd;
        var start = (sStart < sEnd) ? sStart : sEnd;
        var end = (sEnd > sStart) ? sEnd : sStart;
        var allText = chatInput.value;
        var insertText = '\t';
        if (start == end) {
            var toCarret = allText.substr(0, end);
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
        var newText = allText.substring(0, start) + insertText + allText.substring(end, allText.length);
        chatInput.value = newText;
        chatInput.selectionStart = start + insertText.length;
        chatInput.selectionEnd = start + insertText.length;

        event.preventDefault();
    }
}

function sameCharInAllEmotes(emotes, i) {
    var char = emotes[0].name[i];
    for (const emote of emotes) {
        if (emote.name[i] !== char) return false;
    }
    return true;
}

function chatMutation(mutationsList, chatObserver) {
    for (const mutation of mutationsList) {
        if (mutation.addedNodes.length > 0) {
            mutation.addedNodes.forEach(node => {
                var contentElm = node.querySelector('.chat-content');
                var str = contentElm.innerText;
                var text = contentElm.firstChild;
                var emoteTextNodes = [];
                var matches;
                do {
                    matches = [];
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
                for(const emote of emoteTextNodes){
                    contentElm.replaceChild(createEmote(emote[1]), emote[0]);
                }
            });
        }
    }
}

function createEmote(emote){
    var emoteElm = document.createElement('img');
    emoteElm.src = emote.image;
    emoteElm.title = emote.name;
    emoteElm.classList.add('puzzle-emote');
    return emoteElm;
}