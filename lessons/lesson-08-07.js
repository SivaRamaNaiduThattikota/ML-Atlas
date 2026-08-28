// Module 08, Concept 07 -- AdaBoost: weighted resampling.
// "The Reweighting Lab". Reuses the same 8-row A-H CFPB relief table as
// Concepts 03-06. Verdict score computed the same way as
// m08c07_adaboost_verify.js's own final-ensemble formula, not a
// miss/hit heuristic -- confirmed to land on -1.551973 for row H at round 3,
// matching the worked example's own table exactly.

(function () {
  "use strict";

  var ROWS_0807 = ["A", "B", "C", "D", "E", "F", "G", "H"];
  var Y_0807 = { A: 0, B: 0, C: 1, D: 0, E: 1, F: 0, G: 1, H: 0 }; // 1 = relief

  var STUMPS_0807 = [
    { label: "x1 ≤ 2.5", misses: ["H"], err: 0.125000, predH: 1 },
    { label: "x1 ≤ 3.5", misses: ["C"], err: 0.071429, predH: -1 },
    { label: "x2 ≤ 35", misses: ["A", "B"], err: 0.076923, predH: -1 },
  ];

  var round_0807 = 0;
  var weights_0807 = {};
  var alphas_0807 = [];

  ROWS_0807.forEach(function (r) { weights_0807[r] = 1 / 8; });

  var weightsEl_0807 = document.getElementById("weights_0807");
  var outputEl_0807 = document.getElementById("output_0807");
  var verdictEl_0807 = document.getElementById("verdict_0807");
  var stepBtn_0807 = document.getElementById("btn_step_0807");
  var resetBtn_0807 = document.getElementById("btn_reset_0807");

  if (!weightsEl_0807 || !outputEl_0807 || !verdictEl_0807 || !stepBtn_0807 || !resetBtn_0807) return;

  function renderWeights_0807() {
    ROWS_0807.forEach(function (r) {
      var row = weightsEl_0807.querySelector('[data-row="' + r + '"]');
      if (!row) return;
      row.querySelector(".bar-fill").style.width = (weights_0807[r] * 100).toFixed(1) + "%";
      var spans = row.querySelectorAll("span");
      spans[spans.length - 1].textContent = weights_0807[r].toFixed(3);
    });
  }

  function renderVerdict_0807() {
    var score = STUMPS_0807.slice(0, round_0807).reduce(function (acc, s, i) {
      return acc + alphas_0807[i] * s.predH;
    }, 0);
    var trueSign = Y_0807.H === 1 ? 1 : -1;

    if (round_0807 === 0) {
      verdictEl_0807.className = "gate-verdict";
      verdictEl_0807.textContent = "Ensemble vote on row H: not yet run";
    } else if (Math.sign(score) === trueSign && Math.abs(score) > 0.05) {
      verdictEl_0807.className = "gate-verdict verdict-green";
      verdictEl_0807.textContent = "Ensemble vote on row H after round " + round_0807 + ": correct (score " + score.toFixed(3) + ")";
    } else if (Math.sign(score) !== trueSign && Math.abs(score) > 0.05) {
      verdictEl_0807.className = "gate-verdict verdict-red";
      verdictEl_0807.textContent = "Ensemble vote on row H after round " + round_0807 + ": still wrong (score " + score.toFixed(3) + ")";
    } else {
      verdictEl_0807.className = "gate-verdict verdict-amber";
      verdictEl_0807.textContent = "Ensemble vote on row H after round " + round_0807 + ": near tie (score " + score.toFixed(3) + ")";
    }
  }

  function runRound_0807() {
    if (round_0807 >= STUMPS_0807.length) return;
    var s = STUMPS_0807[round_0807];
    var alpha = 0.5 * Math.log((1 - s.err) / s.err);
    alphas_0807.push(alpha);

    ROWS_0807.forEach(function (r) {
      var wrong = s.misses.indexOf(r) !== -1;
      weights_0807[r] = weights_0807[r] * Math.exp(wrong ? alpha : -alpha);
    });
    var total = ROWS_0807.reduce(function (acc, r) { return acc + weights_0807[r]; }, 0);
    ROWS_0807.forEach(function (r) { weights_0807[r] /= total; });

    round_0807 += 1;
    renderWeights_0807();
    outputEl_0807.textContent =
      "Round " + round_0807 + " · stump " + s.label + " · weighted error " + s.err.toFixed(6) +
      " · alpha " + alpha.toFixed(6) + " · missed [" + s.misses.join(", ") + "] · row H weight now " + weights_0807.H.toFixed(3);
    renderVerdict_0807();
    if (round_0807 === STUMPS_0807.length) {
      stepBtn_0807.disabled = true;
      stepBtn_0807.classList.add("secondary");
    }
  }

  function reset_0807() {
    round_0807 = 0;
    ROWS_0807.forEach(function (r) { weights_0807[r] = 1 / 8; });
    alphas_0807 = [];
    stepBtn_0807.disabled = false;
    stepBtn_0807.classList.remove("secondary");
    renderWeights_0807();
    outputEl_0807.textContent = 'Round 0 · weights uniform (1/8 each). Press "Run round" to fit the first stump.';
    renderVerdict_0807();
  }

  stepBtn_0807.addEventListener("click", runRound_0807);
  resetBtn_0807.addEventListener("click", reset_0807);

  renderWeights_0807();
})();
