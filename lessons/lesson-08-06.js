// Module 08, Concept 06 -- Boosting: the sequential-correction idea.
// "Sequential Correction Tracker" lab. Reuses Concept 04's own 8-row A-H
// CFPB relief table. Three verified AdaBoost rounds, added one at a time.
// All numbers (errors, alphas, and rows H/C's weight jumps) are the exact
// node-verified figures from the worked example -- nothing recomputed here.

(function () {
  "use strict";

  var ROWS_0806 = ["A", "B", "C", "D", "E", "F", "G", "H"];

  // Weights AFTER each round's reweighting (round 0 = starting, uniform).
  var WEIGHTS_BY_ROUND_0806 = [
    { A: 0.125, B: 0.125, C: 0.125, D: 0.125, E: 0.125, F: 0.125, G: 0.125, H: 0.125 },
    { A: 0.071429, B: 0.071429, C: 0.071429, D: 0.071429, E: 0.071429, F: 0.071429, G: 0.071429, H: 0.5 },
    { A: 0.038462, B: 0.038462, C: 0.5, D: 0.038462, E: 0.038462, F: 0.038462, G: 0.038462, H: 0.269231 },
  ];

  var ROUNDS_0806 = [
    {
      tree: "Tree 1: split x1≤2.5 (same stump as Concept 04's single tree)",
      wrong: "H",
      error: 0.125,
      alpha: 0.972955,
      ownErrorLabel: "0.125",
      verdict: "Round 1 -- weighted error 0.125, alpha1=0.972955. This is Concept 04's own single-tree stump, missing the exact same row (H). Combined ensemble so far (1 tree): 7 of 8 correct.",
    },
    {
      tree: "Tree 2: reweighted toward row H, splits x1≤3.5, now misses row C instead",
      wrong: "C",
      error: 0.071429,
      alpha: 1.282475,
      ownErrorLabel: "0.071",
      verdict: "Round 2 -- weighted error 0.071429, alpha2=1.282475. Row H's own weight (now 0.5) forced this round's stump toward it; the new miss shifted to row C.",
    },
    {
      tree: "Tree 3: reweighted toward row C, splits x2≤35 (polarity flipped)",
      wrong: "A, B",
      error: 0.076923,
      alpha: 1.242453,
      ownErrorLabel: "0.077",
      verdict: 'Round 3\'s own stump -- weighted error 0.076923, alpha3=1.242453. But the COMBINED 3-round alpha-weighted vote, sign(Σ alpha_t·h_t(x)), scores 8 of 8 -- up from round 1 alone\'s 7 of 8. A single round\'s own error and the ensemble\'s error are different numbers.',
    },
  ];

  var weightBars_0806 = document.getElementById("weightBars_0806");
  var addTreeBtn_0806 = document.getElementById("addTreeBtn_0806");
  var resetBtn_0806 = document.getElementById("resetBoostBtn_0806");
  var roundLabel_0806 = document.getElementById("roundLabel_0806");
  var errorMarker_0806 = document.getElementById("errorMarker_0806");
  var verdict_0806 = document.getElementById("boostVerdict_0806");
  var output_0806 = document.getElementById("boostOutput_0806");

  if (!weightBars_0806 || !addTreeBtn_0806 || !resetBtn_0806 || !roundLabel_0806 || !errorMarker_0806 || !verdict_0806) return;

  var round_0806 = 0;

  function renderWeights_0806() {
    // No round 4 exists, so round 3 has no further reweighting to show --
    // display the same post-round-2 weights round 3's own stump was fit on.
    var weights = WEIGHTS_BY_ROUND_0806[Math.min(round_0806, 2)];
    weightBars_0806.innerHTML = ROWS_0806.map(function (row) {
      var w = weights[row];
      var pct = (w * 100).toFixed(1);
      return (
        '<div class="prob-row"><span>Row ' + row + "</span>" +
        '<div class="bar-track"><div class="bar-fill" style="width:' + pct + '%"></div></div>' +
        "<b>" + w.toFixed(4) + "</b></div>"
      );
    }).join("");
  }

  function render_0806() {
    renderWeights_0806();

    if (round_0806 === 0) {
      roundLabel_0806.textContent = "Round 0 -- no trees fit yet";
      errorMarker_0806.style.left = "50%";
      errorMarker_0806.className = "gate-marker gate-amber";
      verdict_0806.textContent = 'Click "Add tree" to fit round 1.';
      output_0806.textContent = "";
      addTreeBtn_0806.disabled = false;
      return;
    }

    var r = ROUNDS_0806[round_0806 - 1];
    output_0806.textContent = r.tree + " -- misses row(s): " + r.wrong;

    if (round_0806 < 3) {
      roundLabel_0806.textContent = "Round " + round_0806 + " -- this round's own weighted error " + r.ownErrorLabel;
      var pos = Math.min(r.error / 0.15, 1) * 90;
      errorMarker_0806.style.left = pos.toFixed(1) + "%";
      errorMarker_0806.className = "gate-marker " + (r.error > 0.1 ? "gate-red" : "gate-amber");
      verdict_0806.textContent = r.verdict;
    } else {
      // Final state: show the COMBINED ensemble result, not round 3's own
      // (higher) stump error -- combining alpha-weighted votes reaches 8/8.
      roundLabel_0806.textContent = "Combined 3-round ensemble -- 8 of 8 correct";
      errorMarker_0806.style.left = "0%";
      errorMarker_0806.className = "gate-marker gate-green";
      verdict_0806.textContent = r.verdict;
    }

    addTreeBtn_0806.disabled = round_0806 >= 3;
    addTreeBtn_0806.classList.toggle("secondary", round_0806 >= 3);
  }

  addTreeBtn_0806.addEventListener("click", function () {
    if (round_0806 < 3) {
      round_0806 += 1;
      render_0806();
    }
  });

  resetBtn_0806.addEventListener("click", function () {
    round_0806 = 0;
    render_0806();
  });

  render_0806();
})();
