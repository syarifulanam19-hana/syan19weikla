(function () {
  "use strict";

  // ====== SETTINGS ======
  // Pilih setelah paragraf ke berapa untuk iklan tengah
  var MID_AFTER_PARAGRAPH = 1; // contoh: setelah paragraf ke-2

  // (Opsional) Batasi tampil hanya di halaman post (bukan homepage/label)
  var ONLY_ON_POST_PAGE = true;

  // Daftar iklan (rotasi random)
  // Ganti link + image sesuai kebutuhan kamu
  var ADS_DEFAULT = [
    {
      href: "https://www.google.com/",
      img: "https://gallery.yopriceville.com/var/resizes/Free-Clipart-Pictures/Ribbons-and-Banners-PNG/Red_Business_Banner_PNG_Clipart.png?m=1629832746",
      alt: "Recommended"
    },
    {
      href: "https://www.google.com/m",
      img: "https://gallery.yopriceville.com/var/resizes/Free-Clipart-Pictures/Ribbons-and-Banners-PNG/Red_Business_Banner_PNG_Clipart.png?m=1629832746",
      alt: "Learn faster"
    }
  ];

  // (Opsional) Beda iklan per domain blog
  // Isi hostname blog kamu kalau mau khusus
  var ADS_BY_HOST = {
    // "namablog1.blogspot.com": [
    //   { href: "https://...", img:"https://...", alt:"..." }
    // ],
    // "customdomain.com": [
    //   { href: "https://...", img:"https://...", alt:"..." }
    // ]
  };

  // ====== HELPERS ======
  function isPostPage() {
    // Blogger biasanya punya /YYYY/MM/..html
    return /\/\d{4}\/\d{2}\//.test(location.pathname) || /(\.html)$/.test(location.pathname);
  }

  function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function createAdHtml(ad, positionLabel) {
    // positionLabel hanya untuk debugging kalau perlu
    return (
      '<div class="remote-aff-ad remote-aff-ad-' + positionLabel + '" style="' +
        'text-align:center;margin:16px 0;padding:12px;border:1px solid #eee;border-radius:12px;' +
      '">' +
        '<a href="' + ad.href + '" target="_blank" rel="nofollow noopener sponsored">' +
          '<img src="' + ad.img + '" alt="' + (ad.alt || "Ad") + '" style="max-width:100%;height:auto;border-radius:10px;display:inline-block;" />' +
        '</a>' +
      '</div>'
    );
  }

  function findPostBody() {
    // Banyak template Blogger pakai salah satu ini
    return (
      document.querySelector(".post-body") ||
      document.querySelector(".entry-content") ||
      document.querySelector(".post-content") ||
      document.querySelector("article") ||
      null
    );
  }

  // ====== MAIN ======
  try {
    if (ONLY_ON_POST_PAGE && !isPostPage()) return;

    var postBody = findPostBody();
    if (!postBody) return;

    var host = location.hostname;
    var ads = (ADS_BY_HOST[host] && ADS_BY_HOST[host].length) ? ADS_BY_HOST[host] : ADS_DEFAULT;
    if (!ads || !ads.length) return;

    // TOP
    var adTop = pickRandom(ads);
    postBody.insertAdjacentHTML("afterbegin", createAdHtml(adTop, "top"));

    // MID (setelah paragraf tertentu)
    var paragraphs = postBody.querySelectorAll("p");
    if (paragraphs && paragraphs.length > MID_AFTER_PARAGRAPH) {
      var adMid = pickRandom(ads);
      paragraphs[MID_AFTER_PARAGRAPH - 1].insertAdjacentHTML("afterend", createAdHtml(adMid, "mid"));
    }

    // BOTTOM
    var adBottom = pickRandom(ads);
    postBody.insertAdjacentHTML("beforeend", createAdHtml(adBottom, "bottom"));

  } catch (e) {
    // kalau ada error, diam saja biar tidak ganggu user
    // console.log(e);
  }
})();

