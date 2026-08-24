import React, { useState } from 'react'
import Home from './pages/Home'
import Settings from './pages/Settings'
import Play from './pages/Play'


function App() {

  const [page, setPage] = useState('home');

  const [totalRuns, setTotalRuns] = useState(0);
  const [totalBalls, setTotalBalls] = useState(2);
  const [totalWickets, setTotalWickets] = useState(2);

  const [newRuns, setNewRuns] = useState(0);
  const [newBalls, setNewBalls] = useState(0);
  const [newWickets, setNewWickets] = useState(0);

  const [runsLeft, setRunsLeft] = useState(0);
  const [ballsLeft, setBallsLeft] = useState(0);
  const [wicketsLeft, setWicketsLeft] = useState(0);


  const nextPage = () => {
    if(page === 'home'){
      setPage('settings');
    } else if(page === 'settings'){
      setPage('play');
    }
  }

  const prevPage = () => {
    setTotalBalls(2);
    setTotalWickets(2);
    setTotalRuns(20);
    setNewRuns(0);
    setNewBalls(0);
    setNewWickets(0);
    setRunsLeft(0);
    setBallsLeft(0);
    setWicketsLeft(0);
    if(page === 'play') setPage('settings');
    else if(page === 'settings') setPage('home');
  }


  return (
    <>
      {page === 'home' && <Home nextPage={nextPage} />}
      {page === 'settings' && <Settings nextPage={nextPage}  prevPage={prevPage} 
      totalRuns={totalRuns}
      setTotalRuns={setTotalRuns}
      totalBalls={totalBalls}
      setTotalBalls={setTotalBalls}
      totalWickets={totalWickets}
      setTotalWickets={setTotalWickets}
      setBallsLeft={setBallsLeft}
      setWicketsLeft={setWicketsLeft}
      setRunsLeft={setRunsLeft}
      />}
      {page === 'play' && <Play prevPage={prevPage}
      totalRuns={totalRuns}
      setTotalRuns={setTotalRuns}
      totalBalls={totalBalls}
      setTotalBalls={setTotalBalls}
      totalWickets={totalWickets}
      setTotalWickets={setTotalWickets}
      newRuns={newRuns}
      setNewRuns={setNewRuns}
      newBalls={newBalls}
      setNewBalls={setNewBalls}
      newWickets={newWickets}
      setNewWickets={setNewWickets}
      runsLeft={runsLeft}
      setRunsLeft={setRunsLeft}
      ballsLeft={ballsLeft}
      setBallsLeft={setBallsLeft}
      wicketsLeft={wicketsLeft}
      setWicketsLeft={setWicketsLeft}
      />}

    </>
  )
}

export default App
