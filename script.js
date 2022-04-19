// ADS BLOCKER
(function () {
    const allowedList=[];
    const staticBlockedList=["._m8c", ".uiStreamSponsoredLink", 'a[data-hovercard][href*="hc_ref=ADS"]', 'a[role="button"][rel~="noopener"][data-lynx-mode="async"]'];
    const sponsoredTexts=[
        "Sponsored",
        "Գովազդային",
        "Реклама",
        "مُموَّل",
        "赞助内容",
        "贊助",
        "Sponzorováno",
        "Gesponsord",
        "May Sponsor",
        "Commandité",
        "Sponsorisé",
        "Gesponsert",
        "Χορηγούμενη",
        "ממומן",
        "प्रायोजित",
        "Hirdetés",
        "Bersponsor",
        "Sponsorizzato",
        "広告",
        "Sponsorowane",
        "Patrocinado",
        "Sponsorizat",
        "Реклама",
        "Sponzorované",
        "Publicidad",
        "Sponsrad",
        "ได้รับการสนับสนุน",
        "Sponsorlu",
        "Được tài trợ"
    ];

    function getBlockedList() {
        const ariaLabels=sponsoredTexts.map(t=>`a[aria-label="${t}"]`);
        // sponsores and static list
        return [...staticBlockedList, ...ariaLabels];
    }

    const blockedList=getBlockedList();

    function isHidden(e) {
        const style=window.getComputedStyle(e);
        if (style.display === "none" || style.opacity === "0" || style.fontSize === "0px" || style.visibility === "hidden" || style.position === "absolute") {
            return true;
        }
        return false;
    }

    function getTextFromElement(e) {
        return (e.innerText === "" ? e.dataset.content : e.innerText) || "";
    }

    function getTextFromContainerElement(e) {
        return e.dataset.content || Array.prototype.filter.call(e.childNodes, element=>{
            return element.nodeType === Node.TEXT_NODE;
        }).map(element=>{
            return element.textContent;
        }).join("");
    }

    function getVisibleText(e) {
        if (isHidden(e)) {
            return "";
        }
        const children=e.querySelectorAll(":scope > *");
        if (children.length !== 0) {
            if (e.style.display === "flex") {
                return getTextFromContainerElement(e) + Array.prototype.slice.call(children).filter(e=>e.style.flex !== "" && e.style.order !== "").map(e=>[parseInt(e.style.order), getVisibleText(e)]).sort((a, b)=>a[0] - b[0])
                    .map(e=>e[1])
                    .flat().join("");
            } else {
                return getTextFromContainerElement(e) + Array.prototype.slice.call(children).map(getVisibleText).flat().join("");
            }
        }
        return getTextFromElement(e);
    }

    function hideIfSponsored$2(possibleSponsoredTextQueries, e) {
        if (allowedList.some(query=>{
            if (e.querySelector(query) !== null) {
                e.dataset.blocked="allowedList";
                return true;
            }
            return false;
        })) {
            return false;
        }
        if (blockedList.some(query=>{
            if (e.querySelector(query) !== null) {
                e.style.display="none";
                e.dataset.blocked="blockedList";
                return true;
            }
            return false;
        })) {
            return true;
        }
        return possibleSponsoredTextQueries.some(query=>{
            const result=e.querySelectorAll(query);
            return [...result].some(t=>{
                const visibleText=getVisibleText(t);
                if (sponsoredTexts.some(sponsoredText=>visibleText.indexOf(sponsoredText) !== -1)) {
                    e.style.display="none";
                    e.dataset.blocked="sponsored";
                    return true;
                }
                return false;
            });
        });
    }

    const possibleSponsoredTextQueries$1=['div[id^="feedsubtitle"] > :first-child', 'div[id^="feed_sub_title"] > :first-child', 'div[id^="feed__sub__title"] > :first-child', 'div[id^="feedlabel"] > :first-child', 'div[id^="fbfeed_sub_header_id"] > :nth-child(3)', 'div[data-testid$="storysub-title"] > :first-child', 'div[data-testid$="story-subtilte"] > :first-child', 'div[data-testid$="story--subtilte"] > :first-child', 'a[role="button"][aria-labelledby]', 'div[data-testid*="subtitle"] > :first-child', 'div[data-testid*="label"] > :first-child'];

    function hideIfSponsored$1(e) {
        return hideIfSponsored$2(possibleSponsoredTextQueries$1, e);
    }

    let feedObserver$1=null;

    function onPageChange$1() {
        let feed=document.getElementById("stream_pagelet");
        if (feed !== null) {
            feed.querySelectorAll('div[id^="hyperfeed_story_id_"]').forEach(hideIfSponsored$1);
            feedObserver$1=new MutationObserver(mutations=>{
                mutations.forEach(mutation=>{
                    if (mutation.target.id.startsWith("hyperfeed_story_id_")) {
                        hideIfSponsored$1(mutation.target);
                    }
                });
            });
            feedObserver$1.observe(feed, {
                childList: true,
                subtree: true
            });
            return;
        }
        feed=document.getElementById("pagelet_group_");
        if (feed !== null) {
            feed.querySelectorAll('div[id^="mall_post_"]').forEach(hideIfSponsored$1);
            feedObserver$1=new MutationObserver(mutations=>{
                mutations.forEach(mutation=>{
                    mutation.target.querySelectorAll('div[id^="mall_post_"]').forEach(hideIfSponsored$1);
                });
            });
            feedObserver$1.observe(feed, {
                childList: true,
                subtree: true
            });
        }
    }

    const pageObserver$1=new MutationObserver(onPageChange$1);

    function setupPageObserver$1() {
        onPageChange$1();
        const fbContent=document.getElementsByClassName("fb_content")[0];
        pageObserver$1.observe(fbContent, {
            childList: true
        });
    }

    window.addEventListener("beforeunload", ()=>{
        pageObserver$1.disconnect();
        if (feedObserver$1 !== null) {
            feedObserver$1.disconnect();
            feedObserver$1=null;
        }
    });

    function isClassicFacebook() {
        return document.getElementsByClassName("fb_content")[0] !== undefined;
    }

    const possibleSponsoredTextQueries=['a[role="link"] > span[aria-labelledby]', 'div[role="button"] > span[aria-labelledby]', 'span[dir="auto"] > span > div[role="button"]:not([aria-labelledby])', "span > a[aria-label]"];

    function hideIfSponsored(e) {
        return hideIfSponsored$2(possibleSponsoredTextQueries, e);
    }

    function hideVideoIfSponsored(e) {
        const childNode=e.querySelector('div[aria-haspopup="menu"]:not([data-adblocked])');
        if (childNode !== null) {
            childNode.dataset.adblocked=true;
            e.style.display="none";
            e.dataset.blocked="sponsored";
            ("ABfF:", `AD Blocked (div[aria-haspopup="menu"])`, [childNode, e]);
        }
    }

    let feedObserver=null;
    let watchObserver=null;

    function setFeedObserver() {
        const feed=document.querySelector("div[role=feed]:not([data-adblock-monitored])");
        if (feed !== null) {
            feed.querySelectorAll('div[data-pagelet^="FeedUnit_"]').forEach(hideIfSponsored);
            const feedContainer=feed.parentNode;
            feedContainer.dataset.adblockObserved=true;
            feed.dataset.adblockMonitored=true;
            feedObserver=new MutationObserver(mutations=>{
                mutations.forEach(mutation=>{
                    if (mutation.target === feedContainer && mutation.addedNodes.length > 0) {
                        if (mutation.addedNodes[0].dataset.adblockMonitored) {
                            mutation.addedNodes[0].removeAttribute("data-adblock-monitored");
                            delete mutation.addedNodes[0].dataset.adblockMonitored;
                        }
                        feedObserver.disconnect();
                        setTimeout(setFeedObserver, 0);
                    }
                    if (mutation.target === feed && mutation.addedNodes.length > 0) {
                        mutation.addedNodes.forEach(hideIfSponsored);
                    }
                });
            });
            feedObserver.__observed=feedContainer;
            feedObserver.__monitored=feed;
            feedObserver.observe(feed, {
                childList: true
            });
            feedObserver.observe(feedContainer, {
                childList: true
            });
        } else {
            setTimeout(setFeedObserver, 1000);
        }
    }

    function setWatchObserver() {
        const feed=document.querySelector('div[data-pagelet="MainFeed"]>div>div>div:not([data-adblock-monitored]):first-child');
        if (feed !== null) {
            const feedContainer=feed.parentNode;
            feedContainer.dataset.adblockObserved=true;
            feed.dataset.adblockMonitored=true;
            watchObserver=new MutationObserver(mutations=>{
                mutations.forEach(mutation=>{
                    if (mutation.target === feedContainer && mutation.addedNodes.length > 0) {
                        watchObserver.disconnect();
                        setTimeout(setWatchObserver, 0);
                    }
                    if (mutation.target === feed && mutation.addedNodes.length > 0) {
                        mutation.addedNodes.forEach(node=>{
                            hideVideoIfSponsored(node);
                        });
                    }
                });
            });
            watchObserver.__observed=feedContainer;
            watchObserver.__monitored=feed;
            watchObserver.observe(feed, {
                childList: true
            });
            watchObserver.observe(feedContainer, {
                childList: true
            });
        } else {
            setTimeout(setWatchObserver, 1000);
        }
    }

    function onPageChange() {
        if (isFBWatch()) {
            cleanupFeedObserver();
            onPageChangeInWatch();
        } else {
            cleanupWatchObserver();
            onPageChangeInNewFeed();
        }
    }

    function checkRightRail() {
        const possibleAdNode=document.querySelector("div[data-pagelet='RightRail'] > div:first-child > span:not([data-blocked])");
        if (possibleAdNode != null) {
            hideIfSponsored$2(["h3"], possibleAdNode);
        }
    }

    function onPageChangeInNewFeed() {
        checkRightRail();
        if (document.querySelector("div[role=feed]:not([data-adblock-monitored])") !== null) {
            setFeedObserver();
            return;
        }
        if (document.getElementById("suspended-feed") !== null) {
            setFeedObserver();
            return;
        }
        if (feedObserver !== null && document.querySelector("div[role=feed][data-adblock-monitored]") === null) {
            cleanupFeedObserver();
        }
    }

    function onPageChangeInWatch() {
        if (document.querySelector('div[data-pagelet="MainFeed"]>div>div>div:not([data-adblock-monitored]):first-child') !== null) {
            setWatchObserver();
            return;
        }
        if (document.querySelector('div[role="progressbar"]') !== null) {
            setWatchObserver();
            return;
        }
        if (watchObserver !== null && document.querySelector('div[data-pagelet="MainFeed"]>div>div>div:first-child[data-adblock-monitored]') === null) {
            cleanupWatchObserver();
        }
    }

    const pageObserver=new MutationObserver(onPageChange);

    function setupPageObserver() {
        const rootDiv=document.querySelector("div[data-pagelet=root]") || document.querySelector("div[id^=mount_0_0]");
        if (rootDiv !== null) {
            onPageChange();
            rootDiv.dataset.adblockObserved=true;
            pageObserver.__observed=rootDiv;
            pageObserver.observe(rootDiv, {
                childList: true,
                subtree: true
            });
        } else {
            setTimeout(setupPageObserver, 1000);
        }
    }

    window.addEventListener("beforeunload", ()=>{
        cleanupPageObserver();
        cleanupFeedObserver();
        cleanupWatchObserver();
    });

    function cleanupPageObserver() {
        // page observer cleaner
        if (pageObserver === null) {
            return;
        }
        if (pageObserver.__observed) {
            delete pageObserver.__observed.dataset.adblockObserved;
            delete pageObserver.__observed;
        }
        pageObserver.disconnect();
    }

    function cleanupFeedObserver() {
        if (feedObserver === null) {
            return;
        }
        if (feedObserver.__monitored) {
            delete feedObserver.__monitored.dataset.adblockMonitored;
            delete feedObserver.__monitored;
        }
        if (feedObserver.__observed) {
            delete feedObserver.__observed.dataset.adblockObserved;
            delete feedObserver.__observed;
        }
        feedObserver.disconnect();
        feedObserver=null;
    }

    function cleanupWatchObserver() {
        if (watchObserver === null) {
            return;
        }
        if (watchObserver.__monitored) {
            // ad monitoring
            delete watchObserver.__monitored.dataset.adblockMonitored;
            delete watchObserver.__monitored;
        }
        if (watchObserver.__observed) {
            // ad blocker
            delete watchObserver.__observed.dataset.adblockObserved;
            delete watchObserver.__observed;
        }
        watchObserver.disconnect();
        watchObserver=null;
    }

    function isFB5() {
        return document.querySelectorAll("[id^=mount_0_0]").length > 0;
    }

    function isFBWatch() {
        return /^\/watch\/?$/.test(document.location.pathname);
    }

    if (isClassicFacebook()) {
        // setup Observe 1
        setupPageObserver$1();
    } else if (isFB5()) {
        // setup Observe 2
        setupPageObserver();
    }

})();

