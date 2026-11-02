
import React, { useState } from "react";
import {
  FiArrowLeft,
  FiArrowRight,
  FiTarget,
  FiZap,
  FiUsers,
  FiUser,
  FiCheck,
  FiShield,
  FiActivity,
  FiPlay,
} from "react-icons/fi";
import Button from "../components/Button";

const oversOptions = [2, 5, 10, 20];
const wicketOptions = [2, 5, 8, 10];

const steps = [
  { label: "Match", short: "01" },
  { label: "Batters", short: "02" },
  { label: "Bowlers", short: "03" },
  { label: "Gameplay", short: "04" },
  { label: "Preview", short: "05" },
];

function OptionButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`min-w-12 rounded-xl border px-4 py-3 text-sm font-bold transition ${
        active
          ? "border-primary bg-primary text-main shadow-lg shadow-primary/10"
          : "border-bprimary bg-black/10 text-tsecondary hover:border-primary/50"
      }`}
    >
      {children}
    </button>
  );
}

function createDefaultNames(count, prefix, startIndex = 1) {
  return Array.from(
    { length: count },
    (_, index) => `${prefix} ${startIndex + index}`
  );
}

function resizeNames(currentNames, requiredCount, prefix) {
  const names = Array.isArray(currentNames) ? currentNames : [];

  if (names.length >= requiredCount) {
    return names.slice(0, requiredCount);
  }

  return [
    ...names,
    ...createDefaultNames(
      requiredCount - names.length,
      prefix,
      names.length + 1
    ),
  ];
}

function SectionHeading({
  icon: Icon,
  title,
  description,
  accent = "primary",
}) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <div
        className={`rounded-xl p-3 ${
          accent === "secondary"
            ? "bg-secondary/10 text-secondary"
            : "bg-primary/10 text-primary"
        }`}
      >
        <Icon size={21} />
      </div>

      <div>
        <h2 className="text-lg font-bold text-white">{title}</h2>
        <p className="text-xs leading-5 text-tmuted sm:text-sm">
          {description}
        </p>
      </div>
    </div>
  );
}

function ReviewRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/10 py-2.5 last:border-0">
      <span className="text-xs text-tmuted">{label}</span>
      <span className="text-right text-sm font-semibold capitalize text-white">
        {value}
      </span>
    </div>
  );
}

