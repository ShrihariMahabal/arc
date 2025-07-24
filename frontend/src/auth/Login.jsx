import React from 'react'
import { useState, useEffect } from 'react'
import { supabase } from '../supabase-client.js'
import { useNavigate } from 'react-router'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      alert('Please fill all fields')
      return
    }
    console.log('Attempting login...')
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })
    if (error) {
      alert('Error logging in')
      return
    }
    navigate('/')
  }

  useEffect(() => {
    const session = supabase.auth.getSession()
    if (session) {
      navigate('/')
    }
  }, [navigate])

  return (
    <div className='min-h-screen bg-gray-100 p-4 flex justify-center items-center'>
      <div className='bg-white rounded-lg flex flex-col justify-between shadow-md w-[30%] py-4 px-8'>
        <h1 className='text-black text-2xl font-bold self-center mb-6 mt-4'>Login</h1>
        <form className='flex flex-col justify-between w-full px-4 space-y-4 mb-4' onSubmit={handleLogin}>
          <div>
            <label htmlFor="email" className='font-medium'>Email</label>
            <input type="email" placeholder='Enter your email' id="email" value={email} onChange={(e) => setEmail(e.target.value)} className='border border-gray-300 rounded-md p-2 w-full focus:ring-gray-900 focus:border-gray-900 focus:outline-none' />
          </div>
          <div>
            <label htmlFor="password" className='font-medium'>Password</label>
            <input type="password" placeholder='Enter your password' id="password" value={password} onChange={(e) => setPassword(e.target.value)} className='border border-gray-300 rounded-md p-2 w-full focus:ring-gray-900 focus:border-gray-900 focus:outline-none' />
          </div>
          <button type="submit" onClick={handleLogin} className='bg-gray-900 text-white rounded-md p-2 hover:bg-gray-800 transition duration-200'>Login</button>
        </form>
      </div>
    </div>
  )
}

export default Login