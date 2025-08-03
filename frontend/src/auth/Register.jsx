import React from 'react'
import { useState, useEffect } from 'react'
import { supabase } from '../supabase-client.js'
import { useNavigate, Link } from 'react-router'

function Register() {

    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [skills, setSkills] = useState('')

    const navigate = useNavigate()

    const handleRegister = async (e) => {
        e.preventDefault()
        if (!username || !email || !password || !skills) {
            alert('Please fill all fields')
            return
        }
        const { data: userData, error: userError } = await supabase.auth.signUp({
            email: email,
            password: password,
        })
        if (userError) {
            alert('Error creating user')
            return
        } else {
            const { error: tableError } = await supabase
                .from('users')
                .insert([
                    { username: username, email: email, skills: skills, user_id: userData.user.id }
                ])
            if (tableError) {
                alert('Error saving user data')
                return
            }
            else {
                navigate('/')
            }
        }
    };

    return (
        <div className='min-h-screen bg-gray-100 p-4 flex justify-center items-center'>
            <div className='bg-white rounded-lg flex flex-col justify-between shadow-md w-[30%] py-4 px-8'>
                <h1 className='text-black text-2xl font-bold self-center mb-6 mt-4'>Register</h1>
                <div className='flex flex-col justify-between w-full px-4 space-y-4 mb-4'>
                    <div>
                        <label htmlFor="username" className='font-medium text-md'>Username</label>
                        <input type="text" placeholder='Enter your username' id="username" value={username} onChange={(e) => setUsername(e.target.value)} className='border border-gray-300 rounded-md p-2 w-full focus:ring-gray-900 focus:border-gray-900 focus:outline-none' />
                    </div>
                    <div>
                        <label htmlFor="email" className='font-medium'>Email</label>
                        <input type="email" placeholder='Enter your email' id="email" value={email} onChange={(e) => setEmail(e.target.value)} className='border border-gray-300 rounded-md p-2 w-full focus:ring-gray-900 focus:border-gray-900 focus:outline-none' />
                    </div>
                    <div>
                        <label htmlFor="skills" className='font-medium'>Skills</label>
                        <input type="text" placeholder='Enter your skills' id="skills" value={skills} onChange={(e) => setSkills(e.target.value)} className='border border-gray-300 rounded-md p-2 w-full focus:ring-gray-900 focus:border-gray-900 focus:outline-none' />
                    </div>
                    <div>
                        <label htmlFor="password" className='font-medium'>Password</label>
                        <input type="password" placeholder='Enter your password' id="password" value={password} onChange={(e) => setPassword(e.target.value)} className='border border-gray-300 rounded-md p-2 w-full focus:ring-gray-900 focus:border-gray-900 focus:outline-none' />
                    </div>
                    <div>
                        <p>Already have an account? <span className='underline'><Link to="/login">Login</Link></span></p>
                    </div>
                    <button type='submit' onClick={handleRegister} className='mt-2 p-2 bg-primary flex justify-center items-center rounded-md text-white font-semibold'>Register</button>
                </div>
            </div>
        </div>
    )
}

export default Register