export default function Settings({ nextPage, prevPage, setMatchConfig }) {
  const [overs, setOvers] = useState(5);
  const [wickets, setWickets] = useState(5);
  const [target, setTarget] = useState("30");
  const [difficulty, setDifficulty] = useState("normal");
  const [shotStyle, setShotStyle] = useState("balanced");
  const [error, setError] = useState("");
  const [step, setStep] = useState(0);

  const [batterNames, setBatterNames] = useState(() =>
    createDefaultNames(6, "Batter")
  );

  const [bowlerNames, setBowlerNames] = useState(() =>
    createDefaultNames(5, "Bowler")
  );

  const maxBatters = wickets + 1;
  const maxBowlers = Math.min(overs, wickets);

  const updateName = (setter, names, index, value) => {
    setter(
      names.map((name, nameIndex) =>
        nameIndex === index ? value : name
      )
    );
  };

  const updateWickets = (value) => {
    setWickets(value);

    setBatterNames((current) =>
      resizeNames(current, value + 1, "Batter")
    );

    setBowlerNames((current) =>
      resizeNames(current, Math.min(overs, value), "Bowler")
    );

    setError("");
  };

  const updateOvers = (value) => {
    setOvers(value);

    setBowlerNames((current) =>
      resizeNames(current, Math.min(value, wickets), "Bowler")
    );

    setError("");
  };

  const validateTarget = () => {
    const numericTarget = Number(target);

    if (
      !Number.isInteger(numericTarget) ||
      numericTarget < 1 ||
      numericTarget > 999
    ) {
      setError("Enter a target between 1 and 999 runs.");
      return false;
    }

    return true;
  };

  const validateNames = (type) => {
    const names =
      type === "batters"
        ? batterNames.slice(0, maxBatters).map((name) => name.trim())
        : bowlerNames.slice(0, maxBowlers).map((name) => name.trim());

    if (names.some((name) => !name)) {
      setError(
        type === "batters"
          ? "Enter a name for every batter in the lineup."
          : "Enter a name for every bowler in the bowling lineup."
      );

      return false;
    }

    return true;
  };

  // NEXT ONLY CHANGES THE CURRENT STEP.
  // It never starts the game or submits a form.
  const goNext = () => {
    setError("");

    if (step === 0 && !validateTarget()) return;
    if (step === 1 && !validateNames("batters")) return;
    if (step === 2 && !validateNames("bowlers")) return;

    setStep((current) => Math.min(current + 1, 4));
  };

  const goBack = () => {
    setError("");

    if (step === 0) {
      prevPage();
      return;
    }

    setStep((current) => Math.max(current - 1, 0));
  };

  // ONLY THE FINAL PLAY MATCH BUTTON CALLS THIS FUNCTION.
  const startGame = () => {
    setError("");

    const numericTarget = Number(target);

    if (
      !Number.isInteger(numericTarget) ||
      numericTarget < 1 ||
      numericTarget > 999
    ) {
      setError("Enter a target between 1 and 999 runs.");
      setStep(0);
      return;
    }

    const configuredBatters = batterNames
      .slice(0, maxBatters)
      .map((name) => name.trim());

    const configuredBowlers = bowlerNames
      .slice(0, maxBowlers)
      .map((name) => name.trim());

    if (configuredBatters.some((name) => !name)) {
      setError("Enter a name for every batter in the lineup.");
      setStep(1);
      return;
    }

    if (
      configuredBowlers.length < 1 ||
      configuredBowlers.some((name) => !name)
    ) {
      setError("Enter a name for every bowler in the bowling lineup.");
      setStep(2);
      return;
    }

    const allNames = [...configuredBatters, ...configuredBowlers];
    const normalizedNames = allNames.map((name) => name.toLowerCase());

    if (new Set(normalizedNames).size !== normalizedNames.length) {
      setError("Each batter and bowler must have a unique name.");
      setStep(4);
      return;
    }

    // Preserve the original match configuration structure.
    setMatchConfig({
      overs,
      wickets,
      target: numericTarget,
      difficulty,
      shotStyle,
      batterNames: configuredBatters,
      bowlerNames: configuredBowlers,
    });

    // Move to the Play page only after clicking Play Match.
    nextPage();
  };

  const sectionLabel = "mb-3 block text-sm font-semibold text-tprimary";

  const inputClass =
    "w-full rounded-xl border border-bprimary bg-input px-4 py-3 text-sm font-semibold text-white outline-none transition focus:border-primary";

  const stepTitles = [
    "Set match conditions",
    "Build your batting lineup",
    "Choose your bowlers",
    "Customize gameplay",
    "Review your match",
  ];

  return (
    <main className="stadium-background min-h-[100dvh]">
      <div className="mx-auto flex min-h-[100dvh] max-w-5xl flex-col px-4 py-5 sm:px-6 sm:py-8">

        {/* TOP NAVIGATION */}
        <div className="mb-5 flex shrink-0 items-center justify-between gap-3">
          <button
            type="button"
            onClick={goBack}
            className="inline-flex items-center gap-2 rounded-lg py-2 text-sm font-semibold text-tsecondary transition hover:text-white"
          >
            <FiArrowLeft />
            {step === 0 ? "Back to home" : "Previous"}
          </button>

          <span className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
            Match setup
          </span>
        </div>

        {/* PROGRESS */}
        <div className="mb-6 shrink-0">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                Step {step + 1} of {steps.length}
              </p>

              <h1 className="mt-1 text-2xl font-black text-white sm:text-3xl">
                {stepTitles[step]}
              </h1>
            </div>

            <span className="pb-1 text-sm font-semibold text-tmuted">
              {Math.round(((step + 1) / steps.length) * 100)}%
            </span>
          </div>

          <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{
                width: `${((step + 1) / steps.length) * 100}%`,
              }}
            />
          </div>

          <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
            {steps.map((item, index) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  if (index < step) {
                    setError("");
                    setStep(index);
                  }
                }}
                disabled={index >= step}
                className={`flex min-w-0 items-center justify-center gap-1 rounded-lg px-1 py-2 text-[9px] font-bold uppercase tracking-wide transition sm:gap-2 sm:text-[11px] ${
                  index === step
                    ? "bg-primary/15 text-primary"
                    : index < step
                    ? "text-secondary hover:bg-white/5"
                    : "text-tmuted/60"
                }`}
              >
                {index < step ? <FiCheck size={12} /> : item.short}
                <span className="truncate">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* IMPORTANT: NO FORM WRAPPER HERE.
            This prevents Next from accidentally submitting the setup. */}
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1">

            {/* STEP 1: MATCH CONDITIONS */}
            {step === 0 && (
              <section className="glass-panel rounded-2xl p-5 sm:p-7">
                <SectionHeading
                  icon={FiTarget}
                  title="Match conditions"
                  description="Define the limits and target for your innings."
                />

                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label className={sectionLabel}>Total overs</label>

                    <div className="flex flex-wrap gap-2">
                      {oversOptions.map((value) => (
                        <OptionButton
                          key={value}
                          active={overs === value}
                          onClick={() => updateOvers(value)}
                        >
                          {value}
                        </OptionButton>
                      ))}
                    </div>

                    <p className="mt-2 text-xs text-tmuted">
                      {overs * 6} legal deliveries. Up to{" "}
                      {Math.min(overs, wickets)} bowlers.
                    </p>
                  </div>

                  <div>
                    <label className={sectionLabel}>Wicket limit</label>

                    <div className="flex flex-wrap gap-2">
                      {wicketOptions.map((value) => (
                        <OptionButton
                          key={value}
                          active={wickets === value}
                          onClick={() => updateWickets(value)}
                        >
                          {value}
                        </OptionButton>
                      ))}
                    </div>

                    <p className="mt-2 text-xs text-tmuted">
                      {wickets + 1} available batters.
                    </p>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="target" className={sectionLabel}>
                      Target score
                    </label>

                    <input
                      id="target"
                      type="number"
                      min="1"
                      max="999"
                      step="1"
                      value={target}
                      onChange={(event) => {
                        setTarget(event.target.value);
                        setError("");
                      }}
                      className="w-full max-w-sm rounded-xl border border-bprimary bg-input px-4 py-3 text-lg font-bold text-white outline-none focus:border-primary"
                    />

                    <p className="mt-2 text-xs text-tmuted">
                      Reach this score to win the match.
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* STEP 2: BATTING LINEUP */}
            {step === 1 && (
              <section className="glass-panel rounded-2xl p-5 sm:p-7">
                <SectionHeading
                  icon={FiUsers}
                  title="Batting lineup"
                  description={`Add names for all ${maxBatters} batters in your team.`}
                />

                <div className="mb-4 flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2.5 text-xs text-tsecondary">
                  <FiActivity className="shrink-0 text-primary" />
                  <span>
                    Batter 1 opens as striker. Batter 2 starts as non-striker.
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {Array.from({ length: maxBatters }, (_, index) => (
                    <div key={index}>
                      <label
                        htmlFor={`batter-${index}`}
                        className={sectionLabel}
                      >
                        Batter {index + 1}
                        {index === 0 ? " · Opening striker" : ""}
                        {index === 1 ? " · Non-striker" : ""}
                      </label>

                      <input
                        id={`batter-${index}`}
                        type="text"
                        maxLength={24}
                        value={batterNames[index] ?? ""}
                        onChange={(event) => {
                          updateName(
                            setBatterNames,
                            batterNames,
                            index,
                            event.target.value
                          );
                          setError("");
                        }}
                        placeholder={`Enter batter ${index + 1} name`}
                        className={inputClass}
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* STEP 3: BOWLING LINEUP */}
            {step === 2 && (
              <section className="glass-panel rounded-2xl p-5 sm:p-7">
                <SectionHeading
                  icon={FiUser}
                  title="Bowling lineup"
                  description={`Select the ${maxBowlers} bowlers available for this innings.`}
                  accent="secondary"
                />

                <div className="mb-4 rounded-xl border border-secondary/20 bg-secondary/5 px-3 py-3 text-xs leading-5 text-tsecondary">
                  Maximum {maxBowlers} bowlers, based on the lower of your over
                  limit ({overs}) and wicket limit ({wickets}). The bowler from
                  the previous over cannot bowl the next over.
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {Array.from({ length: maxBowlers }, (_, index) => (
                    <div key={index}>
                      <label
                        htmlFor={`bowler-${index}`}
                        className={sectionLabel}
                      >
                        Bowler {index + 1}
                      </label>

                      <input
                        id={`bowler-${index}`}
                        type="text"
                        maxLength={24}
                        value={bowlerNames[index] ?? ""}
                        onChange={(event) => {
                          updateName(
                            setBowlerNames,
                            bowlerNames,
                            index,
                            event.target.value
                          );
                          setError("");
                        }}
                        placeholder={`Enter bowler ${index + 1} name`}
                        className={inputClass}
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* STEP 4: GAMEPLAY PREFERENCES */}
            {step === 3 && (
              <section className="glass-panel rounded-2xl p-5 sm:p-7">
                <SectionHeading
                  icon={FiZap}
                  title="Gameplay preferences"
                  description="Choose the challenge and your starting batting approach."
                  accent="secondary"
                />

                <div className="space-y-6">
                  <div>
                    <label className={sectionLabel}>Difficulty</label>

                    <div className="grid gap-2 sm:grid-cols-3">
                      {[
                        ["easy", "Easy", "Lower wicket risk"],
                        ["normal", "Normal", "Balanced challenge"],
                        ["hard", "Hard", "Higher wicket risk"],
                      ].map(([value, label, description]) => (
                        <button
                          key={value}
                          type="button"
                          aria-pressed={difficulty === value}
                          onClick={() => setDifficulty(value)}
                          className={`rounded-xl border p-4 text-left transition ${
                            difficulty === value
                              ? "border-primary bg-primary/10"
                              : "border-bprimary bg-black/10 hover:border-primary/40"
                          }`}
                        >
                          <p className="font-bold text-white">{label}</p>
                          <p className="mt-1 text-xs text-tmuted">
                            {description}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className={sectionLabel}>
                      Starting batting style
                    </label>

                    <div className="grid gap-2 sm:grid-cols-3">
                      {[
                        ["defensive", "Defensive", "Protect your wicket"],
                        ["balanced", "Balanced", "Mix risk and reward"],
                        ["aggressive", "Aggressive", "Attack for boundaries"],
                      ].map(([value, label, description]) => (
                        <button
                          key={value}
                          type="button"
                          aria-pressed={shotStyle === value}
                          onClick={() => setShotStyle(value)}
                          className={`rounded-xl border p-4 text-left transition ${
                            shotStyle === value
                              ? "border-secondary bg-secondary/10"
                              : "border-bprimary bg-black/10 hover:border-secondary/40"
                          }`}
                        >
                          <p className="font-bold text-white">{label}</p>
                          <p className="mt-1 text-xs text-tmuted">
                            {description}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* STEP 5: FINAL MATCH PREVIEW */}
            {step === 4 && (
              <section className="space-y-4">

                {/* TEAM PREVIEW */}
                <div className="glass-panel rounded-2xl p-5 sm:p-6">
                  <SectionHeading
                    icon={FiCheck}
                    title="Your match is ready"
                    description="Review both teams and your match settings before playing."
                  />

                  <div className="grid gap-3 sm:grid-cols-2">

                    {/* BATTING TEAM */}
                    <div className="rounded-xl border border-primary/25 bg-primary/[0.06] p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <FiUsers className="text-primary" />
                        <h3 className="text-sm font-bold text-white">
                          Batting team
                        </h3>
                      </div>

                      <div className="space-y-2">
                        {batterNames.slice(0, maxBatters).map((name, index) => (
                          <div
                            key={`preview-batter-${index}`}
                            className="flex items-center gap-2 rounded-lg bg-black/15 px-3 py-2"
                          >
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/15 text-[10px] font-bold text-primary">
                              {index + 1}
                            </span>

                            <span className="min-w-0 truncate text-xs font-semibold text-white">
                              {name.trim() || `Batter ${index + 1}`}
                            </span>

                            {index === 0 && (
                              <span className="ml-auto text-[9px] font-bold text-primary">
                                STRIKER
                              </span>
                            )}

                            {index === 1 && (
                              <span className="ml-auto text-[9px] font-bold text-primary">
                                NON-STRIKER
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* BOWLING TEAM */}
                    <div className="rounded-xl border border-secondary/25 bg-secondary/[0.06] p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <FiShield className="text-secondary" />
                        <h3 className="text-sm font-bold text-white">
                          Bowling team
                        </h3>
                      </div>

                      <div className="space-y-2">
                        {bowlerNames.slice(0, maxBowlers).map((name, index) => (
                          <div
                            key={`preview-bowler-${index}`}
                            className="flex items-center gap-2 rounded-lg bg-black/15 px-3 py-2"
                          >
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-secondary/15 text-[10px] font-bold text-secondary">
                              {index + 1}
                            </span>

                            <span className="min-w-0 truncate text-xs font-semibold text-white">
                              {name.trim() || `Bowler ${index + 1}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* MATCH CONFIGURATION PREVIEW */}
                <div className="glass-panel rounded-2xl p-5 sm:p-6">
                  <div className="mb-3 flex items-center gap-2">
                    <FiTarget className="text-primary" />
                    <h3 className="text-sm font-bold text-white">
                      Match settings
                    </h3>
                  </div>

                  <div className="grid gap-x-8 sm:grid-cols-2">
                    <ReviewRow
                      label="Overs"
                      value={`${overs} overs (${overs * 6} balls)`}
                    />

                    <ReviewRow
                      label="Wickets"
                      value={`${wickets} wickets`}
                    />

                    <ReviewRow
                      label="Target"
                      value={`${target || "—"} runs`}
                    />

                    <ReviewRow
                      label="Difficulty"
                      value={difficulty}
                    />

                    <ReviewRow
                      label="Batting style"
                      value={shotStyle}
                    />

                    <ReviewRow
                      label="Players"
                      value={`${maxBatters} batters · ${maxBowlers} bowlers`}
                    />
                  </div>
                </div>

                {/* READY MESSAGE */}
                <div className="flex items-center gap-3 rounded-xl border border-secondary/20 bg-secondary/5 p-4">
                  <FiCheck className="shrink-0 text-secondary" size={20} />
                  <div>
                    <p className="text-sm font-bold text-white">
                      All set for the match
                    </p>
                    <p className="mt-1 text-xs text-tmuted">
                      Check your player names and settings. Press Play Match
                      when you are ready.
                    </p>
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* ERROR MESSAGE */}
          {error && (
            <p
              role="alert"
              className="mt-3 text-sm font-semibold text-red-400"
            >
              {error}
            </p>
          )}

          {/* FOOTER NAVIGATION */}
          <div className="mt-5 flex shrink-0 items-center justify-between gap-3 border-t border-white/10 pt-4">
            <p className="hidden text-xs text-tmuted sm:block">
              {step === 4
                ? "Check your setup before starting."
                : "Your choices are saved as you go."}
            </p>

            {step < 4 ? (
              <Button
                type="button"
                size="lg"
                className="ml-auto"
                onClick={goNext}
              >
                Next <FiArrowRight />
              </Button>
            ) : (
              <div className="ml-auto flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={goBack}
                >
                  <FiArrowLeft /> Back
                </Button>

                <Button
                  type="button"
                  size="lg"
                  onClick={startGame}
                >
                  <FiPlay /> Play match
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
