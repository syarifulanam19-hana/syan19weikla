(function () {
  "use strict";

  // Anti double-run
  if (window.__REMOTE_AFF_ADS_LOADED__) return;
  window.__REMOTE_AFF_ADS_LOADED__ = true;

  var ONLY_ON_POST_PAGE = true;
  var MID_AFTER_BLOCK = 4; // ubah jadi 2/3 kalau artikel pendek

  // ====== ADS ======
  var ADS = {
    banner_top: {
      type: "banner",
      href: "https://www.facebook.com/",
      img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSt_pMl0xmpprd-lpycGIcf8QS1qW3q56nWzQ&s",
      alt: "Top Banner"
    },

    // MID: Adsterra invoke + container (pakai DOM append, bukan innerHTML script)
    adsterra_mid: {
      type: "adsterra_invoke",
      scriptSrc: "https://corruptioneasiestsubmarine.com/204f53d3bc77e4e62a73b051eadb8aa3/invoke.js",
      containerId: "container-204f53d3bc77e4e62a73b051eadb8aa3"
    },

    banner_bottom: {
      type: "banner",
      href: "https://www.google.com/",
      img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSt_pMl0xmpprd-lpycGIcf8QS1qW3q56nWzQ&s",
      alt: "Bottom Banner"
    }
  };

  var PLACEMENT = {
    top: "banner_top",
    mid: "adsterra_mid",
    bottom: "banner_bottom"
  };

  function isPostPage() {
    return /\/\d{4}\/\d{2}\//.test(location.pathname) || /\.html$/.test(location.pathname);
  }

  function findPostBody() {
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
    var blocks = postBody.querySelectorAll(
      "p, h1, h2, h3, h4, h5, h6, img, ul, ol, blockquote, div"
    );
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

  function baseWrap(label) {
    var wrap = document.createElement("div");
    wrap.className = "remote-aff-ad remote-aff-ad-" + label;
    wrap.style.cssText =
      "display:block;clear:both;position:relative;" +
      "margin:16px 0;text-align:center;";
    return wrap;
  }

  function createBannerEl(ad, label) {
    var wrap = baseWrap(label);
    wrap.innerHTML =
      '<a href="' + ad.href + '" target="_blank" rel="nofollow noopener sponsored">' +
        '<img src="' + ad.img + '" alt="' + (ad.alt || "Ad") + '" ' +
        'style="max-width:100%;height:auto;border-radius:10px;display:inline-block;" />' +
      "</a>";
    return wrap;
  }

  function createAdsterraInvokeEl(ad, label) {
    var wrap = baseWrap(label);

    // 1) pastikan container ada (dan unik)
    var existing = document.getElementById(ad.containerId);
    if (existing) {
      // kalau sudah ada dari load sebelumnya, jangan duplikasi
      return null;
    }

    var container = document.createElement("div");
    container.id = ad.containerId;
    wrap.appendChild(container);

    // 2) buat SCRIPT via DOM supaya dieksekusi
    var s = document.createElement("script");
    s.async = true;
    s.setAttribute("data-cfasync", "false");
    s.src = ad.scriptSrc;

    // Optional: simple debug kalau gagal load
    // s.onerror = function(){ console.log("Adsterra script failed:", ad.scriptSrc); };

    wrap.appendChild(s);

    return wrap;
  }

  function createAdEl(ad, label) {
    if (!ad) return null;

    if (ad.type === "banner") return createBannerEl(ad, label);

    if (ad.type === "adsterra_invoke") return createAdsterraInvokeEl(ad, label);

    return null;
  }

  function insertEl(whereEl, position, el) {
    if (!el) return;
    whereEl.insertAdjacentElement(position, el);
  }

  // Blogger kadang render konten telat -> retry beberapa kali
  function runWithRetry(maxTry, delayMs) {
    var tryCount = 0;

    function attempt() {
      tryCount++;

      if (ONLY_ON_POST_PAGE && !isPostPage()) return;

      var postBody = findPostBody();
      if (!postBody) {
        if (tryCount < maxTry) return setTimeout(attempt, delayMs);
        return;
      }

      if (alreadyInserted()) return;

      // TOP
      var topAd = ADS[PLACEMENT.top];
      insertEl(postBody, "afterbegin", createAdEl(topAd, "top"));

      // MID
      var blocks = getContentBlocks(postBody);
      var midAd = ADS[PLACEMENT.mid];
      if (midAd && blocks.length >= MID_AFTER_BLOCK) {
        insertEl(blocks[MID_AFTER_BLOCK - 1], "afterend", createAdEl(midAd, "mid"));
      }

      // BOTTOM
      var bottomAd = ADS[PLACEMENT.bottom];
      insertEl(postBody, "beforeend", createAdEl(bottomAd, "bottom"));
    }

    attempt();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      runWithRetry(10, 500);
    });
  } else {
    runWithRetry(10, 500);
  }
})();
