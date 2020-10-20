// defining urls like json attributes
const linksArray = [
	{ "name": "LinkedIn", "url": "https://www.linkedin.com//" },
    { "name": "Facebook", "url": "https://www.facebook.com/" },
    { "name": "Instagram", "url": "https://www.instagram.com//" }
    
]

const socialLinks = [
	{ "name": "LinkedIn", "url": "https://www.linkedin.com/in/anusha-vakamalla/", "svgUrl": "https://simpleicons.org/icons/linkedin.svg" },
    { "name": "GitHub", "url": "https://github.com/anushavakamalla", "svgUrl": "https://simpleicons.org/icons/github.svg" }
    
]

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})

/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(request) {
    if (request.url.substring(request.url.lastIndexOf('/')) == "/links") {
        return new Response(JSON.stringify(linksArray), {
            headers: { 'content-type': 'application/json' },
        });
    }
    return getHTMLStatic();
}

class URLModifier {
    constructor(links) {
        this.links = links;
    }

async element(id) {
    if (id) {
        let content = '\n';
            this.links.forEach((link) => {
                content += '<a href="';
                content += link.url;
                content += '">';
                content += link.name;
                content += '</a>\n'
            })
            id.setInnerContent(content, { html: true });
        }
    }
}

class InfoModifier {
    async element(id) {
        if (id) {
            if (id.tagName === "div") {
                id.removeAttribute("style");
            } else if (id.tagName === "img") {
                id.setAttribute("src", "https://avatars0.githubusercontent.com/u/65627251?s=400&u=7136f5e180dbdbada15fd713b01b2998c577f522&v=4");
            } if (id.tagName === "h1") {
                id.setInnerContent("Anusha Vakamalla");
            }
        }
    }
}

class SocialModifier {
    constructor(links) {
        this.links = links;
    }

    async element(id) {
        if (id) {
            id.removeAttribute("style");
            let content = '\n';
            this.links.forEach((link) => {
                content += '<a href="';
                content += link.url;
                content += '">';
                content += '\n<img style="filter:invert(100%);" src="' + link.svgUrl + '" alt="' + link.name + '">';
                content += '</a>\n'
            })
            id.setInnerContent(content, { html: true });
        }
    }
}

class WebModifier {
    async element(id) {
        if (id) {
            if (id.tagName === "body") {
                id.setAttribute("class", "bg-green-900");
            } else if (id.tagName === "title") {
                id.setInnerContent("Anusha Vakamalla's Page");
            }
        }
    }
}

const urlModifier = new HTMLRewriter().on('div#links', new URLModifier(linksArray));

const infoModifier = new HTMLRewriter().on('div#profile', new InfoModifier());
const infoImageModifier = new HTMLRewriter().on('img#avatar', new InfoModifier());
const infoNameModifier = new HTMLRewriter().on('h1#name', new InfoModifier());

const socialModifier = new HTMLRewriter().on('div#social', new SocialModifier(socialLinks));

const webModifier = new HTMLRewriter().on('body', new WebModifier());
const headingModifier = new HTMLRewriter().on('title', new WebModifier());

async function getHTMLStatic() {
    let HTMLstatic = await fetch('https://static-links-page.signalnerve.workers.dev')
        .then((response) => {
            if (response.status == 200) {
                return response;
            } else new Response('Something went wrong!', { status: 500 });
        })
    
    HTMLstatic = urlModifier.transform(HTMLstatic);
    HTMLstatic = infoImageModifier.transform(HTMLstatic);
    HTMLstatic = infoNameModifier.transform(HTMLstatic);
    HTMLstatic = infoModifier.transform(HTMLstatic);
   

    HTMLstatic = socialModifier.transform(HTMLstatic);

    HTMLstatic = webModifier.transform(HTMLstatic);
    HTMLstatic = headingModifier.transform(HTMLstatic);

    return HTMLstatic;
}
