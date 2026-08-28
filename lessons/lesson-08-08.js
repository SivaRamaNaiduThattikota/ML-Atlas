// Module 08, Concept 08 -- Gradient boosting: fitting residuals.
// Lab caps at rounds 0-2, exactly what the worked example node-verified
// (exhaustive-threshold stump search, ties independently checked). No
// invented later rounds -- extending this would need a fresh verification
// pass, not a plausible-looking hand-typed number.

(function () {
  "use strict";

  var ROWS_0808 = ["A", "B", "C", "D", "E", "F", "G", "H"];
  var X1_0808 = { A: 1, B: 2, C: 3, D: 1, E: 4, F: 2, G: 5, H: 3 };
  var Y_0808 = { A: 0, B: 0, C: 1, D: 0, E: 1, F: 0, G: 1, H: 0 };
  var LR_0808 = 0.5;
  var F0_0808 = 0.375;

  function leaf1_0808(row) { return X1_0808[row] <= 2.5 ? -0.375 : 0.375; }
  function leaf2_0808(row) { return X1_0808[row] <= 3.5 ? -0.145833 : 0.4375; }

  function predictionAt_0808(row, rounds) {
    var f = F0_0808;
    if (rounds >= 1) f += LR_0808 * leaf1_0808(row);
    if (rounds >= 2) f += LR_0808 * leaf2_0808(row);
    return f;
  }

  var slider_0808 = document.getElementById("rounds_0808");
  var roundsOut_0808 = document.getElementById("roundsOut_0808");
  var stumpTrain_0808 = document.getElementById("stumpTrain_0808");
  var residualBars_0808 = document.getElementById("residualBars_0808");
  var rowHPred_0808 = document.getElementById("rowHPred_0808");
  var rowHResid_0808 = document.getElementById("rowHResid_0808");
  var trainAcc_0808 = document.getElementById("trainAcc_0808");
  var verdict_0808 = document.getElementById("verdict_0808");
  var sample_0808 = document.getElementById("sample_0808");
  var resetBtn_0808 = document.getElementById("resetBtn_0808");

  if (!slider_0808 || !stumpTrain_0808 || !residualBars_0808 || !verdict_0808) return;

  function render_0808() {
    var rounds = parseInt(slider_0808.value, 10);
    roundsOut_0808.textContent = String(rounds);

    var nodes = [{ label: "F0 = 0.375", small: "mean of y" }];
    if (rounds >= 1) nodes.push({ label: "Tree 1", small: "x1≤2.5 → F1" });
    if (rounds >= 2) nodes.push({ label: "Tree 2", small: "x1≤3.5 → F2" });
    stumpTrain_0808.innerHTML = nodes.map(function (n, i) {
      var active = i === nodes.length - 1 ? " active" : "";
      return '<div class="diagram-node' + active + '"><b>' + n.label + "</b><small>" + n.small + "</small></div>";
    }).join("");

    var correct = 0;
    residualBars_0808.innerHTML = ROWS_0808.map(function (row) {
      var pred = predictionAt_0808(row, rounds);
      var resid = Y_0808[row] - pred;
      if (Math.round(pred) === Y_0808[row]) correct += 1;
      var pct = Math.min(Math.abs(resid) * 100, 100).toFixed(1);
      return (
        '<div class="prob-row"><span>Row ' + row + "</span>" +
        '<div class="bar-track"><div class="bar-fill" style="width:' + pct + '%"></div></div>' +
        "<b>" + resid.toFixed(4) + "</b></div>"
      );
    }).join("");

    var predH = predictionAt_0808("H", rounds);
    var residH = Y_0808.H - predH;
    rowHPred_0808.textContent = predH.toFixed(6);
    rowHResid_0808.textContent = residH.toFixed(6);
    trainAcc_0808.textContent = correct + " / 8";

    verdict_0808.classList.remove("verdict-red", "verdict-amber", "verdict-green");
    if (correct === 8) {
      verdict_0808.classList.add("verdict-green");
      verdict_0808.textContent = "All 8 rows correct.";
    } else if (correct >= 6) {
      verdict_0808.classList.add("verdict-amber");
      var missed = ROWS_0808.filter(function (r) { return Math.round(predictionAt_0808(r, rounds)) !== Y_0808[r]; });
      verdict_0808.textContent = correct + " of 8 correct -- still missing row(s): " + missed.join(", ") + ".";
    } else {
      verdict_0808.classList.add("verdict-red");
      verdict_0808.textContent = correct + " of 8 correct.";
    }

    if (rounds === 0) {
      sample_0808.textContent = "Round 0: every row predicts the flat baseline, F0 = 0.375.";
    } else if (rounds === 1) {
      sample_0808.textContent = "Round 1: stump x1≤2.5 updates F1. Row H's own residual just got WORSE (-0.375 → -0.562500) even though train accuracy improved overall.";
    } else {
      sample_0808.textContent = "Round 2: stump x1≤3.5 updates F2. Row H's prediction (0.489583) now rounds correctly to 0 -- but row C lands on the identical 0.489583 and now rounds incorrectly. The miss swapped, it didn't disappear.";
    }
  }

  slider_0808.addEventListener("input", render_0808);
  if (resetBtn_0808) {
    resetBtn_0808.addEventListener("click", function () {
      slider_0808.value = "0";
      render_0808();
    });
  }

  render_0808();
})();
