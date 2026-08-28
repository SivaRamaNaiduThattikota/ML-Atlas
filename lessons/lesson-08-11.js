// Module 08, Concept 11 -- Hyperparameters that matter most.
// Lab drives a real, node-verified 4x3 grid: max_depth in {1,2,3,4} times
// min_samples_split in {2,4,6}, exhaustive-threshold Gini stump/tree search
// on the same 8-row CFPB relief table this module has reused since Concept
// 03. No accuracy number here is interpolated or guessed -- every cell in
// the grid was computed by the same tree-building code and checked by hand
// against the split C02 already worked out.

(function () {
  "use strict";

  // grid[maxDepth][minSamplesSplit] = train correct out of 8
  var GRID_0811 = {
    1: { 2: 7, 4: 7, 6: 7 },
    2: { 2: 8, 4: 8, 6: 7 },
    3: { 2: 8, 4: 8, 6: 7 },
    4: { 2: 8, 4: 8, 6: 7 }
  };

  var depthSlider_0811 = document.getElementById("depth_0811");
  var depthOut_0811 = document.getElementById("depthOut_0811");
  var minSplitSlider_0811 = document.getElementById("minSplit_0811");
  var minSplitOut_0811 = document.getElementById("minSplitOut_0811");
  var accReadout_0811 = document.getElementById("trainAcc_0811");
  var gridView_0811 = document.getElementById("gridView_0811");
  var verdict_0811 = document.getElementById("verdict_0811");
  var sample_0811 = document.getElementById("sample_0811");
  var resetBtn_0811 = document.getElementById("resetBtn_0811");

  if (!depthSlider_0811 || !minSplitSlider_0811 || !gridView_0811 || !verdict_0811) return;

  var MIN_SPLIT_STEPS_0811 = [2, 4, 6];

  function render_0811() {
    var depth = parseInt(depthSlider_0811.value, 10);
    var minSplitIdx = parseInt(minSplitSlider_0811.value, 10);
    var minSplit = MIN_SPLIT_STEPS_0811[minSplitIdx];
    depthOut_0811.textContent = String(depth);
    minSplitOut_0811.textContent = String(minSplit);

    var correct = GRID_0811[depth][minSplit];
    accReadout_0811.textContent = correct + " / 8";

    gridView_0811.innerHTML = [1, 2, 3, 4].map(function (d) {
      var cells = MIN_SPLIT_STEPS_0811.map(function (ms) {
        var active = (d === depth && ms === minSplit) ? " active" : "";
        return '<div class="diagram-node' + active + '"><b>' + GRID_0811[d][ms] + '/8</b><small>depth ' + d + ', split&ge;' + ms + '</small></div>';
      }).join("");
      return cells;
    }).join("");

    verdict_0811.classList.remove("verdict-red", "verdict-amber", "verdict-green");
    if (correct === 8) {
      verdict_0811.classList.add("verdict-green");
      verdict_0811.textContent = "8 of 8 -- this combination reaches the ceiling this table allows.";
    } else {
      verdict_0811.classList.add("verdict-amber");
      verdict_0811.textContent = correct + " of 8 -- capped, not by depth alone.";
    }

    if (depth === 1) {
      sample_0811.textContent = "max_depth=1 caps every combination at 7/8, no matter what min_samples_split does -- a single stump cannot separate this table regardless of regularization.";
    } else if (minSplit === 6) {
      sample_0811.textContent = "min_samples_split=6 caps every depth at 7/8 -- past depth 2, MORE depth buys nothing once the regularization knob is this strict.";
    } else {
      sample_0811.textContent = "depth>=2 with min_samples_split<=4 reaches 8/8 -- the two knobs that matter here are depth clearing 1, and min_samples_split staying under 6.";
    }
  }

  depthSlider_0811.addEventListener("input", render_0811);
  minSplitSlider_0811.addEventListener("input", render_0811);
  if (resetBtn_0811) {
    resetBtn_0811.addEventListener("click", function () {
      depthSlider_0811.value = "1";
      minSplitSlider_0811.value = "0";
      render_0811();
    });
  }

  render_0811();
})();
