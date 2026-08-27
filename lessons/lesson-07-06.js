// Module 07, Concept 06 -- Support vector machines: margins and kernels
// "The Margin Probe" lab. Reuses M06C06's z/||w|| signed-distance formula
// on a FIXED hyperplane w=(0,1), b=0 -- no vote, no probability, just one
// number (y*f(x)) deciding support-vector / non-support / margin-violator.

(function () {
  "use strict";

  var slider_0706 = document.getElementById("wgProbeY_0706");
  var sliderOut_0706 = document.getElementById("wgProbeYOut_0706");
  var escalateBtn_0706 = document.getElementById("wgProbeEscalate_0706");
  var resolveBtn_0706 = document.getElementById("wgProbeResolve_0706");
  var marker_0706 = document.getElementById("wgProbeMarker_0706");
  var readoutPoint_0706 = document.getElementById("wgProbeReadoutPoint_0706");
  var readoutF_0706 = document.getElementById("wgProbeReadoutF_0706");
  var readoutYF_0706 = document.getElementById("wgProbeReadoutYF_0706");
  var readoutDist_0706 = document.getElementById("wgProbeReadoutDist_0706");
  var verdict_0706 = document.getElementById("wgProbeVerdict_0706");

  if (!slider_0706 || !marker_0706) return;

  var PROBE_X_0706 = 1; // fixed -- avoids overlapping the fixed points' x-columns of 2/3/4
  var ESCALATE_COLOR_0706 = "#ff8a4d";
  var RESOLVE_COLOR_0706 = "#1baf7a";

  // plotY matches the static SVG figure's mapping: plotY(y) = 140 - y*40
  function plotY_0706(y) {
    return 140 - y * 40;
  }

  function currentLabel_0706() {
    return escalateBtn_0706.classList.contains("active") ? 1 : -1;
  }

  function computeAndRender() {
    var y = parseFloat(slider_0706.value);
    sliderOut_0706.textContent = y.toFixed(1);

    var label = currentLabel_0706();
    // w = (0,1), b = 0, so f(x) = w.x + b reduces to the probe's y-coordinate
    var f = y;
    var yf = label * f;
    var dist = Math.abs(f); // ||w|| = 1, so distance to boundary is just |f(x)|

    marker_0706.setAttribute("cy", String(plotY_0706(y)));
    marker_0706.setAttribute("fill", label === 1 ? ESCALATE_COLOR_0706 : RESOLVE_COLOR_0706);

    readoutPoint_0706.textContent = "(" + PROBE_X_0706.toFixed(2) + ", " + y.toFixed(2) + ")";
    readoutF_0706.textContent = f.toFixed(2);
    readoutYF_0706.textContent = yf.toFixed(2);
    readoutDist_0706.textContent = dist.toFixed(2);

    verdict_0706.classList.remove("verdict-green", "verdict-amber", "verdict-red");
    if (Math.abs(yf - 1) < 0.05) {
      verdict_0706.textContent = "Exactly on the margin -- this WOULD be a support vector.";
      verdict_0706.classList.add("verdict-green");
    } else if (yf > 1) {
      verdict_0706.textContent = "Strictly inside the safe zone -- NOT a support vector.";
      verdict_0706.classList.add("verdict-amber");
    } else {
      verdict_0706.textContent = "Violates the margin -- a hard-margin SVM could not place this point here.";
      verdict_0706.classList.add("verdict-red");
    }
  }

  slider_0706.addEventListener("input", computeAndRender);

  escalateBtn_0706.addEventListener("click", function () {
    escalateBtn_0706.classList.add("active");
    resolveBtn_0706.classList.remove("active");
    computeAndRender();
  });

  resolveBtn_0706.addEventListener("click", function () {
    resolveBtn_0706.classList.add("active");
    escalateBtn_0706.classList.remove("active");
    computeAndRender();
  });

  // once on load with default state (y=1.5, Escalate active)
  computeAndRender();

  // -- Beginner-core figure (b06): the margin strip around the 4-point
  // worked example. A=(1,1), D=(0,0) Resolve; B=(3,3), C=(5,2) Escalate.
  // Separate illustration from the lab above -- same module, different data.
  function marginFigureSvg_0706() {
    return (
      '<div class="curve-card"><svg class="curve-svg" viewBox="0 0 240 240" role="img" ' +
      'aria-label="Four points around the boundary line x1 plus x2 equals 4, with two ' +
      'parallel margin lines through the support vectors A and B.">' +
      '<line x1="30" y1="80" x2="170" y2="220" stroke="#101826" stroke-width="2"></line>' +
      '<line x1="30" y1="150" x2="100" y2="220" stroke="#1baf7a" stroke-width="1.5" stroke-dasharray="6 4"></line>' +
      '<line x1="65" y1="45" x2="205" y2="185" stroke="#ff8a4d" stroke-width="1.5" stroke-dasharray="6 4"></line>' +
      '<circle cx="65" cy="185" r="10" fill="none" stroke="#1baf7a" stroke-width="1.5" stroke-dasharray="3 2"></circle>' +
      '<circle cx="135" cy="115" r="10" fill="none" stroke="#ff8a4d" stroke-width="1.5" stroke-dasharray="3 2"></circle>' +
      '<circle cx="30" cy="220" r="6" fill="#1baf7a"></circle>' +
      '<circle cx="65" cy="185" r="6" fill="#1baf7a"></circle>' +
      '<circle cx="135" cy="115" r="6" fill="#ff8a4d"></circle>' +
      '<circle cx="205" cy="150" r="6" fill="#ff8a4d"></circle>' +
      '<text x="30" y="234" font-size="11" text-anchor="middle" fill="#101826">D</text>' +
      '<text x="65" y="173" font-size="11" text-anchor="middle" fill="#101826">A</text>' +
      '<text x="135" y="103" font-size="11" text-anchor="middle" fill="#101826">B</text>' +
      '<text x="205" y="138" font-size="11" text-anchor="middle" fill="#101826">C</text>' +
      '</svg></div>'
    );
  }

  var marginFigure_0706 = document.getElementById("wgMarginFigure_0706");
  if (marginFigure_0706) marginFigure_0706.innerHTML = marginFigureSvg_0706();
})();
