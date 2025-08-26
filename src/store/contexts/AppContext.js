import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useRef,
} from "react";
import notebookService from "../../services/notebookService";
import { getNotebooks, setCurrentNotebook } from "../reducer/actions";

// Import individual reducers
import { reducer as quizReducer } from "../../pages/quiz/reducer";
import { reducer as systemSettingsReducer } from "../../components/SettingsPanel/reducer";
import { reducer as sharedReducer } from "../reducer";

export const AppContext = createContext();

// A simple combineReducers function (can be replaced by a library like Redux's combineReducers)
const combineReducers = (reducers) => {
  return (state = {}, action) => {
    let hasChanged = false;
    const nextState = {};
    for (let key in reducers) {
      const previousStateForKey = state[key];
      const nextStateForKey = reducers[key](previousStateForKey, action);
      nextState[key] = nextStateForKey;
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
    }
    return hasChanged ? nextState : state;
  };
};

// Combine all reducers into a rootReducer
const rootReducer = combineReducers({
  quiz: quizReducer,
  systemSettings: systemSettingsReducer,
  shared: sharedReducer,
});

// Initial state for the combined application state
const initialAppState = (() => {
  let savedSettings = {};
  try {
    const storedSettings = localStorage.getItem("jp_word_settings");
    if (storedSettings) {
      savedSettings = JSON.parse(storedSettings);
    }
  } catch (error) {
    console.error("Failed to load settings from localStorage", error);
  }

  // Get the default systemSettings initial state
  const defaultSystemSettings = systemSettingsReducer(undefined, {});

  // Merge loaded settings with default system settings
  const mergedSystemSettings = {
    ...defaultSystemSettings,
    ...savedSettings,
    // Deep merge for playbackOptions if it exists in savedSettings
    playbackOptions: {
      ...defaultSystemSettings.playbackOptions,
      ...(savedSettings.playbackOptions || {}),
    },
  };

  return {
    quiz: quizReducer(undefined, {}), // Get initial state from each reducer
    systemSettings: mergedSystemSettings, // Pass the fully merged state here
    shared: {
      ...sharedReducer(undefined, {}), // Get initial state from shared reducer
      pendingProficiencyUpdates: {}, // Add new temporary storage
    },
  };
})();

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(rootReducer, initialAppState);
  const stateRef = useRef(state); // Create a ref to hold the latest state

  // Update the ref whenever state changes
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Simple thunk middleware
  const enhancedDispatch = useCallback(
    (action) => {
      if (typeof action === "function") {
        return action(enhancedDispatch, () => stateRef.current); // Use stateRef.current for getState
      }
      return dispatch(action);
    },
    [dispatch]
  ); // Removed state from dependencies

  useEffect(() => {
    notebookService.init();
    notebookService.initCurrentNotebook();
    const notebooks = notebookService.getNotebooks();
    const currentNotebookId = notebookService.getCurrentNotebookId();
    enhancedDispatch(getNotebooks(notebooks)); // Use enhancedDispatch
    enhancedDispatch(setCurrentNotebook(currentNotebookId)); // Use enhancedDispatch
  }, [enhancedDispatch]); // Depend on enhancedDispatch

  // Save systemSettings to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(
        "jp_word_settings",
        JSON.stringify(state.systemSettings)
      );
    } catch (error) {
      console.error("Failed to save settings to localStorage", error);
    }
  }, [state.systemSettings]);

  return (
    <AppContext.Provider value={{ state, dispatch: enhancedDispatch }}>
      {" "}
      {/* Provide enhancedDispatch */}
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
