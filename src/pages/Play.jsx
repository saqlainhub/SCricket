import React, { useState } from 'react'
import bannerImage from '../assets/img1.jpg'
import { GoArrowLeft } from "react-icons/go";
import { CiBaseball } from "react-icons/ci";
import Popup from '../components/Popup';


export default function Play({ prevPage, totalRuns, setTotalRuns, totalBalls, setTotalBalls, totalWickets, setTotalWickets, newRuns, setNewRuns, newBalls, setNewBalls, newWickets, setNewWickets, runsLeft, setRunsLeft, ballsLeft, setBallsLeft, wicketsLeft, setWicketsLeft }) {

    const [playerRuns, setPlayerRuns] = useState(0);
    const [playerBalls, setPlayerBalls] = useState(0);

    const [isPlaying, setIsPlaying] = useState(false);
    const [countdown, setCountdown] = useState(null);
    const [gameStatus, setGameStatus] = useState('idle');
    const [showShot, setShowShot] = useState(false);
    const [shotResult, setShotResult] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [gameResult, setGameResult] = useState('no');


    const handleShot = () => {

        if (isPlaying || gameStatus === "ended") return;

        setIsPlaying(true);
        setCountdown(3);
        let count = 3;

        const timer = setInterval(() => {
            count--;

            if (count === 0) {
                clearInterval(timer);
                playBall();
                setIsPlaying(false);
                setCountdown(null);
            } else {
                setCountdown(count);
            };

        }, 700);
    };


    const playBall = () => {

        const outcomes = [0, 1, 2, 3, 4, 6, 'W'];
        const result = outcomes[Math.floor(Math.random() * outcomes.length)];

        setShotResult(result);
        setShowShot(true);
        setTimeout(() => {
            setShowShot(false);
        }, 900);


        if (ballsLeft <= 0 || wicketsLeft <= 0) {
            endGame("loss");
            return;
        }

        setNewBalls(prev => prev + 1);
        setBallsLeft(prev => prev - 1);
        setPlayerBalls(prev => prev + 1);

        if (result === 'W') {
            setNewWickets(prev => prev + 1);
            setWicketsLeft(prev => prev - 1);
            setPlayerRuns(0);
            setPlayerBalls(0);
        } else {
            setNewRuns(prev => prev + result);
            setRunsLeft(prev => runsLeft - result <= 0 ? 0 : prev - result);
            setPlayerRuns(prev => prev + result);
        }

        checkGameStatus(result);
    }


    const checkGameStatus = (result) => {
        setTimeout(() => {
            if (newRuns + (result !== "W" ? result : 0) >= totalRuns) {
                endGame("win");
            } else if (ballsLeft - 1 <= 0) {
                endGame("loss");
            } else if (wicketsLeft - (result === "W" ? 1 : 0) <= 0) {
                endGame("loss");
            }
        }, 0);
    }

    const endGame = (result) => {
        setGameStatus("ended");


        if (result === "win") {
            setShowPopup(true);
            setGameResult('win');
        } else {
            setShowPopup(true);
            setGameResult('lose');
        }
    };








    return (
        <>

            {showPopup && <Popup prevPage={prevPage} gameResult={gameResult} setShowPopup={setShowPopup}/>}


            <button className='absolute top-6 left-8 text-white font-semibold text-lg flex gap-2 items-center' onClick={() => setShowPopup(true)}><GoArrowLeft className='mt-1' strokeWidth={2} />Exit</button>
            <div className='absolute top-0 right-0 bg-primaryDark text-md py-5 px-8 text-yellow font-semibold'>Remaining Wickets : <span className='text-white'>{wicketsLeft}</span></div>

            <div className='w-screen h-screen bg-cover bg-no-repeat bg-center' style={{ backgroundImage: `url(${bannerImage})` }}>
                <div className=' w-screen h-screen flex flex-row items-center justify-center'>
                    <div className='flex justify-between items-center h-42 w-screen px-50 '>

                        <div className='w-40 h-40 bg-primaryDark rounded-full flex justify-center items-center text-xl5 font-bold border-2 border-yellow text-white'>{ballsLeft}
                            <div className='bg-yellow px-6 py-1 mx-11 -mt-1.5 rounded-md absolute self-start text-xs font-semibold text-black'>Balls</div>
                        </div>

                        <div className='w-15 h-15 bg-yellow rounded-full flex justify-center items-center text-xl2 font-bold border-2 border-primaryDark text-primaryDark' disabled={isPlaying || gameStatus === "ended"} onClick={handleShot} >{countdown ? countdown : <CiBaseball />}</div>


                        <div className='w-40 h-40 bg-primaryDark rounded-full flex justify-center items-center text-xl5 font-bold border-2 border-yellow text-white'>{runsLeft}
                            <div className='bg-yellow px-6 py-1 mx-11 -mt-1.5 rounded-md absolute self-start text-xs font-semibold text-black'>Score</div>
                        </div>
                    </div>



                    <div className='fixed bottom-0 bg-primaryDark w-screen h-20 flex justify-between items-center px-8'>
                        <div className='text-md font-semibold text-yellow'>Player Score : <span className='text-white'>{playerRuns} </span><span className='text-xs text-tsecondary font-medium'>({playerBalls} balls)</span></div>
                        <div className="text-xl2 font-bold text-yellow bg-overlay h-full w-1/5 flex items-center justify-center">{newRuns} - {newWickets}</div>
                        <div className="text-md font-semibold text-yellow"> <span className='text-yellow'>Total Overs : </span> <span className=' text-white'>{Math.floor(newBalls / 6)}•{newBalls % 6} </span> <span className='text-xs text-tsecondary font-medium'>({totalBalls / 6})</span></div>
                    </div>
                </div>
            </div>




            <div
                className={`fixed inset-0 w-screen h-screen  bg-black flex items-center justify-center pointer-events-none transition-all duration-500 ease-out
                    ${showShot ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-90 translate-y-6"}
                    `}>
                <div className={` font-extrabold transition-all duration-500 ease-out text-white
                    ${shotResult === "W" ? "text-yellow text-[200px]" : "text-white text-[300px]"}`}>
                    {shotResult === "W" ? "WICKET!" : shotResult}
                </div>
            </div>

        </>
    )
}
