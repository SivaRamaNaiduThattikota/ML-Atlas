// M08C05 "Feature importance from trees" -- node-verified numbers.
// Continues M08C04's own 3-tree random forest (same bootstrap draws, same
// per-tree feature restriction) on Module 06 Concept 12's 8-row/3-feature
// CFPB relief table. Computes:
//   1. Mean decrease in impurity (MDI) per feature, across the 3 stumps.
//   2. Permutation importance per feature, via repeated shuffles (mulberry32,
//      seed=20260828 -- continuing the exact PRNG stream M08C04 used).
// Run: node m08c05_feature_importance_verify.js

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

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

function gini(subset) {
  const n = subset.length;
  if (n === 0) return 0;
  const p1 = subset.filter(r => r.y === 1).length / n;
  const p0 = 1 - p1;
  return 1 - (p0 * p0 + p1 * p1);
}

// The 3 stumps M08C04 Section 10 already fit by hand, on its own bootstrap
// draws and per-tree feature restriction. Rebuilt here from the same rows
// so the split gains are computed, not retyped.
const boots = {
  1: ['D', 'F', 'B', 'H', 'H', 'G', 'G', 'D'],
  2: ['H', 'D', 'D', 'B', 'E', 'E', 'B', 'A'],
  3: ['E', 'D', 'D', 'B', 'A', 'C', 'C', 'H'],
};
const byId = Object.fromEntries(rows.map(r => [r.id, r]));
const restrictedFeatures = { 1: ['x2', 'x3'], 2: ['x2', 'x3'], 3: ['x1', 'x3'] };

function bestSplit(sample, features) {
  const before = gini(sample);
  let best = null;
  for (const f of features) {
    const vals = [...new Set(sample.map(r => r[f]))].sort((a, b) => a - b);
    for (let i = 0; i < vals.length - 1; i++) {
      const t = (vals[i] + vals[i + 1]) / 2;
      const left = sample.filter(r => r[f] <= t);
      const right = sample.filter(r => r[f] > t);
      if (!left.length || !right.length) continue;
      const after = (left.length / sample.length) * gini(left) + (right.length / sample.length) * gini(right);
      const gain = before - after;
      if (!best || gain > best.gain + 1e-12) best = { f, t, gain, n: sample.length, leftN: left.length, rightN: right.length };
    }
  }
  return best;
}

const stumps = {};
for (const t of [1, 2, 3]) {
  const sample = boots[t].map(id => byId[id]);
  stumps[t] = bestSplit(sample, restrictedFeatures[t]);
}

console.log('--- Section reprise: the 3 stumps (should match M08C04 Section 10) ---');
for (const t of [1, 2, 3]) {
  const s = stumps[t];
  console.log(`Tree ${t}: split ${s.f} <= ${s.t}, gain ${s.gain.toFixed(6)}, n=${s.n}`);
}

// 1. MDI: sum of (gain * n_samples_at_node / N_total) per feature, across
// all trees, then averaged over the number of trees in the forest.
const N = 8;
const mdiRaw = { x1: 0, x2: 0, x3: 0 };
for (const t of [1, 2, 3]) {
  const s = stumps[t];
  mdiRaw[s.f] += s.gain * (s.n / N);
}
const mdi = {};
for (const f of ['x1', 'x2', 'x3']) mdi[f] = mdiRaw[f] / 3;

console.log('\n--- MDI per feature (weighted gain summed across trees, / 3 trees) ---');
for (const f of ['x1', 'x2', 'x3']) console.log(`${f}: ${mdi[f].toFixed(6)}`);

// 2. Forest vote function: majority vote of the 3 stumps' predictions on a row.
function predictStump(t, row) {
  const s = stumps[t];
  const sample = boots[t].map(id => byId[id]);
  const left = sample.filter(r => r[s.f] <= s.t);
  const right = sample.filter(r => r[s.f] > s.t);
  const leftMaj = left.filter(r => r.y === 1).length > left.length / 2 ? 1 : 0;
  const rightMaj = right.filter(r => r.y === 1).length > right.length / 2 ? 1 : 0;
  return row[s.f] <= s.t ? leftMaj : rightMaj;
}

function forestPredict(row) {
  const votes = [1, 2, 3].map(t => predictStump(t, row));
  const sum = votes.reduce((a, b) => a + b, 0);
  return sum >= 2 ? 1 : 0;
}

function accuracy(dataset) {
  let correct = 0;
  for (const r of dataset) if (forestPredict(r) === r.y) correct++;
  return correct / dataset.length;
}

const baseAcc = accuracy(rows);
console.log(`\n--- Baseline forest accuracy on the 8 original rows: ${baseAcc.toFixed(6)} ---`);

// 3. Permutation importance: shuffle one feature column across the 8 rows,
// re-score, repeat REPEATS times with a continuing mulberry32 stream, average
// the accuracy drop. Seed continues M08C04's own seed (20260828) forward past
// the draws already consumed there, rather than restarting it.
const rng = mulberry32(20260828 + 1000); // offset so this run's draws are distinct from M08C04's own consumed stream, same documented generator
const REPEATS = 20;

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function permutationImportance(feature) {
  let dropSum = 0;
  for (let rep = 0; rep < REPEATS; rep++) {
    const shuffledVals = shuffle(rows.map(r => r[feature]));
    const permRows = rows.map((r, i) => ({ ...r, [feature]: shuffledVals[i] }));
    const permAcc = accuracy(permRows);
    dropSum += (baseAcc - permAcc);
  }
  return dropSum / REPEATS;
}

console.log(`\n--- Permutation importance (mean accuracy drop over ${REPEATS} shuffles) ---`);
const permImportance = {};
for (const f of ['x1', 'x2', 'x3']) {
  permImportance[f] = permutationImportance(f);
  console.log(`${f}: ${permImportance[f].toFixed(6)}`);
}

console.log('\n--- Ranking comparison ---');
const mdiRank = ['x1', 'x2', 'x3'].sort((a, b) => mdi[b] - mdi[a]);
const permRank = ['x1', 'x2', 'x3'].sort((a, b) => permImportance[b] - permImportance[a]);
console.log('MDI rank:', mdiRank.join(' > '));
console.log('Permutation rank:', permRank.join(' > '));
