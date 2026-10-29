import { useCallback, useEffect, useRef, useState } from "react";
import {
  FiArrowLeft,
  FiPause,
  FiPlay,
  FiX,
  FiBarChart2,
  FiInfo,
  FiRotateCcw,
  FiShield,
  FiTarget,
  FiZap,
} from "react-icons/fi";
import { GiCricketBat } from "react-icons/gi";
import groundImage from "../assets/img1.jpg";
import {
  createInitialMatch,
  playDelivery as resolveDelivery,
} from "../game/matchEngine";

const SHOTS = [
  {
    id: "defensive",
    name: "DEFEND",
    label: "Defense",
    description: "Prioritize control and protect your wicket.",
    color: "#83c7ef",
  },
  {
    id: "balanced",
    name: "BALANCED",
    label: "Balanced",
    description: "Balance placement, timing, and scoring.",
    color: "#66e0a1",
  },
  {
    id: "aggressive",
    name: "ATTACK",
    label: "Attack",
    description: "Aim for boundaries with greater risk.",
    color: "#f4c66a",
  },
];

function overs(balls = 0) {
  const value = Math.max(0, Number(balls) || 0);
  return `${Math.floor(value / 6)}.${value % 6}`;
}

function rate(runs = 0, balls = 0) {
  return balls > 0
    ? ((Number(runs) * 6) / Number(balls)).toFixed(2)
    : "0.00";
}

/**
 * Convert one history entry into the value shown in the over display.
 * Handles common numeric outcomes and text-based outcome labels.
 */
function getBallResult(item) {
  if (
    item?.wicket ||
    item?.isWicket ||
    String(item?.outcome ?? "").toUpperCase() === "W" ||
    String(item?.outcome ?? "").toUpperCase() === "WICKET"
  ) {
    return "W";
  }

  const outcome = item?.outcome;

  if (outcome !== undefined && outcome !== null && outcome !== "") {
    const normalized = String(outcome).trim().toUpperCase();

    if (["W", "WICKET", "OUT"].includes(normalized)) return "W";
    if (["DOT", "DOT BALL", "MAIDEN"].includes(normalized)) return "0";
    if (normalized === "FOUR") return "4";
    if (normalized === "SIX") return "6";

    const numericOutcome = Number(outcome);

    if (
      Number.isFinite(numericOutcome) &&
      numericOutcome >= 0 &&
      numericOutcome <= 6
    ) {
      return String(numericOutcome);
    }
  }

  const runsScored = Number(item?.runs ?? item?.runsScored ?? 0);

  if (Number.isFinite(runsScored) && runsScored >= 0) {
    return String(runsScored);
  }

  return "0";
}

function getResult(match, oldRuns, oldWickets) {
  const item = match?.history?.[match.history.length - 1];
  const outcome = item?.outcome ?? match?.lastOutcome;

  if (
    item?.wicket ||
    outcome === "W" ||
    Number(match?.wickets ?? 0) > oldWickets
  ) {
    return { label: "WICKET", symbol: "W", type: "wicket" };
  }

  if (Number(outcome) === 6 || String(outcome).toUpperCase() === "SIX") {
    return { label: "SIX", symbol: "6", type: "six" };
  }

  if (Number(outcome) === 4 || String(outcome).toUpperCase() === "FOUR") {
    return { label: "FOUR", symbol: "4", type: "four" };
  }

  const difference = Number(match?.runs ?? 0) - Number(oldRuns ?? 0);
  const parsedOutcome = Number(outcome);
  const value =
    outcome !== undefined &&
    outcome !== null &&
    outcome !== "" &&
    Number.isFinite(parsedOutcome)
      ? parsedOutcome
      : difference;

  return {
    label: value === 0 ? "DOT BALL" : `${value} RUN${value === 1 ? "" : "S"}`,
    symbol: String(Math.max(0, value)),
    type: value === 0 ? "dot" : "runs",
  };
}

function ShotIcon({ shotId, size = 21 }) {
  if (shotId === "defensive") {
    return <FiShield size={size} strokeWidth={2.2} aria-hidden="true" />;
  }

  if (shotId === "balanced") {
    return <FiTarget size={size} strokeWidth={2.2} aria-hidden="true" />;
  }

  return <FiZap size={size} strokeWidth={2.2} aria-hidden="true" />;
}

function Circle({ children, label, gold = false }) {
  return (
    <div className="flex shrink-0 flex-col items-center gap-2">
      <div
        className={`flex aspect-square w-[clamp(76px,30vh,120px)] items-center justify-center rounded-full border-2 text-2xl font-black tabular-nums backdrop-blur-md sm:text-3xl ${
          gold
            ? "border-amber-300/70 bg-amber-400/15 text-amber-200 shadow-[0_0_30px_rgba(250,204,21,.18)]"
            : "border-white/40 bg-black/40 text-white shadow-[0_3px_24px_rgba(0,0,0,.3)]"
        }`}
      >
        {children}
      </div>
      <span className="whitespace-nowrap text-[9px] font-bold uppercase tracking-[0.14em] text-white/80 sm:text-[10px]">
        {label}
      </span>
    </div>
  );
}

function MiniBall({ value }) {
  let color = "border border-white/15 bg-white/20 text-white";

  if (value === "W") {
    color = "border border-red-300/60 bg-red-500 text-white";
  } else if (value === "4") {
    color = "border border-emerald-200/60 bg-emerald-300 text-[#062114]";
  } else if (value === "6") {
    color = "border border-amber-200/60 bg-amber-300 text-[#211800]";
  } else if (value === "0") {
    color = "border border-white/10 bg-white/10 text-white/70";
  }

  return (
    <span
      className={`flex h-[clamp(17px,3vh,24px)] min-w-[clamp(17px,3vh,24px)] items-center justify-center rounded-full px-1 text-[9px] font-black tabular-nums ${color}`}
    >
      {value}
    </span>
  );
}

