(function () {
  "use strict";

  // === Anti double-run (kalau script kepasang 2x) ===
  if (window.__REMOTE_AFF_ADS_LOADED__) return;
  window.__REMOTE_AFF_ADS_LOADED__ = true;

  // === Settings ===
  var ONLY_ON_POST_PAGE = true;

  // MID: sisip setelah blok ke-3 (bukan hanya <p>)
  var MID_AFTER_BLOCK = 3;

  var ADS_DEFAULT = [
    {
      href: "https://www.google.com/",
      img: "https://eastersideacademy.co.uk/images/dojo1.png",
      alt: "Recommended"
    },
    {
      href: "https://www.google.com/",
      img: "https://smp.alharaki.sch.id/wp-content/uploads/2021/07/class-dojo-1.png",
      alt: "Learn faster"
    }
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
    wrap.style.cssText =
      "text-align:center;margin:16px 0;padding:12px;border:1px solid #eee;border-radius:12px;";

    wrap.innerHTML =
      '<a href="' + ad.href + '" target="_blank" rel="nofollow noopener sponsored">' +
        '<img src="' + ad.img + '" alt="' + (ad.alt || "Ad") + '" style="max-width:100%;height:auto;border-radius:10px;display:inline-block;" />' +
      "</a>";

    return wrap;
  }

  function findPostBody() {
    return (
      document.querySelector(".post-body") ||
      document.querySelector(".entry-content") ||
      document.querySelector(".post-content") ||
      document.querySelector("article") ||
      null
    );
  }

  function getContentBlocks(postBody) {
    // Ambil blok-blok yang “nyata” buat titik sisip (p, h1-h6, img, ul/ol, div)
    var blocks = postBody.querySelectorAll("p, h1, h2, h3, h4, h5, h6, img, ul, ol, div");
    // Filter yang kosong banget
    var out = [];
    for (var i = 0; i < blocks.length; i++) {
      var el = blocks[i];
      var text = (el.textContent || "").trim();
      if (el.tagName === "IMG" || text.length > 30) out.push(el);
    }
    return out;
  }

  function alreadyInserted() {
    return document.querySelectorAll(".remote-aff-ad").length > 0;
  }

  function run() {
    try {
      if (ONLY_ON_POST_PAGE && !isPostPage()) return;

      var postBody = findPostBody();
      if (!postBody) return;

      // Anti dobel injection (kalau template load ulang, dll)
      if (alreadyInserted()) return;

      var ads = ADS_DEFAULT;
      if (!ads || !ads.length) return;

      // TOP
      postBody.insertAdjacentElement("afterbegin", createAdEl(pickRandom(ads), "top"));

      // MID (pakai blok, bukan cuma <p>)
      var blocks = getContentBlocks(postBody);
      if (blocks.length >= MID_AFTER_BLOCK) {
        blocks[MID_AFTER_BLOCK - 1].insertAdjacentElement("afterend", createAdEl(pickRandom(ads), "mid"));
      }

      // BOTTOM
      postBody.insertAdjacentElement("beforeend", createAdEl(pickRandom(ads), "bottom"));

    } catch (e) {
      // diam
    }
  }

  // Jalankan saat DOM siap (Blogger kadang render lambat)
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
