import React, { useState } from "react";
import { FiArrowLeft, FiTarget, FiZap, FiUsers, FiUser } from "react-icons/fi";
import Button from "../components/Button";

const oversOptions = [2, 5, 10, 20];
const wicketOptions = [2, 5, 8, 10];

function OptionButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`min-w-12 rounded-xl border px-4 py-3 text-sm font-bold transition ${
        active
          ? "border-primary bg-primary text-main"
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

  const additionalCount = requiredCount - names.length;
  return [
    ...names,
    ...createDefaultNames(additionalCount, prefix, names.length + 1),
  ];
}

export default function Settings({ nextPage, prevPage, setMatchConfig }) {
  const [overs, setOvers] = useState(5);
  const [wickets, setWickets] = useState(5);
  const [target, setTarget] = useState("30");
  const [difficulty, setDifficulty] = useState("normal");
  const [shotStyle, setShotStyle] = useState("balanced");
  const [error, setError] = useState("");

  const [batterNames, setBatterNames] = useState(() =>
    createDefaultNames(6, "Batter")
  );
  const [bowlerNames, setBowlerNames] = useState(() =>
    createDefaultNames(5, "Bowler")
  );

  const maxBatters = wickets + 1;
  // The bowling lineup cannot exceed either the over limit or the wicket limit.
  const maxBowlers = Math.min(overs, wickets);

  const updateName = (setter, names, index, value) => {
    setter(names.map((name, nameIndex) =>
      nameIndex === index ? value : name
    ));
  };

  const updateWickets = (value) => {
    setWickets(value);
    setBatterNames((current) => resizeNames(current, value + 1, "Batter"));
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

  const startGame = (event) => {
    event.preventDefault();

    const numericTarget = Number(target);

    if (
      !Number.isInteger(numericTarget) ||
      numericTarget < 1 ||
      numericTarget > 999
    ) {
      setError("Enter a target between 1 and 999 runs.");
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
      return;
    }

    if (
      configuredBowlers.length < 1 ||
      configuredBowlers.some((name) => !name)
    ) {
      setError("Enter a name for every bowler in the bowling lineup.");
      return;
    }

    const allNames = [...configuredBatters, ...configuredBowlers];
    const normalizedNames = allNames.map((name) => name.toLowerCase());

    if (new Set(normalizedNames).size !== normalizedNames.length) {
      setError("Each batter and bowler must have a unique name.");
      return;
    }

    setMatchConfig({
      overs,
      wickets,
      target: numericTarget,
      difficulty,
      shotStyle,
      batterNames: configuredBatters,
      bowlerNames: configuredBowlers,
    });

    nextPage();
  };

  const sectionLabel = "mb-3 block text-sm font-semibold text-tprimary";
  const inputClass =
    "w-full rounded-xl border border-bprimary bg-input px-4 py-3 text-sm font-semibold text-white outline-none transition focus:border-primary";

  return (
    <main className="stadium-background min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        <button
          type="button"
          onClick={prevPage}
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-tsecondary hover:text-white"
        >
          <FiArrowLeft /> Back to home
        </button>

        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Match configuration
          </p>
          <h1 className="mt-3 text-4xl font-black text-white sm:text-5xl">
            Set your innings.
          </h1>
          <p className="mt-3 max-w-2xl leading-7 text-tsecondary">
            Configure your match, choose your batting lineup, and set up the
            bowlers available for your innings.
          </p>
        </div>

        <form onSubmit={startGame} className="space-y-6">
          <section className="glass-panel rounded-2xl p-5 sm:p-7">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-primary/10 p-3 text-primary">
                <FiTarget size={22} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  Match conditions
                </h2>
                <p className="text-sm text-tmuted">
                  Define the limits of your innings.
                </p>
              </div>
            </div>

            <div className="space-y-7">
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
                  {overs * 6} legal deliveries available. Add up to{" "}
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
                  You can configure up to {wickets + 1} batters and{" "}
                  {Math.min(overs, wickets)} bowlers.
                </p>
              </div>

              <div>
                <label htmlFor="target" className={sectionLabel}>
                  Target score
                </label>
                <input
                  id="target"
                  type="number"
                  min="1"
                  max="999"
                  step="1"
                  required
                  value={target}
                  onChange={(event) => {
                    setTarget(event.target.value);
                    setError("");
                  }}
                  className="w-full max-w-xs rounded-xl border border-bprimary bg-input px-4 py-3 text-lg font-bold text-white outline-none focus:border-primary"
                />
                <p className="mt-2 text-xs text-tmuted">
                  You win by reaching this score.
                </p>
              </div>
            </div>
          </section>

          <section className="glass-panel rounded-2xl p-5 sm:p-7">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-primary/10 p-3 text-primary">
                <FiUsers size={22} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  Batting lineup
                </h2>
                <p className="text-sm text-tmuted">
                  Set a name for every batter available in this innings.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
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
                    required
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

          <section className="glass-panel rounded-2xl p-5 sm:p-7">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-secondary/10 p-3 text-secondary">
                <FiUser size={22} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  Bowling lineup
                </h2>
                <p className="text-sm text-tmuted">
                  Configure the bowlers available for this innings.
                </p>
              </div>
            </div>

            <p className="mb-4 text-xs leading-5 text-tmuted">
              Maximum {maxBowlers} bowlers for this match, based on the lower
              of the over limit ({overs}) and wicket limit ({wickets}). The
              bowler who delivered the previous over will be unavailable for
              the next over.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
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
                    required
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

          <section className="glass-panel rounded-2xl p-5 sm:p-7">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-secondary/10 p-3 text-secondary">
                <FiZap size={22} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  Gameplay preferences
                </h2>
                <p className="text-sm text-tmuted">
                  Choose the challenge and your starting approach.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className={sectionLabel}>Difficulty</label>
                <div className="grid gap-3 sm:grid-cols-3">
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
                <label className={sectionLabel}>Starting batting style</label>
                <div className="grid gap-3 sm:grid-cols-3">
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

          {error && (
            <p role="alert" className="text-sm font-semibold text-red-400">
              {error}
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={prevPage}>
              Cancel
            </Button>
            <Button type="submit" size="lg">
              Start innings
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
