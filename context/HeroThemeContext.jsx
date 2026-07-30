"use client";

import { createContext, useContext, useState } from "react";

const HeroThemeContext = createContext();

export const HeroThemeProvider = ({ children }) => {
  const [heroTheme, setHeroTheme] = useState({
    isActive: false, // Set to true when Hero is mounted
    bgColor: "#EBE4D5",
    textColor: "dark", // "dark" or "light"
  });

  return (
    <HeroThemeContext.Provider value={{ heroTheme, setHeroTheme }}>
      {children}
    </HeroThemeContext.Provider>
  );
};

export const useHeroTheme = () => useContext(HeroThemeContext);
