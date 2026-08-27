// Section 14's lab: The Vote Board. Concepts 04-07 all handled exactly two
// classes. This concept combines already-binary classifiers two ways --
// one-vs-rest (OvR, argmax over K independent scores) and one-vs-one
// (OvO, majority vote over K(K-1)/2 pairwise duels) -- and shows the two
// combination rules can genuinely disagree on the same test point.

// The worked example's own fixed weights, verified in the research stage
// and reused verbatim -- this concept never refits anything, it assumes
// these nine weights (3 OvR + 3 OvO) directly, exactly as Concept 07
// assumed its own Gaussian parameters.
const OVR_WEIGHTS_0608 = [
  [1, -1, 0.4],
  [-2, 0.5, 0.3],
  [-3, 0.8, 0.5],
]
const OVO_PAIRS_0608 = [
  { i: 0, j: 1, w: [0.5, -0.6, 0.1] },
  { i: 0, j: 2, w: [-1.5, 0.2, 0.1] },
  { i: 1, j: 2, w: [0.5, 0.1, -0.2] },
]
const CLASS_LABELS_0608 = ['class 0', 'class 1', 'class 2']

const X1_DEFAULT_0608 = 3
const X2_DEFAULT_0608 = 5

function score0608(w, x1, x2) {
  return w[0] + w[1] * x1 + w[2] * x2
}

function ovrPredict0608(x1, x2) {
  const scores = OVR_WEIGHTS_0608.map(w => score0608(w, x1, x2))
  let best = 0
  for (let k = 1; k < scores.length; k++) if (scores[k] > scores[best]) best = k
  return { scores, predicted: best }
}

function ovoPredict0608(x1, x2) {
  const votes = [0, 0, 0]
  const agg = [0, 0, 0]
  const zs = {}
  OVO_PAIRS_0608.forEach(({ i, j, w }) => {
    const z = score0608(w, x1, x2)
    zs[i + '_' + j] = z
    const winner = z >= 0 ? j : i
    votes[winner] += 1
    agg[j] += z
    agg[i] -= z
  })
  const top = Math.max(...votes)
  const tied = votes.map((v, c) => (v === top ? c : -1)).filter(c => c >= 0)
  const predicted = tied.length === 1 ? tied[0] : tied.reduce((a, b) => (agg[b] > agg[a] ? b : a))
  return { votes, zs, agg, predicted, tied: tied.length > 1 }
}

// -- Panel A: OvR Scoreboard -- a bar chart of the three z scores. --
function ovrScoreboardSvg0608(x1, x2, titleId, titleText, descText) {
  const { scores, predicted } = ovrPredict0608(x1, x2)
  const yMax = Math.max(2, ...scores.map(s => Math.abs(s))) * 1.2
  const X0 = 40, X1PX = 260, Y0 = 20, YMID = 130, Y1 = 240
  const barW = 50
  const centers = [90, 150, 210]
  const bars = scores.map((s, k) => {
    const cx = centers[k]
    const h = (Math.abs(s) / yMax) * (YMID - Y0)
    const y = s >= 0 ? YMID - h : YMID
    const fill = k === predicted ? 'var(--teal)' : 'var(--muted)'
    return `
      <rect x="${cx - barW / 2}" y="${y.toFixed(1)}" width="${barW}" height="${Math.max(h, 1).toFixed(1)}" fill="${fill}" opacity="${k === predicted ? 0.85 : 0.45}"/>
      <text x="${cx}" y="${(s >= 0 ? y - 6 : y + h + 12).toFixed(1)}" text-anchor="middle" font-size="8" font-weight="700">${s.toFixed(2)}</text>
      <text x="${cx}" y="${Y1 - 4}" text-anchor="middle" font-size="7.5">${CLASS_LABELS_0608[k]}</text>
      ${k === predicted ? `<text x="${cx}" y="${Y0 - 4}" text-anchor="middle" font-size="7.5" font-weight="700" fill="var(--teal)">PICK</text>` : ''}
    `
  }).join('')
  return `
    <svg class="vector-plane" viewBox="0 0 300 250" role="img" aria-labelledby="${titleId}-title ${titleId}-desc">
      <title id="${titleId}-title">${titleText}</title>
      <desc id="${titleId}-desc">${descText}</desc>
      <g font-family="IBM Plex Mono, monospace" fill="currentColor">
        <line x1="${X0}" y1="${YMID}" x2="${X1PX}" y2="${YMID}" stroke="currentColor" stroke-width="1"/>
        <text x="10" y="${Y0 + 4}" font-size="7">OvR SCOREBOARD</text>
        ${bars}
      </g>
    </svg>
  `
}

