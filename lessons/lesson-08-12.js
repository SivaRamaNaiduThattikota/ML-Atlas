// Module 08, Concept 12 -- worked case: gradient boosting for CFPB's
// relief-risk model, closing the module. Extends C08's gradient boosting
// (capped there at round 2) with a THIRD round, node-verified fresh for
// this concept (see verify/m08c12_worked_case.js). Rounds 0-2 replay C08's
// own numbers unchanged; round 3 is new.

(function () {
  "use strict";

  var ROWS_0812 = ["A", "B", "C", "D", "E", "F", "G", "H"];
  var X1_0812 = { A: 1, B: 2, C: 3, D: 1, E: 4, F: 2, G: 5, H: 3 };
  var X2_0812 = { A: 10, B: 20, C: 15, D: 40, E: 25, F: 60, G: 30, H: 50 };
  var Y_0812 = { A: 0, B: 0, C: 1, D: 0, E: 1, F: 0, G: 1, H: 0 };
  var LR_0812 = 0.5;
  var F0_0812 = 0.375;
  var ADA_0812 = { A: 0, B: 0, C: 1, D: 0, E: 1, F: 0, G: 1, H: 0 };

  function leaf1_0812(row) { return X1_0812[row] <= 2.5 ? -0.375 : 0.375; }
  function leaf2_0812(row) { return X1_0812[row] <= 3.5 ? -0.145833 : 0.4375; }
  function leaf3_0812(row) { return X2_0812[row] <= 35 ? 0.14375 : -0.239583; }

  function predictionAt_0812(row, rounds) {
    var f = F0_0812;
    if (rounds >= 1) f += LR_0812 * leaf1_0812(row);
    if (rounds >= 2) f += LR_0812 * leaf2_0812(row);
    if (rounds >= 3) f += LR_0812 * leaf3_0812(row);
    return f;
  }

  var slider_0812 = document.getElementById("rounds_0812");
  var roundsOut_0812 = document.getElementById("roundsOut_0812");
  var stumpTrain_0812 = document.getElementById("stumpTrain_0812");
  var residualBars_0812 = document.getElementById("residualBars_0812");
  var trainAcc_0812 = document.getElementById("trainAcc_0812");
  var matchAda_0812 = document.getElementById("matchAda_0812");
  var verdict_0812 = document.getElementById("verdict_0812");
  var sample_0812 = document.getElementById("sample_0812");
  var resetBtn_0812 = document.getElementById("resetBtn_0812");

  if (!slider_0812 || !stumpTrain_0812 || !residualBars_0812 || !verdict_0812) return;

  function render_0812() {
    var rounds = parseInt(slider_0812.value, 10);
    roundsOut_0812.textContent = String(rounds);

    var nodes = [{ label: "F0 = 0.375", small: "mean of y" }];
    if (rounds >= 1) nodes.push({ label: "Tree 1", small: "x1≤2.5 → F1" });
    if (rounds >= 2) nodes.push({ label: "Tree 2", small: "x1≤3.5 → F2" });
    if (rounds >= 3) nodes.push({ label: "Tree 3", small: "x2≤35 → F3" });
    stumpTrain_0812.innerHTML = nodes.map(function (n, i) {
      var active = i === nodes.length - 1 ? " active" : "";
      return '<div class="diagram-node' + active + '"><b>' + n.label + "</b><small>" + n.small + "</small></div>";
    }).join("");

    var correct = 0;
    var agreeAda = 0;
    residualBars_0812.innerHTML = ROWS_0812.map(function (row) {
      var pred = predictionAt_0812(row, rounds);
      var resid = Y_0812[row] - pred;
      var gbLabel = pred >= 0.5 ? 1 : 0;
      if (gbLabel === Y_0812[row]) correct += 1;
      if (gbLabel === ADA_0812[row]) agreeAda += 1;
      var pct = Math.min(Math.abs(resid) * 100, 100).toFixed(1);
      return (
        '<div class="prob-row"><span>Row ' + row + "</span>" +
        '<div class="bar-track"><div class="bar-fill" style="width:' + pct + '%"></div></div>' +
        "<b>" + pred.toFixed(4) + "</b></div>"
      );
    }).join("");

    trainAcc_0812.textContent = correct + " / 8";
    matchAda_0812.textContent = agreeAda + " / 8";

    verdict_0812.classList.remove("verdict-red", "verdict-amber", "verdict-green");
    if (correct === 8) {
      verdict_0812.classList.add("verdict-green");
      verdict_0812.textContent = "8 of 8 correct -- and matches AdaBoost's own final vote on every row.";
    } else if (correct >= 6) {
      verdict_0812.classList.add("verdict-amber");
      var missed = ROWS_0812.filter(function (r) {
        return (predictionAt_0812(r, rounds) >= 0.5 ? 1 : 0) !== Y_0812[r];
      });
      verdict_0812.textContent = correct + " of 8 correct -- still missing row(s): " + missed.join(", ") + ".";
    } else {
      verdict_0812.classList.add("verdict-red");
      verdict_0812.textContent = correct + " of 8 correct.";
    }

    if (rounds === 0) {
      sample_0812.textContent = "Round 0: flat baseline, F0 = 0.375 for every row -- no decision yet.";
    } else if (rounds === 1) {
      sample_0812.textContent = "Round 1: x1≤2.5 updates F1. 7 of 8 correct, row H still wrong.";
    } else if (rounds === 2) {
      sample_0812.textContent = "Round 2: x1≤3.5 updates F2. Still 7 of 8 -- the miss swapped from H to C, exactly as Concept 08 found. Concept 08 stopped here.";
    } else {
      sample_0812.textContent = "Round 3 (new for this concept): x2≤35 updates F3. 8 of 8 -- and the split (x2≤35) is the identical rule AdaBoost's own round 3 used, on the identical residual-era gap.";
    }
  }

  slider_0812.addEventListener("input", render_0812);
  if (resetBtn_0812) {
    resetBtn_0812.addEventListener("click", function () {
      slider_0812.value = "0";
      render_0812();
    });
  }

  render_0812();
})();
