// Module 09 Concept 02 -- "The perceptron and its limits"
// Lab: The Bias Slider.
//
// The perceptron's own learning rule (w <- w + eta*(y-yhat)*x) converged on the
// shared 8-row CFPB relief table at w=(68,-10,2), b=11 -- see verify/m09c02_worked_case.js.
// DOT_NO_BIAS below is w1*x1 + w2*x2 + w3*x3 for each row, using that exact converged
// weight vector, computed once via node so this file never re-derives a number by hand.
// The lab lets the learner move ONE real parameter the algorithm itself produced --
// the bias it converged to (b=11) -- and recomputes each row's z, step activation, and
// correctness live from that single precomputed dot product plus the slider's value.
(function () {
  var DOT_NO_BIAS = { A: -30, B: -62, C: 54, D: -330, E: 22, F: -464, G: 42, H: -296 };
  var TRUE_Y = { A: 0, B: 0, C: 1, D: 0, E: 1, F: 0, G: 1, H: 0 };
  var CONVERGED_BIAS = 11;
  var ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  function stepActivate(z) { return z >= 0 ? 1 : 0; }

  function init() {
    var slider = document.getElementById('bias_0902');
    var out = document.getElementById('biasOut_0902');
    var accEl = document.getElementById('trainAcc_0902');
    var missEl = document.getElementById('missRows_0902');
    var verdict = document.getElementById('verdict_0902');
    var sample = document.getElementById('sample_0902');
    var resetBtn = document.getElementById('resetBtn_0902');
    if (!slider) return;

    function render() {
      var bias = parseFloat(slider.value, 10);
      out.textContent = bias;
      var correct = 0;
      var wrong = [];
      var lines = [];
      ROWS.forEach(function (row) {
        var z = DOT_NO_BIAS[row] + bias;
        var yhat = stepActivate(z);
        var y = TRUE_Y[row];
        var ok = yhat === y;
        if (ok) correct++; else wrong.push(row);
        var node = document.getElementById('row_0902_' + row);
        if (node) {
          node.classList.toggle('active', ok);
          var small = node.querySelector('small');
          if (small) small.textContent = 'z=' + z.toFixed(1) + ' → ŷ=' + yhat + ' (y=' + y + ')';
        }
        lines.push('row ' + row + ': ' + DOT_NO_BIAS[row] + ' + (' + bias + ') = ' + z.toFixed(1) +
          ' → step = ' + yhat + (ok ? ' [correct]' : ' [WRONG]'));
      });
      accEl.textContent = correct + ' / 8';
      missEl.textContent = wrong.length ? wrong.join(', ') : 'none';
      var atConverged = bias === CONVERGED_BIAS;
      verdict.className = 'gate-verdict ' + (correct === 8 ? 'verdict-green' : (correct >= 6 ? 'verdict-amber' : 'verdict-red'));
      verdict.textContent = correct === 8
        ? (atConverged
          ? 'Bias = 11, the exact value the perceptron’s own learning rule converged to — 8/8, this is the trained model.'
          : 'Bias = ' + bias + ' also reaches 8/8 — the training rows admit more than one separating bias once w1, w2, w3 are fixed.')
        : 'Bias = ' + bias + ' misclassifies ' + wrong.length + ' of 8 rows (' + wrong.join(', ') + ') — moving the bias off the trained value breaks the boundary.';
      sample.textContent = lines.join('\n');
    }

    slider.addEventListener('input', render);
    resetBtn.addEventListener('click', function () {
      slider.value = CONVERGED_BIAS;
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
