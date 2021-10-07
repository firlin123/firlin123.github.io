// ==UserScript==
// @name         Starry Eyes Translate
// @namespace    http://tampermonkey.net/
// @version      0.1.5
// @description  translation for Starry Eyes CYOA
// @author       firlin123
// @match        */mlp/thread/*
// @icon         https://u.smutty.horse/mdmtklszsxo.png
// @grant        none
// @homepage     https://firlin123.github.io
// @updateURL    https://firlin123.github.io/pony/StarryEyesCYOA/launcher.user.js
// @downloadURL  https://firlin123.github.io/pony/StarryEyesCYOA/launcher.user.js
// ==/UserScript==

(function () {
	'use strict';

	//change to true if you want to manually add threads that are not in the
	//https://firlin123.github.io/pony/StarryEyesCYOA/match.txt
	var useMyMatch = false;
	//                             add threads here |
	//                                              V
	var myMatch = "^\/mlp\/thread\/(37280692|37637506)\/?$";

	if (window.myHost == null) {
		window.myHost = 'https://firlin123.github.io';
	}
	var triggered = {
		'matchSrc': window.myHost + '/pony/StarryEyesCYOA/match.txt?ts='+Date.now(),
		'scriptSrc': window.myHost + '/pony/StarryEyesCYOA/code.js?ts='+Date.now(),
		'styleSrc': window.myHost + '/pony/StarryEyesCYOA/style.css?ts='+Date.now()
	};

	if (!useMyMatch) {
		if (triggered) {
			fetch(triggered.matchSrc)
				.then(res => res.text())
				.then(mathText => {
					const r = new RegExp(mathText);
					if (document.location.pathname.match(r)) {
						go();
					}
				});
		}
	}
	else {
		const r = new RegExp(myMatch);
		if (document.location.pathname.match(r)) {
			go();
		}
	}


	function go() {
		fetch(triggered.styleSrc)
			.then(res => res.text())
			.then(code => {
				const e = document.createElement('style');
				e.innerHTML = code;
				document.body.appendChild(e);
			});
		fetch(triggered.scriptSrc)
			.then(res => res.text())
			.then(code => {
				const e = document.createElement('script');
				e.innerHTML = code;
				document.body.appendChild(e);
			});
	}
})();