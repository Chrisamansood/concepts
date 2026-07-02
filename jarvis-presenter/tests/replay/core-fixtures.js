function point(x, y, z = 0) {
  return { x, y, z };
}

function makeHand(gesture, centerX = 0.5, centerY = 0.5) {
  const hand = Array.from({ length: 21 }, () => point(centerX, centerY));
  hand[0] = point(centerX, centerY + 0.2);
  hand[1] = point(centerX - 0.07, centerY + 0.12);
  hand[2] = point(centerX - 0.1, centerY + 0.08);
  hand[3] = point(centerX - 0.08, centerY + 0.1);
  hand[4] = point(centerX - 0.05, centerY + 0.12);

  const fingers = [
    { name: "index", ids: [5, 6, 7, 8], x: centerX - 0.06 },
    { name: "middle", ids: [9, 10, 11, 12], x: centerX - 0.02 },
    { name: "ring", ids: [13, 14, 15, 16], x: centerX + 0.02 },
    { name: "pinky", ids: [17, 18, 19, 20], x: centerX + 0.06 }
  ];
  const extended = {
    index: ["index", "peace", "palm", "pinch", "menu-pinch", "other"].includes(gesture),
    middle: ["peace", "palm", "menu-pinch"].includes(gesture),
    ring: ["palm", "menu-pinch", "other"].includes(gesture),
    pinky: ["palm", "menu-pinch"].includes(gesture)
  };

  for (const finger of fingers) {
    const [mcp, pip, dip, tip] = finger.ids;
    hand[mcp] = point(finger.x, centerY + 0.08);
    hand[pip] = point(finger.x, centerY);
    if (extended[finger.name]) {
      hand[dip] = point(finger.x, centerY - 0.08);
      hand[tip] = point(finger.x, centerY - 0.16);
    } else {
      hand[dip] = point(finger.x + 0.012, centerY + 0.035);
      hand[tip] = point(finger.x + 0.02, centerY + 0.075);
    }
  }

  if (["pinch", "menu-pinch"].includes(gesture)) {
    hand[4] = point(hand[8].x + 0.008, hand[8].y + 0.006);
  }
  return hand;
}

function handedness(label) {
  return [{ categoryName: label, score: 0.99 }];
}

function frames(count, gesture, position, start = 0, step = 33) {
  return Array.from({ length: count }, (_, index) => {
    const location = typeof position === "function" ? position(index, count) : position;
    return {
      t: start + index * step,
      landmarks: location ? [makeHand(gesture, location.x, location.y)] : [],
      handedness: location ? [handedness("Right")] : []
    };
  });
}

function twoHandFrames(count, gestures, positions, start = 0, step = 33) {
  return Array.from({ length: count }, (_, index) => {
    const pair = typeof positions === "function" ? positions(index, count) : positions;
    return {
      t: start + index * step,
      landmarks: [makeHand(gestures[0], pair[0].x, pair[0].y), makeHand(gestures[1], pair[1].x, pair[1].y)],
      handedness: [handedness("Left"), handedness("Right")]
    };
  });
}

const environment = { mirror: true, cameraWidth: 640, cameraHeight: 480, synthetic: true };

