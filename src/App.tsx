import { useNotes } from "./hooks/useNotes";
import { NoteList } from "./components/NoteList";
import { NoteEditor } from "./components/NoteEditor";
import { exportAsMarkdown } from "./lib/export";
import "./App.css";

function App() {
  const {
    notes,
    allTags,
    filterTag,
    setFilterTag,
    selectedNote,
    selectedId,
    setSelectedId,
    addNote,
    updateNote,
    deleteNote,
    addImage,
    removeImage,
    loading,
  } = useNotes();

  if (loading) {
    return (
      <div className="app loading-state">
        <p>読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <NoteList
        notes={notes}
        selectedId={selectedId}
        allTags={allTags}
        filterTag={filterTag}
        onFilterTag={setFilterTag}
        onSelect={setSelectedId}
        onAdd={addNote}
        onDelete={deleteNote}
      />
      {selectedNote ? (
        <NoteEditor
          note={selectedNote}
          allTags={allTags}
          onUpdate={updateNote}
          onAddImage={addImage}
          onRemoveImage={removeImage}
          onExport={exportAsMarkdown}
        />
      ) : (
        <main className="note-editor empty-state">
          <p>ノートを選択するか、新しいノートを作成してください</p>
        </main>
      )}
    </div>
  );
}

export default App;
