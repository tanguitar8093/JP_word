
import React, { useState, useEffect } from 'react';
import notebookService from '../../services/notebookService';
import { useApp } from '../../store/contexts/AppContext';
import { getNotebooks, setCurrentNotebook } from '../../store/reducer/actions';

const NotebookManagementPage = ({ onExit }) => {
  const { state, dispatch } = useApp();
  const { notebooks, currentNotebookId } = state.shared;
  const [newNotebookName, setNewNotebookName] = useState('');
  const [selectedNotebook, setSelectedNotebook] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [editingContext, setEditingContext] = useState('');
  const [proficiencyFilter, setProficiencyFilter] = useState(0); // 0 for all, 1 for low, 2 for medium, 3 for high

  useEffect(() => {
    const currentNotebook = notebooks.find(n => n.id === currentNotebookId);
    if (currentNotebook) {
        handleSelectNotebook(currentNotebook);
    }

  }, [currentNotebookId, notebooks]);

  const refreshNotebooks = (currentId) => {
    const allNotebooks = notebookService.getNotebooks();
    dispatch(getNotebooks(allNotebooks));
    if (currentId) {
        dispatch(setCurrentNotebook(currentId));
        notebookService.setCurrentNotebookId(currentId);
    }
  };

  const handleSelectNotebook = (notebook) => {
    setSelectedNotebook(notebook);
    setEditingName(notebook.name);
    setEditingContext(JSON.stringify(notebook.context, null, 2));
    dispatch(setCurrentNotebook(notebook.id));
    notebookService.setCurrentNotebookId(notebook.id);
  };

  const handleCreateNotebook = () => {
    try {
      const newNotebook = notebookService.createNotebook(newNotebookName);
      setNewNotebookName('');
      refreshNotebooks(newNotebook.id); // Select the new notebook
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDeleteNotebook = (id) => {
    if (window.confirm('Are you sure you want to delete this notebook?')) {
      notebookService.deleteNotebook(id);
      refreshNotebooks(null); // Deselect
    }
  };

  const handleUpdateName = () => {
    try {
        notebookService.updateNotebook(selectedNotebook.id, { name: editingName });
        refreshNotebooks(selectedNotebook.id);
    } catch (error) {
        alert(error.message);
    }
  };

  const handleUpdateContext = () => {
    try {
        const newContextData = JSON.parse(editingContext);
        const originalContext = selectedNotebook.context;
        const contextMap = new Map(originalContext.map(word => [word.id, word]));

        const itemsToUpdate = Array.isArray(newContextData) ? newContextData : [newContextData];

        for (const item of itemsToUpdate) {
            if (item && typeof item === 'object' && item.id) {
                contextMap.set(item.id, item);
            } else if (item && typeof item === 'object' && !item.id) {
                // Optional: handle adding new words that don't have an ID yet
                // For now, we only update existing ones based on ID.
            }
        }

        const finalContext = Array.from(contextMap.values());
        notebookService.updateNotebook(selectedNotebook.id, { context: finalContext });
        refreshNotebooks(selectedNotebook.id);
        // also update the textarea to reflect the formatted, saved data
        setEditingContext(JSON.stringify(finalContext, null, 2));
        alert('Context updated successfully!');
    } catch (error) {
        alert(`Error updating context: ${error.message}`);
    }
  };

  const handleDeleteWord = (wordId) => {
    if (window.confirm('Are you sure you want to delete this word?')) {
        try {
            notebookService.deleteWordsFromNotebook(selectedNotebook.id, [wordId]);
            refreshNotebooks(selectedNotebook.id);
        } catch (error) {
            alert(error.message);
        }
    }
  };
  
  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const newNotebook = await notebookService.importNotebook(file);
      refreshNotebooks(newNotebook.id);
      alert('Notebook imported successfully!');
    } catch (error) {
      alert(error.message);
    }
    event.target.value = null;
  };

  const filteredContext = selectedNotebook?.context.filter(word => {
    if (proficiencyFilter === 0) return true;
    return word.proficiency === proficiencyFilter;
  }) || [];

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <button onClick={onExit} style={{ float: 'right' }}>Back to App</button>
      <h1>Notebook Management (Beta)</h1>

      <div style={{ marginBottom: '20px' }}>
        <h2>Create New Notebook</h2>
        <input 
          type="text" 
          value={newNotebookName} 
          onChange={(e) => setNewNotebookName(e.target.value)} 
          placeholder="Enter notebook name (max 20 chars)" 
          maxLength="20"
        />
        <button onClick={handleCreateNotebook}>Create</button>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Import Notebook</h2>
        <input type="file" accept=".json" onChange={handleImport} />
      </div>

      <hr />

      <div style={{ display: 'flex' }}>
        <div style={{ width: '30%', borderRight: '1px solid #ccc', paddingRight: '10px' }}>
          <h2>Notebooks</h2>
          {notebooks.length === 0 ? <p>No notebooks found.</p> : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {notebooks.map(notebook => (
                <li key={notebook.id} style={{ marginBottom: '10px', fontWeight: currentNotebookId === notebook.id ? 'bold' : 'normal' }}>
                  <span onClick={() => handleSelectNotebook(notebook)} style={{ cursor: 'pointer' }}>
                    {notebook.name}
                  </span>
                  <button onClick={() => handleDeleteNotebook(notebook.id)} style={{ marginLeft: '10px' }}>Delete</button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div style={{ width: '70%', paddingLeft: '10px' }}>
          <h2>Selected Notebook Details</h2>
          {selectedNotebook ? (
            <div>
              <div>
                <input 
                    type="text" 
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    maxLength="20"
                />
                <button onClick={handleUpdateName}>Update Name</button>
              </div>
              
              <h3>Content (JSON - Merge Update):</h3>
                <textarea 
                    value={editingContext}
                    onChange={(e) => setEditingContext(e.target.value)}
                    rows={15}
                    style={{width: '95%', background: '#f4f4f4', border: '1px solid #ccc'}}
                    placeholder="Paste a full array or a single object (with id) to update/merge."
                />
                <div>
                    <button onClick={handleUpdateContext}>Save Context</button>
                </div>
              
              <h4>Words Preview:</h4>
              <div>
                <button onClick={() => setProficiencyFilter(0)} style={{ fontWeight: proficiencyFilter === 0 ? 'bold' : 'normal' }}>All</button>
                <button onClick={() => setProficiencyFilter(1)} style={{ fontWeight: proficiencyFilter === 1 ? 'bold' : 'normal' }}>Low</button>
                <button onClick={() => setProficiencyFilter(2)} style={{ fontWeight: proficiencyFilter === 2 ? 'bold' : 'normal' }}>Medium</button>
                <button onClick={() => setProficiencyFilter(3)} style={{ fontWeight: proficiencyFilter === 3 ? 'bold' : 'normal' }}>High</button>
              </div>
               {filteredContext && filteredContext.length > 0 ? (
                <ul>
                    {filteredContext.map(word => (
                        <li key={word.id}>{word.jp_word} - {word.ch_word} (Proficiency: {word.proficiency}) <button onClick={() => handleDeleteWord(word.id)}>Delete</button></li>
                    ))}
                </ul>
               ) : <p>This notebook is empty or no words match the filter.</p>}
            </div>
          ) : (
            <p>Select a notebook to see its details.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotebookManagementPage;
