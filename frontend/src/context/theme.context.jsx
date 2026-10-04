import React, { createContext, useContext, useEffect, useState } from 'react'

export const ThemeContext = createContext({ theme: 'light', toggleTheme: () => {} })

function getInitialTheme() {
    try {
        const saved = localStorage.getItem('theme')
        if (saved === 'dark' || saved === 'light') return saved
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    } catch {
        return 'light'
    }
}

export const ThemeProvider = ({ children }) => {
    const [ theme, setTheme ] = useState(getInitialTheme)

    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark')
        try { localStorage.setItem('theme', theme) } catch { /* ignore */ }
    }, [ theme ])

    const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'))

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export const useTheme = () => useContext(ThemeContext)
