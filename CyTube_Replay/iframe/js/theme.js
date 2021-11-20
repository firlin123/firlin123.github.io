(function () {
  var c = document.cookie.split(";").map(function (s) {
    return s.trim();
  });

  // Set in the head template.
  var theme = DEFAULT_THEME;
  for (var i = 0; i < c.length; i++) {
    if (c[i].indexOf("cytube-theme=") === 0) {
      theme = c[i].split("=")[1];
      break;
    }
  }

  var rex = new RegExp("^" + escapeStringRegexp(WIN_PATH) + "\\/css\\/themes\\/.+?.css$");
  if (theme == null || !theme.match(rex)) {
    return;
  }

  if (theme !== DEFAULT_THEME) {
    console.info("THEME COOKIE:", theme);
    var cur = document.getElementById("usertheme");
    cur.parentNode.removeChild(cur);
    var css = document.createElement("link");
    css.setAttribute("rel", "stylesheet");
    css.setAttribute("type", "text/css");
    css.setAttribute("href", theme);
    css.setAttribute("id", "usertheme");
    document.head.appendChild(css);
  }

  // https://github.com/sindresorhus/escape-string-regexp
  function escapeStringRegexp(string) {
    if (typeof string !== 'string') {
      throw new TypeError('Expected a string');
    }

    // Escape characters with special meaning either inside or outside character sets.
    // Use a simple backslash escape when it’s always valid, and a `\xnn` escape when
    // the simpler form would be disallowed by Unicode patterns’ stricter grammar.
    return string
      .replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
      .replace(/-/g, '\\x2d');
  }
})();