// -- Panel B: OvO Tournament -- a triangle of classes with vote badges. --
function ovoTournamentSvg0608(x1, x2, titleId, titleText, descText) {
  const { votes, zs, agg, predicted, tied } = ovoPredict0608(x1, x2)
  const nodes = [
    { c: 0, x: 150, y: 30 },
    { c: 1, x: 50, y: 200 },
    { c: 2, x: 250, y: 200 },
  ]
  const pairKeyFor = (a, b) => Math.min(a, b) + '_' + Math.max(a, b)
  const edges = [[0, 1], [0, 2], [1, 2]].map(([a, b]) => {
    const na = nodes.find(n => n.c === a), nb = nodes.find(n => n.c === b)
    const z = zs[pairKeyFor(a, b)]
    const mx = (na.x + nb.x) / 2, my = (na.y + nb.y) / 2
    return `
      <line x1="${na.x}" y1="${na.y}" x2="${nb.x}" y2="${nb.y}" stroke="currentColor" stroke-width="1" opacity="0.5"/>
      <text x="${mx}" y="${my - 4}" text-anchor="middle" font-size="7">${z.toFixed(2)}</text>
    `
  }).join('')
  const nodeMarks = nodes.map(n => {
    const isWinner = n.c === predicted
    const r = 26
    return `
      <circle cx="${n.x}" cy="${n.y}" r="${r}" fill="${isWinner ? 'var(--teal)' : 'var(--paper)'}" stroke="currentColor" stroke-width="1.4" opacity="${isWinner ? 0.85 : 1}"/>
      <text x="${n.x}" y="${n.y - 4}" text-anchor="middle" font-size="7.5" font-weight="700">${CLASS_LABELS_0608[n.c]}</text>
      <text x="${n.x}" y="${n.y + 10}" text-anchor="middle" font-size="8" font-weight="700">${votes[n.c]} vote${votes[n.c] === 1 ? '' : 's'}</text>
      ${isWinner ? `<text x="${n.x}" y="${n.y - 34}" text-anchor="middle" font-size="8" font-weight="700" fill="var(--teal)">WINNER</text>` : ''}
    `
  }).join('')
  const tieNote = tied ? `<text x="150" y="238" text-anchor="middle" font-size="7" fill="var(--muted)">TIE -- broken by aggregate confidence: ${agg.map(a => a.toFixed(1)).join(', ')}</text>` : ''
  return `
    <svg class="vector-plane" viewBox="0 0 300 250" role="img" aria-labelledby="${titleId}-title ${titleId}-desc">
      <title id="${titleId}-title">${titleText}</title>
      <desc id="${titleId}-desc">${descText}</desc>
      <g font-family="IBM Plex Mono, monospace" fill="currentColor">
        <text x="10" y="16" font-size="7">OvO TOURNAMENT</text>
        ${edges}
        ${nodeMarks}
        ${tieNote}
      </g>
    </svg>
  `
}

// -- Static figure #1 (beginner, b04): the main disagreement, no interaction. --
function renderVoteStatic1_0608() {
  const wrap = document.querySelector('#wgVoteStatic1_0608')
  if (!wrap) return
  wrap.innerHTML = `
    <div style="display:flex;gap:16px;flex-wrap:wrap">
      <div style="flex:1;min-width:220px">${ovrScoreboardSvg0608(X1_DEFAULT_0608, X2_DEFAULT_0608, 'c0608-b04-ovr', 'OvR scoreboard at x1=3, x2=5', 'Three bars showing OvR scores 0, 1.0 and 1.9 for classes 0, 1 and 2. Class 2 has the tallest bar and is marked PICK.')}</div>
      <div style="flex:1;min-width:220px">${ovoTournamentSvg0608(X1_DEFAULT_0608, X2_DEFAULT_0608, 'c0608-b04-ovo', 'OvO tournament at x1=3, x2=5', 'A triangle of three class nodes with vote badges 2, 1 and 0 for classes 0, 1 and 2. Class 0 is highlighted as the winner.')}</div>
    </div>
  `
}

