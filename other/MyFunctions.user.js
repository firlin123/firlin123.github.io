// ==UserScript==
// @name         My Functions
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  My functions
// @author       Me
// @match        *://*/*
// @icon         data:image/svg+xml,%3Csvg aria-hidden='true' focusable='false' data-prefix='fab' data-icon='js' role='img' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 448 512' class='svg-inline--fa fa-js fa-w-14 fa-5x'%3E%3Cpath fill='currentColor' d='M0 32v448h448V32H0zm243.8 349.4c0 43.6-25.6 63.5-62.9 63.5-33.7 0-53.2-17.4-63.2-38.5l34.3-20.7c6.6 11.7 12.6 21.6 27.1 21.6 13.8 0 22.6-5.4 22.6-26.5V237.7h42.1v143.7zm99.6 63.5c-39.1 0-64.4-18.6-76.7-43l34.3-19.8c9 14.7 20.8 25.6 41.5 25.6 17.4 0 28.6-8.7 28.6-20.8 0-14.4-11.4-19.5-30.7-28l-10.5-4.5c-30.4-12.9-50.5-29.2-50.5-63.5 0-31.6 24.1-55.6 61.6-55.6 26.8 0 46 9.3 59.8 33.7L368 290c-7.2-12.9-15-18-27.1-18-12.3 0-20.1 7.8-20.1 18 0 12.6 7.8 17.7 25.9 25.6l10.5 4.5c35.8 15.3 55.9 31 55.9 66.2 0 37.8-29.8 58.6-69.7 58.6z' class=''%3E%3C/path%3E%3C/svg%3E
// @grant        none
// @homepage     https://firlin123.github.io
// @updateURL    https://firlin123.github.io/other/MyFunctions.user.js
// @downloadURL  https://firlin123.github.io/other/MyFunctions.user.js
// ==/UserScript==

(function () {
    'use strict';
    window.myFunctions_DownloadString = function (text, filename = 'out.json', type = "application/json") {
        const a = document.createElement("a");
        a.href = window.URL.createObjectURL(new Blob([text], { 'type': type }));
        a.setAttribute("download", filename);
        a.click();
        window.URL.revokeObjectURL(a.href);
    }
    window.myFunctions_UploadString = async function (timeout) {
        return await new Promise((resolve, reject) => {
            let timeoutId = undefined;
            let fileIn = document.createElement('input');
            if (typeof timeout === 'number' && timeout > 0)
                timeoutId = setTimeout(() => reject('Timeout'), timeout);
            fileIn.type = 'file';
            fileIn.onchange = e => {
                let reader = new FileReader();
                reader.onload = () => {
                    if (timeoutId != null)
                        clearTimeout(timeoutId);
                    resolve(reader.result);
                };
                reader.readAsText(fileIn.files[0]);
            };
            fileIn.click();
        });
    }
})();