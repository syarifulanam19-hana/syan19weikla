(function () {
  "use strict";

  // Anti double-run (kalau script kepasang 2x)
  if (window.__REMOTE_AFF_ADS_LOADED__) return;
  window.__REMOTE_AFF_ADS_LOADED__ = true;

  var ONLY_ON_POST_PAGE = true;

  // Mid: sisip setelah blok ke-4 (bisa kamu ubah)
  var MID_AFTER_BLOCK = 4;

  var ADS_DEFAULT = [
    { href: "https://www.facebook.com/", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSt_pMl0xmpprd-lpycGIcf8QS1qW3q56nWzQ&s", alt: "Recommended" },
    { href: "https://www.google.com/", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSt_pMl0xmpprd-lpycGIcf8QS1qW3q56nWzQ&s", alt: "Try this" }
  ];

  function isPostPage() {
    return /\/\d{4}\/\d{2}\//.test(location.pathname) || /\.html$/.test(location.pathname);
  }

  function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function createAdEl(ad, label) {
    var wrap = document.createElement("div");
    wrap.className = "remote-aff-ad remote-aff-ad-" + label;

    // IMPORTANT: clear:both + position:relative mencegah banner “naik” gara-gara float
    wrap.style.cssText =
      "display:block;clear:both;position:relative;" +
      "text-align:center;margin:16px 0;padding:12px;border:1px solid #eee;border-radius:12px;background:#fff;";

    wrap.innerHTML =
      '<a href="' + ad.href + '" target="_blank" rel="nofollow noopener sponsored">' +
        '<img src="' + ad.img + '" alt="' + (ad.alt || "Ad") + '" style="max-width:100%;height:auto;border-radius:10px;display:inline-block;" />' +
      "</a>";

    return wrap;
  }

  function findPostBody() {
    // Lebih “kebal” untuk mobile Blogger
    return (
      document.querySelector('[itemprop="articleBody"]') ||
      document.querySelector(".post-body") ||
      document.querySelector(".postBody") ||
      document.querySelector(".entry-content") ||
      document.querySelector(".post-content") ||
      document.querySelector("article") ||
      null
    );
  }

  function getContentBlocks(postBody) {
    var blocks = postBody.querySelectorAll("p, h1, h2, h3, h4, h5, h6, img, ul, ol, blockquote, div");
    var out = [];
    for (var i = 0; i < blocks.length; i++) {
      var el = blocks[i];
      var text = (el.textContent || "").trim();
      if (el.tagName === "IMG" || text.length > 20) out.push(el);
    }
    return out;
  }

  function alreadyInserted() {
    return document.querySelectorAll(".remote-aff-ad").length > 0;
  }

  function run() {
    if (ONLY_ON_POST_PAGE && !isPostPage()) return;

    var postBody = findPostBody();
    if (!postBody) return;

    // kalau sudah ada banner, jangan inject lagi
    if (alreadyInserted()) return;

    // TOP
    postBody.insertAdjacentElement("afterbegin", createAdEl(pickRandom(ADS_DEFAULT), "top"));

    // MID
    var blocks = getContentBlocks(postBody);
    if (blocks.length >= MID_AFTER_BLOCK) {
      blocks[MID_AFTER_BLOCK - 1].insertAdjacentElement("afterend", createAdEl(pickRandom(ADS_DEFAULT), "mid"));
    }

    // BOTTOM (benar-benar di akhir konten)
    postBody.insertAdjacentElement("beforeend", createAdEl(pickRandom(ADS_DEFAULT), "bottom"));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
