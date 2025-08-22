import { createContext, useContext, useReducer } from 'react';

// Import individual reducers
import { reducer as quizReducer } from '../features/quiz/reducer';
import { reducer as wordManagementReducer } from '../features/wordManagement/reducer';
import { reducer as systemSettingsReducer } from '../features/systemSettings/reducer';
import { reducer as wordReadingReducer } from '../features/wordReading/reducer';
import { reducer as sharedReducer } from '../common/reducer';

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
  wordManagement: wordManagementReducer,
  systemSettings: systemSettingsReducer,
  wordReading: wordReadingReducer,
  shared: sharedReducer,
});

// Initial state for the combined application state
const initialAppState = {
  quiz: quizReducer(undefined, {}), // Get initial state from each reducer
  wordManagement: wordManagementReducer(undefined, {}),
  systemSettings: systemSettingsReducer(undefined, {}),
  wordReading: wordReadingReducer(undefined, {}),
  shared: sharedReducer(undefined, {}),
};

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(rootReducer, initialAppState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};