import React from 'react'
import { useTheme } from '../context/theme.context'

const ThemeToggle = ({ className = '' }) => {
    const { theme, toggleTheme } = useTheme()
    const isDark = theme === 'dark'

    return (
        <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Light mode' : 'Dark mode'}
            className={`h-9 w-9 inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white transition-colors ${className}`}
        >
            <i className={isDark ? 'ri-sun-line' : 'ri-moon-line'}></i>
        </button>
    )
}

export default ThemeToggle
