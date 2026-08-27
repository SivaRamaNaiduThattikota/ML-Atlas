// Module 07, Concept 10: A naive Bayes baseline for CFPB narrative tagging.
// Fits the same 12-document corpus (both multinomial and Bernoulli) that the
// lesson text scores by hand, renders the beginner-core verdict figure, and
// drives Section 19's lab, The CFPB Baseline Console -- six word-count
// sliders plus four "load the held-out narrative" buttons, scoring both
// models live against the same fitted parameters used throughout the lesson.

(function () {
  "use strict";

  var VOCAB = ["refund", "delay", "error", "urgent", "thanks", "please"];

  // -- Fixed training corpus (Section 05 / Section 07's own tallies) --
  var MULTI_COUNT = {
    escalate: { refund: 4, delay: 5, error: 5, urgent: 4, thanks: 0, please: 0 },
    resolve: { refund: 2, delay: 0, error: 0, urgent: 0, thanks: 8, please: 8 },
  };
  var MULTI_N = { escalate: 18, resolve: 18 };
  var VOCAB_SIZE = 6;

  var BERN_DF = {
    escalate: { refund: 4, delay: 5, error: 5, urgent: 4, thanks: 0, please: 0 },
    resolve: { refund: 2, delay: 0, error: 0, urgent: 0, thanks: 6, please: 6 },
  };
  var BERN_DOCS = { escalate: 6, resolve: 6 };

  var PRIOR = 0.5;

  function pMulti(word, cls) {
    return (MULTI_COUNT[cls][word] + 1) / (MULTI_N[cls] + VOCAB_SIZE);
  }
  function pBern(word, cls) {
    return (BERN_DF[cls][word] + 1) / (BERN_DOCS[cls] + 2);
  }

  function scoreMultinomial(counts) {
    var pE = 1, pR = 1;
    VOCAB.forEach(function (w) {
      var c = counts[w] || 0;
      pE *= Math.pow(pMulti(w, "escalate"), c);
      pR *= Math.pow(pMulti(w, "resolve"), c);
    });
    var jE = PRIOR * pE, jR = PRIOR * pR, total = jE + jR;
    return { postE: total > 0 ? jE / total : 0, postR: total > 0 ? jR / total : 0 };
  }

  function scoreBernoulli(counts) {
    var pE = 1, pR = 1;
    VOCAB.forEach(function (w) {
      var present = (counts[w] || 0) > 0;
      var eP = pBern(w, "escalate"), rP = pBern(w, "resolve");
      pE *= present ? eP : (1 - eP);
      pR *= present ? rP : (1 - rP);
    });
    var jE = PRIOR * pE, jR = PRIOR * pR, total = jE + jR;
    return { postE: total > 0 ? jE / total : 0, postR: total > 0 ? jR / total : 0 };
  }

  // -- The four held-out narratives from Section 10, for the load buttons. --
  var TEST_CASES = {
    T1: { counts: { refund: 1, delay: 1, urgent: 1 }, truth: "escalate" },
    T2: { counts: { error: 2, urgent: 1 }, truth: "escalate" },
    T3: { counts: { thanks: 2, please: 1 }, truth: "resolve" },
    T4: { counts: { delay: 1 }, truth: "resolve" },
  };

  var els = {};
  function byId(id) { return document.getElementById(id); }
  function fmt(n) { return n.toFixed(6); }

  var loadedTruth = null;

  function currentCounts() {
    var counts = {};
    VOCAB.forEach(function (w) {
      counts[w] = els.slider[w] ? parseInt(els.slider[w].value, 10) : 0;
    });
    return counts;
  }

  function render() {
    var counts = currentCounts();
    VOCAB.forEach(function (w) {
      if (els.out[w]) els.out[w].textContent = String(counts[w]);
    });

    var multi = scoreMultinomial(counts);
    var bern = scoreBernoulli(counts);

    els.readoutMultiE.textContent = fmt(multi.postE);
    els.readoutMultiR.textContent = fmt(multi.postR);
    els.readoutBernE.textContent = fmt(bern.postE);
    els.readoutBernR.textContent = fmt(bern.postR);

    var multiCall = multi.postE >= multi.postR ? "escalate" : "resolve";
    var bernCall = bern.postE >= bern.postR ? "escalate" : "resolve";

    var verdict = "Multinomial predicts <b>" + multiCall.toUpperCase() + "</b> (P=" +
      fmt(multiCall === "escalate" ? multi.postE : multi.postR) + ") · Bernoulli predicts <b>" +
      bernCall.toUpperCase() + "</b> (P=" + fmt(bernCall === "escalate" ? bern.postE : bern.postR) + ")";

    if (multiCall !== bernCall) {
      verdict += " -- the two models disagree on this narrative.";
    } else {
      verdict += " -- same call, different confidence.";
    }

    if (loadedTruth) {
      var correctMulti = multiCall === loadedTruth;
      verdict += " True label: <b>" + loadedTruth.toUpperCase() + "</b> -- multinomial is " +
        (correctMulti ? "correct." : "wrong (this is Section 15's diagnosed miss).");
    }

    var verdictEl = els.verdict;
    if (verdictEl) {
      verdictEl.innerHTML = verdict;
      verdictEl.className = "gate-verdict " + (loadedTruth
        ? (multiCall === loadedTruth ? "verdict-green" : "verdict-red")
        : (multiCall === bernCall ? "verdict-green" : "verdict-amber"));
    }
  }

  function loadCase(id) {
    var testCase = TEST_CASES[id];
    if (!testCase) return;
    VOCAB.forEach(function (w) {
      if (els.slider[w]) els.slider[w].value = String(testCase.counts[w] || 0);
    });
    loadedTruth = testCase.truth;
    render();
  }

  function reset() {
    var defaults = { refund: 1, delay: 1, error: 0, urgent: 1, thanks: 0, please: 0 };
    VOCAB.forEach(function (w) {
      if (els.slider[w]) els.slider[w].value = String(defaults[w]);
    });
    loadedTruth = null;
    render();
  }

  function markFreeform() {
    loadedTruth = null;
    render();
  }

  function init() {
    els.slider = {
      refund: byId("wgWordRefund_0710"),
      delay: byId("wgWordDelay_0710"),
      error: byId("wgWordError_0710"),
      urgent: byId("wgWordUrgent_0710"),
      thanks: byId("wgWordThanks_0710"),
      please: byId("wgWordPlease_0710"),
    };
    els.out = {
      refund: byId("wgWordRefundOut_0710"),
      delay: byId("wgWordDelayOut_0710"),
      error: byId("wgWordErrorOut_0710"),
      urgent: byId("wgWordUrgentOut_0710"),
      thanks: byId("wgWordThanksOut_0710"),
      please: byId("wgWordPleaseOut_0710"),
    };
    if (!els.slider.refund) return;

    els.readoutMultiE = byId("wgReadoutMultiE_0710");
    els.readoutMultiR = byId("wgReadoutMultiR_0710");
    els.readoutBernE = byId("wgReadoutBernE_0710");
    els.readoutBernR = byId("wgReadoutBernR_0710");
    els.verdict = byId("wgVerdict_0710");

    VOCAB.forEach(function (w) {
      if (els.slider[w]) els.slider[w].addEventListener("input", markFreeform);
    });

    var loadT1 = byId("wgLoadT1_0710"), loadT2 = byId("wgLoadT2_0710"),
      loadT3 = byId("wgLoadT3_0710"), loadT4 = byId("wgLoadT4_0710"),
      resetBtn = byId("wgReset_0710");
    if (loadT1) loadT1.addEventListener("click", function () { loadCase("T1"); });
    if (loadT2) loadT2.addEventListener("click", function () { loadCase("T2"); });
    if (loadT3) loadT3.addEventListener("click", function () { loadCase("T3"); });
    if (loadT4) loadT4.addEventListener("click", function () { loadCase("T4"); });
    if (resetBtn) resetBtn.addEventListener("click", reset);

    render();
    renderVerdictFigure();
  }

  // -- Beginner-core figure: the four held-out calls, three right, one wrong. --
  function verdictFigureSvg() {
    return '<svg class="vector-plane" viewBox="0 0 460 220" role="img" aria-labelledby="c0710-fig-title c0710-fig-desc">' +
      '<title id="c0710-fig-title">Four held-out narratives, three correct and one misclassified</title>' +
      '<desc id="c0710-fig-desc">T1 and T2, true escalate, both score above 0.98 for escalate. T3, true resolve, scores 0.9986 for resolve. T4, true resolve, scores 0.857 for escalate -- the model\'s one mistake.</desc>' +
      '<g font-family="IBM Plex Mono, monospace" fill="currentColor" font-size="9">' +
      '<rect x="15" y="20" width="200" height="50" rx="4" fill="var(--teal)" opacity="0.15" stroke="var(--teal)" stroke-width="1.4"/>' +
      '<text x="115" y="40" text-anchor="middle" font-weight="700">T1 "refund delay urgent"</text>' +
      '<text x="115" y="55" text-anchor="middle">true escalate -- P=0.980392 correct</text>' +
      '<rect x="245" y="20" width="200" height="50" rx="4" fill="var(--teal)" opacity="0.15" stroke="var(--teal)" stroke-width="1.4"/>' +
      '<text x="345" y="40" text-anchor="middle" font-weight="700">T2 "error urgent error"</text>' +
      '<text x="345" y="55" text-anchor="middle">true escalate -- P=0.994475 correct</text>' +
      '<rect x="15" y="90" width="200" height="50" rx="4" fill="var(--teal)" opacity="0.15" stroke="var(--teal)" stroke-width="1.4"/>' +
      '<text x="115" y="110" text-anchor="middle" font-weight="700">T3 "thanks please thanks"</text>' +
      '<text x="115" y="125" text-anchor="middle">true resolve -- P=0.998630 correct</text>' +
      '<rect x="245" y="90" width="200" height="50" rx="4" fill="var(--orange)" opacity="0.18" stroke="var(--orange)" stroke-width="1.4"/>' +
      '<text x="345" y="110" text-anchor="middle" font-weight="700">T4 "delay"</text>' +
      '<text x="345" y="125" text-anchor="middle">true resolve -- P(escalate)=0.857143 WRONG</text>' +
      '<text x="230" y="175" text-anchor="middle" font-size="10" font-weight="700">Held-out accuracy: 3/4 = 0.75</text>' +
      '<text x="230" y="195" text-anchor="middle" font-size="8">precision 0.666667 · recall 1.0 · positive class = escalate</text>' +
      "</g></svg>";
  }
  function renderVerdictFigure() {
    var wrap = byId("wgVerdictFigure_0710");
    if (wrap) wrap.innerHTML = verdictFigureSvg();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
