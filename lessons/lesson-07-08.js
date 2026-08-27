// Module 07, Concept 08 -- Complexity versus interpretability tradeoffs
// "The Complexity Dial" lab. Drags a kernel SVM's own support-vector count
// (n_sv, 1-4, matching this module's shared 4-point/d=2 convention) and
// recomputes, live, exactly how many raw numbers that model would need to
// keep forever -- sklearn's own documented attribute shapes for dual_coef_,
// support_vectors_ and intercept_, nothing invented. Fixed reference counts
// (KNN=8, Naive Bayes=7, Linear SVM=3) never move; only the kernel SVM
// column and readout respond to the slider.

(function () {
  "use strict";

  var slider_0708 = document.getElementById("complexityDial_0708");
  var sliderOut_0708 = document.getElementById("complexityDialOut_0708");
  var readout_0708 = document.getElementById("complexityReadout_0708");
  var verdict_0708 = document.getElementById("complexityVerdict_0708");
  var towerNoise_0708 = document.getElementById("towerKSVM_noise_0708");
  var towerBias_0708 = document.getElementById("towerKSVM_bias_0708");
  var towerVariance_0708 = document.getElementById("towerKSVM_variance_0708");
  var towerLabel_0708 = document.getElementById("towerKSVM_label_0708");

  if (!slider_0708 || !readout_0708) return;

  var D_0708 = 2;   // this module's shared feature-count convention, x1/x2
  var MAX_SCALE_0708 = 13; // n_sv=4 worst case -- the fixed ceiling every bar is drawn against

  // Fixed baselines this concept already derived by hand elsewhere:
  var KNN_STORED_0708 = 8;      // Concept 02's own N=4, d=2 toy set: N*d
  var NB_FITTED_0708 = 7;       // Concept 03's own d=3,K=2 count, reused as-is
  var SVM_FITTED_0708 = 3;      // Concept 06's own w=(0.5,0.5), b=-2

  function pct_0708(numerator) {
    return (numerator / MAX_SCALE_0708 * 100).toFixed(1) + "%";
  }

  function computeAndRender_0708() {
    var nSv = parseInt(slider_0708.value, 10);
    sliderOut_0708.textContent = String(nSv);

    // sklearn SVC's own documented attribute shapes, applied literally:
    //   support_vectors_ : (n_SV, n_features) -> n_SV * d numbers
    //   dual_coef_        : (n_classes-1, n_SV) -> n_SV numbers (K=2 case)
    //   intercept_        : (n_classes*(n_classes-1)/2,) -> 1 number (K=2 case)
    var svCoords = nSv * D_0708;
    var dualCoeffs = nSv;
    var intercept = 1;
    var total = svCoords + dualCoeffs + intercept;

    readout_0708.innerHTML =
      "<div><span>SUPPORT VECTORS KEPT</span><b>" + nSv + "</b></div>" +
      "<div><span>SUPPORT-VECTOR COORDINATES</span><b>" + svCoords + " (n_sv × d)</b></div>" +
      "<div><span>DUAL COEFFICIENTS</span><b>" + dualCoeffs + " (n_sv)</b></div>" +
      "<div><span>INTERCEPT</span><b>1</b></div>" +
      "<div><span>TOTAL NUMBERS KEPT FOREVER</span><b>" + total + "</b></div>";

    if (towerNoise_0708) {
      towerNoise_0708.style.height = pct_0708(svCoords);
      towerBias_0708.style.height = pct_0708(intercept);
      towerVariance_0708.style.height = pct_0708(dualCoeffs);
      towerLabel_0708.textContent = "Kernel SVM, n_sv=" + nSv + " (" + total + " total)";
    }

    verdict_0708.classList.remove("verdict-green", "verdict-amber", "verdict-red");
    if (total < NB_FITTED_0708) {
      verdict_0708.textContent =
        "Still more compact than Naive Bayes (" + NB_FITTED_0708 + ") and cheaper than KNN's raw storage (" + KNN_STORED_0708 + ").";
      verdict_0708.classList.add("verdict-green");
    } else if (total === NB_FITTED_0708) {
      verdict_0708.textContent =
        "Ties Naive Bayes exactly at " + NB_FITTED_0708 + " numbers -- no longer the clearly most compact option.";
      verdict_0708.classList.add("verdict-amber");
    } else {
      verdict_0708.textContent =
        "Now costs MORE than simply storing the raw training set outright (" + KNN_STORED_0708 + ") -- the compactness advantage is gone.";
      verdict_0708.classList.add("verdict-red");
    }
  }

  slider_0708.addEventListener("input", computeAndRender_0708);

  // once on load with the default state (n_sv=1)
  computeAndRender_0708();
})();
