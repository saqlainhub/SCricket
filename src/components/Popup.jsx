import React from 'react'
import Button from './Button'

export default function Popup({prevPage, gameResult, setShowPopup}) {
    return (
        <div className='absolute bg-overlay h-screen w-screen flex justify-center items-center'>
            <div className='w-100 h-65 bg-primaryDark flex flex-col rounded-2xl items-center'>
                <h1 className='text-center font-bold pt-8 pb-4 text-yellow text-xl'>
                    {gameResult === 'win' ? 'YOU WON!' : 'YOU LOST!'}</h1>
                <p className='text-md text-white w-83 text-center'>I hope you have got a good expereience from this game. Are you want to go back or not? </p>
                <div className='flex justify-between w-full px-15'>
                    <Button children='Cancel' variant='primary' size='md' className='mx-0' 
                    onClick={() => setShowPopup(false)}/>
                    <Button children='Go Back' variant='primary' size='md' className='mx-0' onClick={prevPage}/>
                </div>
                {/* <h1>{gameResult === 'win' ? 'WON!' : 'LOST!'}</h1>
                <p>Are you want to go back? </p>
                <div className=''>
                    <Button children='Cancel' variant='primary' size='lg' onClick={setShowPopup(false)} />
                    <Button children='Go Back' variant='primary' size='lg' onClick={prevPage} />
                </div> */}
            </div>
        </div>
    )
}


