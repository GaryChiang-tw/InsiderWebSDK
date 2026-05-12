/**
 * 首頁 Insider 整合偵測（對齊 insider-head.js 的 insiderFlow）。
 */
(function () {
  var EXPECTED_INSIDER_FLOW = 3;
  var MAX_MS = 12000;
  var INTERVAL_MS = 400;
  var start = Date.now();

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function setPill(el, text, tone) {
    if (!el) return;
    el.textContent = text;
    el.className =
      "insider-diagnostics__pill insider-diagnostics__pill--" + (tone || "muted");
  }

  function findInsScript() {
    var scripts = document.getElementsByTagName("script");
    for (var i = 0; i < scripts.length; i++) {
      var s = scripts[i].src || "";
      if (s.indexOf("useinsider.com/ins.js") !== -1) return scripts[i].src;
    }
    return "";
  }

  function run() {
    var qStatus = $("[data-diag='queue-status']");
    var qDetail = $("[data-diag='queue-detail']");
    var fStatus = $("[data-diag='flow-status']");
    var fDetail = $("[data-diag='flow-detail']");
    var sStatus = $("[data-diag='script-status']");
    var sDetail = $("[data-diag='script-detail']");
    var rStatus = $("[data-diag='runtime-status']");
    var rDetail = $("[data-diag='runtime-detail']");

    var iq = window.InsiderQueue;
    if (iq == null) {
      setPill(qStatus, "不存在", "bad");
      qDetail.textContent = "—";
    } else if (Array.isArray(iq)) {
      setPill(qStatus, "已存在 (Array)", "ok");
      qDetail.textContent = "length = " + iq.length;
    } else {
      setPill(qStatus, "已存在 (非 Array)", "warn");
      qDetail.textContent = typeof iq;
    }

    var flow = window.insiderFlow;
    if (flow === undefined) {
      setPill(fStatus, "未定義", "bad");
      fDetail.textContent = "—";
    } else if (flow === EXPECTED_INSIDER_FLOW) {
      setPill(fStatus, "值 = " + flow, "ok");
      fDetail.textContent = "符合預期 (" + EXPECTED_INSIDER_FLOW + ")";
    } else {
      setPill(fStatus, "值 = " + flow, "warn");
      fDetail.textContent =
        "預期為 " + EXPECTED_INSIDER_FLOW + "（與 assets/js/insider-head.js 一致）";
    }

    var insSrc = findInsScript();
    if (insSrc) {
      setPill(sStatus, "已注入 <script>", "ok");
      sDetail.textContent = insSrc;
    } else {
      setPill(sStatus, "未偵測到", "bad");
      sDetail.textContent = "找不到 src 含 useinsider.com/ins.js 的標籤";
    }

    var insider = window.Insider;
    if (insider != null && typeof insider === "object") {
      setPill(rStatus, "已就緒", "ok");
      rDetail.textContent = "window.Insider 型別 : " + typeof insider;
    } else if (Date.now() - start < MAX_MS) {
      setPill(rStatus, "等待載入…", "muted");
      rDetail.textContent =
        insider === undefined
          ? "window.Insider 尚未出現"
          : "window.Insider 型別 : " + typeof insider;
    } else {
      setPill(rStatus, "未就緒", "bad");
      rDetail.textContent =
        insider === undefined
          ? "逾時仍未載入 window.Insider"
          : "window.Insider 型別 : " + typeof insider;
    }
  }

  function tick() {
    run();
    if (Date.now() - start < MAX_MS) {
      var insider = window.Insider;
      if (insider == null || typeof insider !== "object") {
        setTimeout(tick, INTERVAL_MS);
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", tick);
  } else {
    tick();
  }

  window.addEventListener("load", run);
  setTimeout(run, MAX_MS + 100);
})();
