import React, { useContext, useState, useEffect } from 'react'
import { UserContext } from '../context/user.context'
import axios from "../config/axios"
import { useNavigate } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'

const Home = () => {

    const { user } = useContext(UserContext)
    const [ isModalOpen, setIsModalOpen ] = useState(false)
    const [ projectName, setProjectName ] = useState(null)
    const [ project, setProject ] = useState([])

    const navigate = useNavigate()

    function createProject(e) {
        e.preventDefault()
        console.log({ projectName })

        axios.post('/projects/create', {
            name: projectName,
        })
            .then((res) => {
                console.log(res)
                setIsModalOpen(false)
            })
            .catch((error) => {
                console.log(error)
            })
    }

    useEffect(() => {
        axios.get('/projects/all').then((res) => {
            setProject(res.data.projects)

        }).catch(err => {
            console.log(err)
        })

    }, [])

    return (
        <div className="min-h-screen w-full bg-slate-50 dark:bg-zinc-950">
            <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
                <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white flex items-center justify-center">
                            <i className="ri-sparkling-2-fill"></i>
                        </div>
                        <span className="font-semibold text-lg tracking-tight">AI Developer</span>
                    </div>
                    <div className="flex items-center gap-3">
                        {user?.email && (
                            <span className="hidden sm:inline-flex items-center gap-2 text-sm text-slate-600 dark:text-zinc-400">
                                <span className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 flex items-center justify-center font-semibold">
                                    {user.email[0].toUpperCase()}
                                </span>
                                {user.email}
                            </span>
                        )}
                        <ThemeToggle />
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-6 py-10">
                <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Your projects</h1>
                        <p className="mt-1 text-slate-500 dark:text-zinc-400">Open a project to chat with AI and your team.</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-500/25 transition">
                        <i className="ri-add-line text-lg"></i>
                        New Project
                    </button>
                </div>

                <div className="projects grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {
                        project.map((project) => (
                            <div key={project._id}
                                onClick={() => {
                                    navigate(`/project`, {
                                        state: { project }
                                    })
                                }}
                                className="project group cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-xl hover:-translate-y-0.5 hover:border-indigo-300 transition dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-500/60 dark:hover:shadow-indigo-500/10">
                                <div className="flex items-start justify-between">
                                    <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white flex items-center justify-center text-lg font-semibold">
                                        {project.name?.[0]?.toUpperCase() || 'P'}
                                    </div>
                                    <i className="ri-arrow-right-up-line text-xl text-slate-300 group-hover:text-indigo-500 transition"></i>
                                </div>
                                <h2 className="mt-4 font-semibold text-lg truncate">{project.name}</h2>
                                <div className="mt-2 flex items-center gap-2 text-sm text-slate-500 dark:text-zinc-400">
                                    <i className="ri-user-line"></i>
                                    <span>Collaborators</span>
                                    <span className="ml-auto inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-slate-100 px-2 text-xs font-medium text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">
                                        {project.users.length}
                                    </span>
                                </div>
                            </div>
                        ))
                    }
                </div>

                {project.length === 0 && (
                    <div className="mt-6 rounded-2xl border border-dashed border-slate-300 dark:border-zinc-700 py-16 text-center text-slate-500 dark:text-zinc-400">
                        <i className="ri-folder-add-line text-4xl"></i>
                        <p className="mt-2">No projects yet. Create your first one to get started.</p>
                    </div>
                )}
            </main>

            {isModalOpen && (
                <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900 dark:border dark:border-zinc-800">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-xl font-semibold">Create New Project</h2>
                            <button type="button" onClick={() => setIsModalOpen(false)} className="h-8 w-8 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800">
                                <i className="ri-close-line text-lg"></i>
                            </button>
                        </div>
                        <form onSubmit={createProject}>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1.5">Project Name</label>
                                <input
                                    onChange={(e) => setProjectName(e.target.value)}
                                    value={projectName}
                                    type="text"
                                    placeholder="e.g. Todo app"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:placeholder-zinc-500"
                                    required />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button type="button" className="px-4 py-2 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 transition" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="px-4 py-2 rounded-xl text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 transition">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Home