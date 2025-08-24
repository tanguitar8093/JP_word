
export const SET_CURRENT_NOTEBOOK = 'shared/SET_CURRENT_NOTEBOOK';
export const GET_NOTEBOOKS = 'shared/GET_NOTEBOOKS';
export const UPDATE_WORD_IN_NOTEBOOK = 'shared/UPDATE_WORD_IN_NOTEBOOK';
export const UPDATE_PENDING_PROFICIENCY = 'shared/UPDATE_PENDING_PROFICIENCY';
export const CLEAR_PENDING_PROFICIENCY_UPDATES = 'shared/CLEAR_PENDING_PROFICIENCY_UPDATES';
export const COMMIT_PENDING_PROFICIENCY_UPDATES = 'shared/COMMIT_PENDING_PROFICIENCY_UPDATES'; // New action type

export const setCurrentNotebook = (notebookId) => ({
  type: SET_CURRENT_NOTEBOOK,
  payload: notebookId,
});

export const getNotebooks = (notebooks) => ({
    type: GET_NOTEBOOKS,
    payload: notebooks,
});

export const updateWordInNotebook = (notebookId, wordId, updates) => ({
  type: UPDATE_WORD_IN_NOTEBOOK,
  payload: { notebookId, wordId, updates },
});

export const updatePendingProficiency = (wordId, proficiency) => ({
  type: UPDATE_PENDING_PROFICIENCY,
  payload: { wordId, proficiency },
});

export const clearPendingProficiencyUpdates = () => ({
  type: CLEAR_PENDING_PROFICIENCY_UPDATES,
});

// New thunk action creator for committing pending proficiency updates
export const commitPendingProficiencyUpdates = () => async (dispatch, getState) => {
  console.log("commit action?");
  const { currentNotebookId, pendingProficiencyUpdates } = getState().shared;
  console.log("Pending proficiency updates:", pendingProficiencyUpdates); // Add this log

  for (const wordId in pendingProficiencyUpdates) {
    const proficiency = pendingProficiencyUpdates[wordId];
    console.log(`Committing wordId: ${wordId}, proficiency: ${proficiency}`); // Add this log
    try {
      const notebookService = (await import('../../services/notebookService')).default; // Dynamic import
      await notebookService.updateWordInNotebook(currentNotebookId, wordId, { proficiency });
      dispatch(updateWordInNotebook(currentNotebookId, wordId, { proficiency }));
    } catch (error) {
      console.error(`Failed to commit proficiency for word ${wordId}:`, error);
    }
  }
  dispatch(clearPendingProficiencyUpdates());
};
