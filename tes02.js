(function () {
  "use strict";

  // Anti double-run (kalau script kepasang 2x)
  if (window.__REMOTE_AFF_ADS_LOADED__) return;
  window.__REMOTE_AFF_ADS_LOADED__ = true;

  var ONLY_ON_POST_PAGE = true;

  // MID: sisip setelah blok ke-4 (bisa kamu ubah)
  var MID_AFTER_BLOCK = 4;

  // === 1) DAFTAR IKLAN (KASIH ID BIAR MUDAH DIPILIH) ===
  var ADS = {
    ad_offer1: {
      type: "script",
      html: '<script src="https://corruptioneasiestsubmarine.com/a4/8c/72/a48c72bcd2d5372cabfdefdc7b4c2650.js"></script>'
    },

    ad_offer2: {
      type: "script",
      html:
        '<script async="async" data-cfasync="false" src="https://corruptioneasiestsubmarine.com/204f53d3bc77e4e62a73b051eadb8aa3/invoke.js"></script>' +
        '<div id="container-204f53d3bc77e4e62a73b051eadb8aa3"></div>'
    },

    ad_offer3: {
      href: "https://www.google.com/",
      img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSt_pMl0xmpprd-lpycGIcf8QS1qW3q56nWzQ&s",
      alt: "Google"
    }
  };

// ===== 2) PILIH IKLAN PER POSISI =====
  var PLACEMENT = {
    top: "ad_offer1",
    mid: "ad_offer2",
    bottom: "ad_offer3"
  };

  function isPostPage() {
    return /\/\d{4}\/\d{2}\//.test(location.pathname) || /\.html$/.test(location.pathname);
  }

  function createAdEl(ad, label) {
    var wrap = document.createElement("div");
    wrap.className = "remote-aff-ad remote-aff-ad-" + label;

    // clear:both + position:relative mencegah banner “naik” gara-gara float
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
    // Titik sisip fleksibel (p/heading/img/list/dll)
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

  function getAdByPlacement(key) {
    var adId = PLACEMENT[key];
    var ad = ADS[adId];
    return ad || null;
  }

  function run() {
    if (ONLY_ON_POST_PAGE && !isPostPage()) return;

    var postBody = findPostBody();
    if (!postBody) return;

    // kalau sudah ada banner, jangan inject lagi
    if (alreadyInserted()) return;

    // === TOP ===
    var topAd = getAdByPlacement("top");
    if (topAd) {
      postBody.insertAdjacentElement("afterbegin", createAdEl(topAd, "top"));
    }

    // === MID ===
    var blocks = getContentBlocks(postBody);
    var midAd = getAdByPlacement("mid");
    if (midAd && blocks.length >= MID_AFTER_BLOCK) {
      blocks[MID_AFTER_BLOCK - 1].insertAdjacentElement("afterend", createAdEl(midAd, "mid"));
    }

    // === BOTTOM ===
    var bottomAd = getAdByPlacement("bottom");
    if (bottomAd) {
      postBody.insertAdjacentElement("beforeend", createAdEl(bottomAd, "bottom"));
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