// -- Static figure #2 (advanced, s07): the tie case at x1=0, x2=0. --
function renderVoteStatic2_0608() {
  const wrap = document.querySelector('#wgVoteStatic2_0608')
  if (!wrap) return
  wrap.innerHTML = `
    <div style="display:flex;gap:16px;flex-wrap:wrap">
      <div style="flex:1;min-width:220px">${ovrScoreboardSvg0608(0, 0, 'c0608-s07-ovr', 'OvR scoreboard at x1=0, x2=0', 'Three bars showing OvR scores 1, -2 and -3 for classes 0, 1 and 2. Class 0 has the tallest bar and is marked PICK.')}</div>
      <div style="flex:1;min-width:220px">${ovoTournamentSvg0608(0, 0, 'c0608-s07-ovo', 'OvO tournament at x1=0, x2=0, a genuine tie', 'A triangle of three class nodes, each with exactly 1 vote -- a genuine three-way tie. A note below states the tie is broken by aggregate confidence, with class 0 winning.')}</div>
    </div>
  `
}

// -- Interactive lab (s14): The Vote Board. --
const x1Slider0608 = document.querySelector('#wgX1_0608')
const x2Slider0608 = document.querySelector('#wgX2_0608')
const x1Out0608 = document.querySelector('#wgX1Out_0608')
const x2Out0608 = document.querySelector('#wgX2Out_0608')
const resetBtn0608 = document.querySelector('#wgReset_0608')
const ovrPanel0608 = document.querySelector('#wgOvrPanel_0608')
const ovoPanel0608 = document.querySelector('#wgOvoPanel_0608')
const readout0608 = document.querySelector('#wgReadout_0608')
const verdict0608 = document.querySelector('#wgVerdict_0608')

function currentParams0608() {
  return {
    x1: x1Slider0608 ? Number(x1Slider0608.value) : X1_DEFAULT_0608,
    x2: x2Slider0608 ? Number(x2Slider0608.value) : X2_DEFAULT_0608,
  }
}

function renderLab0608() {
  if (!x1Slider0608 || !x2Slider0608) return
  const { x1, x2 } = currentParams0608()
  if (x1Out0608) x1Out0608.textContent = x1.toFixed(1)
  if (x2Out0608) x2Out0608.textContent = x2.toFixed(1)

  if (ovrPanel0608) {
    ovrPanel0608.innerHTML = ovrScoreboardSvg0608(x1, x2, 'c0608-lab-ovr', 'Live OvR scoreboard, updated as the sliders move', 'A live version of the OvR bar chart, redrawn from the current slider values.')
  }
  if (ovoPanel0608) {
    ovoPanel0608.innerHTML = ovoTournamentSvg0608(x1, x2, 'c0608-lab-ovo', 'Live OvO tournament, updated as the sliders move', 'A live version of the OvO tournament triangle, redrawn from the current slider values.')
  }

  const ovr = ovrPredict0608(x1, x2)
  const ovo = ovoPredict0608(x1, x2)
  const agree = ovr.predicted === ovo.predicted

  if (readout0608) {
    readout0608.innerHTML = `
      <div><span>OvR SCORES</span><b>${ovr.scores.map(s => s.toFixed(2)).join(', ')} → predicts ${CLASS_LABELS_0608[ovr.predicted]}</b></div>
      <div><span>OvO VOTES</span><b>${ovo.votes.join(', ')} → predicts ${CLASS_LABELS_0608[ovo.predicted]}${ovo.tied ? ' (tie-break)' : ''}</b></div>
    `
  }

  if (verdict0608) {
    verdict0608.className = `gate-verdict ${agree ? 'verdict-green' : 'verdict-amber'}`
    verdict0608.textContent = agree
      ? `AGREE -- both schemes predict ${CLASS_LABELS_0608[ovr.predicted]} at x1=${x1.toFixed(1)}, x2=${x2.toFixed(1)}.`
      : `DISAGREE -- OvR predicts ${CLASS_LABELS_0608[ovr.predicted]} while OvO predicts ${CLASS_LABELS_0608[ovo.predicted]} at x1=${x1.toFixed(1)}, x2=${x2.toFixed(1)}, using the exact same nine weights.`
  }
}

x1Slider0608?.addEventListener('input', renderLab0608)
x2Slider0608?.addEventListener('input', renderLab0608)

resetBtn0608?.addEventListener('click', () => {
  if (x1Slider0608) x1Slider0608.value = String(X1_DEFAULT_0608)
  if (x2Slider0608) x2Slider0608.value = String(X2_DEFAULT_0608)
  renderLab0608()
})

renderVoteStatic1_0608()
renderVoteStatic2_0608()
renderLab0608()
