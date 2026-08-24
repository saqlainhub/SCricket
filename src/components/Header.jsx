import React from 'react'
import Logo from '../assets/logo1.png';
import profile from '../assets/profile.jpg'

export default function Header() {
  return (
    <navbar className='z-100 flex flex-row items-center justify-between px-12 py-4 w-full h-20 bg-primary fixed'>
      <div className=''>
          <img src={Logo} alt="Logo" className='w-25'/>
      </div>
      <div className='flex flex-row gap-1 items-center'>
          <div style={{backgroundImage: `url(${profile}`}} className="bg-cover bg-no-repeat bg-center w-11 h-11 rounded-full overflow-hidden border-2 border-yellow"></div>
          <div className='text-sm font-semibold text-white ml-3'>Saqlain 513</div>
      </div>
    </navbar>
  )
}
