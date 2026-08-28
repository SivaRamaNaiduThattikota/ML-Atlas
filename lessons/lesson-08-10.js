// Module 08, Concept 10 -- stacking and blending heterogeneous models.
// Base votes on row H are fixed, node-verified for this lesson's own
// train (A-E) / holdout (F,G,H) split. Only the meta-weights are tunable.

(function () {
  "use strict";

  var BASE_VOTES = { knn: 0, nb: 0, tree: 1 }; // row H, node-verified base-learner predictions
  var ids = ["knn", "nb", "tree"];

  function $(id) {
    return document.getElementById(id);
  }

  function currentWeights() {
    return ids.reduce(function (acc, k) {
      acc[k] = parseFloat($("w_" + k + "_0810").value);
      return acc;
    }, {});
  }

  function syncOutputs() {
    ids.forEach(function (k) {
      $("w_" + k + "_out_0810").textContent = parseFloat($("w_" + k + "_0810").value).toFixed(2);
    });
  }

  function runStack() {
    var w = currentWeights();
    var wsum = ids.reduce(function (s, k) { return s + w[k]; }, 0) || 1;
    var p1 = ids.reduce(function (s, k) { return s + (w[k] / wsum) * BASE_VOTES[k]; }, 0);
    var p0 = 1 - p1;

    $("bar1_0810").style.width = (p1 * 100).toFixed(1) + "%";
    $("bar0_0810").style.width = (p0 * 100).toFixed(1) + "%";
    $("bar1_out_0810").textContent = Math.round(p1 * 100) + "%";
    $("bar0_out_0810").textContent = Math.round(p0 * 100) + "%";

    var predicted = p1 >= 0.5 ? 1 : 0;
    var correct = predicted === 0; // row H truth is 0

    ids.forEach(function (k) {
      $("node_" + k + "_0810").classList.toggle("active", BASE_VOTES[k] === predicted);
    });

    $("stackVerdict_0810").textContent = correct
      ? "Meta-model predicts relief = " + predicted + " -- matches row H's true label. KNN and Naive Bayes already vote correctly here; the meta-model's job is mainly to not be dragged off course by the tree/stump's wrong vote."
      : "Meta-model predicts relief = " + predicted + " -- misses row H, the same failure mode the single tree (Concept 01/04) had on this row.";
  }

  function resetStack() {
    var d = { knn: 0.33, nb: 0.33, tree: 0.34 };
    ids.forEach(function (k) { $("w_" + k + "_0810").value = d[k]; });
    syncOutputs();
    runStack();
  }

  function normalizeStack() {
    var w = currentWeights();
    var s = ids.reduce(function (a, k) { return a + w[k]; }, 0) || 1;
    ids.forEach(function (k) { $("w_" + k + "_0810").value = (w[k] / s).toFixed(2); });
    syncOutputs();
    runStack();
  }

  var runBtn = $("runStack_0810");
  if (!runBtn) return;

  ids.forEach(function (k) {
    $("w_" + k + "_0810").addEventListener("input", syncOutputs);
  });
  runBtn.addEventListener("click", runStack);
  $("resetStack_0810").addEventListener("click", resetStack);
  $("normalizeStack_0810").addEventListener("click", normalizeStack);

  syncOutputs();
  runStack();
})();
