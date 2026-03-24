import type { Note } from "../types/Note";

export function exportAsMarkdown(note: Note) {
  let md = `# ${note.title}\n\n`;

  if (note.tags.length > 0) {
    md += `> Tags: ${note.tags.join(", ")}\n\n`;
  }

  md += note.content;

  if (note.images.length > 0) {
    md += "\n\n---\n\n## 添付画像\n\n";
    for (const img of note.images) {
      md += `![${img.name}](${img.dataUrl})\n\n`;
    }
  }

  const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${note.title || "note"}.md`;
  a.click();
  URL.revokeObjectURL(url);
}
