(function () {
  "use strict";

  // ===== Anti double-run =====
  if (window.__REMOTE_AFF_ADS_LOADED__) return;
  window.__REMOTE_AFF_ADS_LOADED__ = true;

  var ONLY_ON_POST_PAGE = true;
  var MID_AFTER_BLOCK = 4; // turunkan ke 2/3 kalau artikel pendek

  // ===== ADS CONFIG =====
  var ADS = {

    // ===== TOP : Adsterra iframe 468x60 =====
    adsterra_top: {
      type: "adsterra_iframe",
      options: {
        key: "68ff788002d0ee493e40896f8d81d78b",
        format: "iframe",
        height: 60,
        width: 468,
        params: {}
      },
      scriptSrc: "https://corruptioneasiestsubmarine.com/68ff788002d0ee493e40896f8d81d78b/invoke.js"
    },

    // ===== MID : Adsterra invoke + container =====
    adsterra_mid: {
      type: "adsterra_invoke",
      scriptSrc: "https://corruptioneasiestsubmarine.com/204f53d3bc77e4e62a73b051eadb8aa3/invoke.js",
      containerId: "container-204f53d3bc77e4e62a73b051eadb8aa3"
    },

    // ===== BOTTOM : Banner biasa =====
    banner_bottom: {
      type: "banner",
      href: "https://www.google.com/",
      img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSt_pMl0xmpprd-lpycGIcf8QS1qW3q56nWzQ&s",
      alt: "Bottom Banner"
    }
  };

  var PLACEMENT = {
    top: "adsterra_top",
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
      document.querySelector(".entry-content") ||
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

  // ===== CREATE ADS =====

  function createBannerEl(ad, label) {
    var wrap = baseWrap(label);
    wrap.innerHTML =
      '<a href="' + ad.href + '" target="_blank" rel="nofollow noopener sponsored">' +
      '<img src="' + ad.img + '" alt="' + (ad.alt || "Ad") + '" style="max-width:100%;height:auto;border-radius:10px;" />' +
      "</a>";
    return wrap;
  }

  function createAdsterraIframeEl(ad, label) {
    var wrap = baseWrap(label);

    // atOptions harus global
    window.atOptions = ad.options;

    var s = document.createElement("script");
    s.async = true;
    s.src = ad.scriptSrc;

    wrap.appendChild(s);
    return wrap;
  }

  function createAdsterraInvokeEl(ad, label) {
    var wrap = baseWrap(label);

    if (document.getElementById(ad.containerId)) return null;

    var container = document.createElement("div");
    container.id = ad.containerId;
    wrap.appendChild(container);

    var s = document.createElement("script");
    s.async = true;
    s.setAttribute("data-cfasync", "false");
    s.src = ad.scriptSrc;

    wrap.appendChild(s);
    return wrap;
  }

  function createAdEl(ad, label) {
    if (!ad) return null;
    if (ad.type === "banner") return createBannerEl(ad, label);
    if (ad.type === "adsterra_iframe") return createAdsterraIframeEl(ad, label);
    if (ad.type === "adsterra_invoke") return createAdsterraInvokeEl(ad, label);
    return null;
  }

  function insertEl(where, pos, el) {
    if (el) where.insertAdjacentElement(pos, el);
  }

  function run() {
    if (ONLY_ON_POST_PAGE && !isPostPage()) return;

    var postBody = findPostBody();
    if (!postBody) return;
    if (alreadyInserted()) return;

    // TOP
    insertEl(postBody, "afterbegin", createAdEl(ADS[PLACEMENT.top], "top"));

    // MID
    var blocks = getContentBlocks(postBody);
    if (blocks.length >= MID_AFTER_BLOCK) {
      insertEl(
        blocks[MID_AFTER_BLOCK - 1],
        "afterend",
        createAdEl(ADS[PLACEMENT.mid], "mid")
      );
    }

    // BOTTOM
    insertEl(postBody, "beforeend", createAdEl(ADS[PLACEMENT.bottom], "bottom"));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
