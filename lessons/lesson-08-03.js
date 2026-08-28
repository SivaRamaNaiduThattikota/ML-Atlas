// Module 08, Concept 03: Bagging -- bootstrap aggregation.
// Drives Section 19's lab, "Bootstrap Draws -> Majority Vote." The lesson's
// worked-example arithmetic (the A-H tie, the three seeded bootstrap draws,
// the divergence table) is presented statically in the lesson text -- this
// script only renders the lab, which uses its OWN separate 8-row set and
// live Math.random() redraws, not the seeded LCG shown in the text.

(function () {
  "use strict";

  // -- Hash-sync boilerplate, same convention as the rest of this module. --
  var advancedLesson0803 = document.querySelector("#advanced-lesson");
  function syncAdvancedTarget0803() {
    if (!advancedLesson0803) return;
    advancedLesson0803.open =
      location.hash === "#advanced-lesson" ||
      /^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash);
  }
  addEventListener("hashchange", syncAdvancedTarget0803);
  syncAdvancedTarget0803();

  // -- The lab's own 8-row set: 3 relief (1), 5 no-relief (0). --
  var BAG_LABELS_0803 = [1, 0, 0, 1, 0, 0, 1, 0];
  var BAG_N_0803 = 8;
  var TRUE_MAJORITY_0803 = 0; // 5 of 8 rows are label 0

  function freshDraw_0803() {
    var draw = [];
    for (var i = 0; i < BAG_N_0803; i++) {
      draw.push(Math.floor(Math.random() * BAG_N_0803));
    }
    return draw;
  }

  function identityDraw_0803() {
    var draw = [];
    for (var i = 0; i < BAG_N_0803; i++) draw.push(i);
    return draw;
  }

  // Three bags, initialized to "no resampling" -- Reset and first load both
  // land here, so the starting state trivially matches a single model.
  var bags_0803 = [identityDraw_0803(), identityDraw_0803(), identityDraw_0803()];

  function bagPrediction_0803(draw) {
    var ones = 0;
    draw.forEach(function (idx) { if (BAG_LABELS_0803[idx] === 1) ones++; });
    return ones > draw.length / 2 ? 1 : 0;
  }

  function byId(id) { return document.getElementById(id); }

  function renderBagGrid_0803(gridEl, draw) {
    if (!gridEl) return;
    var counts = new Array(BAG_N_0803).fill(0);
    draw.forEach(function (idx) { counts[idx]++; });
    var html = "";
    for (var r = 0; r < BAG_N_0803; r++) {
      var isRelief = BAG_LABELS_0803[r] === 1;
      var kind = isRelief ? "acc-pos" : "acc-neg";
      var count = counts[r];
      // Draw-count classes reused semantically, NOT as correctness -- see
      // Section 20's mechanics writeup and every cell's own title/aria-label.
      var state = count === 0 ? "" : count === 1 ? "acc-correct" : "acc-wrong";
      var relief = isRelief ? "relief" : "no relief";
      var label = "Row " + (r + 1) + " (" + relief + "), drawn " + count + "x";
      html += '<div class="acc-cell ' + kind + " " + state + '" title="' + label +
        '" aria-label="' + label + '">R' + (r + 1) + "&middot;" + count + "</div>";
    }
    gridEl.innerHTML = html;
  }

  function renderBagging_0803() {
    var grids = [byId("baggingGrid1_0803"), byId("baggingGrid2_0803"), byId("baggingGrid3_0803")];
    grids.forEach(function (el, i) { renderBagGrid_0803(el, bags_0803[i]); });

    var predictions = bags_0803.map(bagPrediction_0803);

    var family = byId("baggingFamily_0803");
    if (family) {
      family.innerHTML = predictions.map(function (pred, i) {
        var draw = bags_0803[i];
        var ones = draw.filter(function (idx) { return BAG_LABELS_0803[idx] === 1; }).length;
        var zeros = draw.length - ones;
        return '<div class="diagram-node"><b>Bag ' + (i + 1) + "</b><small>" + zeros +
          " no-relief votes, " + ones + " relief votes<br>predicts " +
          (pred === 1 ? "RELIEF" : "NO RELIEF") + "</small></div>";
      }).join("");
    }

    var ensembleOnes = predictions.filter(function (p) { return p === 1; }).length;
    var ensemble = ensembleOnes > 1.5 ? 1 : 0; // 3 bags, no ties possible
    var flipped = predictions.filter(function (p) { return p !== TRUE_MAJORITY_0803; }).length;

    var hub = byId("baggingHub_0803");
    if (hub) {
      hub.innerHTML =
        predictions.slice(0, 1).map(function (pred) {
          return '<div class="diagram-node"><b>Bag 1</b><small>predicts ' +
            (pred === 1 ? "RELIEF" : "NO RELIEF") + "</small></div>";
        }).join("") +
        '<div class="diagram-node hub-center"><b>Ensemble</b><small>predicts ' +
          (ensemble === 1 ? "RELIEF" : "NO RELIEF") + "</small></div>" +
        predictions.slice(1).map(function (pred, i) {
          return '<div class="diagram-node"><b>Bag ' + (i + 2) + "</b><small>predicts " +
            (pred === 1 ? "RELIEF" : "NO RELIEF") + "</small></div>";
        }).join("");
    }

    var readout = byId("baggingReadout_0803");
    if (readout) {
      readout.innerHTML =
        "<div><span>TRUE MAJORITY (ALL 8 ROWS)</span><b>NO RELIEF (5 of 8)</b></div>" +
        "<div><span>INDIVIDUAL BAGS THAT FLIPPED</span><b>" + flipped + " of 3</b></div>" +
        "<div><span>ENSEMBLE PREDICTION</span><b>" + (ensemble === 1 ? "RELIEF" : "NO RELIEF") + "</b></div>";
    }

    var verdict = byId("baggingVerdict_0803");
    if (verdict) {
      var matches = ensemble === TRUE_MAJORITY_0803;
      var cls, msg;
      if (matches && flipped === 0) {
        cls = "verdict-green";
        msg = "All 3 bags agree -- no resampling noise showed up on this draw.";
      } else if (matches && flipped > 0) {
        cls = "verdict-green";
        msg = flipped + " of 3 bags flipped on their own, but the vote across all 3 still landed on the correct majority -- that's the variance-reduction payoff.";
      } else if (flipped >= 2) {
        cls = "verdict-red";
        msg = "The vote itself flipped this time (" + flipped + " of 3 disagreed) -- with only 3 bags an unlucky draw can still tip the ensemble; more bags shrink how often this happens, it doesn't make it impossible.";
      } else {
        cls = "verdict-amber";
        msg = "The vote itself flipped this time (" + flipped + " of 3 disagreed) -- with only 3 bags an unlucky draw can still tip the ensemble; more bags shrink how often this happens, it doesn't make it impossible.";
      }
      verdict.className = "gate-verdict " + cls;
      verdict.textContent = msg;
    }
  }

  function init() {
    var drawBtn = byId("baggingDrawBtn_0803");
    var resetBtn = byId("baggingResetBtn_0803");
    if (!drawBtn && !resetBtn) return;

    if (drawBtn) {
      drawBtn.addEventListener("click", function () {
        bags_0803 = [freshDraw_0803(), freshDraw_0803(), freshDraw_0803()];
        renderBagging_0803();
      });
    }
    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        bags_0803 = [identityDraw_0803(), identityDraw_0803(), identityDraw_0803()];
        renderBagging_0803();
      });
    }

    renderBagging_0803();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
