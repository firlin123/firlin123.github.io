// ==UserScript==
// @name         AI Meme Prompt Override
// @namespace    http://tampermonkey.net/
// @version      2.0
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
    const css = `#meme-container {
            position: relative;
            display: block;
            width: 300px;
            height: 300px;
            border: 2px solid black;
            background-color: #f2f2f2;
        }

        #meme-img {
            display: none;
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        #meme-canvas {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border: unset;
            background-color: transparent;
            margin-bottom: unset;
            max-width: unset;
            max-height: unset;
        }

        #meme-file-input {
            display: none;
        }

        #meme-container label {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: unset;
            margin-right: unset;
        }

        #meme-container span {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }

        #bloom-prompt-check:checked+label+div {
            display: none;
        }

        #bloom-prompt-check:not(:checked)+label+div+div {
            display: none;
        }

        #bloom-prompt-input {
            min-width: 360px;
            min-height: 100px;
        }

        #gpt-prompt-container {
            position: relative;
        }

        #gpt-prompt-container>div {
            font-family: monospace;
            font-size: 14px;
            line-height: 16px;
            position: absolute;
            top: 1px;
            left: 4px;
            padding-top: 3px;
            padding-bottom: 0px;
            background: white;
            color: grey;
            pointer-events: none;
            max-width: 340px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        #gpt-prompt-input {
            font-size: 14px;
            line-height: 16px;
            padding-top: 66px;
            padding-left: 3px;
            min-width: 360px;
            min-height: 32px;
            border: 1px solid black;
            margin: 0;
        }

        #gpt-prompt-input:focus-visible {
            outline: 1px solid black;
        }

        #gpt-prompt-input.english+div>span {
            display: none;
        }

        #gpt-prompt-input.english {
            padding-top: 50px;
            min-height: 48px;
        }`;
    const style = document.createElement('style');
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);

    const mainDiv = document.createElement('div');
    mainDiv.id = "po-main";
    mainDiv.style = "position:absolute;inset:0;background:#fff;margin:8px";
    mainDiv.innerHTML = `
    <div id="meme-container">
        <img id="meme-img">
        <canvas id="meme-canvas" width="300" height="300"></canvas>
        <label><input type="file" id="meme-file-input" accept="image/*"></label>
        <span id="meme-label">Drop Image Here</span>
    </div>
    <div>
        <input id="gpt-prompt-check" type="radio" name="model-check" checked>
        <label for="gpt-prompt-check">GPT-3</label>
        <input id="bloom-prompt-check" type="radio" name="model-check">
        <label for="bloom-prompt-check">Bloom</label>
        <div id="gpt-prompt">
            <label for="gpt-prompt-lang-input">Language:</label>
            <input type="text" id="gpt-prompt-lang-input" value="English" placeholder="English"><br>
            <label for="gpt-prompt-input">Prompt:</label> <small>(We can't control the gray part except for language)</small>
            <div id="gpt-prompt-container">
                <textarea id="gpt-prompt-input" class="english"></textarea>
                <div>
                    You generate funny short meme captions.<br>
                    <span>Write in <span id="gpt-prompt-lang-span">English</span> language.<br></span>
                    You respond with Caption: ...<br>
                    Img description:
                </div>
            </div>
        </div>
        <div id="bloom-prompt">
            <label for="bloom-prompt-input">Prompt:</label><br>
            <textarea id="bloom-prompt-input"></textarea>
        </div>
    </div>
    <details>
        <summary>More options:</summary>
        <label for="font-size-input">Font Size:</label>
        <input type="range" id="font-size-input" class="option" min="10" max="100" value="36">
        <br>
        <label for="line-spacing-input">Line Spacing:</label>
        <input type="range" id="line-spacing-input" class="option" min="0.5" max="2" step="0.1" value="1.2">
        <br>
        <label for="font-family-select">Font Family:</label>
        <select id="font-family-select" class="option">
            <option value="Impact, sans-serif">Impact</option>
            <option value="Arial, sans-serif">Arial</option>
            <option value="Helvetica, sans-serif">Helvetica</option>
            <option value="Comic Sans MS, sans-serif">Comic Sans MS</option>
        </select>
        <br>
        <label for="font-weight-select">Font Weight:</label>
        <select id="font-weight-select" class="option">
            <option value="">Normal</option>
            <option value="bold">Bold</option>
        </select>
        <br>
        <label for="fill-color-input">Fill Color:</label>
        <input type="color" id="fill-color-input" class="option" value="#ffffff">
        <br>
        <label for="stroke-color-input">Stroke Color:</label>
        <input type="color" id="stroke-color-input" class="option" value="#000000">
        <br>
        <label for="line-width-input">Line Width:</label>
        <input type="range" id="line-width-input" class="option" min="0" max="10" value="2">
        <br>
        <label for="margin-input">Margin:</label>
        <input type="range" id="margin-input" class="option" min="0" max="50" value="10">
    </details>
    <div>
        <button id="generate-button">Generate Meme</button>
        <button id="download-button">Download</button>
    </div>`;
    document.body.append(mainDiv);


    /**
     * @type {HTMLCanvasElement}
     */
    const memeCanvas = document.getElementById('meme-canvas');
    const memeCtx = memeCanvas.getContext('2d');
    const generateButton = document.getElementById('generate-button');
    const downloadButton = document.getElementById('download-button');
    const memeFileInput = document.getElementById('meme-file-input');
    const memeImg = document.getElementById('meme-img');
    const memeContainer = document.getElementById('meme-container');
    const memeLabel = document.getElementById('meme-label');
    const gptPromptLangInput = document.getElementById('gpt-prompt-lang-input');
    const gptPromptInput = document.getElementById('gpt-prompt-input');
    const bloomPromptInput = document.getElementById('bloom-prompt-input');
    const gptPromptCheck = document.getElementById('gpt-prompt-check');
    const loadedImg = new Image();
    let memeText = '';
    let gptPrompt = '';
    let bloomPrompt = '';
    let gptPromptLanguage = 'English';
    let hasMemeText = false;
    let hasMemePrompt = false;
    let useGpt = true;
    let generating = false;

    function drawText(text, options = {}) {
        if (!options || typeof options !== "object") options = {};
        const memeText = text;
        const isBottom = (options.textGravity ?? 'bottom') === 'bottom';
        const fontSize = options.fontSize || 36;
        const lineSpacing = options.lineSpacing || 1.2;
        const fontFamily = options.fontFamily || "Impact, sans-serif";
        const fontWeight = options.fontWeight || "";
        memeCtx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
        memeCtx.fillStyle = options.fillStyle || "white";
        memeCtx.strokeStyle = options.strokeStyle || "black";
        const lineWidth = parseInt(options.lineWidth || 2);
        memeCtx.lineWidth = lineWidth;
        memeCtx.textAlign = "center";
        memeCtx.textBaseline = "bottom";
        const margin = options.margin || 10;
        const words = memeText.split(/\s+/);

        // Wrap the text
        function wrapText(context, text, maxWidth) {
            const lines = [];
            let line = '';
            text.forEach((word) => {
                const testLine = line + word + ' ';
                const metrics = context.measureText(testLine);
                const testWidth = metrics.width;
                if (testWidth > maxWidth && line.length > 0) {
                    lines.push(line.trim());
                    line = word + ' ';
                } else {
                    line = testLine;
                }
            });
            lines.push(line.trim());
            return lines;
        }

        // Render the text
        const wrappedText = wrapText(memeCtx, words, memeCanvas.width - margin * 2);
        const lineHeight = fontSize * lineSpacing;
        const totalTextHeight = (wrappedText.length - 1) * lineHeight;
        let y;

        if (isBottom) {
            y = memeCanvas.height - margin - totalTextHeight;
        } else {
            y = margin;
        }

        wrappedText.forEach((line) => {
            const x = memeCanvas.width / 2;
            if (lineWidth) {
                memeCtx.strokeText(line, x, y);
            }
            memeCtx.fillText(line, x, y);
            y += lineHeight;
        });
    }

    function drawFull(img, text, options) {
        // Clear the canvas
        memeCtx.clearRect(0, 0, memeCanvas.width, memeCanvas.height);
        if (img) {
            memeCtx.drawImage(img, 0, 0, memeCanvas.width, memeCanvas.height);
        }
        drawText(text, options);
    }

    function loadImageFromFile(file) {
        if (!file) return;
        const url = URL.createObjectURL(file);
        loadedImg.onload = () => {
            const { width, height } = loadedImg;
            memeImg.onload = () => {
                URL.revokeObjectURL(url);
                memeImg.style.display = 'block';
                memeLabel.remove();
                onNewImage({ width, height });
            }
            memeImg.src = url;
        };
        loadedImg.onerror = (e) => {
            URL.revokeObjectURL(url);
            console.error('Error loading image', e);
        };
        loadedImg.src = url;
    }

    function onNewImage(dims) {
        const { width, height } = calculateWH(dims);
        memeCanvas.width = width;
        memeCanvas.height = height;
        memeContainer.style.width = `${width}px`;
        memeContainer.style.height = `${height}px`;
        hasMemePrompt = false;
        hasMemeText = false;
        triggerUpdate();
    }

    async function triggerUpdate() {
        if (generating) return;
        generating = true;
        generateButton.disabled = true;
        try {
            if (loadedImg.src === '') return;
            if (!hasMemeText) {
                if (!hasMemePrompt) await generatePrompt();
                if (!hasMemeText) await generateText();
            }
            drawFull(null, memeText, getOptions());
        } catch (e) {
            console.error('Trigger Update Error:', e);
            alert('Error occured. Check console for more details.');
        }
        generating = false;
        generateButton.disabled = false;
    }

    async function generateText() {
        if (useGpt) {
            if (!hasMemePrompt) return await generatePrompt();
            await gptRequest('', gptPrompt);
        }
        else {
            let r = await fetch("https://api-inference.huggingface.co/models/bigscience/bloom", {
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                    inputs: bloomPrompt,
                    parameters: {
                        seed: Math.floor(Math.random() * 10) + 1,
                        early_stopping: false,
                        length_penalty: 0,
                        max_new_tokens: 30,
                        do_sample: true,
                        top_p: 0.9
                    }
                }),
                method: "POST"
            });
            let resp = await r.json();
            const match = resp[0].generated_text.match(/: "([^"]*)"/);
            if (match) {
                memeText = match[1];
                hasMemeText = true;
            } else {
                throw new Error("BloomAI failed");
            }
        }
    }

    async function generatePrompt() {
        if (loadedImg.src === '') throw new Error('No input image selected');
        // Clear the canvas
        memeCtx.clearRect(0, 0, memeCanvas.width, memeCanvas.height);
        memeCtx.drawImage(loadedImg, 0, 0, memeCanvas.width, memeCanvas.height);
        if (useGpt) {
            const dataURL = memeCanvas.toDataURL("image/jpeg");
            await gptRequest(dataURL, null);
        }
        else {
            const imageBlob = await new Promise(a => memeCanvas.toBlob(blob => a(blob), "image/jpeg"));
            const response = await fetch('https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-base', {
                method: 'POST',
                headers: {
                    'content-type': imageBlob.type,
                    'content-length': imageBlob.size
                },
                body: imageBlob,
            });
            const result = await response.json();
            gptPromptInput.value = result[0].generated_text;
            onGptPrompt();
        }
    };

    async function gptRequest(dataURL, descText) {
        const response = await fetch("/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: dataURL, lang: gptPromptLanguage, descText })
        });
        const { text, desc } = await response.json();
        if (typeof desc === 'string') {
            hasMemePrompt = true;
            gptPromptInput.value = desc;
            onGptPrompt();
        }
        if (typeof text === 'string') {
            hasMemeText = true;
            memeText = text;
        }
    }

    function getOptions() {
        const fontSize = document.getElementById('font-size-input').value;
        const lineSpacing = document.getElementById('line-spacing-input').value;
        const fontFamily = document.getElementById('font-family-select').value;
        const fontWeight = document.getElementById('font-weight-select').value;
        const fillStyle = document.getElementById('fill-color-input').value;
        const strokeStyle = document.getElementById('stroke-color-input').value;
        const lineWidth = document.getElementById('line-width-input').value;
        const margin = document.getElementById('margin-input').value;
        return { fontSize, lineSpacing, fontFamily, fontWeight, fillStyle, strokeStyle, lineWidth, margin };
    }

    function calculateWH(dims, minDim = 150, maxDim = 512) {
        const aspectRatio = dims.width / dims.height;
        let width, height;
        if (aspectRatio >= 1) {
            width = maxDim;
            height = maxDim / aspectRatio;
        } else {
            width = maxDim * aspectRatio;
            height = maxDim;
        }
        // Ignore aspect ratio if the image is too narrow vertically or horizontally
        if (width < minDim) width = minDim;
        if (height < minDim) height = minDim;
        return { width, height };
    }

    function onGptPrompt() {
        gptPrompt = gptPromptInput.value.trim();
        hasMemeText = false;
        if (gptPrompt === '') {
            hasMemePrompt = false;
            bloomPromptInput.value = bloomPrompt = '';
            return;
        }
        bloomPrompt = `Funny, short meme caption for the picture of ${gptPrompt.replace(/^Caption: /, '')}: "`;
        bloomPromptInput.value = bloomPrompt;
        hasMemePrompt = true;
    }

    // Trigger update or file selection on generate click
    generateButton.addEventListener('click', () => {
        if (generating) return;
        if (loadedImg.src === '') {
            memeFileInput.click();
            return;
        }
        hasMemeText = false;
        triggerUpdate();
    });
    downloadButton.addEventListener('click', () => {
        if (generating) return;
        if (loadedImg.src === '') return;
        if (!hasMemeText) return;
        drawFull(loadedImg, memeText, getOptions());
        const link = document.createElement('a');
        link.download = 'prompt-override-mod.png';
        link.href = memeCanvas.toDataURL();
        link.click();
    });

    // Update bloom prompt from gpt prompt
    gptPromptInput.addEventListener('input', onGptPrompt);

    bloomPromptInput.addEventListener('input', e => {
        bloomPrompt = bloomPromptInput.value.trim();
        hasMemeText = false;
        if (!(hasMemePrompt = bloomPrompt !== '')) {
            gptPromptInput.value = gptPrompt = '';
        }
    });

    // Keep track of gpt prompt language
    gptPromptLangInput.addEventListener('input', e => {
        gptPromptLanguage = gptPromptLangInput.value.trim();
        if (gptPromptLanguage === '') gptPromptLanguage = 'English';
        document.getElementById('gpt-prompt-lang-span').innerText = gptPromptLanguage;
        gptPromptInput.classList[gptPromptLanguage === 'English' ? 'add' : 'remove']('english');
    });

    // Keep track of which model to use
    gptPromptCheck.addEventListener('change', e => useGpt = gptPromptCheck.checked);
    document.getElementById('bloom-prompt-check').addEventListener('change', e => useGpt = gptPromptCheck.checked);

    // Regenerate the meme whenever the sliders/selects are changed
    document.querySelectorAll('.option').forEach(input => {
        input.addEventListener('change', triggerUpdate);
        input.addEventListener('input', triggerUpdate);
    });

    // Handle file input change event
    memeFileInput.addEventListener('change', (event) => {
        loadImageFromFile(event.target.files[0]);
    });

    // Handle drag and drop events
    memeContainer.addEventListener('dragover', (event) => {
        event.preventDefault();
        event.stopPropagation();
    });

    memeContainer.addEventListener('drop', (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (event.dataTransfer && event.dataTransfer.files.length) {
            loadImageFromFile(event.dataTransfer.files[0]);
        }
    });
};

const scriptText = `(${mainFunction.toString()})();`;
const script = document.createElement('script');
script.textContent = scriptText;
document.head.appendChild(script);