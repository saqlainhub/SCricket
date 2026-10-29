
const SHOT_PROFILES = {
  defensive: {
    label: "Defensive",
    outcomes: [
      { value: 0, weight: 48 },
      { value: 1, weight: 34 },
      { value: 2, weight: 10 },
      { value: 3, weight: 2 },
      { value: 4, weight: 3 },
      { value: 6, weight: 0.5 },
      { value: "W", weight: 2.5 },
    ],
  },
  balanced: {
    label: "Balanced",
    outcomes: [
      { value: 0, weight: 30 },
      { value: 1, weight: 30 },
      { value: 2, weight: 15 },
      { value: 3, weight: 3 },
      { value: 4, weight: 13 },
      { value: 6, weight: 5 },
      { value: "W", weight: 4 },
    ],
  },
  aggressive: {
    label: "Aggressive",
    outcomes: [
      { value: 0, weight: 15 },
      { value: 1, weight: 17 },
      { value: 2, weight: 12 },
      { value: 3, weight: 3 },
      { value: 4, weight: 23 },
      { value: 6, weight: 18 },
      { value: "W", weight: 15 },
    ],
  },
};

const DIFFICULTY_MULTIPLIERS = {
  easy: 0.65,
  normal: 1,
  hard: 1.5,
};

export function createInitialMatch(config) {
  const batterCount = config.wickets + 1;

  return {
    config,
    status: "playing",
    runs: 0,
    wickets: 0,
    legalBalls: 0,
    strikerIndex: 0,
    nonStrikerIndex: 1,
    batters: Array.from({ length: batterCount }, (_, index) => ({
      name: index === 0 ? "You" : `Batter ${index + 1}`,
      runs: 0,
      balls: 0,
      fours: 0,
      sixes: 0,
      dismissed: false,
    })),
    history: [],
    commentary: "You're on strike. Choose your shot.",
    lastOutcome: null,
    result: null,
  };
}

export function formatOvers(legalBalls) {
  return `${Math.floor(legalBalls / 6)}.${legalBalls % 6}`;
}

export function getRunRate(runs, legalBalls) {
  if (!legalBalls) return "0.00";
  return ((runs * 6) / legalBalls).toFixed(2);
}

export function getRemainingBalls(match) {
  return Math.max(
    0,
    match.config.overs * 6 - match.legalBalls
  );
}

function pickWeightedOutcome(outcomes, random) {
  const totalWeight = outcomes.reduce(
    (sum, outcome) => sum + outcome.weight,
    0
  );

  let roll = random() * totalWeight;

  for (const outcome of outcomes) {
    roll -= outcome.weight;
    if (roll < 0) return outcome.value;
  }

  return outcomes[outcomes.length - 1].value;
}

function chooseOutcome(shot, difficulty, random) {
  const profile = SHOT_PROFILES[shot] ?? SHOT_PROFILES.balanced;
  const multiplier = DIFFICULTY_MULTIPLIERS[difficulty] ?? 1;

  const outcomes = profile.outcomes.map((item) => ({
    ...item,
    weight:
      item.value === "W"
        ? item.weight * multiplier
        : item.weight,
  }));

  return pickWeightedOutcome(outcomes, random);
}

function describeOutcome(outcome, batterName) {
  if (outcome === "W") return `OUT! ${batterName} is dismissed.`;
  if (outcome === 0) return "Dot ball. No runs.";
  if (outcome === 4) return "FOUR! Beautifully placed to the boundary.";
  if (outcome === 6) return "SIX! Smashed over the boundary.";
  return `${outcome} run${outcome === 1 ? "" : "s"} scored.`;
}

export function playDelivery(match, shot, random = Math.random) {
  if (match.status !== "playing") return match;
  if (getRemainingBalls(match) <= 0) return finishMatch(match);

  const outcome = chooseOutcome(
    shot,
    match.config.difficulty,
    random
  );

  const next = {
    ...match,
    batters: match.batters.map((batter) => ({ ...batter })),
    history: [...match.history],
  };

  const striker = next.batters[next.strikerIndex];
  const batterName = striker.name;

  next.legalBalls += 1;
  striker.balls += 1;

  const runs = outcome === "W" ? 0 : outcome;

  next.history.push({
    ball: next.legalBalls,
    outcome,
    shot,
    runs,
    wicket: outcome === "W",
  });

  next.lastOutcome = outcome;
  next.commentary = describeOutcome(outcome, batterName);

  if (outcome === "W") {
    striker.dismissed = true;
    next.wickets += 1;

    if (next.wickets >= next.config.wickets) {
      return finishMatch(next);
    }

    const nextBatterIndex = next.wickets + 1;

    if (nextBatterIndex < next.batters.length) {
      next.strikerIndex = nextBatterIndex;
    }
  } else {
    next.runs += outcome;
    striker.runs += outcome;

    if (outcome === 4) striker.fours += 1;
    if (outcome === 6) striker.sixes += 1;

    if (outcome % 2 === 1) {
      [next.strikerIndex, next.nonStrikerIndex] = [
        next.nonStrikerIndex,
        next.strikerIndex,
      ];
    }
  }

  if (next.runs >= next.config.target) {
    return finishMatch(next);
  }

  if (next.legalBalls >= next.config.overs * 6) {
    return finishMatch(next);
  }

  if (next.legalBalls % 6 === 0) {
    [next.strikerIndex, next.nonStrikerIndex] = [
      next.nonStrikerIndex,
      next.strikerIndex,
    ];
    next.commentary += " End of over.";
  }

  return next;
}

export function finishMatch(match) {
  if (match.status === "ended") return match;

  let message;

  if (match.runs >= match.config.target) {
    message = `You won by ${match.config.wickets - match.wickets} wicket${
      match.config.wickets - match.wickets === 1 ? "" : "s"
    }!`;
  } else if (match.runs === match.config.target - 1) {
    message = "Match tied.";
  } else {
    message = `You lost by ${match.config.target - match.runs - 1} run${
      match.config.target - match.runs - 1 === 1 ? "" : "s"
    }.`;
  }

  return {
    ...match,
    status: "ended",
    result: {
      won: match.runs >= match.config.target,
      message,
      runs: match.runs,
      wickets: match.wickets,
      overs: formatOvers(match.legalBalls),
    },
    commentary: message,
  };
}
