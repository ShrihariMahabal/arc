import React from 'react'

function temp1() {
  const handleClick = (e) => {
    console.log(e.target.checked)
  }

  return (
    <input type="checkbox" onClick={handleClick} />
  )
}

export default temp1