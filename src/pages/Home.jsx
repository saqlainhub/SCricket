import React from 'react'
import Button from '../components/Button'
import Header from '../components/Header'
import bannerImage from '../assets/img1.jpg'

export default function Home({nextPage}) {
    return (
        <>
            <Header />
            <div className='w-screen h-screen bg-cover bg-no-repeat bg-center z-1' style={{ backgroundImage: `url(${bannerImage}` }}>
                <div className='flex flex-col gap-3 items-center justify-center w-screen h-screen z-2 bg-overlay'>
                    <div className='w-3/5 text-white text-center'>
                        <h1 className='text-xl4 font-bold font-body mb-1'>World # 01 Cricket</h1>
                        <p className='text-md'>This is the game in which if you will play then you can easily succeed and you can get and entertain yourself. Its also very challenging for new fellows.</p>
                    </div>
                    <Button children='Play Now' variant='primary' size='lg' onClick={nextPage}/>
                </div>
            </div>
        </>
    )
}
