// ==UserScript==
// @name         Farm Rpg Extension
// @namespace    http://tampermonkey.net/
// @version      0.1.1
// @description  Adds some helper functionality to farm rpg
// @author       Michiocre
// @match        https://farmrpg.com/index.php
// @icon         https://www.google.com/s2/favicons?sz=64&domain=farmrpg.com
// @grant        none
// ==/UserScript==

(function(open) {
    XMLHttpRequest.prototype.open = function() {
        this.addEventListener("readystatechange", function() {
            if (this.readyState == 4) {
                if (this.responseURL.includes('getstats')) {
                    updateQuickCraft();
                }
            }
        }, false);
        open.apply(this, arguments);
    };
})(XMLHttpRequest.prototype.open);

let inventory = [];
let crafting = [];
let invSize = 0;

function ws_numberWithCommas(x)
{
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


async function updateInventory() {
    let request = await fetch(`https://farmrpg.com/inventory.php`, {
        "credentials": "include",
        "headers": {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0",
            "Accept": "*/*",
            "Accept-Language": "en-US,en;q=0.5",
            "X-Requested-With": "XMLHttpRequest",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin"
        },
        "referrer": "https://farmrpg.com/index.php",
        "method": "GET",
        "mode": "cors"
    });

    const invSizeExp = /Currently, you cannot have more than <strong>(\d+)<\/strong> of any/gm;
    const itemsExp = /<li class="gr[\s\S]+?"item\.php\?id=(\d+)"[\s\S]+?img src="([^"]+)[\s\S]+?<strong>([^<]+)[\s\S]+?item-after"[^>]+?>(\d+)[\s\S]+?<\/li>/gm;
    let inventoryPhp = await request.text();
    let results = [...inventoryPhp.matchAll(invSizeExp)]
    let invSize = parseInt(results[0][1]);

    inventory = [];
    results = [...inventoryPhp.matchAll(itemsExp)]
    for (let result of results) {
        inventory.push({
            html: result[0],
            id: result[1],
            image: result[2],
            name: result[3],
            amount: result[4],
        });
    }
}

async function updateCrafting() {
    let request = await fetch("https://farmrpg.com/workshop.php", {
        "credentials": "include",
        "headers": {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0",
            "Accept": "*/*",
            "Accept-Language": "en-US,en;q=0.5",
            "X-Requested-With": "XMLHttpRequest",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "Pragma": "no-cache",
            "Cache-Control": "no-cache"
        },
        "referrer": "https://farmrpg.com/index.php",
        "method": "GET",
        "mode": "cors"
    });

    const craftsExp = /<li [\s\S]+?data-id="(\d+)" data-name="([^"]+)"[\s\S]+?<\/li>/gm;
    let workshopPhp = await request.text();

    let results = [...workshopPhp.matchAll(craftsExp)];
    crafting = [];
    for (let result of results) {
        crafting.push({
            html: result[0],
            id: result[1],
            name: result[2],
        });
    }
}

function linkQttyButtons() {
    $('.qty').on(
        'change',
        function () {
            var qty = $(this).val();
            var price = $(this).data('price');
            var id = $(this).data('id');

            if (qty > 0) {
                var newamt = qty * price;
                $('.craft' + id).html(ws_numberWithCommas(newamt));

                $('.res' + id).each(
                    function ( index ) {
                        var amt = $(this).data('amt');
                        newamt = qty * amt;
                        $(this).html(ws_numberWithCommas(newamt));
                    }
                );
            }
        }
    );

    $('.mqty').click(
        function () {
            var id = $(this).data('id');
            var qty = parseInt($('.qty' + id).val());
            qty = qty - 1;
            if (qty < 1) {
                qty = 1;
            }
            $('.qty' + id).val(qty);
            $('.qty' + id).trigger("change");
        }
    );

    $('.pqty').click(
        function () {
            var id = $(this).data('id');
            var max = $(this).data('max');
            var qty = parseInt($('.qty' + id).val());
            qty = qty + 1;
            if (qty < 1) {
                qty = 1;
            }
            if (qty <= max) {
                $('.qty' + id).val(qty);
                $('.qty' + id).trigger("change");
            }
        }
    );

    $('.maxqty').click(
        function () {
            var id = $(this).data('id');
            var max = $(this).data('max');
            var qty = parseInt(max);
            if (qty <= max) {
                $('.qty' + id).val(qty);
            }
        }
    );
}

function createElementFromHTML(htmlString) {
    var div = document.createElement('div');
    div.innerHTML = htmlString.trim();

    // Change this to div.childNodes to support multiple top-level nodes.
    return div.firstChild;
}

let characterLinkMap = {
    "Rosalie": "mailbox.php?id=22438",
    "Holger": "mailbox.php?id=22439",
    "Beatrix": "mailbox.php?id=22440",
    "Thomas": "mailbox.php?id=22441",
    "Cecil": "mailbox.php?id=22442",
    "George": "mailbox.php?id=22443",
    "Jill": "mailbox.php?id=22444",
    "Vincent": "mailbox.php?id=22445",
    "Lorn": "mailbox.php?id=22446",
    "Buddy": "mailbox.php?id=22447",
    "Borgen": "mailbox.php?id=53900",
    "Ric Ryph": "mailbox.php?id=59421",
    "Mummy": "mailbox.php?id=70604",
    "Star Meerif": "mailbox.php?id=46158",
    "Charles Horsington III": "mailbox.php?id=71760",
    "ROOMBA": "mailbox.php?id=71761",
    "Cpt Thomas": "mailbox.php?id=71805",
    "frank": "mailbox.php?id=84518",
    "Mariya": "mailbox.php?id=178572",
    "Geist": "mailbox.php?id=118065",
    "Gary Bearson V": "mailbox.php?id=38"
}

let smileyMap = {
    'loves': '/img/items/s_love.png',
    'likes': '/img/items/s_like.png',
    'hates': '/img/items/s_hate.png'
}


async function handleItem(page) {
    let itemName = page.navbarInnerContainer.getElementsByClassName('sharelink')[0].innerText;
    let container = page.container.getElementsByClassName('content-block')[0];

    if (page.container.getElementsByClassName('relationsList').length > 0) {
        return;
    }

    let newItemName = itemName.toLowerCase().replace(' ', '-');

    const itemAmountExp = /(\d+ on hand)/gm;
    let results = [...page.container.innerHTML.matchAll(itemAmountExp)]
    let itemAmount = parseInt(results[0][1]);

    let response = await fetch(`https://buddy.farm/page-data/i/${newItemName}/page-data.json`, {
        "method": "GET",
    });

    let data = await response.json();

    let innerData = '';
    let relations = data.result.data.farmrpg.items[0].npcItems;
    relations = relations.filter(a => a.relationship != 'hates');
    if (relations.length > 0) {
        relations.sort((a, b) => {
            if (b.relationship == 'hates') {
                return -1;
            }
            if (a.relationship > b.relationship) {
                return -1;
            }
            if (a.relationship < b.relationship) {
                return 1;
            }
            return 0;
        });
        for (let relation of relations) {
            if (!characterLinkMap[relation.npc.name]) {
                console.warn("This relation does not exist: ", relation);
                continue;
            }
            let mailboxId = characterLinkMap[relation.npc.name].split('=')[1];
            innerData += `
                    <li class="close-panel">
                      <div class="item-content">
                        <div class="item-media"><a href="${characterLinkMap[relation.npc.name]}"><img src="${relation.npc.image}" class="itemimg"></a></div>
                        <div class="item-inner">
                          <div class="item-title">${relation.npc.name}  <img src="${smileyMap[relation.relationship]}" style="width:19px;height:19px;vertical-align:text-top">
                            <br><span style="font-size: 11px">You have ${itemAmount} and can send up to <span ${itemAmount==0?'style="color:red"':''}>${itemAmount}</span></span>
                            <br>
                            <button class="mqty" data-id="${mailboxId}">-</button>
                            <input type="number" class="qty qty${mailboxId}" style="font-size:13px;width:60px !important;" value="0" min="1" data-id="${mailboxId}" data-max="${itemAmount}" pattern="\d*">
                            <button class="pqty" data-max="${itemAmount}" data-id="${mailboxId}">+</button>
                            <button class="maxqty" data-max="${itemAmount}" data-id="${mailboxId}">+MAX</button>
                          </div>
                          <div class="item-after"><button class="button givebtnnc" data-to="${mailboxId}" data-id="${mailboxId}" data-name="${itemName}">Give</button></div>
                        </div>
                      </div>
                    </li>`
        }

        let insertionContainer = createElementFromHTML(`
          <div class="card relationsList">
            <div class="card-content">
              <div class="card-content-inner">
                <div class="list-block">
                  <ul>
                    ${innerData}
                  </ul>
                </div>
              </div>
            </div>
          </div>`);

        let beforeThis = container.getElementsByClassName('content-block-title')[1];
        if (!beforeThis) {
            beforeThis = container.getElementsByTagName('p')[0];
        }

        container.insertBefore(createElementFromHTML('<div class="content-block-title">Friendship Values</div>'), beforeThis);
        container.insertBefore(insertionContainer, beforeThis);

        linkQttyButtons();

        $(".givebtnnc").one(
            'click',
            function () {

                let method = "givemailitem";
                let id = $(this).data("id");
                let to = $(this).data("to");
                let name = $(this).data("name");
                var thisbutton = $(this);

                var qty = parseInt($('.qty' + id).val());
                var qty_max = parseInt($('.qty' + id).data('max'));

                if (qty <= qty_max && qty > 0) {
                    $(thisbutton).html("Success!");
                    $(thisbutton).addClass("btnyellow");

                    $.ajax(
                        {
                            url: "worker.php?go=" + method + "&id=" + page.query.id + "&to=" + to + "&qty=" + qty,
                            method: "POST"
                        }
                    )
                        .done(
                        function (data) {
                            myApp.hideIndicator();
                            //console.log('success', data);

                            switch (data) {
                                case "success":

                                    currentScroll = $$(mainView.activePage.container).find('.page-content').scrollTop();
                                    mainView.router.refreshPage();

                                    break;
                                case "full":

                                    myApp.alert(
                                        "Mailbox can't hold that many!",
                                        'Sorry!',
                                        function () {
                                            // save current scroll before page refresh
                                            currentScroll = $$(mainView.activePage.container).find('.page-content').scrollTop();

                                            // refreshes both this page and prev page
                                            mainView.router.refreshPage();
                                        }
                                    );

                                    break;
                            }

                        }
                    );
                }
            }
        );
    }
}

let areaId;

let fastCraftingList = {
    7: [21, 23, 36, 167, 193, 194, 75, 110],
    1: [21, 95, 75],
    2: [21, 95, 75, 81],
    3: [21, 95, 81, 203, 73, 537],
    5: [203, 350, 94, 75, 193, 787],
    6: [104, 368, 305],
    8: [95, 143, 77, 78, 117, 104, 368, 145],
    9: [95, 117, 368, 594],
    10: [379, 492, 456, 393, 305, 317, 536, 897]
};

async function updateQuickCraft() {
    if (!areaId) {
        return;
    }
    //console.log('Refreshing QuickCraft');
    let innerContainer = document.getElementById('craftingCardInner');
    let innerHtml = '';

    await updateCrafting();
    for (let id of fastCraftingList[areaId]) {
        let item = crafting.find(el => el.id == id);
        if (item) {
            item.html = item.html.replace('from=workshop', 'from=area')
            innerHtml += item.html;
        }
    }

    innerContainer.innerHTML = `
        <div class="card" id="craftingCardInner">
            <div class="card-content">
                <div class="list-block list-block-search searchbar-found favcraftitems sortable">
                    <ul>${innerHtml}</ul>
                </div>
            </div>
        </div>`;

    linkQttyButtons();

    $(".craftbtnnc").on(
        'click',
        function () {

            let method = "craftitem";

            var id = $(this).data('id');
            var name = $(this).data('name');
            var qty = parseInt($('.qty' + id).val());
            var qty_max = parseInt($('.qty' + id).data('max'));
            var rfresh;
            let cbtn = "craftbtn" + id;

            if (id > 0 && qty > 0 && qty <= qty_max) {
                $.ajax(
                    {
                        url: "worker.php?go=" + method + "&id=" + id + "&qty=" + qty,
                        method: "POST",
                        beforeSend: function () {
                            $("." + cbtn).html("Success!");
                            $("." + cbtn).addClass("btnyellow");
                            $("." + cbtn).attr("disabled",true);
                            myApp.showIndicator();
                        }
                    }
                )
                    .done(
                    function (data) {

                        switch (data) {
                            case "cannotafford":
                                myApp.alert("You can't afford that many!", 'Sorry!');
                                break;
                            case "success":

                                myApp.hideIndicator();
                                updateQuickCraft();

                                break;
                        }

                    }
                );
            }
        }
    );
}

async function handleArea(page) {

    areaId = page.query.id;
    let container = page.container.getElementsByClassName('content-block')[0];
    let cardHeader = createElementFromHTML(`<div class="content-block-title">Quick Crafting</div>`);
    container.appendChild(cardHeader);

    container.appendChild(createElementFromHTML(`<div class="card" id="craftingCardInner"></div>`));

    container.appendChild(createElementFromHTML(`<p>&nbsp;</p>`));
    container.appendChild(createElementFromHTML(`<p>&nbsp;</p>`));
    container.appendChild(createElementFromHTML(`<p>&nbsp;</p>`));
}

let autofishing = false;
let autofishingInt;
function handleFishing(page) {
        let buttonContainer = page.container.getElementsByClassName('buttons-row')[0];

        let newButton = createElementFromHTML(`<div class="button btnpurple disable-select" style="font-size:11px;line-height:20px;height:60px">
        <img src="/img/items/7783.png" style="width:14px;vertical-align:middle">
        <br>
        <strong>Fast fishing</strong>
        </div>`);
        newButton.onclick = () => page.container.getElementsByClassName('fishcaught')[0].click();
        buttonContainer.appendChild(newButton);

        newButton = createElementFromHTML(`<div class="button btnred disable-select" style="font-size:11px;line-height:20px;height:60px">
        <img src="/img/items/7783.png" style="width:14px;vertical-align:middle">
        <br>
        <strong>Auto fishing</strong>
        </div>`);
        newButton.onclick = (event) => {
            if (autofishing) {
                clearInterval(autofishingint);
                event.target.classList.remove('btngreen');
                event.target.classList.add('brnred');
                autofishing = false;
            } else {
                let baittype = document.getElementById('baitarea').innerText.split(':')[0];
                autofishingint = setInterval(
                    async function () {
                        if (baittype == 'Worms') {
                            let worms = parseInt(document.getElementById('baitarea').innerText.split(' ')[1]);

                            if (worms < 300) {
                                await fetch("https://farmrpg.com/worker.php?go=buyitem&id=18&qty=200", {
                                    "credentials": "include",
                                    "headers": {
                                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0",
                                        "Accept": "*/*",
                                        "Accept-Language": "en-US,en;q=0.5",
                                        "X-Requested-With": "XMLHttpRequest",
                                        "Sec-Fetch-Dest": "empty",
                                        "Sec-Fetch-Mode": "cors",
                                        "Sec-Fetch-Site": "same-origin"
                                    },
                                    "referrer": "https://farmrpg.com/index.php",
                                    "method": "POST",
                                    "mode": "cors"
                                });

                                page.container.getElementsByClassName('sellallfishbtnnc')[0].click();
                            }
                        }
                        page.container.getElementsByClassName('fishcaught')[0].click();
                    },
                    1000
                );

                event.target.classList.remove('brnred');
                event.target.classList.add('btngreen');
                autofishing = true;
            }
        };
        //buttonContainer.appendChild(newButton);
}

(function () {
    'use strict';
    myApp.onPageInit('item', handleItem);
    myApp.onPageInit('area', handleArea);
    myApp.onPageInit('fishing', handleFishing);
    //myApp.onPageAfterAnimation('item', () => console.log('onPageAfterAnimation'));
    //myApp.onPageAfterBack('item', () => console.log('onPageAfterBack'));
    //myApp.onPageBack('item', () => console.log('onPageBack'));
    //myApp.onPageBeforeAnimation('item', () => console.log('onPageBeforeAnimation'));
    //myApp.onPageBeforeInit('item', () => console.log('onPageBeforeInit'));
    //myApp.onPageBeforeRemove('item', () => console.log('onPageBeforeRemove'));
    //myApp.onPageInit('item', () => console.log('onPageInit'));
    //myApp.onPageReinit('item', () => console.log('onPageReinit'));
})();



