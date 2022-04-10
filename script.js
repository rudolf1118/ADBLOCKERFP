
let sponsoredTexts=[
    "Sponsored",
    "مُموَّل", // Arabic
    "赞助内容", // Chinese (Simplified)
    "贊助", // Chinese (Traditional)
    "Sponzorováno", // Czech
    "Gesponsord", // Dutch
    "May Sponsor", // Filipino
    "Commandité", // French (Canada)
    "Sponsorisé", // French
    "Gesponsert", // German
    "Χορηγούμενη", // Greek
    "ממומן", // Hebrew
    "प्रायोजित", // Hindi
    "Hirdetés", // Hungarian
    "Bersponsor", // Indonesian
    "Sponsorizzato", // Italian
    "広告", // Japanese
    "Sponsorowane", // Polish
    "Patrocinado", // Portuguese (Brazil)
    "Sponsorizat", // Romanian
    "Реклама", // Russian
    "Sponzorované", // Slovak
    "Publicidad", // Spanish
    "Sponsrad", // Swedish
    "ได้รับการสนับสนุน", // Thai
    "Sponsorlu", // Turkish
    "Được tài trợ", // Vietnamese
];
let sponsores=sponsoredTexts.map((element)=>`a[aria - label="${element}"]`)
let blockList=["._m8c", ".uiStreamSponsoredLink", 'a[data-hovercard][href*="hc_ref=ADS"]', 'a[role="button"][rel~="noopener"][data-lynx-mode="async"]',];

let list=[...sponsores, ...blockList];

let posts=document.querySelector('[role="feed"]');

let blocker=()=>{
    document.querySelectorAll('[role="feed"] [data-pagelet]').forEach(element => {
        for(let i = 0;i<list.length;i++) {
        let spelement = element.querySelector(`[aria-label="${list[i]}"]`)
        if (spelement !== null) element.style.display = 'none'
    }}) };

let RemoveFromFeed=() =>{
    let d = document,
        postFeed = d.querySelector('[role="feed"]'),
        postFeedObserver = new MutationObserver(
            mutations => mutations && blocker()
        )

    postFeed &&
    postFeedObserver.observe(postFeed, {
        childList: true
    })
    };

setInterval(function () {
    blocker();
    RemoveFromFeed();
}, 1000000);