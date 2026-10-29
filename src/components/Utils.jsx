
export function formatStrikeRate(runs, balls) {
  if (!balls) return "0.00";
  return ((runs / balls) * 100).toFixed(2);
}

export function formatOvers(legalBalls) {
  return `${Math.floor(legalBalls / 6)}.${legalBalls % 6}`;
}

export function calculateRunRate(runs, legalBalls) {
  if (!legalBalls) return "0.00";
  return ((runs * 6) / legalBalls).toFixed(2);
}

export function calculateRequiredRate(runsRequired, ballsRemaining) {
  if (runsRequired <= 0) return "0.00";
  if (ballsRemaining <= 0) return "—";
  return ((runsRequired * 6) / ballsRemaining).toFixed(2);
}

export function calculateEconomy(runsConceded, legalBalls) {
  if (!legalBalls) return "0.00";
  return ((runsConceded * 6) / legalBalls).toFixed(2);
}

export function calculateBoundaryPercentage(fours, sixes, runs) {
  if (!runs) return "0.0";
  return (((fours * 4 + sixes * 6) / runs) * 100).toFixed(1);
}

export function validateMatchConfig(config) {
  const errors = {};

  if (!Number.isInteger(config.overs) || config.overs < 1 || config.overs > 50) {
    errors.overs = "Overs must be between 1 and 50.";
  }

  if (
    !Number.isInteger(config.wickets) ||
    config.wickets < 1 ||
    config.wickets > 10
  ) {
    errors.wickets = "Wickets must be between 1 and 10.";
  }

  if (
    !Number.isInteger(config.target) ||
    config.target < 1 ||
    config.target > 999
  ) {
    errors.target = "Target must be between 1 and 999.";
  }

  if (!["easy", "normal", "hard"].includes(config.difficulty)) {
    errors.difficulty = "Choose a valid difficulty.";
  }

  if (!["defensive", "balanced", "aggressive"].includes(config.shotStyle)) {
    errors.shotStyle = "Choose a valid batting style.";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
