import { useNotes } from "./hooks/useNotes";
import { NoteList } from "./components/NoteList";
import { NoteEditor } from "./components/NoteEditor";
import "./App.css";

function App() {
  const {
    notes,
    selectedNote,
    selectedId,
    setSelectedId,
    addNote,
    updateNote,
    deleteNote,
  } = useNotes();

  return (
    <div className="app">
      <NoteList
        notes={notes}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onAdd={addNote}
        onDelete={deleteNote}
      />
      {selectedNote ? (
        <NoteEditor note={selectedNote} onUpdate={updateNote} />
      ) : (
        <main className="note-editor empty-state">
          <p>ノートを選択するか、新しいノートを作成してください</p>
        </main>
      )}
    </div>
  );
}

export default App;
