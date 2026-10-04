import React, { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from '../config/axios'
import { UserContext } from '../context/user.context'
import AuthShell, { fieldLabel, fieldInput, primaryBtn } from '../components/AuthShell'

const Login = () => {


    const [ email, setEmail ] = useState('')
    const [ password, setPassword ] = useState('')

    const { setUser } = useContext(UserContext)

    const navigate = useNavigate()

    function submitHandler(e) {

        e.preventDefault()

        axios.post('/users/login', {
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
            title="Welcome back"
            subtitle="Log in to continue to your projects."
            footer={<>Don't have an account? <Link to="/register" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">Create one</Link></>}
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
                            placeholder="Enter your password"
                        />
                    </div>
                </div>
                <button type="submit" className={primaryBtn}>
                    Login
                </button>
            </form>
        </AuthShell>
    )
}

export default Login