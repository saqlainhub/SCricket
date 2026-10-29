
import React, { useState } from "react";
import Home from "./pages/Home";
import Settings from "./pages/Settings";
import Play from "./pages/Play";

const DEFAULT_CONFIG = {
  overs: 5,
  wickets: 5,
  target: 30,
  difficulty: "normal",
  shotStyle: "balanced",
};

export default function App() {
  const [page, setPage] = useState("home");
  const [matchConfig, setMatchConfig] = useState(DEFAULT_CONFIG);
  const [matchId, setMatchId] = useState(0);

  const startMatch = () => {
    setMatchId((id) => id + 1);
    setPage("play");
  };

  const returnHome = () => setPage("home");

  return (
    <>
      {page === "home" && (
        <Home nextPage={() => setPage("settings")} />
      )}

      {page === "settings" && (
        <Settings
          nextPage={startMatch}
          prevPage={returnHome}
          setMatchConfig={setMatchConfig}
        />
      )}

      {page === "play" && (
        <Play
          key={matchId}
          config={matchConfig}
          goHome={returnHome}
          replayMatch={startMatch}
        />
      )}
    </>
  );
}
