import {blockList, sponsores} from "./other";

let list=[...sponsores, ...blockList];

let blocker=()=>{
    document.querySelectorAll('[role="feed"] [data-pagelet]').forEach(element=>{
        for (let i=0; i < list.length; i++) {
            let spelement=element.querySelector(`[aria-label="${list[i]}"]`)
            if (spelement !== null) element.style.display='none'
        }
    })
};

let RemoveFromFeed=()=>{
    let d=document,
        postFeed=d.querySelector('[role="feed"]'),
        postFeedObserver=new MutationObserver(
            mutations=>mutations && blocker()
        )

    postFeed &&
    postFeedObserver.observe(postFeed, {
        childList: true,
        subtree: true
    })
};

setInterval(function () {
    blocker();
    RemoveFromFeed()
}, 1000000);