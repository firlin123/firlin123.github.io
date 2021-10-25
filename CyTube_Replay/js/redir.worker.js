const base = 'https://firlin123.github.io';
//const base = 'https://ee56-77-222-156-115.ngrok.io';
//const base = 'http://0.0.0.0:8001';
const status = 301;

async function handleRequest(request) {
    const url = new URL(request.url);
    let { pathname, search, hash } = url;
    const destinationURL = base + pathname + search + hash;

    //return Response.redirect(destinationURL, status);

    var headers = new Headers();
    headers.set("location", destinationURL);
    headers.set("Access-Control-Allow-Origin", '*');
    var init = {
        headers, status,
        statusText: "Moved Permanently"
    };
    return new Response(null, init);
}

addEventListener("fetch", async event => {
    event.respondWith(handleRequest(event.request))
});