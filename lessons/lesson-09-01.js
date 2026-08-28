// Module 09 Concept 01 -- "From linear models to a network of them"
// Lab: The Collapse Dial.
//
// H1_0901 and H2_0901 below are the two hidden units' outputs for each of the 8 CFPB
// rows -- H1 = 1.6*x1 - 0.04*x2 - 4.0, H2 = 1.2*x3 -- engineered so that recombining
// them as z = e1*H1 + e2*H2 with e1=0.5, e2=1.0 reproduces Module 08 Concept 12's own
// fitted weights (w0=-2.0, w1=0.8, w2=-0.02, w3=1.2) exactly. See Section 07/08.
// The lab fixes e2 at 1.0 and lets e1 move -- one line through a much larger weight
// space, not a training run. Every value here is precomputed so this file never
// re-derives a number by hand; it only recombines the two fixed hidden values live.
(function () {
  var H1_0901 = { A: -2.8, B: -1.6, C: 0.2, D: -4.0, E: 1.4, F: -3.2, G: 2.8, H: -1.2 };
  var H2_0901 = { A: 1.2, B: 1.2, C: 0.0, D: 1.2, E: 0.0, F: 0.0, G: 1.2, H: 0.0 };
  var TRUE_Y_0901 = { A: 0, B: 0, C: 1, D: 0, E: 1, F: 0, G: 1, H: 0 };
  var ROWS_0901 = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  var E2_0901 = 1.0;
  var ORIGINAL_E1_0901 = 0.5;

  function sigmoid(z) { return 1 / (1 + Math.exp(-z)); }

  function init() {
    var slider = document.getElementById('e1_0901');
    var out = document.getElementById('e1Out_0901');
    var accEl = document.getElementById('trainAcc_0901');
    var missEl = document.getElementById('missRows_0901');
    var verdict = document.getElementById('verdict_0901');
    var sample = document.getElementById('sample_0901');
    var jump05 = document.getElementById('jump05_0901');
    var jump075 = document.getElementById('jump075_0901');
    var jump10 = document.getElementById('jump10_0901');
    if (!slider) return;

    function render() {
      var e1 = parseFloat(slider.value);
      out.textContent = e1.toFixed(2);
      var correct = 0;
      var wrong = [];
      var lines = [];
      ROWS_0901.forEach(function (row) {
        var z = e1 * H1_0901[row] + E2_0901 * H2_0901[row];
        var p = sigmoid(z);
        var yhat = p >= 0.5 ? 1 : 0;
        var y = TRUE_Y_0901[row];
        var ok = yhat === y;
        if (ok) correct++; else wrong.push(row);
        var node = document.getElementById('row_0901_' + row);
        if (node) {
          node.classList.toggle('active', ok);
          var small = node.querySelector('small');
          if (small) small.textContent = 'z=' + z.toFixed(4) + ' → p=' + p.toFixed(4) + ' (y=' + y + ')';
        }
        lines.push('row ' + row + ': z = ' + e1.toFixed(2) + '×' + H1_0901[row] + ' + ' + E2_0901.toFixed(2) + '×' + H2_0901[row] +
          ' = ' + z.toFixed(4) + ' → p=' + p.toFixed(4) + ' → ŷ=' + yhat + (ok ? ' [correct]' : ' [WRONG]'));
      });
      accEl.textContent = correct + ' / 8';
      missEl.textContent = wrong.length ? wrong.join(', ') : 'none';
      verdict.className = 'gate-verdict ' + (correct === 8 ? 'verdict-green' : (correct >= 6 ? 'verdict-amber' : 'verdict-red'));
      if (Math.abs(e1 - ORIGINAL_E1_0901) < 1e-9) {
        verdict.textContent = 'e1 = 0.5, the exact value engineered to reproduce Module 08 Concept 12’s own fitted weights -- 7/8, row B still the one miss.';
      } else if (Math.abs(e1 - 0.75) < 1e-9) {
        verdict.textContent = 'e1 = 0.75 -- row B’s z is exactly 0, p is exactly 0.5. Under a p≥0.5 rule that is still a predicted "relief," which is still wrong. A tie is not a fix.';
      } else if (correct === 8) {
        verdict.textContent = 'e1 = ' + e1.toFixed(2) + ' reaches 8/8 -- but this is one point on one line through the network’s weight space, not evidence the network gained any real capacity.';
      } else {
        verdict.textContent = 'e1 = ' + e1.toFixed(2) + ' misclassifies ' + wrong.length + ' of 8 rows (' + wrong.join(', ') + ').';
      }
      sample.textContent = lines.join('\n');
    }

    slider.addEventListener('input', render);
    if (jump05) jump05.addEventListener('click', function () { slider.value = 0.5; render(); });
    if (jump075) jump075.addEventListener('click', function () { slider.value = 0.75; render(); });
    if (jump10) jump10.addEventListener('click', function () { slider.value = 1.0; render(); });
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
