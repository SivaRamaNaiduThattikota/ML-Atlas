// Module 09 Concept 05 -- "Weight initialization and the vanishing/exploding gradient problem"
// Lab: the scheme switcher.
//
// All five matrices below are copied verbatim from this concept's own node run of
// verify/m09c05_worked_case.js (seeded LCG+Box-Muller -- see that file for the PRNG).
// This lab does not re-randomize anything; it only re-runs the real forward pass and
// the real variance/derivative math on top of those fixed matrices, live, per scheme.
(function () {
  var X_STD = [
    [-1.233905, -1.300022, 1.000000], [-0.474579, -0.688247, 1.000000],
    [ 0.284747, -0.994135, -1.000000], [-1.233905, 0.535303, 1.000000],
    [ 1.044074, -0.382360, -1.000000], [-0.474579, 1.758854, -1.000000],
    [ 1.803400, -0.076472, 1.000000], [ 0.284747, 1.147079, -1.000000]
  ];
  var ROW_IDS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  var THRESHOLD = 0.01;

  var SCHEMES = {
    zero: {
      label: 'Zero init', activation: 'tanh',
      W1: [[0,0,0],[0,0,0],[0,0,0],[0,0,0]], b1: [0,0,0,0],
      W2: [[0,0,0,0]], b2: [0]
    },
    naiveLarge: {
      label: 'Naive, std=10', activation: 'tanh',
      W1: [[-21.3395,12.1725,11.3206],[-6.2881,0.3471,15.3627],[2.4222,11.5851,3.0110],[0.2962,-6.6841,4.9571]],
      b1: [0,0,0,0], W2: [[8.2158,11.1524,-7.9250,7.6469]], b2: [0]
    },
    naiveSmall: {
      label: 'Naive, std=0.01', activation: 'tanh',
      W1: [[-0.022000,0.001680,-0.003271],[-0.003109,0.003061,0.000338],[0.005007,-0.008779,0.000405],[-0.006155,0.016355,-0.015425]],
      b1: [0,0,0,0], W2: [[-0.011223,0.020200,0.013905,-0.001106]], b2: [0]
    },
    xavier: {
      label: 'Xavier/Glorot', activation: 'tanh',
      W1: [[-1.0151,-0.3890,-0.3301],[0.6730,0.1296,-0.5242],[-0.4241,0.1444,-0.4528],[-0.0151,-0.4319,0.5163]],
      b1: [0,0,0,0], W2: [[-0.4723,-0.0371,-0.9157,-0.6383]], b2: [0]
    },
    he: {
      label: 'He/Kaiming', activation: 'relu',
      W1: [[-1.0704,-1.1203,0.4687],[0.0719,-1.2707,-0.5000],[0.4925,0.2061,-0.0008],[0.8660,0.2769,-0.4240]],
      b1: [0,0,0,0], W2: [[-0.3104,-0.8493,0.4792,1.7058]], b2: [0]
    }
  };

  function tanhFn(z) { return Math.tanh(z); }
  function dtanh(z) { var t = tanhFn(z); return 1 - t * t; }
  function relu(z) { return Math.max(0, z); }
  function drelu(z) { return z > 0 ? 1 : 0; }
  function activate(name, z) { return name === 'relu' ? relu(z) : tanhFn(z); }
  function deriv(name, z) { return name === 'relu' ? drelu(z) : dtanh(z); }

  function mean(a) { return a.reduce(function (s, v) { return s + v; }, 0) / a.length; }
  function variance(a) { var m = mean(a); return mean(a.map(function (v) { return (v - m) * (v - m); })); }

  function matVec(W, x) {
    return W.map(function (row) {
      return row.reduce(function (s, w, j) { return s + w * x[j]; }, 0);
    });
  }
  function addVec(a, b) { return a.map(function (v, i) { return v + b[i]; }); }

  function fmt(x) {
    var ax = Math.abs(x);
    if (ax !== 0 && ax < 1e-4) return x.toExponential(2);
    return x.toFixed(4);
  }

  function init() {
    var controls = document.getElementById('schemeControls_0905');
    if (!controls) return;
    var varZ1El = document.getElementById('varZ1_0905');
    var varZ2El = document.getElementById('varZ2_0905');
    var ratioEl = document.getElementById('ratio_0905');
    var tallyEl = document.getElementById('tally_0905');
    var verdict = document.getElementById('verdict_0905');
    var sample = document.getElementById('sample_0905');

    function render(key) {
      var s = SCHEMES[key];
      var z1All = [], z2All = [], unitAlive = [0, 0, 0, 0];
      var lines = [];

      X_STD.forEach(function (x, i) {
        var z1 = addVec(matVec(s.W1, x), s.b1);
        z1All.push.apply(z1All, z1);
        var a1 = z1.map(function (z) { return activate(s.activation, z); });
        var z2 = addVec(matVec(s.W2, a1), s.b2)[0];
        z2All.push(z2);
        var rowLine = ROW_IDS[i] + ': ';
        z1.forEach(function (z, idx) {
          var alive = Math.abs(deriv(s.activation, z)) >= THRESHOLD;
          if (alive) unitAlive[idx]++;
          rowLine += 'u' + (idx + 1) + '=' + fmt(z) + (alive ? '(live) ' : '(dead) ');
        });
        lines.push(rowLine.trim() + '  z2=' + fmt(z2));
      });

      var varZ1 = variance(z1All);
      var varZ2 = variance(z2All);
      var liveTotal = unitAlive.reduce(function (s, v) { return s + v; }, 0);

      for (var u = 0; u < 4; u++) {
        var node = document.getElementById('unit_0905_' + (u + 1));
        if (node) {
          node.classList.toggle('active', unitAlive[u] > 0);
          var small = node.querySelector('small');
          if (small) small.textContent = unitAlive[u] + ' of 8 rows alive';
        }
      }

      varZ1El.textContent = fmt(varZ1);
      varZ2El.textContent = fmt(varZ2);
      ratioEl.textContent = varZ1 === 0 ? 'undefined (0/0)' : fmt(varZ2 / varZ1);
      tallyEl.textContent = liveTotal + ' / 32';

      var band = key === 'zero' ? 'red' : (liveTotal >= 24 ? 'green' : (liveTotal >= 1 ? 'amber' : 'red'));
      verdict.className = 'gate-verdict verdict-' + band;

      if (key === 'zero') {
        verdict.textContent = s.label + ': every hidden unit is numerically identical on every row (var=0) -- a live derivative here would not help, because all four units would receive the exact same gradient forever. This is a symmetry failure, not a scale failure.';
      } else if (varZ2 / varZ1 < 0.01 && varZ1 > 0) {
        verdict.textContent = s.label + ': ' + liveTotal + '/32 units look "alive" near z=0, but the signal itself has nearly vanished by the output layer (variance shrank ' + (varZ1 / varZ2).toFixed(0) + '&times; crossing one layer) -- alive is not the same as useful.';
      } else if (varZ2 / varZ1 > 1.5) {
        verdict.textContent = s.label + ': ' + liveTotal + '/32 units alive, but the output layer’s variance grew to ' + (varZ2 / varZ1).toFixed(2) + '&times; the hidden layer’s -- this is the exploding side of the same slider, on a single layer.';
      } else {
        verdict.textContent = s.label + ': ' + liveTotal + '/32 units alive, output/hidden variance ratio ' + (varZ2 / varZ1).toFixed(4) + ' -- close to preserved, the behavior these formulas were derived to produce.';
      }

      sample.textContent = lines.join('\n');
    }

    controls.addEventListener('click', function (e) {
      var btn = e.target.closest('.control');
      if (!btn) return;
      controls.querySelectorAll('.control').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      render(btn.dataset.scheme);
    });

    render('zero');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
