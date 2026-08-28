// Module 08, Concept 09 -- XGBoost vs LightGBM.
// Lab caps at exactly the three (lambda, gamma) settings node-verified in
// m08c09_xgb_lgbm_verify.js. No interpolation between them is invented --
// only those three configurations report a real gain number.

(function () {
  "use strict";

  var SETTINGS_0809 = {
    "0": {
      label: "lambda=0, gamma=0",
      note: "Unregularized -- collapses to the same plain SSE-reduction gain Concept 08 used.",
      rows: [
        { split: "x1<=2.5", gain: 0.219727, kept: true },
        { split: "x1<=3.5", gain: 0.203451, kept: true },
        { split: "x2<=35", gain: 0.131836, kept: true },
      ],
    },
    "1": {
      label: "lambda=1, gamma=0",
      note: "XGBoost-style L2 leaf-weight penalty shrinks every gain, but the ranking of candidate splits is unchanged.",
      rows: [
        { split: "x1<=2.5", gain: 0.175000, kept: true },
        { split: "x1<=3.5", gain: 0.137649, kept: true },
        { split: "x2<=35", gain: 0.104980, kept: true },
      ],
    },
    "2": {
      label: "lambda=1, gamma=0.15",
      note: "Adding gamma prunes every split whose gain can't clear the threshold -- only the root split survives.",
      rows: [
        { split: "x1<=2.5", gain: 0.025000, kept: true },
        { split: "x1<=3.5", gain: -0.012351, kept: false },
        { split: "x2<=35", gain: -0.045020, kept: false },
      ],
    },
  };

  var slider = document.getElementById("regSetting_0809");
  var out = document.getElementById("regSettingOut_0809");
  var table = document.getElementById("gainTable_0809");
  var verdict = document.getElementById("verdict_0809");
  var sample = document.getElementById("sample_0809");
  var resetBtn = document.getElementById("resetBtn_0809");

  if (!slider || !table || !verdict) return;

  function render() {
    var key = slider.value;
    var s = SETTINGS_0809[key];
    out.textContent = s.label;

    table.innerHTML = s.rows.map(function (r) {
      var cls = r.kept ? "" : " style=\"opacity:.5;text-decoration:line-through\"";
      return (
        '<div class="prob-row"' + cls + "><span>" + r.split + "</span>" +
        '<div class="bar-track"><div class="bar-fill" style="width:' + Math.min(Math.abs(r.gain) * 300, 100).toFixed(1) + '%"></div></div>' +
        "<b>" + r.gain.toFixed(6) + "</b></div>"
      );
    }).join("");

    var survivors = s.rows.filter(function (r) { return r.kept; }).length;
    verdict.classList.remove("verdict-red", "verdict-amber", "verdict-green");
    if (key === "2") {
      verdict.classList.add("verdict-amber");
      verdict.textContent = survivors + " of 3 candidate splits survive gamma pruning -- only the root split, x1<=2.5.";
    } else {
      verdict.classList.add("verdict-green");
      verdict.textContent = "All " + survivors + " candidate splits keep positive gain; ranking matches Concept 08's own unregularized search.";
    }
    sample.textContent = s.note;
  }

  slider.addEventListener("input", render);
  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      slider.value = "0";
      render();
    });
  }

  render();
})();