const coreFixtures = [
  {
    schemaVersion: 1,
    fixtureId: "core-index-draw-down-sideways",
    createdAt: "2026-06-28T00:00:00Z",
    environment,
    metadata: { setup: { tool: "pen" }, description: "Index-only path moves down, then sideways." },
    frames: frames(18, "index", (i) => ({ x: 0.42 + Math.max(0, i - 9) * 0.018, y: 0.34 + Math.min(i, 9) * 0.018 })),
    expectedSignals: [{ type: "state.DRAWING", betweenMs: [100, 350] }],
    expectedCommands: [],
    forbiddenCommands: ["menu.open", "overlay.clear"]
  },
  {
    schemaVersion: 1,
    fixtureId: "core-circle-orientation-change",
    createdAt: "2026-06-28T00:00:00Z",
    environment,
    metadata: { setup: { tool: "circle" }, description: "Index gesture traces a circle while hand position changes." },
    frames: frames(20, "index", (i, n) => ({ x: 0.5 + Math.cos((i / n) * Math.PI * 2) * 0.12, y: 0.5 + Math.sin((i / n) * Math.PI * 2) * 0.12 })),
    expectedSignals: [{ type: "state.DRAWING", betweenMs: [100, 350] }],
    expectedCommands: [],
    forbiddenCommands: ["menu.open"]
  },
  {
    schemaVersion: 1,
    fixtureId: "core-peace-pointer-no-draw",
    createdAt: "2026-06-28T00:00:00Z",
    environment,
    metadata: { setup: { tool: "pen" }, description: "Peace sign moves slowly without drawing." },
    frames: frames(12, "peace", (i) => ({ x: 0.42 + i * 0.008, y: 0.48 })),
    expectedSignals: [{ type: "state.POINTING", betweenMs: [60, 250] }],
    expectedCommands: [],
    forbiddenCommands: ["overlay.undo", "overlay.redo"]
  },
  {
    schemaVersion: 1,
    fixtureId: "core-stationary-palm-menu",
    createdAt: "2026-06-28T00:00:00Z",
    environment,
    metadata: { description: "Stationary palm holds long enough to open the radial menu." },
    frames: frames(26, "palm", { x: 0.5, y: 0.5 }),
    expectedSignals: [{ type: "menu.open", betweenMs: [550, 900] }],
    expectedCommands: [],
    forbiddenCommands: ["presentation.next", "presentation.previous"]
  },
  {
    schemaVersion: 1,
    fixtureId: "core-fast-palm-swipe-next",
    createdAt: "2026-06-28T00:00:00Z",
    environment,
    metadata: { setup: { slideMode: true }, description: "Fast mirrored palm movement advances one slide without opening the menu." },
    frames: frames(8, "palm", (i) => ({ x: 0.28 + i * 0.06, y: 0.5 }), 700),
    expectedCommands: [{ type: "presentation.next", betweenMs: [700, 950] }],
    expectedSignals: [],
    forbiddenCommands: ["menu.open"]
  },
  {
    schemaVersion: 1,
    fixtureId: "phase5-palm-swipe-next-return-suppressed",
    createdAt: "2026-07-02T00:00:00Z",
    environment,
    metadata: { setup: { slideMode: true }, description: "Right-to-left screen swipe advances once; the natural return motion stays suppressed until palm release." },
    frames: [
      ...frames(10, "palm", (i) => ({ x: 0.25 + i * 0.055, y: 0.5 })),
      ...frames(30, "palm", (i) => ({ x: 0.745 - i * 0.016, y: 0.5 }), 330)
    ],
    expectedCommands: [{ type: "presentation.next", betweenMs: [30, 400] }],
    expectedSignals: [],
    forbiddenCommands: ["presentation.previous"],
    forbiddenSignals: ["menu.open"]
  },
  {
    schemaVersion: 1,
    fixtureId: "phase5-palm-swipe-previous-direction",
    createdAt: "2026-07-02T00:00:00Z",
    environment,
    metadata: { setup: { slideMode: true }, description: "Left-to-right screen swipe goes to the previous slide." },
    frames: frames(10, "palm", (i) => ({ x: 0.75 - i * 0.055, y: 0.5 })),
    expectedCommands: [{ type: "presentation.previous", betweenMs: [30, 400] }],
    expectedSignals: [],
    forbiddenCommands: ["presentation.next"],
    forbiddenSignals: ["menu.open"]
  },
  {
    schemaVersion: 1,
    fixtureId: "core-one-to-two-hands",
    createdAt: "2026-06-28T00:00:00Z",
    environment,
    metadata: { description: "A second hand enters and two-hand mode wins after confirmation." },
    frames: [
      ...frames(5, "fist", { x: 0.35, y: 0.5 }),
      ...twoHandFrames(8, ["fist", "fist"], [{ x: 0.34, y: 0.5 }, { x: 0.68, y: 0.5 }], 165)
    ],
    expectedSignals: [{ type: "two-hand.enter", betweenMs: [300, 500] }],
    expectedCommands: [],
    forbiddenCommands: ["menu.open", "presentation.next", "presentation.previous"]
  },
  {
    schemaVersion: 1,
    fixtureId: "core-two-hand-pinch-zoom",
    createdAt: "2026-06-28T00:00:00Z",
    environment,
    metadata: { description: "Two pinches stabilize, spread apart and then move together." },
    frames: [
      ...twoHandFrames(12, ["pinch", "pinch"], [{ x: 0.4, y: 0.5 }, { x: 0.6, y: 0.5 }]),
      ...twoHandFrames(8, ["pinch", "pinch"], (i) => [{ x: 0.4 - i * 0.015, y: 0.5 }, { x: 0.6 + i * 0.015, y: 0.5 }], 396),
      ...twoHandFrames(8, ["pinch", "pinch"], (i) => [{ x: 0.295 + i * 0.012, y: 0.5 }, { x: 0.705 - i * 0.012, y: 0.5 }], 660)
    ],
    expectedSignals: [{ type: "zoom.change", betweenMs: [350, 850] }],
    expectedCommands: [],
    forbiddenCommands: ["menu.open", "presentation.next", "presentation.previous"]
  },
  {
    schemaVersion: 1,
    fixtureId: "core-tracking-loss-during-draw",
    createdAt: "2026-06-28T00:00:00Z",
    environment,
    metadata: { setup: { tool: "pen" }, description: "Drawing begins, landmarks disappear briefly and then remain absent." },
    frames: [
      ...frames(12, "index", (i) => ({ x: 0.42 + i * 0.01, y: 0.42 + i * 0.006 })),
      ...frames(3, "none", null, 396),
      ...frames(4, "index", (i) => ({ x: 0.62 + i * 0.008, y: 0.54 }), 495),
      ...frames(20, "none", null, 627)
    ],
    expectedSignals: [
      { type: "state.DRAWING", betweenMs: [100, 350] },
      { type: "drawing.tracking-loss-stop", betweenMs: [450, 650] },
      { type: "state.IDLE", betweenMs: [1000, 1400] }
    ],
    expectedCommands: [],
    forbiddenCommands: ["menu.open", "overlay.clear"]
  },
  {
    schemaVersion: 1,
    fixtureId: "regression-menu-open-finger-pinch-select",
    createdAt: "2026-06-28T00:00:00Z",
    environment,
    metadata: { setup: { tool: "pen" }, description: "Open palm opens the menu, the hand points right, then pinches while the remaining fingers stay open." },
    frames: [
      ...frames(26, "palm", { x: 0.5, y: 0.5 }),
      ...frames(5, "index", { x: 0.3, y: 0.5 }, 858),
      ...frames(4, "menu-pinch", { x: 0.3, y: 0.5 }, 1023)
    ],
    expectedSignals: [{ type: "menu.open", betweenMs: [550, 900] }],
    expectedCommands: [{ type: "tool.select", betweenMs: [1000, 1150] }],
    forbiddenCommands: ["presentation.next", "presentation.previous"]
  },
  {
    schemaVersion: 1,
    fixtureId: "phase4c-menu-temporary-other",
    createdAt: "2026-07-02T00:00:00Z",
    environment,
    metadata: { description: "The open menu survives an unclassified transition before a stable pinch." },
    frames: [
      ...frames(26, "palm", { x: 0.5, y: 0.5 }),
      ...frames(4, "other", { x: 0.34, y: 0.5 }, 858),
      ...frames(3, "index", { x: 0.3, y: 0.5 }, 990),
      ...frames(4, "menu-pinch", { x: 0.3, y: 0.5 }, 1089)
    ],
    expectedSignals: [{ type: "menu.open", betweenMs: [550, 900] }],
    expectedCommands: [{ type: "tool.select", betweenMs: [1100, 1250] }],
    forbiddenCommands: ["presentation.next", "presentation.previous"]
  },
  {
    schemaVersion: 1,
    fixtureId: "phase4c-two-hands-return-one",
    createdAt: "2026-07-02T00:00:00Z",
    environment,
    metadata: { description: "Confirmed two-hand mode releases without an immediate one-hand action." },
    frames: [
      ...twoHandFrames(9, ["fist", "fist"], [{ x: 0.34, y: 0.5 }, { x: 0.68, y: 0.5 }]),
      ...frames(8, "palm", { x: 0.5, y: 0.5 }, 297)
    ],
    expectedSignals: [{ type: "two-hand.enter", betweenMs: [150, 260] }, { type: "two-hand.exit", betweenMs: [400, 560] }],
    expectedCommands: [],
    forbiddenCommands: ["presentation.next", "presentation.previous", "menu.open"]
  },
  {
    schemaVersion: 1,
    fixtureId: "phase4c-early-clear-release",
    createdAt: "2026-07-02T00:00:00Z",
    environment,
    metadata: { description: "Two open palms released before one second never clear." },
    frames: [
      ...twoHandFrames(20, ["palm", "palm"], [{ x: 0.32, y: 0.5 }, { x: 0.7, y: 0.5 }]),
      ...frames(8, "fist", { x: 0.5, y: 0.5 }, 660)
    ],
    expectedSignals: [{ type: "two-hand.enter", betweenMs: [150, 260] }],
    expectedCommands: [],
    forbiddenCommands: ["overlay.clear", "menu.open"],
    forbiddenSignals: ["overlay.clear"]
  }
];

export { coreFixtures, makeHand };
