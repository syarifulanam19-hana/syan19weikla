(function () {
  "use strict";

  // ===== Anti double-run =====
  if (window.__REMOTE_AFF_ADS_LOADED__) return;
  window.__REMOTE_AFF_ADS_LOADED__ = true;

  var ONLY_ON_POST_PAGE = true;
  var MID_AFTER_BLOCK = 4; // turunkan ke 2/3 kalau artikel pendek

  // ===== Fallback settings =====
  // Berapa lama menunggu Adsterra render sebelum fallback aktif (ms)
  var ADSTERRA_FALLBACK_TIMEOUT = 3500;

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
      scriptSrc: "https://corruptioneasiestsubmarine.com/68ff788002d0ee493e40896f8d81d78b/invoke.js",
      // fallback kalau gagal load
      fallback: {
        type: "banner",
        href: "https://www.google.com/",
        img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSt_pMl0xmpprd-lpycGIcf8QS1qW3q56nWzQ&s",
        alt: "Fallback Top"
      }
    },

    // ===== MID : Adsterra invoke + container =====
    adsterra_mid: {
      type: "adsterra_invoke",
      scriptSrc: "https://corruptioneasiestsubmarine.com/204f53d3bc77e4e62a73b051eadb8aa3/invoke.js",
      containerId: "container-204f53d3bc77e4e62a73b051eadb8aa3",
      // fallback kalau gagal load
      fallback: {
        type: "banner",
        href: "https://www.google.com/",
        img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSt_pMl0xmpprd-lpycGIcf8QS1qW3q56nWzQ&s",
        alt: "Fallback Mid"
      }
    },

// ===== BOTTOM : Update Baru (Script Invoke) =====
    adsterra_bottom: {
      type: "adsterra_invoke",
      scriptSrc: "https://corruptioneasiestsubmarine.com/a4/8c/72/a48c72bcd2d5372cabfdefdc7b4c2650.js",
      containerId: "container-a48c72bcd2d5372cabfdefdc7b4c2650",
      fallback: {
        type: "banner",
        href: "https://www.google.com/",
        img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSt_pMl0xmpprd-lpycGIcf8QS1qW3q56nWzQ&s",
        alt: "Fallback Bottom"
      }
    }
  };

  // Pilih iklan per posisi
  var PLACEMENT = {
    top: "adsterra_top",
    mid: "adsterra_mid",
    bottom: "adsterra_bottom"
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
    // clear:both mencegah “naik” karena float
    wrap.style.cssText =
      "display:block;clear:both;position:relative;" +
      "margin:16px 0;text-align:center;";
    return wrap;
  }

  // ===== Fallback helpers =====
  function createBannerInnerHTML(ad) {
    return (
      '<a href="' + ad.href + '" target="_blank" rel="nofollow noopener sponsored">' +
        '<img src="' + ad.img + '" alt="' + (ad.alt || "Ad") + '" ' +
        'style="max-width:100%;height:auto;border-radius:10px;display:inline-block;" />' +
      "</a>"
    );
  }

  function applyFallback(wrap, fallbackAd) {
    if (!wrap || !fallbackAd) return;
    // jangan overwrite kalau sudah ada iframe / sudah render
    var hasIframe = wrap.querySelector("iframe");
    if (hasIframe) return;

    wrap.innerHTML = createBannerInnerHTML(fallbackAd);
  }

  // ===== Ad creators =====
  function createBannerEl(ad, label) {
    var wrap = baseWrap(label);
    wrap.innerHTML = createBannerInnerHTML(ad);
    return wrap;
  }

  // Adsterra iframe invoke:
  // - set window.atOptions tepat sebelum script dimasukkan
  // - load berurutan supaya atOptions tidak tabrakan
  // - fallback jika iframe tidak muncul dalam timeout
  function createAdsterraIframeEl(ad, label) {
    var wrap = baseWrap(label);

    // atOptions harus global & dibaca invoke.js saat eksekusi
    window.atOptions = ad.options;

    var s = document.createElement("script");
    // Penting: jangan async agar urutan eksekusi lebih stabil
    s.async = false;
    s.src = ad.scriptSrc;

    // Jika script gagal load (network/adblock), fallback
    s.onerror = function () {
      applyFallback(wrap, ad.fallback);
    };

    wrap.appendChild(s);

    // Timeout check: kalau tidak ada iframe setelah X ms -> fallback
    setTimeout(function () {
      var hasIframe = wrap.querySelector("iframe");
      if (!hasIframe) {
        applyFallback(wrap, ad.fallback);
      }
    }, ADSTERRA_FALLBACK_TIMEOUT);

    return wrap;
  }

  function createAdsterraInvokeEl(ad, label) {
    var wrap = baseWrap(label);

    // pastikan container unik
    if (document.getElementById(ad.containerId)) return null;

    var container = document.createElement("div");
    container.id = ad.containerId;
    wrap.appendChild(container);

    var s = document.createElement("script");
    s.async = true;
    s.setAttribute("data-cfasync", "false");
    s.src = ad.scriptSrc;

    s.onerror = function () {
      applyFallback(wrap, ad.fallback);
    };

    wrap.appendChild(s);

    // Timeout check: kalau container tetap kosong -> fallback
    setTimeout(function () {
      // kalau Adsterra render biasanya mengisi container/menambah iframe
      var hasIframe = wrap.querySelector("iframe");
      var hasContent = (container.innerHTML || "").trim().length > 0;
      if (!hasIframe && !hasContent) {
        applyFallback(wrap, ad.fallback);
      }
    }, ADSTERRA_FALLBACK_TIMEOUT);

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

  // Load berurutan (supaya atOptions top & bottom tidak tabrakan)
  function runSequential() {
    if (ONLY_ON_POST_PAGE && !isPostPage()) return;

    var postBody = findPostBody();
    if (!postBody) return;
    if (alreadyInserted()) return;

    // TOP
    var topAd = ADS[PLACEMENT.top];
    var topEl = createAdEl(topAd, "top");
    insertEl(postBody, "afterbegin", topEl);

    // MID
    var blocks = getContentBlocks(postBody);
    var midAd = ADS[PLACEMENT.mid];
    if (midAd && blocks.length >= MID_AFTER_BLOCK) {
      var midEl = createAdEl(midAd, "mid");
      insertEl(blocks[MID_AFTER_BLOCK - 1], "afterend", midEl);
    }

    // BOTTOM — kasih delay kecil agar top iframe invoke selesai baca atOptions dulu
    setTimeout(function () {
      var bottomAd = ADS[PLACEMENT.bottom];
      var bottomEl = createAdEl(bottomAd, "bottom");
      insertEl(postBody, "beforeend", bottomEl);
    }, 250);
  }

  // Blogger kadang render telat
  function runWithRetry(maxTry, delayMs) {
    var tries = 0;
    function attempt() {
      tries++;
      var postBody = findPostBody();
      if (!postBody) {
        if (tries < maxTry) return setTimeout(attempt, delayMs);
        return;
      }
      runSequential();
    }
    attempt();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      runWithRetry(10, 400);
    });
  } else {
    runWithRetry(10, 400);
  }
})();
