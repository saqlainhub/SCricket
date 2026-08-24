import React, { useState } from 'react'
import bannerImage from '../assets/img1.jpg'
import Button from '../components/Button'
import { GoArrowLeft } from "react-icons/go";

export default function Settings({ nextPage, prevPage, totalRuns, setTotalRuns, totalBalls, setTotalBalls, totalWickets, setTotalWickets, setRunsLeft, setBallsLeft, setWicketsLeft}) {

    const [runsInput, setRunsInput] = useState(20);
    const selectWickets = [2, 3, 5, 8, 11];
    const selectBalls = [2, 5, 10, 20, 50];

    const ballsActive = 'bg-primary w-10.5 h-10 font-semibold text-white text-sm rounded';
    const ballsUnactive = 'bg-secondary hover:bg-primary w-10.5 h-10 font-semibold text-white text-sm rounded';
    const wicketsActive = 'bg-primary w-10.5 h-10 font-semibold text-white text-sm rounded';
    const wicketsUnactive = 'bg-secondary hover:bg-primary w-10.5 h-10 font-semibold text-white text-sm rounded';


    const startGame = () => {
        setTotalRuns(runsInput);
        setTotalBalls(prev => prev*6);
        setRunsLeft(runsInput);
        setBallsLeft(totalBalls*6);
        setWicketsLeft(totalWickets);
        nextPage();
    };


    return (
        <>
            <button className='absolute top-6 left-8 text-white font-semibold text-lg flex gap-2 items-center' onClick={prevPage}><GoArrowLeft className='mt-1' strokeWidth={2} />Back</button>
            <div className='w-screen h-screen bg-cover bg-no-repeat bg-center' style={{ backgroundImage: `url(${bannerImage})` }}>
                <div className=' w-screen h-screen flex flex-col items-center justify-center'>
                    <div className='w-full h-full flex flex-col items-center justify-center bg-overlay gap-12 px-8'>
                        <h2 className='text-xl3 font-bold text-center font-body text-white'>Match Settings</h2>
                        <div className='flex flex-col gap-15'>
                            <div className='flex gap-25 items-center'>
                                <p className='text-lg text-yellow font-bold '>Total Overs :</p>
                                <div className='flex gap-2'>
                                    {selectBalls.map((ball) => (
                                        <button
                                            key={ball}
                                            className={totalBalls === ball ? ballsActive : ballsUnactive}
                                            onClick={() => setTotalBalls(ball)}>{ball}</button>
                                    ))}

                                </div>

                            </div>
                            <div className='flex gap-20 items-center'>
                                <p className='text-lg text-yellow font-bold '>Total Wickets :</p>
                                <div className='flex gap-2'>
                                    {selectWickets.map((wicket) => (
                                        <button
                                            key={wicket}
                                            className={totalWickets === wicket ? wicketsActive : wicketsUnactive}
                                            onClick={() => setTotalWickets(wicket)}>{wicket}</button>
                                    ))}
                                </div>

                            </div>

                            <div className='flex gap-23.5 items-center'>
                                <p className='text-lg text-yellow font-bold '>Total Target :</p>
                                <div className='flex gap-2'>
                                    <input type="text" value={runsInput} onChange={e => setRunsInput(Number(e.target.value))} className='border-2 outline-none border-yellow bg-overlay2 rounded px-2 py-1 w-58 text-white font-semibold ' />
                                </div>

                            </div>

                        </div>
                        <Button children='Start Now' variant='primary' size='lg' onClick={startGame} />
                    </div>
                </div>
            </div>
        </>
    )
}
