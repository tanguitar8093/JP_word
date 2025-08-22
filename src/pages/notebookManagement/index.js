
import React, { useState, useEffect, useCallback } from 'react';
import notebookService from '../../services/notebookService';

const NotebookManagementPage = ({ onExit }) => {
  const [notebooks, setNotebooks] = useState([]);
  const [newNotebookName, setNewNotebookName] = useState('');
  const [selectedNotebook, setSelectedNotebook] = useState(null);
  const [editingName, setEditingName] = useState('');

  const loadNotebooks = useCallback(() => {
    const allNotebooks = notebookService.getNotebooks();
    setNotebooks(allNotebooks);
    if (selectedNotebook) {
        const updatedSelected = allNotebooks.find(n => n.id === selectedNotebook.id);
        setSelectedNotebook(updatedSelected || null);
    }
  }, [selectedNotebook]);

  useEffect(() => {
    notebookService.init();
    loadNotebooks();
  }, [loadNotebooks]);

  const handleCreateNotebook = () => {
    try {
      notebookService.createNotebook(newNotebookName);
      setNewNotebookName('');
      loadNotebooks();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDeleteNotebook = (id) => {
    if (window.confirm('Are you sure you want to delete this notebook?')) {
      notebookService.deleteNotebook(id);
      loadNotebooks();
    }
  };

  const handleSelectNotebook = (notebook) => {
    setSelectedNotebook(notebook);
    setEditingName(notebook.name);
  };

  const handleUpdateName = () => {
    try {
        notebookService.updateNotebook(selectedNotebook.id, { name: editingName });
        loadNotebooks();
    } catch (error) {
        alert(error.message);
    }
  };

  const handleDeleteWord = (wordId) => {
    if (window.confirm('Are you sure you want to delete this word?')) {
        try {
            notebookService.deleteWordsFromNotebook(selectedNotebook.id, [wordId]);
            loadNotebooks();
        } catch (error) {
            alert(error.message);
        }
    }
  };
  
  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      await notebookService.importNotebook(file);
      loadNotebooks();
      alert('Notebook imported successfully!');
    } catch (error) {
      alert(error.message);
    }
  };

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
                <li key={notebook.id} style={{ marginBottom: '10px' }}>
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
              
              <h3>Content:</h3>
              <pre style={{ background: '#f4f4f4', padding: '10px', maxHeight: '300px', overflowY: 'auto' }}>
                {JSON.stringify(selectedNotebook.context, null, 2)}
              </pre>
              
              <h4>Words:</h4>
               {selectedNotebook.context && selectedNotebook.context.length > 0 && selectedNotebook.context[0].jp ? (
                <ul>
                    {selectedNotebook.context.map(word => (
                        <li key={word.id}>{word.jp} - {word.en} <button onClick={() => handleDeleteWord(word.id)}>Delete</button></li>
                    ))}
                </ul>
               ) : <p>This notebook is empty.</p>}
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
