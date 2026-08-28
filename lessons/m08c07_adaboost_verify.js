// AdaBoost worked example verifier -- Module 08 Concept 07
// Reuses Module 06 Concept 12's 8-row/3-feature CFPB relief table,
// the same table Concept 04/05 already reuse for their own worked examples.
// x1=prior_contact_attempts, x2=case_age_days, x3=timely_response, y=relief

const rows = [
  { id: 'A', x1: 1, x2: 10, x3: 1, y: 0 },
  { id: 'B', x1: 2, x2: 20, x3: 1, y: 0 },
  { id: 'C', x1: 3, x2: 15, x3: 0, y: 1 },
  { id: 'D', x1: 1, x2: 40, x3: 1, y: 0 },
  { id: 'E', x1: 4, x2: 25, x3: 0, y: 1 },
  { id: 'F', x1: 2, x2: 60, x3: 0, y: 0 },
  { id: 'G', x1: 5, x2: 30, x3: 1, y: 1 },
  { id: 'H', x1: 3, x2: 50, x3: 0, y: 0 },
];
const n = rows.length;
const yPM = rows.map(r => (r.y === 1 ? 1 : -1)); // AdaBoost needs {-1,+1} labels

// Candidate thresholds: midpoints between consecutive sorted unique values, per feature
function thresholds(feat) {
  const vals = [...new Set(rows.map(r => r[feat]))].sort((a, b) => a - b);
  const t = [];
  for (let i = 0; i < vals.length - 1; i++) t.push((vals[i] + vals[i + 1]) / 2);
  return t;
}
const FEATS = ['x1', 'x2', 'x3'];

// A decision stump: predicts +1 if x[feat] <= thresh else -1, OR the flipped polarity.
function stumpPredict(feat, thresh, polarity, row) {
  const below = row[feat] <= thresh;
  const raw = below ? 1 : -1;
  return polarity === 1 ? raw : -raw;
}

// Find the stump (feat, thresh, polarity) minimizing weighted error under weights w[]
function bestStump(w) {
  let best = null;
  for (const feat of FEATS) {
    for (const thresh of thresholds(feat)) {
      for (const polarity of [1, -1]) {
        let err = 0;
        for (let i = 0; i < n; i++) {
          const pred = stumpPredict(feat, thresh, polarity, rows[i]);
          if (pred !== yPM[i]) err += w[i];
        }
        if (!best || err < best.err - 1e-12) {
          best = { feat, thresh, polarity, err };
        }
      }
    }
  }
  return best;
}

function round4(x) { return Math.round(x * 1e6) / 1e6; }

const ROUNDS = 3;
let w = new Array(n).fill(1 / n);
const stumps = [];
const alphas = [];
const weightSnapshots = [w.slice()];

for (let t = 0; t < ROUNDS; t++) {
  const stump = bestStump(w);
  const err = stump.err;
  const alpha = 0.5 * Math.log((1 - err) / err);
  const preds = rows.map(r => stumpPredict(stump.feat, stump.thresh, stump.polarity, r));
  let wNew = w.map((wi, i) => wi * Math.exp(-alpha * yPM[i] * preds[i]));
  const Z = wNew.reduce((a, b) => a + b, 0);
  wNew = wNew.map(x => x / Z);
  stumps.push({ ...stump, preds });
  alphas.push(alpha);
  w = wNew;
  weightSnapshots.push(w.slice());
}

// Final strong classifier: sign(sum alpha_t * h_t(x))
const finalScores = rows.map((r, i) =>
  stumps.reduce((acc, s, t) => acc + alphas[t] * s.preds[i], 0)
);
const finalPred = finalScores.map(s => (s >= 0 ? 1 : -1));
const correct = finalPred.filter((p, i) => p === yPM[i]).length;

console.log('=== Per-round weighted-best stump ===');
stumps.forEach((s, t) => {
  console.log(`Round ${t + 1}: feature=${s.feat} thresh<=${s.thresh} polarity=${s.polarity} weightedErr=${round4(s.err)} alpha=${round4(alphas[t])}`);
  console.log('  preds (A-H):', s.preds.join(','));
});

console.log('\n=== Sample weights after each round (A-H) ===');
weightSnapshots.forEach((ws, t) => {
  console.log(`w${t}:`, ws.map(round4).join(', '));
});

console.log('\n=== Final ensemble ===');
console.log('alphas:', alphas.map(round4));
console.log('final scores (A-H):', finalScores.map(round4));
console.log('final preds  (A-H):', finalPred.map(p => (p === 1 ? 'relief' : 'no-relief')).join(', '));
console.log('true labels  (A-H):', rows.map(r => (r.y === 1 ? 'relief' : 'no-relief')).join(', '));
console.log(`accuracy: ${correct}/${n} = ${round4(correct / n)}`);

const missed = rows.filter((r, i) => finalPred[i] !== yPM[i]).map(r => r.id);
console.log('missed rows:', missed.length ? missed.join(',') : 'none');
