// Module 07, Concept 07 -- The kernel trick, conceptually
// "The Lift Toggle" lab. Same 4-point dataset used throughout this lesson --
// R1=(1,0), R2=(-1,0) resolve; E1=(0,4), E2=(0,-4) escalate -- flat and
// not linearly separable in 2D. Toggling "Lifted" adds the one extra
// coordinate z=x1^2+x2^2 as height on the same cube-floor widget and shows
// the flat plane z=8.5 that separates the two classes cleanly.

(function () {
  "use strict";

  var flatBtn_0707 = document.getElementById("wgLiftFlatBtn_0707");
  var liftBtn_0707 = document.getElementById("wgLiftLiftBtn_0707");
  var boundary_0707 = document.getElementById("wgLiftBoundary_0707");
  var label_0707 = document.getElementById("wgLiftFloorLabel_0707");
  var verdict_0707 = document.getElementById("wgLiftVerdict_0707");
  var readout_0707 = document.getElementById("wgLiftReadout_0707");

  if (!flatBtn_0707 || !liftBtn_0707) return;

  var reduceMotion_0707 = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Same four points used in every worked table in this lesson.
  var POINTS_0707 = [
    { name: "R1", x1: 1, x2: 0, y: -1, cls: "resolve" },
    { name: "R2", x1: -1, x2: 0, y: -1, cls: "resolve" },
    { name: "E1", x1: 0, x2: 4, y: 1, cls: "escalate" },
    { name: "E2", x1: 0, x2: -4, y: 1, cls: "escalate" },
  ];

  // Height scale: pixels of translateZ per unit of z = x1^2+x2^2.
  var HEIGHT_SCALE_0707 = 3;
  var BOUNDARY_Z_0707 = 8.5; // midpoint between max(Resolve z)=1 and min(Escalate z)=16

  POINTS_0707.forEach(function (pt) {
    pt.z = pt.x1 * pt.x1 + pt.x2 * pt.x2;
    pt.el = document.getElementById("wgLiftDot_0707_" + pt.name);
    if (pt.el && !reduceMotion_0707) pt.el.style.transition = "transform .3s ease";
  });

  function renderReadout_0707() {
    if (!readout_0707) return;
    readout_0707.innerHTML = POINTS_0707.map(function (pt) {
      return (
        "<div><span>" + pt.name + " (x1,x2)</span><b>(" + pt.x1 + ", " + pt.x2 + ")</b></div>"
      );
    }).join("") + POINTS_0707.map(function (pt) {
      return "<div><span>" + pt.name + " z=x1²+x2²</span><b>" + pt.z.toFixed(2) + "</b></div>";
    }).join("");
  }

  function setLifted_0707(lifted) {
    liftBtn_0707.classList.toggle("active", lifted);
    flatBtn_0707.classList.toggle("active", !lifted);
    liftBtn_0707.classList.toggle("secondary", !lifted);
    flatBtn_0707.classList.toggle("secondary", lifted);

    POINTS_0707.forEach(function (pt) {
      if (!pt.el) return;
      var tz = lifted ? pt.z * HEIGHT_SCALE_0707 : 0;
      pt.el.style.transform = "translateZ(" + tz.toFixed(1) + "px)";
    });

    if (boundary_0707) {
      boundary_0707.hidden = !lifted;
      if (lifted) boundary_0707.style.transform = "translateZ(" + (BOUNDARY_Z_0707 * HEIGHT_SCALE_0707).toFixed(1) + "px)";
    }

    if (label_0707) {
      label_0707.textContent = lifted ? "LIFTED -- z = x1²+x2² ADDED AS HEIGHT" : "FLAT -- ORIGINAL (x1, x2) ONLY";
    }

    if (verdict_0707) {
      verdict_0707.classList.remove("verdict-green", "verdict-red");
      if (lifted) {
        verdict_0707.textContent = "Separated: every Resolve point sits at z=1, every Escalate point at z=16. The flat plane z=8.5 splits them with margin 7.500 -- and by symmetry, all four points touch it.";
        verdict_0707.classList.add("verdict-green");
      } else {
        verdict_0707.textContent = "Not separated: R1/R2 and E1/E2 sit on segments that cross at the origin -- no straight line in this view can put Resolve on one side and Escalate on the other.";
        verdict_0707.classList.add("verdict-red");
      }
    }
  }

  flatBtn_0707.addEventListener("click", function () { setLifted_0707(false); });
  liftBtn_0707.addEventListener("click", function () { setLifted_0707(true); });

  renderReadout_0707();
  setLifted_0707(false);
})();