function Stat({ label, value }) {
  return (
    <div className="min-w-0">
      <div className="text-[8px] uppercase tracking-wider text-white/55 sm:text-[9px]">
        {label}
      </div>
      <div className="truncate text-[10px] font-bold tabular-nums text-white sm:text-xs">
        {value}
      </div>
    </div>
  );
}

function Modal({ children, onClose, label, className = "" }) {
  return (
    <div
      className={`absolute inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-black/75 p-2 backdrop-blur-sm sm:p-3 ${className}`}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      {children}
    </div>
  );
}


function initializeConfiguredMatch(config) {
  const initial = createInitialMatch(config);
  const batterNames = Array.isArray(config?.batterNames) && config.batterNames.length
    ? config.batterNames
    : ["Batter 1", "Batter 2", ...Array.from(
        { length: Math.max(0, Number(config?.wickets ?? 5) - 1) },
        (_, index) => `Batter ${index + 3}`
      )];
  const bowlerNames = Array.isArray(config?.bowlerNames) && config.bowlerNames.length
    ? config.bowlerNames
    : ["Computer Bowler"];

  const existingBatters = Array.isArray(initial?.batters) ? initial.batters : [];
  const batters = batterNames.map((name, index) => ({
    ...(existingBatters[index] ?? {
      runs: 0, balls: 0, fours: 0, sixes: 0, dismissed: false,
    }),
    name,
  }));

  const firstBowler = bowlerNames[0] || "Computer Bowler";
  return {
    ...initial,
    batters,
    strikerIndex: Number(initial?.strikerIndex ?? 0),
    nonStrikerIndex: Number(initial?.nonStrikerIndex ?? 1),
    bowlerName: firstBowler,
    bowler: { ...(initial?.bowler ?? {}), name: firstBowler },
  };
}

