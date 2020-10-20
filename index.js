// defining urls like json attributes
const linksArray = [
    { "name": "Cloudflare", "url": "https://www.cloudflare.com/" },
    { "name": "Google", "url": "https://www.google.com/" },
    { "name": "LinkedIn", "url": "https://www.linkedin.com//" }
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
    return getStaticPage();
}

class LinkTransformer {
    constructor(links) {
        this.links = links;
    }

    async element(element) {
        if (element) {
            let text = '\n';
            this.links.forEach((link) => {
                text += '<a href="';
                text += link.url;
                text += '">';
                text += link.name;
                text += '</a>\n'
            })
            element.setInnerContent(text, { html: true });
        }
    }
}

class ProfileTransformer {
    async element(element) {
        if (element) {
            if (element.tagName === "div") {
                element.removeAttribute("style");
            } else if (element.tagName === "img") {
                element.setAttribute("src", "https://avatars0.githubusercontent.com/u/65627251?s=400&u=7136f5e180dbdbada15fd713b01b2998c577f522&v=4");
            } if (element.tagName === "h1") {
                element.setInnerContent("Anusha Vakamalla");
            }
        }
    }
}

class SocialTransformer {
    constructor(links) {
        this.links = links;
    }

    async element(element) {
        if (element) {
            element.removeAttribute("style");
            let text = '\n';
            this.links.forEach((link) => {
                text += '<a href="';
                text += link.url;
                text += '">';
                text += '\n<img style="filter:invert(100%);" src="' + link.svgUrl + '" alt="' + link.name + '">';
                text += '</a>\n'
            })
            element.setInnerContent(text, { html: true });
        }
    }
}

class PageTransformer {
    async element(element) {
        if (element) {
            if (element.tagName === "body") {
                element.setAttribute("class", "bg-green-900");
            } else if (element.tagName === "title") {
                element.setInnerContent("Anusha Vakamalla's Page");
            }
        }
    }
}

const linkTransformer = new HTMLRewriter().on('div#links', new LinkTransformer(linksArray));

const profileTransformer = new HTMLRewriter().on('div#profile', new ProfileTransformer());
const profileImageTransformer = new HTMLRewriter().on('img#avatar', new ProfileTransformer());
const profileNameTransformer = new HTMLRewriter().on('h1#name', new ProfileTransformer());

const socialTransformer = new HTMLRewriter().on('div#social', new SocialTransformer(socialLinks));

const pageTransformer = new HTMLRewriter().on('body', new PageTransformer());
const titleTransformer = new HTMLRewriter().on('title', new PageTransformer());

async function getStaticPage() {
    let staticPage = await fetch('https://static-links-page.signalnerve.workers.dev')
        .then((response) => {
            if (response.status == 200) {
                return response;
            } else new Response('Something went wrong!', { status: 500 });
        })

    staticPage = linkTransformer.transform(staticPage);

    staticPage = profileTransformer.transform(staticPage);
    staticPage = profileImageTransformer.transform(staticPage);
    staticPage = profileNameTransformer.transform(staticPage);

    staticPage = socialTransformer.transform(staticPage);

    staticPage = pageTransformer.transform(staticPage);
    staticPage = titleTransformer.transform(staticPage);

    return staticPage;
}
