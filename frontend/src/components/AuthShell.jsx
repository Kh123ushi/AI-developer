import React from 'react'
import ThemeToggle from './ThemeToggle'

const features = [
    { icon: 'ri-chat-3-line', text: 'Chat with AI and your team in real time' },
    { icon: 'ri-code-s-slash-line', text: 'Generate, edit and run code in the browser' },
    { icon: 'ri-team-line', text: 'Invite collaborators to every project' },
]

const AuthShell = ({ title, subtitle, children, footer }) => (
    <div className="min-h-screen w-full flex bg-white dark:bg-zinc-950">
        {/* Brand panel */}
        <aside className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12 text-white bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600">
            <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-white/10 blur-3xl"></div>
            <div className="absolute -bottom-32 -right-16 h-[28rem] w-[28rem] rounded-full bg-fuchsia-300/20 blur-3xl"></div>

            <div className="relative flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-xl">
                    <i className="ri-sparkling-2-fill"></i>
                </div>
                <span className="text-xl font-semibold tracking-tight">AI Developer</span>
            </div>

            <div className="relative max-w-md">
                <h1 className="text-4xl font-bold leading-tight tracking-tight">
                    Build software by talking to it.
                </h1>
                <p className="mt-4 text-white/80 text-lg">
                    Describe what you want, and let AI scaffold, edit and run it with you.
                </p>
                <ul className="mt-10 space-y-4">
                    {features.map(f => (
                        <li key={f.text} className="flex items-center gap-3 text-white/90">
                            <span className="h-9 w-9 rounded-lg bg-white/15 flex items-center justify-center">
                                <i className={f.icon}></i>
                            </span>
                            {f.text}
                        </li>
                    ))}
                </ul>
            </div>

            <p className="relative text-sm text-white/60">© {new Date().getFullYear()} AI Developer</p>
        </aside>

        {/* Form panel */}
        <main className="relative flex-1 flex items-center justify-center px-6 py-12">
            <ThemeToggle className="absolute top-5 right-5" />

            <div className="w-full max-w-md">
                <div className="lg:hidden flex items-center gap-2 mb-8">
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white flex items-center justify-center">
                        <i className="ri-sparkling-2-fill"></i>
                    </div>
                    <span className="font-semibold text-lg">AI Developer</span>
                </div>

                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{title}</h2>
                <p className="mt-2 text-slate-500 dark:text-zinc-400">{subtitle}</p>

                <div className="mt-8">{children}</div>

                <p className="mt-6 text-sm text-slate-500 dark:text-zinc-400 text-center">{footer}</p>
            </div>
        </main>
    </div>
)

export const fieldLabel = 'block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1.5'
export const fieldInput =
    'w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:placeholder-zinc-500 transition'
export const primaryBtn =
    'w-full py-3 rounded-xl font-medium text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-500/25 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-950 transition'

export default AuthShell
