(function () {
  "use strict";

  // ---- Fixed background constants (Concept 04's own 6-document CFPB set) ----
  var VOCAB = ["refund", "delay", "error", "thanks", "please"];

  // Multinomial per-class totals (from Concept 04), N=9 each.
  var MULTI_COUNT = {
    escalate: { refund: 3, delay: 3, error: 3, thanks: 0, please: 0 },
    resolve: { refund: 1, delay: 0, error: 0, thanks: 4, please: 4 },
  };
  var MULTI_N = { escalate: 9, resolve: 9 };
  var MULTI_VOCAB_SIZE = 5;

  // Bernoulli per-class document frequencies, 3 docs per class.
  var BERN_DF = {
    escalate: { refund: 2, delay: 3, error: 2, thanks: 0, please: 0 },
    resolve: { refund: 1, delay: 0, error: 0, thanks: 3, please: 3 },
  };
  var BERN_DOCS = { escalate: 3, resolve: 3 };

  function pMulti(word, cls) {
    return (MULTI_COUNT[cls][word] + 1) / (MULTI_N[cls] + MULTI_VOCAB_SIZE);
  }
  function pBern(word, cls) {
    return (BERN_DF[cls][word] + 1) / (BERN_DOCS[cls] + 2);
  }

  // Fixed absent-word constants (delay, please never appear in any test doc here).
  var FIXED_BERN = {
    escalate: { delay: pBern("delay", "escalate"), please: 1 - pBern("please", "escalate") },
    resolve: { delay: pBern("delay", "resolve"), please: 1 - pBern("please", "resolve") },
  };

  var els = {};
  function byId(id) { return document.getElementById(id); }

  function fmt(n) { return n.toFixed(6); }

  function computeAndRender() {
    var counts = {
      refund: parseInt(els.refund.value, 10),
      error: parseInt(els.error.value, 10),
      thanks: parseInt(els.thanks.value, 10),
    };

    els.refundOut.textContent = String(counts.refund);
    els.errorOut.textContent = String(counts.error);
    els.thanksOut.textContent = String(counts.thanks);

    var sliderWords = ["refund", "error", "thanks"];
    var bernFactor = { escalate: {}, resolve: {} };
    var multiFactor = { escalate: {}, resolve: {} };

    ["escalate", "resolve"].forEach(function (cls) {
      sliderWords.forEach(function (w) {
        var c = counts[w];
        var pb = pBern(w, cls);
        bernFactor[cls][w] = c > 0 ? pb : 1 - pb;
        var pm = pMulti(w, cls);
        multiFactor[cls][w] = c > 0 ? Math.pow(pm, c) : 1;
      });
    });

    // ---- Bernoulli table (5 rows, every vocabulary word) ----
    sliderWords.forEach(function (w) {
      var present = counts[w] > 0;
      var labelEl = els.bernLabel[w];
      labelEl.textContent = w + (present ? " (present)" : " (absent)");
      els.bernE[w].textContent = fmt(bernFactor.escalate[w]);
      els.bernR[w].textContent = fmt(bernFactor.resolve[w]);
    });

    var bernLikeE = bernFactor.escalate.refund * FIXED_BERN.escalate.delay *
      bernFactor.escalate.error * bernFactor.escalate.thanks * FIXED_BERN.escalate.please;
    var bernLikeR = bernFactor.resolve.refund * FIXED_BERN.resolve.delay *
      bernFactor.resolve.error * bernFactor.resolve.thanks * FIXED_BERN.resolve.please;
    var bernJointE = 0.5 * bernLikeE;
    var bernJointR = 0.5 * bernLikeR;
    var bernSum = bernJointE + bernJointR;
    var bernPostE = bernSum > 0 ? bernJointE / bernSum : 0;
    var bernPostR = bernSum > 0 ? bernJointR / bernSum : 0;

    els.bernProductE.textContent = fmt(bernJointE);
    els.bernProductR.textContent = fmt(bernJointR);

    // ---- Multinomial table (3 rows, only present-word tokens ever entered) ----
    sliderWords.forEach(function (w) {
      var c = counts[w];
      var labelEl = els.multiLabel[w];
      labelEl.textContent = c > 0
        ? w + " (×" + c + ", present)"
        : w + " (×0, absent — contributes 1.000000)";
      els.multiE[w].textContent = fmt(multiFactor.escalate[w]);
      els.multiR[w].textContent = fmt(multiFactor.resolve[w]);
    });

    var multiLikeE = multiFactor.escalate.refund * multiFactor.escalate.error * multiFactor.escalate.thanks;
    var multiLikeR = multiFactor.resolve.refund * multiFactor.resolve.error * multiFactor.resolve.thanks;
    var multiJointE = 0.5 * multiLikeE;
    var multiJointR = 0.5 * multiLikeR;
    var multiSum = multiJointE + multiJointR;
    var multiPostE = multiSum > 0 ? multiJointE / multiSum : 0;
    var multiPostR = multiSum > 0 ? multiJointR / multiSum : 0;

    els.multiProductE.textContent = fmt(multiJointE);
    els.multiProductR.textContent = fmt(multiJointR);

    // ---- Gate readout ----
    els.readoutBernE.textContent = fmt(bernPostE);
    els.readoutBernR.textContent = fmt(bernPostR);
    els.readoutMultiE.textContent = fmt(multiPostE);
    els.readoutMultiR.textContent = fmt(multiPostR);

    // ---- Verdict ----
    var bernCall = bernPostE >= bernPostR ? "ESCALATE" : "RESOLVE";
    var multiCall = multiPostE >= multiPostR ? "ESCALATE" : "RESOLVE";
    var bernP = bernCall === "ESCALATE" ? bernPostE : bernPostR;
    var multiP = multiCall === "ESCALATE" ? multiPostE : multiPostR;

    var verdict = "Bernoulli predicts <b>" + bernCall + "</b> (P=" + fmt(bernP) + ") · " +
      "Multinomial predicts <b>" + multiCall + "</b> (P=" + fmt(multiP) + ") · " +
      "same word counts, different math — Bernoulli only asks yes/no per word; Multinomial keeps counting every repeat.";

    if (bernCall !== multiCall) {
      verdict += " These two models disagree on the call.";
    } else {
      var gap = Math.abs(bernPostE - multiPostE);
      verdict += " Same call, different confidence — a gap of " + fmt(gap) + " in the escalate posterior alone.";
    }

    els.verdict.innerHTML = verdict;
  }

  function reset() {
    els.refund.value = "1";
    els.error.value = "1";
    els.thanks.value = "1";
    computeAndRender();
  }

  function init() {
    els.refund = byId("wgWordRefund_0705");
    els.error = byId("wgWordErrorCount_0705");
    els.thanks = byId("wgWordThanksCount_0705");
    els.refundOut = byId("wgWordRefundOut_0705");
    els.errorOut = byId("wgWordErrorCountOut_0705");
    els.thanksOut = byId("wgWordThanksCountOut_0705");

    if (!els.refund || !els.error || !els.thanks) return;

    els.bernLabel = { refund: byId("wgBernRefundLabel_0705"), error: byId("wgBernErrorLabel_0705"), thanks: byId("wgBernThanksLabel_0705") };
    els.bernE = { refund: byId("wgBernRefundE_0705"), error: byId("wgBernErrorE_0705"), thanks: byId("wgBernThanksE_0705") };
    els.bernR = { refund: byId("wgBernRefundR_0705"), error: byId("wgBernErrorR_0705"), thanks: byId("wgBernThanksR_0705") };
    els.bernProductE = byId("wgBernProductE_0705");
    els.bernProductR = byId("wgBernProductR_0705");

    els.multiLabel = { refund: byId("wgMultiRefundLabel_0705"), error: byId("wgMultiErrorLabel_0705"), thanks: byId("wgMultiThanksLabel_0705") };
    els.multiE = { refund: byId("wgMultiRefundE_0705"), error: byId("wgMultiErrorE_0705"), thanks: byId("wgMultiThanksE_0705") };
    els.multiR = { refund: byId("wgMultiRefundR_0705"), error: byId("wgMultiErrorR_0705"), thanks: byId("wgMultiThanksR_0705") };
    els.multiProductE = byId("wgMultiProductE_0705");
    els.multiProductR = byId("wgMultiProductR_0705");

    els.readoutBernE = byId("wgReadoutBernE_0705");
    els.readoutBernR = byId("wgReadoutBernR_0705");
    els.readoutMultiE = byId("wgReadoutMultiE_0705");
    els.readoutMultiR = byId("wgReadoutMultiR_0705");
    els.verdict = byId("wgVerdict_0705");

    els.refund.addEventListener("input", computeAndRender);
    els.error.addEventListener("input", computeAndRender);
    els.thanks.addEventListener("input", computeAndRender);

    var resetBtn = byId("wgReset_0705");
    if (resetBtn) resetBtn.addEventListener("click", reset);

    computeAndRender();
    renderGaussFigures();
  }

  // ---- Beginner-core + advanced Gaussian figures (live SVG, no data build) ----
  function gaussSvg() {
    return '<svg viewBox="0 0 320 140" width="100%" height="140" role="img" aria-hidden="true">' +
      '<line x1="10" y1="120" x2="310" y2="120" stroke="currentColor" stroke-opacity="0.3"></line>' +
      '<path d="M10,118 C60,118 90,20 140,20 C190,20 220,118 270,118" fill="none" stroke="#4d8dff" stroke-width="2"></path>' +
      '<path d="M40,118 C90,118 130,55 180,55 C230,55 260,118 310,118" fill="none" stroke="#ff8a4d" stroke-width="2"></path>' +
      '<circle cx="210" cy="88" r="4" fill="currentColor"></circle>' +
      '<text x="140" y="14" font-size="10" fill="#4d8dff" text-anchor="middle">escalate</text>' +
      '<text x="230" y="47" font-size="10" fill="#ff8a4d" text-anchor="middle">resolve</text>' +
      '<text x="210" y="102" font-size="9" fill="currentColor" text-anchor="middle">new $900 dispute</text>' +
      '</svg>';
  }

  function renderGaussFigures() {
    var a = byId("wgGaussFigure_0705");
    var b = byId("wgGaussFigureAdv_0705");
    if (a) a.innerHTML = gaussSvg();
    if (b) b.innerHTML = gaussSvg();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
