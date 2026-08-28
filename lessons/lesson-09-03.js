// Module 09 Concept 03 -- "The multilayer perceptron -- architecture"
// Lab: the hidden-layer-width slider.
//
// Fixed: input layer = 3 (the CFPB table's x1,x2,x3, same features Concept 02's
// perceptron used), output layer = 1. The slider moves ONE real parameter this
// concept's own worked example computed: H, the hidden layer's width. Every count
// below is 3H / H / H / 1, node-verified against direct matrix counting for
// H=1..12 in verify/m09c03_worked_case.js (formula 5H+1).
(function () {
  var INPUT_SIZE = 3;
  var OUTPUT_SIZE = 1;
  var BASELINE_TOTAL = 4; // Concept 02's single perceptron: 3 weights + 1 bias

  function init() {
    var slider = document.getElementById('hidden_0903');
    var out = document.getElementById('hiddenOut_0903');
    var hiddenNode = document.getElementById('hiddenNode_0903');
    var w1ShapeEl = document.getElementById('w1Shape_0903');
    var w1CountEl = document.getElementById('w1Count_0903');
    var b1CountEl = document.getElementById('b1Count_0903');
    var w2ShapeEl = document.getElementById('w2Shape_0903');
    var w2CountEl = document.getElementById('w2Count_0903');
    var b2CountEl = document.getElementById('b2Count_0903');
    var totalEl = document.getElementById('totalParams_0903');
    var vsBaselineEl = document.getElementById('vsBaseline_0903');
    var verdict = document.getElementById('verdict_0903');
    var sample = document.getElementById('sample_0903');
    var resetBtn = document.getElementById('resetBtn_0903');
    if (!slider) return;

    function render() {
      var H = parseInt(slider.value, 10);
      out.textContent = H;
      var w1Count = INPUT_SIZE * H;
      var b1Count = H;
      var w2Count = H * OUTPUT_SIZE;
      var b2Count = OUTPUT_SIZE;
      var total = w1Count + b1Count + w2Count + b2Count; // == 5H + 1

      var small = hiddenNode.querySelector('small');
      if (small) small.textContent = H + ' unit' + (H === 1 ? '' : 's');

      w1ShapeEl.textContent = H + '×' + INPUT_SIZE;
      w1CountEl.textContent = w1Count;
      b1CountEl.textContent = b1Count;
      w2ShapeEl.textContent = OUTPUT_SIZE + '×' + H;
      w2CountEl.textContent = w2Count;
      b2CountEl.textContent = b2Count;
      totalEl.textContent = total;
      var diff = total - BASELINE_TOTAL;
      vsBaselineEl.textContent = '+' + diff;

      var note = '';
      if (H === 4) note = ' -- exactly this concept’s own worked example (Section 11): 21 parameters.';
      else if (H === 10) note = ' -- the width path from Section 14: 51 parameters, 10 more than the depth path’s 41.';

      verdict.className = 'gate-verdict verdict-green';
      verdict.textContent = 'H=' + H + ' → ' + total + ' total parameters (' + diff +
        ' more than Concept 02’s single perceptron’s 4)' + note;

      sample.textContent =
        'W1: ' + H + '×' + INPUT_SIZE + ' = ' + w1Count + ' weights\n' +
        'b1: ' + b1Count + ' biases\n' +
        'W2: ' + OUTPUT_SIZE + '×' + H + ' = ' + w2Count + ' weights\n' +
        'b2: ' + b2Count + ' bias\n' +
        'Total: ' + total + ' parameters (formula 5H+1, node-verified for H=1..12 in verify/m09c03_worked_case.js)';
    }

    slider.addEventListener('input', render);
    resetBtn.addEventListener('click', function () {
      slider.value = 4;
      render();
    });
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
