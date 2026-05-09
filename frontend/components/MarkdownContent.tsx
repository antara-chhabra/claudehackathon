import React from "react";

function renderInline(s: string): string {
  return s
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(
      /\[(.+?)\]\((https?:\/\/[^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener" style="color:#631212;text-decoration:underline">$1</a>'
    );
}

export default function MarkdownContent({ text }: { text: string }) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];

  function flushList() {
    if (listItems.length === 0) return;
    elements.push(
      <ul key={elements.length} style={{ paddingLeft: 16, margin: "6px 0" }}>
        {listItems.map((item, i) => (
          <li
            key={i}
            style={{ marginBottom: 3 }}
            dangerouslySetInnerHTML={{ __html: renderInline(item) }}
          />
        ))}
      </ul>
    );
    listItems = [];
  }

  for (const line of lines) {
    const trimmed = line.trim();

    if (/^#{1,3}\s/.test(trimmed)) {
      flushList();
      const content = trimmed.replace(/^#{1,3}\s/, "");
      elements.push(
        <p
          key={elements.length}
          style={{ fontWeight: 700, marginTop: 10, marginBottom: 2, color: "#3D2B1F" }}
          dangerouslySetInnerHTML={{ __html: renderInline(content) }}
        />
      );
    } else if (/^[-*]\s/.test(trimmed)) {
      listItems.push(trimmed.replace(/^[-*]\s/, ""));
    } else if (/^---+$/.test(trimmed)) {
      flushList();
      elements.push(
        <hr
          key={elements.length}
          style={{ border: "none", borderTop: "1px solid #E0D4C0", margin: "8px 0" }}
        />
      );
    } else if (trimmed === "") {
      flushList();
    } else {
      flushList();
      elements.push(
        <p
          key={elements.length}
          style={{ margin: "3px 0", lineHeight: 1.65 }}
          dangerouslySetInnerHTML={{ __html: renderInline(trimmed) }}
        />
      );
    }
  }
  flushList();

  return <div>{elements}</div>;
}
