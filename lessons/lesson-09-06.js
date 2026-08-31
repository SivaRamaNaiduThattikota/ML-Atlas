// Module 09 Concept 06 -- "Forward propagation, traced by hand"
// Lab: drag hidden unit 1's own bias for CFPB Row C, watch its ReLU kink -- and the
// network's final output -- move live.
//
// Every constant below is the exact value verify/m09c06_worked_case.js already drew and
// computed (seed=906, std=1 Gaussian) -- nothing here is re-invented for the lab. Only
// b1_1 (hidden unit 1's own bias) moves; units 2, 3 and 4's a1 are fixed at the values
// this concept's own forward pass already produced for Row C, x=(3,15,0).
(function () {
  var RAW_DOT_1 = 1.2291200702956449;   // W1[unit1] . x for Row C, fixed
  var DEFAULT_B1_1 = 0.10541605220258342; // this concept's own drawn b1_1
  var KINK_B1_1 = -RAW_DOT_1;           // z1_1 = 0 exactly here -- unit 1's ReLU kink

  // Units 2, 3, 4's a1 for Row C -- unaffected by the slider, held fixed.
  var A1_FIXED = [31.990553852890674, 0, 0.005016463270555049];
  var W2 = [1.0717235038569415, 0.6171817581436092, 0.4148516929811021, 0.18894012994788142];
  var B2 = -0.9059256417244915;

  function relu(z) { return Math.max(0, z); }

  function fmt(x) {
    if (Math.abs(x) < 1e-9) return '0';
    return x.toFixed(6).replace(/0+$/, '').replace(/\.$/, '');
  }

  function compute(b1_1) {
    var z1_1 = RAW_DOT_1 + b1_1;
    var a1_1 = relu(z1_1);
    var a1 = [a1_1, A1_FIXED[0], A1_FIXED[1], A1_FIXED[2]];
    var z2 = W2[0] * a1[0] + W2[1] * a1[1] + W2[2] * a1[2] + W2[3] * a1[3] + B2;
    var a2 = relu(z2);
    return { z1_1: z1_1, a1_1: a1_1, z2: z2, a2: a2, live: z1_1 > 0 };
  }

  function init() {
    var slider = document.getElementById('bias1_0906');
    var out = document.getElementById('bias1Out_0906');
    var unit1Node = document.getElementById('unit_0906_1');
    var z1Out = document.getElementById('z1Out_0906');
    var a1Out = document.getElementById('a1Out_0906');
    var z2Out = document.getElementById('z2Out_0906');
    var a2Out = document.getElementById('a2Out_0906');
    var verdict = document.getElementById('verdict_0906');
    var sample = document.getElementById('sample_0906');
    var resetBtn = document.getElementById('resetBtn_0906');
    var kinkBtn = document.getElementById('kinkBtn_0906');
    if (!slider || !unit1Node) return;

    function render() {
      var b1_1 = parseFloat(slider.value);
      out.textContent = fmt(b1_1);
      var r = compute(b1_1);

      var small = unit1Node.querySelector('small');
      if (small) {
        small.textContent = 'z1=' + fmt(r.z1_1) + ', a1=' + fmt(r.a1_1) + ' (' + (r.live ? 'live' : 'dead') + ')';
      }
      unit1Node.classList.toggle('active', r.live);

      z1Out.textContent = fmt(r.z1_1);
      a1Out.textContent = fmt(r.a1_1);
      z2Out.textContent = fmt(r.z2);
      a2Out.textContent = fmt(r.a2);

      var distToKink = b1_1 - KINK_B1_1;
      verdict.className = 'gate-verdict ' + (r.live ? 'verdict-green' : 'verdict-red');
      if (r.live) {
        verdict.textContent = 'Unit 1 is LIVE (z1_1=' + fmt(r.z1_1) + ' > 0). Network output a2=' + fmt(r.a2) +
          '. The kink sits at b1_1=' + fmt(KINK_B1_1) + ' -- ' + fmt(Math.abs(distToKink)) + ' away from here.';
      } else {
        verdict.textContent = 'Unit 1 is DEAD (z1_1=' + fmt(r.z1_1) + ' <= 0, ReLU clips it to exactly 0). Network output a2=' +
          fmt(r.a2) + ' no longer moves at all if you slide further left -- that is ReLU’s own zero gradient, made visible.';
      }

      sample.textContent =
        'b1_1 = ' + fmt(b1_1) + '\n' +
        'z1_1 = ' + fmt(RAW_DOT_1) + ' + ' + fmt(b1_1) + ' = ' + fmt(r.z1_1) + '\n' +
        'a1_1 = ReLU(z1_1) = ' + fmt(r.a1_1) + '\n' +
        'a1 (all 4 units) = [' + fmt(r.a1_1) + ', ' + fmt(A1_FIXED[0]) + ', ' + fmt(A1_FIXED[1]) + ', ' + fmt(A1_FIXED[2]) + ']\n' +
        'z2 = W2.a1 + b2 = ' + fmt(r.z2) + '\n' +
        'a2 = ReLU(z2) = ' + fmt(r.a2);
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
