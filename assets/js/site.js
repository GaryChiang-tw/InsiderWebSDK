/**
 * Insider Web SDK 測試站共用腳本。
 * 之後可在此擴充 data layer、Insider queue 等。
 */
document.documentElement.classList.add("js-ready");

(function () {
  var nodes = document.querySelectorAll(".js-version-display");
  if (!nodes.length) return;
  var url = new URL("VERSION", document.baseURI);
  fetch(url.href, { cache: "no-store" })
    .then(function (r) {
      return r.ok ? r.text() : Promise.reject();
    })
    .then(function (t) {
      var v = t.replace(/\s+/g, "");
      if (!v) return;
      nodes.forEach(function (el) {
        el.textContent = v;
      });
    })
    .catch(function () {});
})();
