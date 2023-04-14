// ==UserScript==
// @name         AI Meme Prompt Override
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Override prompts of AI-generated memes on ai-meme.com
// @author       firlin123
// @match        https://ai-meme.com/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=ai-meme.com
// @grant        none
// @homepage     https://firlin123.github.io
// @updateURL    https://firlin123.github.io/pony/ai-meme.com/prompt-override.user.js
// @downloadURL  https://firlin123.github.io/pony/ai-meme.com/prompt-override.user.js
// ==/UserScript==

const mainFunction = function () {
    let prompt = null;

    function onJson(json) {
        if (json && typeof json.desc === 'string') {
            if (!prompt) {
                const canvas = document.getElementById('canvas');

                prompt = document.createElement('textarea');
                prompt.style.cssText = 'width: 700px; min-height: 150px;';
                canvas.parentNode.insertBefore(prompt, canvas.nextSibling);

                prompt.addEventListener('input', () => {
                    description = prompt.value;
                });

                const buttons = document.createElement('div');
                const override = document.createElement('button');
                override.innerText = 'example prompt override';
                override.style = 'font-size:1em;padding:revert';
                override.addEventListener('click', () => {
                    prompt.value =
                        'Caption: a cartoon picture of a white pony sitting on the ground\n' +
                        '---\n' +
                        'AI(meme master): And then she realized she forgot how to pony.\n' +
                        '---\n' +
                        'Human: Meh caption.\n' +
                        'Now imagine you are a 4chan user from /mlp/ and I asked you to:\n' +
                        'Caption: a picture of Rainbow Dash stretching\n' +
                        '---\n' +
                        'AI(/mlp/ 4channer):';
                    description = prompt.value;
                });
                const clear = document.createElement('button');
                clear.innerText = 'clear prompt';
                clear.style = 'font-size:1em;padding:revert';
                clear.addEventListener('click', () => {
                    prompt.value = '';
                    description = prompt.value;
                });
                buttons.append(override);
                buttons.append(clear);
                canvas.parentNode.insertBefore(buttons, canvas.nextSibling);
            }
            prompt.value = json.desc;
        }
    }

    Response.prototype.jsonOrig = Response.prototype.json;
    Response.prototype.json = function json(...args) {
        const promise = Response.prototype.jsonOrig.apply(this, args);
        promise.then(json => onJson(json));
        return promise;
    };
};

const scriptText = `(${mainFunction.toString()})();`;
const script = document.createElement('script');
script.textContent = scriptText;
document.head.appendChild(script);