export default function Play({ config, goHome, replayMatch }) {
  const [match, setMatch] = useState(() => initializeConfiguredMatch(config));
  const [showPlayerSetup, setShowPlayerSetup] = useState(false);
  const [showBowlerPicker, setShowBowlerPicker] = useState(false);
  const [showBatterPicker, setShowBatterPicker] = useState(false);
  const [pendingBowlerChange, setPendingBowlerChange] = useState(false);
  const [previousOverBowler, setPreviousOverBowler] = useState(null);
  const [activeBowlerIndex, setActiveBowlerIndex] = useState(0);
  const [incomingBatterIndex, setIncomingBatterIndex] = useState(null);
  const configuredBowlerNames = Array.isArray(config?.bowlerNames) && config.bowlerNames.length
    ? config.bowlerNames
    : ["Computer Bowler"];
  const [bowlingFigures, setBowlingFigures] = useState(() =>
    configuredBowlerNames.map((name) => ({
      name, runs: 0, wickets: 0, legalBalls: 0,
    }))
  );
  const [selectedShot, setSelectedShot] = useState(
    config?.shotStyle || "balanced"
  );
  const [phase, setPhase] = useState("ready");
  const [countdown, setCountdown] = useState(3);
  const [result, setResult] = useState(null);
  const [showScorecard, setShowScorecard] = useState(false);
  const [scorecardTab, setScorecardTab] = useState("batting");
  const [showDetails, setShowDetails] = useState(false);
  const [showExit, setShowExit] = useState(false);
  const [showPause, setShowPause] = useState(false);
  const [paused, setPaused] = useState(false);

  const matchRef = useRef(match);
  const phaseRef = useRef("ready");
  const busyRef = useRef(false);
  const timersRef = useRef([]);

  useEffect(() => {
    matchRef.current = match;
  }, [match]);

  const schedule = useCallback((fn, delay) => {
    const id = setTimeout(fn, delay);
    timersRef.current.push(id);
    return id;
  }, []);

  useEffect(
    () => () => timersRef.current.forEach(clearTimeout),
    []
  );

  const runs = Number(match?.runs ?? 0);
  const wickets = Number(match?.wickets ?? 0);
  const legalBalls = Number(match?.legalBalls ?? 0);
  const totalOvers = Number(config?.overs ?? 5);
  const maxBalls = totalOvers * 6;
  const remainingBalls = Math.max(0, maxBalls - legalBalls);
  const target = Number(config?.target ?? 30);
  const needed = Math.max(0, target - runs);
  const runRate = rate(runs, legalBalls);
  const requiredRate =
    remainingBalls > 0 ? rate(needed, remainingBalls) : "—";

  const batters = match?.batters ?? [];
  const strikerIndex = Number(match?.strikerIndex ?? 0);
  const nonStrikerIndex = Number(match?.nonStrikerIndex ?? 1);

  const striker = batters[strikerIndex] ?? {
    name: "Batter 1",
    runs: 0,
    balls: 0,
    fours: 0,
    sixes: 0,
  };

  const nonStriker = batters[nonStrikerIndex] ?? {
    name: "Batter 2",
    runs: 0,
    balls: 0,
    fours: 0,
    sixes: 0,
  };

  const history = match?.history ?? [];
  const overIndex = Math.floor(Math.max(0, legalBalls - 1) / 6);

  /*
   * Include entries from the current over even when they are marked
   * as non-legal deliveries. This prevents extras from being hidden.
   * Support either "ball" or "ballNumber" as the history index.
   */
  const currentOver = history
    .filter((item) => {
      const ballNumber = Number(item?.ball ?? item?.ballNumber ?? 0);

      return (
        ballNumber > 0 &&
        Math.floor((ballNumber - 1) / 6) === overIndex
      );
    })
    .slice(-6)
    .map(getBallResult);

  const bowler = match?.bowler ?? {};
  const bowlerName = match?.bowlerName ?? bowler?.name ?? "Computer Bowler";
  const activeBowlingFigure = bowlingFigures[activeBowlerIndex] ?? {
    runs: 0,
    wickets: 0,
    legalBalls: 0,
  };
  const bowlerRuns = activeBowlingFigure.runs;
  const bowlerWickets = activeBowlingFigure.wickets;
  const bowlerBalls = activeBowlingFigure.legalBalls;

  const ended =
    match?.status === "ended" ||
    Boolean(match?.result) ||
    runs >= target ||
    wickets >= Number(config?.wickets ?? 5) ||
    remainingBalls <= 0;

  const endTitle =
    runs >= target
      ? "YOU WIN"
      : runs === target - 1
        ? "MATCH TIED"
        : "INNINGS COMPLETE";

  const endMessage =
    runs >= target
      ? `Target reached with ${Math.max(
          0,
          Number(config?.wickets ?? 5) - wickets
        )} wickets remaining.`
      : runs === target - 1
        ? "The innings finished level on runs."
        : `You finished ${Math.max(0, target - runs)} runs short of the target.`;

  const playDelivery = useCallback(() => {
    if (
      busyRef.current ||
      phaseRef.current !== "ready" ||
      paused ||
      ended
    ) {
      return;
    }

    busyRef.current = true;
    phaseRef.current = "countdown";
    setPhase("countdown");
    setCountdown(3);

    let count = 3;

    const tick = () => {
      count -= 1;

      if (count > 0) {
        setCountdown(count);
        schedule(tick, 700);
        return;
      }

      setCountdown(0);

      const current = matchRef.current;
      const oldRuns = Number(current?.runs ?? 0);
      const oldWickets = Number(current?.wickets ?? 0);
      const oldLegalBalls = Number(current?.legalBalls ?? 0);
      const oldStrikerIndex = Number(current?.strikerIndex ?? 0);
      const oldBowlerRuns = Number(current?.bowlerRuns ?? current?.bowler?.runsConceded ?? current?.runsConceded ?? oldRuns);
      const oldBowlerWickets = Number(current?.bowlerWickets ?? current?.bowler?.wickets ?? 0);

      let updated;

      try {
        updated = resolveDelivery(current, selectedShot);
      } catch (error) {
        console.error("Could not play delivery:", error);
        busyRef.current = false;
        phaseRef.current = "ready";
        setPhase("ready");
        return;
      }

      if (!updated) {
        busyRef.current = false;
        phaseRef.current = "ready";
        setPhase("ready");
        return;
      }

      const newWickets = Number(updated?.wickets ?? 0);
      const newLegalBalls = Number(updated?.legalBalls ?? oldLegalBalls);
      const wicketFell = newWickets > oldWickets;
      const overFinished =
        newLegalBalls > oldLegalBalls &&
        newLegalBalls % 6 === 0 &&
        newLegalBalls < maxBalls;
      const batterList = Array.isArray(updated?.batters) ? [...updated.batters] : [];
      if (wicketFell && batterList[oldStrikerIndex]) {
        batterList[oldStrikerIndex] = {
          ...batterList[oldStrikerIndex],
          dismissed: true,
        };
        updated = { ...updated, batters: batterList, strikerIndex: oldStrikerIndex };
      }

      const runDelta = Math.max(0, Number(updated?.runs ?? oldRuns) - oldRuns);
      const wicketDelta = Math.max(0, newWickets - oldWickets);
      const ballDelta = Math.max(0, newLegalBalls - oldLegalBalls);
      setBowlingFigures((currentFigures) => currentFigures.map((figure, index) =>
        index === activeBowlerIndex
          ? {
              ...figure,
              runs: figure.runs + runDelta,
              wickets: figure.wickets + wicketDelta,
              legalBalls: figure.legalBalls + ballDelta,
            }
          : figure
      ));

      matchRef.current = updated;
      setMatch(updated);
      setResult(getResult(updated, oldRuns, oldWickets));
      phaseRef.current = "result";
      setPhase("result");

      schedule(() => {
        busyRef.current = false;

        const isOver =
          updated?.status === "ended" ||
          Boolean(updated?.result) ||
          Number(updated?.runs ?? 0) >= target ||
          Number(updated?.wickets ?? 0) >= Number(config?.wickets ?? 5) ||
          Number(updated?.legalBalls ?? 0) >= maxBalls;

        if (isOver) {
          phaseRef.current = "ended";
          setPhase("ended");
          return;
        }

        if (wicketFell) {
          const dismissedIndex = oldStrikerIndex;
          const nextIndex = (updated?.batters ?? []).findIndex((batter, index) =>
            index !== dismissedIndex &&
            index !== Number(updated?.nonStrikerIndex ?? 1) &&
            !batter?.dismissed
          );
          if (nextIndex >= 0) {
            setIncomingBatterIndex(nextIndex);
            setShowBatterPicker(true);
            setPendingBowlerChange(overFinished);
          } else if (overFinished) {
            setPreviousOverBowler(activeBowlerIndex);
            setShowBowlerPicker(true);
          }
          phaseRef.current = "selection";
          setPhase("ready");
          return;
        }

        if (overFinished) {
          setPreviousOverBowler(activeBowlerIndex);
          setShowBowlerPicker(true);
          phaseRef.current = "selection";
          setPhase("ready");
          return;
        }

        phaseRef.current = "ready";
        setPhase("ready");
      }, 1750);
    };

    schedule(tick, 700);
  }, [paused, ended, schedule, selectedShot, target, config, maxBalls, activeBowlerIndex]);

  const chooseNextBowler = (index) => {
    const name = configuredBowlerNames[index];
    if (!name || index === previousOverBowler) return;

    setActiveBowlerIndex(index);
    setMatch((current) => {
      const updated = {
        ...current,
        bowlerName: name,
        bowlerRuns: 0,
        bowlerWickets: 0,
        bowlerLegalBalls: 0,
        runsConceded: 0,
        bowler: {
          ...(current?.bowler ?? {}),
          name,
          runsConceded: 0,
          wickets: 0,
          legalBalls: 0,
        },
      };
      matchRef.current = updated;
      return updated;
    });
    setPreviousOverBowler(previousOverBowler);
    setShowBowlerPicker(false);
    setPendingBowlerChange(false);
    phaseRef.current = "ready";
    setPhase("ready");
  };

  const chooseIncomingBatter = (index) => {
    const current = matchRef.current;
    const batter = current?.batters?.[index];
    if (!batter || batter.dismissed || index === Number(current?.nonStrikerIndex ?? 1)) {
      return;
    }

    const updated = {
      ...current,
      strikerIndex: index,
      batters: current.batters.map((item, itemIndex) =>
        itemIndex === index ? { ...item, dismissed: false } : item
      ),
    };
    matchRef.current = updated;
    setMatch(updated);
    setShowBatterPicker(false);

    if (pendingBowlerChange) {
      setPreviousOverBowler(activeBowlerIndex);
      setShowBowlerPicker(true);
      setPendingBowlerChange(false);
    } else {
      phaseRef.current = "ready";
      setPhase("ready");
    }
  };

  const exitMatch = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    goHome?.();
  };

  const resumeMatch = () => {
    setPaused(false);
    setShowPause(false);
    phaseRef.current = ended ? "ended" : "ready";
    setPhase(ended ? "ended" : "ready");
  };

  const selected =
    SHOTS.find((shot) => shot.id === selectedShot) ?? SHOTS[1];

  return (
    <div className="fixed inset-0 z-50 flex min-h-0 h-[100dvh] w-full flex-col overflow-hidden bg-[#07120C] text-white">
      {/* Full-screen ground background */}
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${groundImage})` }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[#06140B]/35" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/65 via-[#07150C]/15 to-black/75" />

      {/* Top bar: original height and controls preserved */}
      <header className="relative z-20 flex h-[62px] shrink-0 items-start justify-between border-b border-white/15 bg-[#07130C]/65 px-2 pt-2 backdrop-blur-md sm:h-12 sm:items-center sm:pt-0 sm:px-4">
        <div className="flex min-w-0 shrink-0 items-center gap-1 sm:gap-3">
          <button
            type="button"
            onClick={() => setShowExit(true)}
            title="Exit match"
            aria-label="Exit match"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-white/20 bg-black/20 hover:bg-white/15 sm:h-8 sm:w-8"
          >
            <FiArrowLeft size={16} />
          </button>

          <span className="hidden items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-emerald-200 sm:flex">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" />
            Live
          </span>

          <button
            type="button"
            onClick={() => {
              setScorecardTab("batting");
              setShowScorecard(true);
            }}
            className="flex items-center gap-1 rounded-md border border-white/15 bg-black/20 px-2 py-1.5 text-[9px] font-bold tracking-wide hover:bg-white/15 sm:px-3 sm:text-[10px]"
          >
            <FiBarChart2 size={13} />
            <span className="hidden sm:inline">SCORECARD</span>
            <span className="sm:hidden">SCORE</span>
          </button>

          <button
            type="button"
            onClick={() => setShowDetails((value) => !value)}
            title="More match statistics"
            aria-label="More match statistics"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-white/80 hover:bg-white/15"
          >
            <FiInfo size={14} />
          </button>
        </div>

        {/* Commentary remains inside the existing top bar */}
        <div
          className="pointer-events-none absolute bottom-1 left-2 right-2 flex w-auto max-w-xl translate-x-0 items-center justify-center gap-1.5 overflow-hidden sm:bottom-auto sm:left-1/2 sm:right-auto sm:top-1/2 sm:w-[34%] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:gap-2"
          aria-live="polite"
        >
          <span className="hidden shrink-0 text-[8px] font-black uppercase tracking-wider text-amber-200 md:inline sm:text-[9px]">
            COMMENTARY
          </span>
          <span className="min-w-0 truncate text-center text-[9px] text-white sm:text-[10px] md:text-[11px]">
            {match?.commentary ||
              (legalBalls === 0
                ? "Choose your shot and play the first ball."
                : "Select your shot for the next delivery.")}
          </span>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-5">
          <div className="text-right leading-tight">
            <span className="text-[8px] text-white/65 sm:text-[9px]">
              RR <b className="ml-1 text-white">{runRate}</b>
            </span>
            <span className="mx-1 text-white/30 sm:mx-1.5">|</span>
            <span className="text-[8px] text-white/65 sm:text-[9px]">
              RRR <b className="ml-1 text-amber-200">{requiredRate}</b>
            </span>
          </div>

          <button
            type="button"
            disabled={ended || phase === "countdown" || phase === "result"}
            onClick={() => {
              setPaused(true);
              setShowPause(true);
            }}
            className="flex h-7 items-center gap-1 rounded-md border border-white/20 bg-black/25 px-2 text-[9px] font-bold hover:bg-white/15 disabled:opacity-40 sm:h-8 sm:px-3 sm:text-[10px]"
          >
            <FiPause size={13} />
            <span className="hidden sm:inline">PAUSE</span>
          </button>
        </div>

        {showDetails && (
          <div className="absolute left-2 right-2 top-full z-30 mt-1 grid grid-cols-3 gap-3 rounded-lg border border-white/20 bg-[#10251B]/95 p-3 shadow-xl backdrop-blur-xl sm:left-auto sm:right-20 sm:w-80 sm:grid-cols-2">
            <Stat label="Run rate" value={runRate} />
            <Stat label="Required rate" value={requiredRate} />
            <Stat label="Runs needed" value={needed} />
            <Stat label="Balls remaining" value={remainingBalls} />
            <Stat label="Bowler economy" value={rate(bowlerRuns, bowlerBalls)} />
            <Stat
              label="Wickets remaining"
              value={Math.max(0, Number(config?.wickets ?? 5) - wickets)}
            />
          </div>
        )}
      </header>

      {/* Main gameplay */}
      <main className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden px-1.5 py-1 sm:px-5">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#07120C]/10 via-transparent to-[#07120C]/20" />

        <div className="relative flex w-full max-w-6xl flex-col items-center justify-center">
          {/* Large side indicators, smaller central batting button */}
          <div className="flex w-full items-center justify-between gap-1 px-0 sm:gap-2 sm:px-5 md:px-8">
            <Circle label="Balls left">{remainingBalls}</Circle>

            <button
              type="button"
              onClick={playDelivery}
              disabled={ended || paused || phase !== "ready" || showBowlerPicker || showBatterPicker}
              aria-label="Play delivery"
              title="Play delivery"
              className={`group relative flex aspect-square w-[clamp(76px,12vh,112px)] shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 ${
                phase === "countdown"
                  ? "animate-[cricketPulse_.7s_ease-in-out_infinite] border-amber-200 bg-amber-400/20 text-amber-100 shadow-[0_0_0_8px_rgba(251,191,36,.12),0_0_0_18px_rgba(251,191,36,.07)]"
                  : phase === "ready" && !paused && !ended
                    ? "border-emerald-200 bg-[#16834D]/90 text-white shadow-[0_0_28px_rgba(16,185,129,.3)] hover:scale-105 hover:bg-[#1BA65F] active:scale-95"
                    : "border-white/30 bg-black/50 text-white/60"
              }`}
            >
              <span className="absolute inset-[5px] rounded-full border border-white/25" />

              {phase === "countdown" ? (
                <span
                  key={countdown}
                  className="relative animate-[cricketNumber_.65s_ease-out] text-4xl font-black tabular-nums sm:text-5xl"
                >
                  {countdown}
                </span>
              ) : (
                <GiCricketBat
                  className="relative drop-shadow-md transition-transform duration-200 group-hover:-rotate-12"
                  size={38}
                  aria-hidden="true"
                />
              )}
            </button>

            <Circle label="Total runs" gold>
              {Math.max(0, target - runs)}
            </Circle>
          </div>

          {/* Only the selected shot name appears above the shot buttons */}
          <div
            className="mt-2 h-4 text-center text-[10px] font-black uppercase tracking-[0.2em] drop-shadow sm:mt-3 sm:text-xs"
            style={{ color: selected.color }}
            aria-live="polite"
          >
            {selected.label}
          </div>

          {/* Three compact shot buttons with icons and yellow selected glow */}
          <div className="mt-2 flex w-full max-w-xs items-center justify-center gap-5 sm:mt-3 sm:gap-7">
            {SHOTS.map((shot) => {
              const active = selectedShot === shot.id;

              return (
                <div
                  key={shot.id}
                  className="group relative flex min-w-0 flex-col items-center"
                >
                  <button
                    type="button"
                    disabled={phase !== "ready" || paused || ended}
                    onClick={() => setSelectedShot(shot.id)}
                    aria-label={`${shot.label}: ${shot.description}`}
                    aria-pressed={active}
                    title={shot.description}
                    className={`relative flex h-[clamp(35px,5.5vh,48px)] w-[clamp(35px,5.5vh,48px)] items-center justify-center rounded-full border shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${
                      active
                        ? "z-10 scale-110 border-yellow-300 bg-yellow-400/20 text-yellow-200 ring-1 ring-yellow-200/50 shadow-[0_0_12px_rgba(250,204,21,.65),0_0_28px_rgba(250,204,21,.3)]"
                        : "border-white/40 bg-[#07170D]/85 text-white/80 hover:border-yellow-300/60 hover:text-yellow-100"
                    }`}
                    style={
                      active
                        ? {
                            boxShadow:
                              "0 0 10px rgba(250,204,21,.75), 0 0 24px rgba(250,204,21,.42), 0 0 40px rgba(250,204,21,.18)",
                          }
                        : undefined
                    }
                  >
                    {active && (
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute -inset-2 -z-10 rounded-full bg-yellow-400/20 blur-md"
                      />
                    )}

                    <span className="relative z-10">
                      <ShotIcon shotId={shot.id} size={21} />
                    </span>
                  </button>

                  <span
                    className={`mt-1 text-[8px] font-bold tracking-wider sm:text-[9px] ${
                      active ? "text-yellow-200" : "text-white/65"
                    }`}
                  >
                    {shot.name}
                  </span>

                  {/* Shot description appears on hover or keyboard focus */}
                  <div className="pointer-events-none absolute bottom-full left-1/2 z-40 mb-2 hidden w-40 -translate-x-1/2 rounded-lg border border-white/15 bg-[#0B1C12]/95 p-2 text-center text-[10px] leading-relaxed text-white shadow-xl group-hover:block  sm:w-48 sm:text-xs">
                    <div
                      className="mb-1 font-bold"
                      style={{ color: shot.color }}
                    >
                      {shot.label}
                    </div>
                    {shot.description}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Bottom scoreboard */}
      <footer className="relative z-20 grid h-[clamp(100px,15vh,145px)] shrink-0 grid-cols-[minmax(0,1fr)_minmax(76px,.58fr)_minmax(0,1fr)] border-t border-white/10 bg-gray-900 text-[#F8FAF8] shadow-[0_-5px_25px_rgba(0,0,0,.35)] backdrop-blur-xl sm:grid-cols-[minmax(0,1.2fr)_minmax(175px,.8fr)_minmax(0,1.2fr)]">
        <section className="flex min-w-0 flex-col justify-center gap-2 border-r border-[#3f3f38] px-1.5 py-1.5 sm:gap-3 sm:px-5 sm:py-2">
          {[striker, nonStriker].map((batter, index) => {
            const isStriker = index === 0;

            return (
              <div
                key={`${batter?.name ?? "batter"}-${index}`}
                className="flex min-w-0 items-center gap-1 sm:gap-2"
              >
                <span
                  className={`w-2 shrink-0 text-[10px] font-black ${
                    isStriker ? "text-[#b0ea04]" : "text-transparent"
                  }`}
                >
                  ▶
                </span>
                <span
                  className={`min-w-0 flex-1 truncate text-[10px] sm:text-xs ${
                    isStriker
                      ? "font-black text-[#ccf500]"
                      : "font-semibold text-[#9dafa4]"
                  }`}
                >
                  {batter?.name ?? `Batter ${index + 1}`}
                </span>
                <span className="shrink-0 whitespace-nowrap text-[10px] font-black tabular-nums text-[#b7cbbd] sm:text-sm">
                  {batter?.runs ?? 0}
                  <span className="ml-0.5 font-medium text-[#6e7e72]">
                    ({batter?.balls ?? 0})
                  </span>
                </span>
              </div>
            );
          })}
        </section>

        <section className="flex min-w-0 flex-col items-center justify-center border-r border-[#3f3f38] px-1 py-1 text-center">
          <div className="my-0.5 whitespace-nowrap text-[clamp(23px,5vh,39px)] font-black leading-none tracking-tight text-[#c7d4cc] tabular-nums">
            {runs}
            <span className="mx-1 text-[#afc0b2]">-</span>
            {wickets}
          </div>
          <div className="mt-1 whitespace-nowrap text-[8px] font-bold text-[#618573] sm:text-[10px]">
            Target {target}
          </div>
        </section>

        <section className="flex min-w-0 flex-col justify-center gap-1.5 px-1.5 py-1.5 sm:gap-2 sm:px-5 sm:py-2">
          <div className="flex min-w-0 items-center justify-between gap-1.5">
            <div className="min-w-0 truncate text-[10px] font-black text-[#c9d7ce] sm:text-xs">
              {bowlerName}
            </div>
            <div className="shrink-0 text-right text-[10px] font-black tabular-nums text-[#b5c8bb] sm:text-xs">
              {bowlerRuns} - {bowlerWickets} / {overs(bowlerBalls)}
            </div>
          </div>

          <div className="flex min-w-0 items-center gap-1 overflow-hidden">
            {currentOver.length ? (
              currentOver.map((value, index) => (
                <MiniBall key={`${index}-${value}`} value={value} />
              ))
            ) : (
              <span className="text-[9px] text-[#a4b4a9]">—</span>
            )}
          </div>
        </section>
      </footer>

      {/* Delivery result animation */}
      {phase === "result" && result && (
        <div
          className="pointer-events-none absolute inset-0 z-[80] flex items-center justify-center overflow-hidden bg-black/75 backdrop-blur-[3px] animate-[cricketFadeIn_.18s_ease-out]"
          aria-live="assertive"
        >
          <div
            className={`absolute inset-0 ${
              result.type === "wicket"
                ? "bg-red-600/20"
                : result.type === "six"
                  ? "bg-amber-400/15"
                  : "bg-emerald-400/10"
            }`}
          />

          <div className="relative flex flex-col items-center text-center animate-[cricketResult_.9s_cubic-bezier(.2,.8,.2,1)]">
            <div
              className={`text-xs font-black uppercase tracking-[.35em] sm:text-sm ${
                result.type === "wicket"
                  ? "text-red-300"
                  : result.type === "six"
                    ? "text-amber-300"
                    : "text-emerald-200"
              }`}
            >
              {result.label}
            </div>

            <div
              className={`my-1 font-black leading-none tabular-nums ${
                result.type === "wicket"
                  ? "text-red-400"
                  : result.type === "six"
                    ? "text-amber-300"
                    : "text-white"
              }`}
              style={{
                fontSize: "clamp(110px, 27vw, 250px)",
                textShadow: "0 0 55px rgba(255,255,255,.15)",
              }}
            >
              {result.symbol}
            </div>


          </div>
        </div>
      )}

      {/* Exit confirmation */}
      {showExit && (
        <Modal label="Exit match" onClose={() => setShowExit(false)}>
          <div className="w-full max-w-sm rounded-xl border border-white/20 bg-[#102219] p-5 shadow-2xl">
            <h2 className="text-lg font-black">Exit match?</h2>
            <p className="mt-2 text-xs leading-relaxed text-white/60">
              Leaving now will end your current match.
            </p>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setShowExit(false)}
                className="flex-1 rounded-lg border border-white/15 px-3 py-2.5 text-xs font-bold hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={exitMatch}
                className="flex-1 rounded-lg bg-red-500 px-3 py-2.5 text-xs font-bold hover:bg-red-400"
              >
                Exit match
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Pause menu */}
      {showPause && (
        <Modal label="Match paused" onClose={resumeMatch}>
          <div className="w-full max-w-sm rounded-xl border border-white/20 bg-[#102219] p-5 text-center shadow-2xl">
            <FiPause className="mx-auto mb-3 text-emerald-300" size={27} />
            <h2 className="text-xl font-black">Match paused</h2>
            <p className="mt-2 text-xs text-white/60">
              Current score: {runs}-{wickets}
            </p>
            <button
              type="button"
              onClick={resumeMatch}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-400 px-4 py-3 text-xs font-black text-[#07130D] hover:bg-emerald-300"
            >
              <FiPlay size={14} fill="currentColor" />
              RESUME MATCH
            </button>
            <button
              type="button"
              onClick={() => {
                setShowPause(false);
                setShowExit(true);
              }}
              className="mt-2 w-full rounded-lg px-4 py-2 text-xs text-white/55 hover:text-white"
            >
              Exit match
            </button>
          </div>
        </Modal>
      )}

      {/* Choose the incoming batter after a wicket */}
      {showBatterPicker && (
        <Modal
          label="Choose incoming batter"
          onClose={() => {}}
          className="!z-[95]"
        >
          <div className="w-full max-w-md rounded-2xl border border-white/15 max-h-[90dvh] overflow-y-auto bg-[#102219] p-4 shadow-2xl sm:p-7">
            <div className="text-[9px] font-black uppercase tracking-[.25em] text-emerald-300">
              WICKET FALLEN
            </div>
            <h2 className="mt-2 text-xl font-black sm:text-2xl">Choose next batter</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/55">
              Select a batter who is not dismissed and is not currently at the crease.
            </p>
            <div className="mt-5 max-h-[45dvh] space-y-2 overflow-auto">
              {(match?.batters ?? []).map((batter, index) => {
                const unavailable =
                  Boolean(batter?.dismissed) ||
                  index === Number(match?.nonStrikerIndex ?? 1) ||
                  index === Number(match?.strikerIndex ?? 0);
                return (
                  <button
                    key={`${batter?.name ?? "batter"}-${index}`}
                    type="button"
                    disabled={unavailable}
                    onClick={() => chooseIncomingBatter(index)}
                    className="flex w-full items-center justify-between rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-left text-sm font-bold transition hover:border-emerald-300/50 hover:bg-emerald-400/10 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <span>{batter?.name ?? `Batter ${index + 1}`}</span>
                    <span className="text-[10px] font-semibold text-white/45">
                      {batter?.dismissed ? "OUT" :
                        index === Number(match?.nonStrikerIndex ?? 1) ? "AT CREASE" :
                        index === Number(match?.strikerIndex ?? 0) ? "CURRENT BATTER" : "AVAILABLE"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </Modal>
      )}

      {/* Choose a different bowler at the end of each over */}
      {showBowlerPicker && (
        <Modal
          label="Choose next over bowler"
          onClose={() => {}}
          className="!z-[96]"
        >
          <div className="w-full max-w-md rounded-2xl border border-white/15 max-h-[90dvh] overflow-y-auto bg-[#102219] p-4 shadow-2xl sm:p-7">
            <div className="text-[9px] font-black uppercase tracking-[.25em] text-amber-300">
              OVER COMPLETE
            </div>
            <h2 className="mt-2 text-xl font-black sm:text-2xl">Choose next bowler</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/55">
              {configuredBowlerNames.length < 2
                ? "Add at least two bowlers in Settings to continue after an over."
                : "The bowler who delivered the previous over cannot bowl this over."}
            </p>
            <div className="mt-5 max-h-[45dvh] space-y-2 overflow-auto">
              {configuredBowlerNames.map((name, index) => {
                const unavailable = index === previousOverBowler;
                return (
                  <button
                    key={`${name}-${index}`}
                    type="button"
                    disabled={unavailable || configuredBowlerNames.length < 2}
                    onClick={() => chooseNextBowler(index)}
                    className="flex w-full items-center justify-between rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-left text-sm font-bold transition hover:border-amber-300/50 hover:bg-amber-400/10 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <span>{name}</span>
                    <span className="text-[10px] font-semibold text-white/45">
                      {unavailable ? "PREVIOUS OVER" : index === activeBowlerIndex ? "CURRENT BOWLER" : "AVAILABLE"}
                    </span>
                  </button>
                );
              })}
            </div>
            {configuredBowlerNames.length < 2 && (
              <p className="mt-4 text-xs text-red-300">
                This innings needs at least two configured bowlers to change ends after an over. Return to Settings and add another bowler.
              </p>
            )}
          </div>
        </Modal>
      )}

      {/* Full scorecard */}
      {showScorecard && (
        <Modal
          label="Full scorecard"
          onClose={() => setShowScorecard(false)}
          className="!z-[100]"
        >
          <div className="flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-white/20 bg-[#0B1B12]/[.98] shadow-2xl">
            <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3 sm:px-6">
              <div>
                <div className="text-[9px] font-black uppercase tracking-[.2em] text-emerald-300">
                  MATCH CENTRE
                </div>
                <h2 className="mt-1 text-lg font-black">Full scorecard</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowScorecard(false)}
                className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white"
                aria-label="Close scorecard"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="flex shrink-0 items-center border-b border-white/10 px-4 sm:px-6">
              {[
                { id: "batting", label: "BATTING" },
                { id: "bowling", label: "BOWLING" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setScorecardTab(tab.id)}
                  className={`relative px-4 py-3 text-[10px] font-black tracking-wider ${
                    scorecardTab === tab.id
                      ? "text-emerald-300"
                      : "text-white/45 hover:text-white"
                  }`}
                >
                  {tab.label}
                  {scorecardTab === tab.id && (
                    <span className="absolute inset-x-4 bottom-0 h-0.5 bg-emerald-300" />
                  )}
                </button>
              ))}
              <div className="ml-auto text-right">
                <div className="text-xl font-black tabular-nums">
                  {runs}-{wickets}
                </div>
                <div className="text-[9px] text-white/45">
                  {overs(legalBalls)} overs
                </div>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-auto p-3 sm:p-5">
              {scorecardTab === "batting" ? (
                <table className="w-full min-w-[290px] border-collapse text-left text-[10px] sm:min-w-0 sm:text-xs">
                  <thead>
                    <tr className="border-b border-white/15 text-[9px] uppercase tracking-wider text-white/45">
                      <th className="py-3 pr-2">Batter</th>
                      <th className="px-1 py-3 text-right">R</th>
                      <th className="px-1 py-3 text-right">B</th>
                      <th className="px-1 py-3 text-right">4s</th>
                      <th className="px-1 py-3 text-right">6s</th>
                      <th className="py-3 pl-1 text-right">SR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(batters.length ? batters : [striker, nonStriker]).map(
                      (batter, index) => {
                        const balls = Number(batter?.balls ?? 0);
                        const batterRuns = Number(batter?.runs ?? 0);
                        const isCurrent =
                          index === strikerIndex || index === nonStrikerIndex;

                        return (
                          <tr
                            key={`${batter?.name ?? "batter"}-${index}`}
                            className="border-b border-white/[.07]"
                          >
                            <td className="py-3 pr-2">
                              <span className="font-bold text-white">
                                {batter?.name ?? `Batter ${index + 1}`}
                              </span>
                              {isCurrent && (
                                <span className="ml-1 text-emerald-300">*</span>
                              )}
                              <div className="mt-0.5 text-[9px] text-white/40">
                                {batter?.dismissed
                                  ? "Out"
                                  : isCurrent
                                    ? "Not out"
                                    : "—"}
                              </div>
                            </td>
                            <td className="px-1 py-3 text-right font-black tabular-nums">
                              {batterRuns}
                            </td>
                            <td className="px-1 py-3 text-right tabular-nums text-white/70">
                              {balls}
                            </td>
                            <td className="px-1 py-3 text-right tabular-nums text-white/70">
                              {batter?.fours ?? 0}
                            </td>
                            <td className="px-1 py-3 text-right tabular-nums text-white/70">
                              {batter?.sixes ?? 0}
                            </td>
                            <td className="py-3 pl-1 text-right tabular-nums text-amber-300">
                              {rate(batterRuns, balls)}
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              ) : (
                <table className="w-full min-w-[290px] border-collapse text-left text-[10px] sm:min-w-0 sm:text-xs">
                  <thead>
                    <tr className="border-b border-white/15 text-[9px] uppercase tracking-wider text-white/45">
                      <th className="py-3 pr-2">Bowler</th>
                      <th className="px-1 py-3 text-right">O</th>
                      <th className="px-1 py-3 text-right">R</th>
                      <th className="px-1 py-3 text-right">W</th>
                      <th className="px-1 py-3 text-right">Econ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bowlingFigures.map((figure, index) => (
                      <tr
                        key={`${figure.name}-${index}`}
                        className="border-b border-white/[.07]"
                      >
                        <td className="py-3 pr-2 font-bold text-white">
                          {figure.name}
                          {index === activeBowlerIndex && (
                            <span className="ml-1 text-emerald-300">•</span>
                          )}
                        </td>
                        <td className="px-1 py-3 text-right tabular-nums text-white/70">
                          {overs(figure.legalBalls)}
                        </td>
                        <td className="px-1 py-3 text-right tabular-nums text-white/70">
                          {figure.runs}
                        </td>
                        <td className="px-1 py-3 text-right tabular-nums text-white/70">
                          {figure.wickets}
                        </td>
                        <td className="px-1 py-3 text-right tabular-nums text-amber-300">
                          {rate(figure.runs, figure.legalBalls)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              <div className="mt-5 grid grid-cols-2 gap-4 rounded-lg border border-white/10 bg-white/[.03] p-3 sm:grid-cols-4 sm:p-4">
                <Stat label="Run rate" value={runRate} />
                <Stat label="Required rate" value={requiredRate} />
                <Stat label="Target" value={target} />
                <Stat label="Balls remaining" value={remainingBalls} />
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* End-of-match panel */}
      {phase === "ended" && !showScorecard && (
        <div className="absolute inset-0 z-[90] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl border border-white/20 bg-[#102219] p-6 text-center shadow-2xl">
            <GiCricketBat className="mx-auto mb-3 text-emerald-300" size={32} />
            <div className="text-[9px] font-black uppercase tracking-[.25em] text-emerald-300">
              FINAL SCORE
            </div>
            <div className="mt-2 text-5xl font-black tabular-nums">
              {runs}-{wickets}
            </div>
            <h2 className="mt-4 text-2xl font-black">{endTitle}</h2>
            <p className="mt-2 text-xs leading-relaxed text-white/60">
              {match?.result?.message ?? endMessage}
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  setScorecardTab("batting");
                  setShowScorecard(true);
                }}
                className="flex-1 rounded-lg border border-white/15 px-4 py-3 text-xs font-bold hover:bg-white/5"
              >
                View scorecard
              </button>
              <button
                type="button"
                onClick={() => replayMatch?.()}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-400 px-4 py-3 text-xs font-black text-[#07130D] hover:bg-emerald-300"
              >
                <FiRotateCcw size={14} />
                PLAY AGAIN
              </button>
            </div>
            <button
              type="button"
              onClick={exitMatch}
              className="mt-3 w-full px-4 py-2 text-xs text-white/50 hover:text-white"
            >
              Back to home
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes cricketFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes cricketResult {
          0% {
            opacity: 0;
            transform: translateY(28px) scale(.55);
            filter: blur(9px);
          }
          55% {
            opacity: 1;
            transform: translateY(-3px) scale(1.06);
            filter: blur(0);
          }
          75% { transform: translateY(0) scale(1); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes cricketPulse {
          0%, 100% {
            box-shadow:
              0 0 0 5px rgba(251,191,36,.10),
              0 0 0 12px rgba(251,191,36,.04);
          }
          50% {
            box-shadow:
              0 0 0 10px rgba(251,191,36,.16),
              0 0 0 20px rgba(251,191,36,.07);
          }
        }

        @keyframes cricketNumber {
          from { opacity: 0; transform: scale(1.5); }
          to { opacity: 1; transform: scale(1); }
        }

        @media (max-height: 430px) {
          header { height: 38px; }
          main { padding-top: 2px; padding-bottom: 2px; }
          footer { height: 78px; }
        }
      `}</style>
    </div>
  );
}