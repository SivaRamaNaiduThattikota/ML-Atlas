// Module 07, Concept 09 -- When these models still win
// "The Regime Dial" lab. Drags the dataset size N (1-8) and recomputes,
// live, the same storage-cost formulas Concepts 01-02/06/08 already
// published for KNN (N*d) and a worst-case kernel SVM (n_sv=N, every
// point kept as a support vector -- Concept 07's own real outcome).
// Naive Bayes (7, Concept 03) and linear SVM (3, Concept 06) never move --
// they cost the same regardless of how large the training set grows.
// Nothing here is a new benchmark; every number is the same formula this
// module already verified, just swept over N instead of held at N=4.

(function () {
  "use strict";

  var slider_0709 = document.getElementById("regimeDial_0709");
  var sliderOut_0709 = document.getElementById("regimeDialOut_0709");
  var readout_0709 = document.getElementById("regimeReadout_0709");
  var verdict_0709 = document.getElementById("regimeVerdict_0709");
  var towerKNN_0709 = document.getElementById("towerKNN_0709");
  var towerKNNLabel_0709 = document.getElementById("towerKNNLabel_0709");
  var towerKernel_0709 = document.getElementById("towerKernel_0709");
  var towerKernelLabel_0709 = document.getElementById("towerKernelLabel_0709");

  if (!slider_0709 || !readout_0709) return;

  var D_0709 = 2;         // module's shared feature-count convention, x1/x2
  var N_MAX_0709 = 8;     // slider ceiling
  var CEILING_0709 = N_MAX_0709 * (D_0709 + 1) + 1; // kernel-worst at N=8 -> 25, the tallest bar possible in range

  // Fixed baselines, reused exactly as this module already published them:
  var NB_FIXED_0709 = 7;       // Concept 03's own d=3,K=2 count
  var SVM_FIXED_0709 = D_0709 + 1; // Concept 06's w=(0.5,0.5), b=-2 -> 3

  function pct_0709(numerator) {
    return (numerator / CEILING_0709 * 100).toFixed(1) + "%";
  }

  function computeAndRender_0709() {
    var N = parseInt(slider_0709.value, 10);
    sliderOut_0709.textContent = String(N);

    var knn = N * D_0709;                 // Concepts 01-02/08: N*d raw numbers, forever
    var kernelWorst = N * (D_0709 + 1) + 1; // n_sv=N worst case, Concept 07's own demonstrated outcome

    readout_0709.innerHTML =
      "<div><span>DATASET SIZE (N)</span><b>" + N + "</b></div>" +
      "<div><span>KNN -- STORED FOREVER</span><b>" + knn + " (N × d)</b></div>" +
      "<div><span>NAIVE BAYES -- FIXED</span><b>" + NB_FIXED_0709 + "</b></div>" +
      "<div><span>LINEAR SVM -- FIXED</span><b>" + SVM_FIXED_0709 + "</b></div>" +
      "<div><span>KERNEL SVM -- WORST CASE</span><b>" + kernelWorst + " (n_sv = N)</b></div>";

    if (towerKNN_0709) {
      towerKNN_0709.style.height = pct_0709(knn);
      towerKNNLabel_0709.textContent = "KNN, N=" + N + " (" + knn + " stored)";
    }
    if (towerKernel_0709) {
      towerKernel_0709.style.height = pct_0709(kernelWorst);
      towerKernelLabel_0709.textContent = "Kernel SVM, worst case (" + kernelWorst + " total)";
    }

    verdict_0709.classList.remove("verdict-green", "verdict-amber", "verdict-red");
    if (knn < SVM_FIXED_0709) {
      verdict_0709.textContent =
        "N=" + N + ": KNN is still the cheapest of the four to store (" + knn + " numbers) -- too little data for a fitted model's fixed cost to pay off yet.";
      verdict_0709.classList.add("verdict-green");
    } else if (knn < NB_FIXED_0709) {
      verdict_0709.textContent =
        "N=" + N + ": linear SVM's fixed 3 is now the cheapest option, but KNN (" + knn + ") still beats Naive Bayes' fixed 7 -- the crossover against Naive Bayes hasn't happened yet.";
      verdict_0709.classList.add("verdict-amber");
    } else {
      verdict_0709.textContent =
        "N=" + N + ": KNN (" + knn + ") now costs more than Naive Bayes' fixed 7 too -- both fitted models (Naive Bayes, linear SVM) are cheaper than storing the raw data outright, and the kernel-SVM worst case (" + kernelWorst + ") is the priciest of all.";
      verdict_0709.classList.add("verdict-red");
    }
  }

  slider_0709.addEventListener("input", computeAndRender_0709);

  // once on load with the default state (N=1)
  computeAndRender_0709();
})();
