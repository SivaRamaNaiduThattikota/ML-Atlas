// Module 09 Concept 08 -- lab: walk the real 8-row dL/db2 sequence (Concept 07's own
// numbers, rows A-H) through all four update rules live. Every function below is a
// direct port of verify/m09c08_worked_case.js's runSGD/runMomentum/runRMSprop/runAdam --
// nothing here is a new scenario or a hardcoded trace, only the same arithmetic re-run
// client-side as the step slider moves.
(function () {
  var B2_START = -0.9059256417;
  var ROW_IDS = ['A','B','C','D','E','F','G','H'];
  var GRADS = [14.5189024364, 28.3702997098, 19.2692621696, 56.4507491055,
               33.1206594430, 83.2929171229, 40.9699270837, 69.1897499502];
  var LR = 0.001, MOM_BETA = 0.9, RMS_ALPHA = 0.99, RMS_EPS = 1e-8, RMS_LR = 0.01,
      ADAM_B1 = 0.9, ADAM_B2 = 0.999, ADAM_EPS = 1e-8;

  function fmt(x) { return x.toFixed(6); }

  // Recomputes every rule's state from scratch up to step N -- deterministic, so this
  // is cheap and never drifts from a running accumulator across slider moves.
  function computeUpTo(n) {
    var sgd = B2_START, mom = B2_START, v = 0, rms = B2_START, s = 0, adam = B2_START, m = 0, vv = 0;
    for (var i = 0; i < n; i++) {
      var g = GRADS[i], t = i + 1;
      sgd = sgd - LR * g;
      v = MOM_BETA * v + g; mom = mom - LR * v;
      s = RMS_ALPHA * s + (1 - RMS_ALPHA) * g * g; rms = rms - RMS_LR * g / (Math.sqrt(s) + RMS_EPS);
      m = ADAM_B1 * m + (1 - ADAM_B1) * g; vv = ADAM_B2 * vv + (1 - ADAM_B2) * g * g;
      var mhat = m / (1 - Math.pow(ADAM_B1, t)), vhat = vv / (1 - Math.pow(ADAM_B2, t));
      adam = adam - LR * mhat / (Math.sqrt(vhat) + ADAM_EPS);
    }
    return { sgd: sgd, mom: mom, v: v, rms: rms, s: s, adam: adam };
  }

  function init() {
    var slider = document.getElementById('step_0908');
    var out = document.getElementById('stepOut_0908');
    if (!slider) return;
    var rowOut = document.getElementById('rowOut_0908');
    var gradOut = document.getElementById('gradOut_0908');
    var vOut = document.getElementById('vOut_0908');
    var sOut = document.getElementById('sOut_0908');
    var sgdNode = document.getElementById('opt_0908_sgd');
    var momNode = document.getElementById('opt_0908_mom');
    var rmsNode = document.getElementById('opt_0908_rms');
    var adamNode = document.getElementById('opt_0908_adam');
    var verdict = document.getElementById('verdict_0908');
    var sample = document.getElementById('sample_0908');
    var resetBtn = document.getElementById('resetBtn_0908');
    var endBtn = document.getElementById('endBtn_0908');

    function render() {
      var n = parseInt(slider.value, 10);
      out.textContent = n === 0 ? '0 (start)' : n + ' (through row ' + ROW_IDS[n - 1] + ')';
      var r = computeUpTo(n);

      rowOut.textContent = n === 0 ? '–' : 'Row ' + ROW_IDS[n - 1];
      gradOut.textContent = n === 0 ? '–' : fmt(GRADS[n - 1]);
      vOut.textContent = fmt(r.v);
      sOut.textContent = fmt(r.s);

      sgdNode.querySelector('small').textContent = 'b2 = ' + fmt(r.sgd);
      momNode.querySelector('small').textContent = 'b2 = ' + fmt(r.mom) + ', v=' + fmt(r.v);
      rmsNode.querySelector('small').textContent = 'b2 = ' + fmt(r.rms) + ', s=' + fmt(r.s);
      adamNode.querySelector('small').textContent = 'b2 = ' + fmt(r.adam);

      var spread = Math.max(r.sgd, r.mom, r.rms, r.adam) - Math.min(r.sgd, r.mom, r.rms, r.adam);
      verdict.className = 'gate-verdict ' + (n === 0 ? 'verdict-amber' : 'verdict-green');
      verdict.textContent = n === 0
        ? 'All four rules start identical -- they only diverge once a real gradient arrives.'
        : 'After ' + n + ' step' + (n === 1 ? '' : 's') + ', the four rules span ' + fmt(spread) +
          ' in b2 from the SAME gradients and the SAME starting point -- the spread comes entirely from the update rule.';

      sample.textContent =
        'Step ' + n + (n > 0 ? ' (row ' + ROW_IDS[n - 1] + ', g=' + fmt(GRADS[n - 1]) + ')' : '') + '\n' +
        'SGD:      b2 = ' + fmt(r.sgd) + '\n' +
        'Momentum: b2 = ' + fmt(r.mom) + '  (v=' + fmt(r.v) + ')\n' +
        'RMSprop:  b2 = ' + fmt(r.rms) + '  (s=' + fmt(r.s) + ')\n' +
        'Adam:     b2 = ' + fmt(r.adam);
    }

    slider.addEventListener('input', render);
    resetBtn.addEventListener('click', function () { slider.value = 0; render(); });
    endBtn.addEventListener('click', function () { slider.value = 8; render(); });
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
