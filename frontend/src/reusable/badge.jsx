import React from 'react'

function Badge({textCol, bgCol, textSize, children}) {
    return (
        <div className={`flex justify-center items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${textCol} ${bgCol} ${textSize}`}>
            {children}
        </div>
    )
}

export default Badge