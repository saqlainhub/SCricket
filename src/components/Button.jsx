import React from 'react'

export default function Button({
    children,
    variant="primary",
    size="sm",
    className=" ",
    ...props 
}) {

    const baseStyles = "m-6 font-semibold";

    const variants = {
        primary : "bg-secondary hover:bg-primary text-white rounded-md",
        outline : "bg-none text-primary hover:primaryDark no-underline hover:underline",
        norounded : "bg-primary hover:bg-primaryDark text-white"
    };

    const sizes = {
        sm : "text-sm px-4 py-1 ",
        md : "text-sm px-5 py-[5px]",
        lg : "text-md px-6 py-[6px]",
        xl : "text-md px-6 py-2 w-[100vh]" 
    };



    return (
        <>
            <button className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>{children}</button>
        </>
   
)
}


 // <button onClick={(e) => e.target} className='bg-primary font-semibold text-sm text-white hover:bg-primaryDark rounded-md m-6 px-5 py-1'>{props.text}</button>
