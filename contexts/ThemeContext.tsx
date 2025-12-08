'use client';

import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';

const darkTheme = {
    bg: "bg-[#05080E]",
    textPrimary: "text-white",
    textSecondary: "text-white/40",
    glass: "bg-white/5 border-white/10",
    input: "bg-white/5 border-white/10 text-white placeholder-white/30",
    divider: "bg-white/10",
    toggleBg: "bg-blue-500/30 border-white/10",
    toggleDot: "bg-blue-400",
};

const lightTheme = {
    bg: "bg-gray-200",
    textPrimary: "text-white",
    textSecondary: "text-white/40",
    glass: "bg-white/5 border-white/10",
    input: "bg-white/3 border-white/20 text-white placeholder-white/30",
    divider: "bg-white/10",
    toggleBg: "bg-white/60 border-white/20",
    toggleDot: "bg-blue-500",
};

export type Theme = typeof darkTheme;

interface ThemeContextType {
    isDarkMode: boolean;
    theme: Theme;
    toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [isDarkMode, setIsDarkMode] = useState(true);
    const theme = useMemo(() => isDarkMode ? darkTheme : lightTheme, [isDarkMode]);

    const toggleDarkMode = () => setIsDarkMode(v => !v);

    return (
        <ThemeContext.Provider
            value={{
                isDarkMode,
                theme,
                toggleDarkMode,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
