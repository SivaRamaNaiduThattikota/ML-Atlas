// Module 09 Concept 07 -- "Backpropagation -- the chain rule, conceptually"
// Lab: drag hidden unit 1's own bias for CFPB Row C -- the exact same real parameter
// Concept 06's own lab dragged -- and watch the CHAIN RULE itself move: the upstream
// gradient arriving from the output layer, this unit's own local ReLU slope, and the
// product of the two (dL/db1_1), live.
//
// Every constant below is the exact value verify/m09c07_worked_case.js already drew and
// computed (seed=906, std=1 Gaussian, identical draw to Concept 06) -- nothing here is
// re-invented for the lab. Only b1_1 moves; units 2, 3 and 4's a1 are fixed at the values
// Concept 06's own forward pass already produced for Row C, x=(3,15,0), and the loss is
// this concept's own disclosed stand-in, L = 0.5*(a2-y)^2, y=1 (Row C is a relief case).
(function () {
  var RAW_DOT_1 = 1.2291200702956449;     // W1[unit1] . x for Row C, fixed (Concept 06's own number)
  var DEFAULT_B1_1 = 0.10541605220258342; // this concept's own drawn b1_1, reused from Concept 06
  var KINK_B1_1 = -1.229120;              // z1_1 = 0 exactly here -- unit 1's ReLU kink (6dp, Concept 06's own label)
  var W2_0 = 1.0717235038569415;          // W2 weight feeding from unit 1
  var Z2_CONST = 18.8390084436754;        // W2[1]*a1_2 + W2[2]*a1_3 + W2[3]*a1_4 + b2 -- everything z2 depends on besides a1_1
  var Y = 1;                              // Row C's own label (relief = 1)

  function relu(z) { return Math.max(0, z); }

  function fmt(x) {
    if (Math.abs(x) < 1e-9) return '0';
    return x.toFixed(6).replace(/0+$/, '').replace(/\.$/, '');
  }

  // Reproduces verify/m09c07_worked_case.js's backward() function exactly, specialized
  // to the one parameter (b1_1) this lab moves.
  function compute(b1_1) {
    var z1_1 = RAW_DOT_1 + b1_1;
    var a1_1 = relu(z1_1);
    var z2 = W2_0 * a1_1 + Z2_CONST;
    var a2 = relu(z2);
    var L = 0.5 * Math.pow(a2 - Y, 2);
    var dLda2 = a2 - Y;
    var reluPrimeZ2 = z2 > 0 ? 1 : 0;
    var delta2 = dLda2 * reluPrimeZ2;           // upstream x local, at the OUTPUT unit
    var upstream = delta2 * W2_0;                // dL/da1_1 -- what arrives at unit 1 from above
    var localSlope = z1_1 > 0 ? 1 : 0;            // ReLU'(z1_1) -- unit 1's own local gradient
    var delta1_1 = upstream * localSlope;         // dL/db1_1 = dL/dW1_1 (per feature) -- the chain-rule product
    return {
      z1_1: z1_1, a1_1: a1_1, z2: z2, a2: a2, L: L,
      upstream: upstream, localSlope: localSlope, delta1_1: delta1_1,
      live: localSlope === 1
    };
  }

  function init() {
    var slider = document.getElementById('bias1_0907');
    var out = document.getElementById('bias1Out_0907');
    var unit1Node = document.getElementById('unit_0907_1');
    var z1Out = document.getElementById('z1Out_0907');
    var upstreamOut = document.getElementById('upstreamOut_0907');
    var localOut = document.getElementById('localOut_0907');
    var deltaOut = document.getElementById('deltaOut_0907');
    var lossOut = document.getElementById('lossOut_0907');
    var verdict = document.getElementById('verdict_0907');
    var sample = document.getElementById('sample_0907');
    var resetBtn = document.getElementById('resetBtn_0907');
    var kinkBtn = document.getElementById('kinkBtn_0907');
    if (!slider || !unit1Node) return;

    function render() {
      var b1_1 = parseFloat(slider.value);
      out.textContent = fmt(b1_1);
      var r = compute(b1_1);

      var small = unit1Node.querySelector('small');
      if (small) {
        small.textContent = 'z1=' + fmt(r.z1_1) + ', local ReLU’=' + r.localSlope + ' (' + (r.live ? 'live' : 'dead') + ')';
      }
      unit1Node.classList.toggle('active', r.live);

      z1Out.textContent = fmt(r.z1_1);
      upstreamOut.textContent = fmt(r.upstream);
      localOut.textContent = String(r.localSlope);
      deltaOut.textContent = fmt(r.delta1_1);
      lossOut.textContent = fmt(r.L);

      verdict.className = 'gate-verdict ' + (r.live ? 'verdict-green' : 'verdict-red');
      if (r.live) {
        verdict.textContent = 'Local gradient is LIVE (ReLU’(z1_1)=1). dL/db1_1 = upstream (' + fmt(r.upstream) +
          ') × local (1) = ' + fmt(r.delta1_1) + ' -- the full upstream signal passes through unchanged.';
      } else {
        verdict.textContent = 'Local gradient is DEAD (ReLU’(z1_1)=0). dL/db1_1 = upstream (' + fmt(r.upstream) +
          ') × local (0) = 0 -- the upstream error is real and nonzero, but this unit’s own local slope zeroes it out completely. This is exactly what happened to unit 3 on every one of the 8 CFPB rows.';
      }

      sample.textContent =
        'b1_1 = ' + fmt(b1_1) + '\n' +
        'z1_1 = ' + fmt(RAW_DOT_1) + ' + ' + fmt(b1_1) + ' = ' + fmt(r.z1_1) + '\n' +
        'a1_1 = ReLU(z1_1) = ' + fmt(r.a1_1) + '\n' +
        'z2 = ' + fmt(W2_0) + ' * a1_1 + ' + fmt(Z2_CONST) + ' = ' + fmt(r.z2) + '\n' +
        'a2 = ReLU(z2) = ' + fmt(r.a2) + '   (y = ' + Y + ')\n' +
        'L = 0.5*(a2-y)^2 = ' + fmt(r.L) + '\n' +
        'upstream dL/da1_1 = dL/dz2 * W2_1 = ' + fmt(r.upstream) + '\n' +
        'local ReLU’(z1_1) = ' + r.localSlope + '\n' +
        'dL/db1_1 = upstream × local = ' + fmt(r.delta1_1);
    }

    slider.addEventListener('input', render);
    resetBtn.addEventListener('click', function () {
      slider.value = DEFAULT_B1_1;
      render();
    });
    kinkBtn.addEventListener('click', function () {
      slider.value = KINK_B1_1;
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
