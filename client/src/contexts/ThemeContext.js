import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Create context
const ThemeContext = createContext();

// Action types
const THEME_ACTIONS = {
  TOGGLE_THEME: 'TOGGLE_THEME',
  SET_THEME: 'SET_THEME',
  SET_SIDEBAR_COLLAPSED: 'SET_SIDEBAR_COLLAPSED',
  TOGGLE_SIDEBAR: 'TOGGLE_SIDEBAR'
};

// Initial state
const initialState = {
  darkMode: localStorage.getItem('darkMode') === 'true' || false,
  sidebarCollapsed: localStorage.getItem('sidebarCollapsed') === 'true' || false,
  primaryColor: localStorage.getItem('primaryColor') || 'blue'
};

// Reducer
const themeReducer = (state, action) => {
  switch (action.type) {
    case THEME_ACTIONS.TOGGLE_THEME:
      const newDarkMode = !state.darkMode;
      localStorage.setItem('darkMode', newDarkMode.toString());
      return {
        ...state,
        darkMode: newDarkMode
      };
    case THEME_ACTIONS.SET_THEME:
      localStorage.setItem('darkMode', action.payload.toString());
      return {
        ...state,
        darkMode: action.payload
      };
    case THEME_ACTIONS.SET_SIDEBAR_COLLAPSED:
      localStorage.setItem('sidebarCollapsed', action.payload.toString());
      return {
        ...state,
        sidebarCollapsed: action.payload
      };
    case THEME_ACTIONS.TOGGLE_SIDEBAR:
      const newCollapsed = !state.sidebarCollapsed;
      localStorage.setItem('sidebarCollapsed', newCollapsed.toString());
      return {
        ...state,
        sidebarCollapsed: newCollapsed
      };
    default:
      return state;
  }
};

// ThemeProvider component
export const ThemeProvider = ({ children }) => {
  const [state, dispatch] = useReducer(themeReducer, initialState);

  // Apply theme to document
  useEffect(() => {
    if (state.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.darkMode]);

  // Toggle theme function
  const toggleTheme = () => {
    dispatch({ type: THEME_ACTIONS.TOGGLE_THEME });
  };

  // Set theme function
  const setTheme = (isDark) => {
    dispatch({ type: THEME_ACTIONS.SET_THEME, payload: isDark });
  };

  // Toggle sidebar function
  const toggleSidebar = () => {
    dispatch({ type: THEME_ACTIONS.TOGGLE_SIDEBAR });
  };

  // Set sidebar collapsed function
  const setSidebarCollapsed = (collapsed) => {
    dispatch({ type: THEME_ACTIONS.SET_SIDEBAR_COLLAPSED, payload: collapsed });
  };

  const value = {
    ...state,
    toggleTheme,
    setTheme,
    toggleSidebar,
    setSidebarCollapsed
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