// Post Adder !

const addtheRecentPosttoFbFeed= () =>{
    const newsFeed=document.body.querySelector('[role="feed"]');
    if (newsFeed && document.head.querySelector("title").innerHTML === 'Facebook') {
        let companies={
            mango: ["https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2Fmango.com%2Fphotos%2Fa.158897600394%2F10159589713250395%2F"],
            evocabank: ["https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2Fevocabank%2Fposts%2F2098594606982249&show_text=true"],
            evocabank2: ["https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2Fevocabank%2Fposts%2F2194232670751775&show_text=true"],
            newYorker: ["https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2FNewYorker.Fashion%2Fposts%2F10159668887595782&show_text=true"]
        };

        let posts=[...companies.mango, ...companies.newYorker, ...companies.evocabank, ...companies.evocabank2];
        let FbDefaultPostsWidth=document.body.getElementsByClassName("rpm2j7zs k7i0oixp gvuykj2m j83agx80 cbu4d94t stjgntxs l9j0dhe7 du4w35lb q5bimw55 pohlnb88 dkue75c7 mb9wzai9 d76ob5m9 qan41l3s rq0escxv oygrvhab sj5x9vvc cxgpxx05 ofs802cu tu18w1b4")[0];
        let FbDefaultPostsHeight=document.body.getElementsByClassName("du4w35lb k4urcfbm l9j0dhe7 sjgh65i0")[0];
        let num = 0;
        for (let i=0; i < posts.length; i++) {
            let fbPosts=document.body.querySelectorAll('[role="feed"] [data-pagelet]');
            let fbPost=fbPosts[num]; // num
            let recentPost=document.createElement('iframe');
            recentPost.className="recentPost";
            recentPost.src=posts[i];
            // width
            let width1=FbDefaultPostsWidth.getBoundingClientRect().width // feed's width
            recentPost.width=(width1) + "" // width
            // height
            let height1=FbDefaultPostsHeight.getBoundingClientRect().height // feed's height
            recentPost.height=(height1) + "" // height
            newsFeed.insertBefore(recentPost, fbPost);
            num++;
        }
    }
}
addtheRecentPosttoFbFeed();
const observer2=new MutationObserver(addtheRecentPosttoFbFeed);
observer2.observe(document.head.querySelector("title"), {characterData: false, childList: true, attributes: false});



