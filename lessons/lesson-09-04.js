// Module 09 Concept 04 -- "Activation functions: sigmoid, tanh and ReLU"
// Lab: switch the activation, watch the live-gradient tally move.
//
// The twelve z's below are NOT recomputed here -- they are Concept 02's own
// pre-activations: 8 CFPB rows run through its converged perceptron weights
// (w=(68,-10,2), b=11), and 4 XOR points run through the weights it got stuck
// at (w=(0,1), b=0). See module-09-concept-02.html Sections 09 and 13, and
// this lesson's own Sections 11-12, for where each number comes from.
(function () {
  var POINTS = [
    { id: 'A', label: 'Row A', z: -19, group: 'CFPB' },
    { id: 'B', label: 'Row B', z: -51, group: 'CFPB' },
    { id: 'C', label: 'Row C', z: 65, group: 'CFPB' },
    { id: 'D', label: 'Row D', z: -319, group: 'CFPB' },
    { id: 'E', label: 'Row E', z: 33, group: 'CFPB' },
    { id: 'F', label: 'Row F', z: -453, group: 'CFPB' },
    { id: 'G', label: 'Row G', z: 53, group: 'CFPB' },
    { id: 'H', label: 'Row H', z: -285, group: 'CFPB' },
    { id: 'X1', label: 'XOR (0,0)', z: 0, group: 'XOR' },
    { id: 'X2', label: 'XOR (1,1)', z: 1, group: 'XOR' },
    { id: 'X3', label: 'XOR (0,1)', z: 1, group: 'XOR' },
    { id: 'X4', label: 'XOR (1,0)', z: 0, group: 'XOR' }
  ];

  var LIVE_THRESHOLD = 0.01;

  function sigmoid(z) { return 1 / (1 + Math.exp(-z)); }
  function dsigmoid(z) { var s = sigmoid(z); return s * (1 - s); }
  function tanhFn(z) { return Math.tanh(z); }
  function dtanh(z) { var t = tanhFn(z); return 1 - t * t; }
  function relu(z) { return Math.max(0, z); }
  // z=0 is treated as dead by this concept's own convention -- see Section 10/17.
  function drelu(z) { return z > 0 ? 1 : 0; }

  var ACTIVATIONS = {
    sigmoid: { label: 'Sigmoid', fn: sigmoid, dfn: dsigmoid },
    tanh: { label: 'Tanh', fn: tanhFn, dfn: dtanh },
    relu: { label: 'ReLU', fn: relu, dfn: drelu }
  };

  function fmtVal(x) {
    if (x === 0) return '0';
    var ax = Math.abs(x);
    if (ax < 1e-4) return x.toExponential(2);
    return x.toFixed(6).replace(/0+$/, '').replace(/\.$/, '');
  }

  function init() {
    var buttons = Array.prototype.slice.call(document.querySelectorAll('.activation-button'));
    var liveCountEl = document.getElementById('liveCount_0904');
    var breakdownEl = document.getElementById('liveBreakdown_0904');
    var verdict = document.getElementById('verdict_0904');
    var sample = document.getElementById('sample_0904');
    if (!buttons.length || !liveCountEl) return;

    function render(key) {
      var activation = ACTIVATIONS[key];
      var live = 0;
      var liveCfpb = 0;
      var liveXor = 0;
      var deadCfpbRows = [];
      var lines = [];

      POINTS.forEach(function (pt) {
        var out = activation.fn(pt.z);
        var d = activation.dfn(pt.z);
        var isLive = Math.abs(d) >= LIVE_THRESHOLD;
        if (isLive) {
          live++;
          if (pt.group === 'CFPB') liveCfpb++; else liveXor++;
        } else if (pt.group === 'CFPB') {
          deadCfpbRows.push(pt.id);
        }
        var node = document.getElementById('pt_0904_' + pt.id);
        if (node) {
          node.classList.toggle('active', isLive);
          var small = node.querySelector('small');
          if (small) {
            small.textContent = 'z=' + pt.z + ' -> ' + fmtVal(out) + ' (d=' + fmtVal(d) + ', ' + (isLive ? 'live' : 'dead') + ')';
          }
        }
        lines.push(pt.label + ' (' + pt.group + '): z=' + pt.z + ' -> ' + activation.label + '=' + fmtVal(out) +
          ', d' + activation.label + '=' + fmtVal(d) + ' [' + (isLive ? 'LIVE' : 'dead') + ']');
      });

      liveCountEl.textContent = live + ' / 12';
      breakdownEl.textContent = liveCfpb + ' of 8 CFPB rows, ' + liveXor + ' of 4 XOR points';

      verdict.className = 'gate-verdict ' + (live >= 5 ? 'verdict-green' : (live >= 1 ? 'verdict-amber' : 'verdict-red'));
      if (activation.label === 'ReLU') {
        verdict.textContent = 'ReLU: ' + live + ' of 12 gradients alive (' + liveCfpb + ' of 8 CFPB rows, ' + liveXor +
          ' of 4 XOR) -- it stays alive on any positive z regardless of scale, but ' + deadCfpbRows.length +
          ' CFPB rows sit at z <= 0 and are permanently dead.';
      } else {
        verdict.textContent = activation.label + ': ' + live + ' of 12 gradients alive (' + liveCfpb +
          ' of 8 CFPB rows, ' + liveXor + ' of 4 XOR) -- every CFPB-scale row is dead at this weight scale, alive only on the small XOR z’s.';
      }

      sample.textContent = lines.join('\n');
    }

    function select(button) {
      buttons.forEach(function (item) {
        var active = item === button;
        item.classList.toggle('active', active);
        item.classList.toggle('secondary', !active);
        item.setAttribute('aria-pressed', String(active));
      });
      render(button.dataset.activation);
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () { select(button); });
    });

    select(buttons[0]);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
