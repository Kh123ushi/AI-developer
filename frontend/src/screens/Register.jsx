import React, { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserContext } from '../context/user.context'
import axios from '../config/axios'
import AuthShell, { fieldLabel, fieldInput, primaryBtn } from '../components/AuthShell'

const Register = () => {

    const [ email, setEmail ] = useState('')
    const [ password, setPassword ] = useState('')

    const { setUser } = useContext(UserContext)

    const navigate = useNavigate()


    function submitHandler(e) {

        e.preventDefault()

        axios.post('/users/register', {
            email,
            password
        }).then((res) => {
            console.log(res.data)
            localStorage.setItem('token', res.data.token)
            setUser(res.data.user)
            navigate('/')
        }).catch((err) => {
            console.log(err.response.data)
        })
    }


    return (
        <AuthShell
            title="Create your account"
            subtitle="Start building with AI in minutes."
            footer={<>Already have an account? <Link to="/login" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">Login</Link></>}
        >
            <form onSubmit={submitHandler} className="space-y-5">
                <div>
                    <label className={fieldLabel} htmlFor="email">Email</label>
                    <div className="relative">
                        <i className="ri-mail-line absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                        <input
                            onChange={(e) => setEmail(e.target.value)}
                            type="email"
                            id="email"
                            className={fieldInput}
                            placeholder="you@example.com"
                        />
                    </div>
                </div>
                <div>
                    <label className={fieldLabel} htmlFor="password">Password</label>
                    <div className="relative">
                        <i className="ri-lock-2-line absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                        <input
                            onChange={(e) => setPassword(e.target.value)}
                            type="password"
                            id="password"
                            className={fieldInput}
                            placeholder="Create a password"
                        />
                    </div>
                </div>
                <button type="submit" className={primaryBtn}>
                    Register
                </button>
            </form>
        </AuthShell>
    )
}

export default Register