import React, { useState } from 'react';
import { MarkdownPreview } from './MarkdownPreview';
import './MarkdownEditor.css';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  minHeight?: string;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  placeholder = 'Write your comment... (Markdown supported)',
  disabled = false,
  minHeight = '120px',
}) => {
  const [mode, setMode] = useState<'write' | 'preview'>('write');

  const handleInsert = (before: string, after: string = '') => {
    const textarea = document.querySelector('.markdown-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);

    onChange(newText);

    // Set cursor position after insert
    setTimeout(() => {
      textarea.focus();
      const newPosition = start + before.length + selectedText.length;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  return (
    <div className="markdown-editor">
      <div className="markdown-toolbar">
        <div className="toolbar-left">
          <button
            type="button"
            className="toolbar-btn"
            onClick={() => handleInsert('**', '**')}
            title="Bold (Ctrl+B)"
            disabled={disabled}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8.21 13c2.106 0 3.412-1.087 3.412-2.823 0-1.306-.984-2.283-2.324-2.386v-.055a2.176 2.176 0 0 0 1.852-2.14c0-1.51-1.162-2.46-3.014-2.46H3.843V13H8.21zM5.908 4.674h1.696c.963 0 1.517.451 1.517 1.244 0 .834-.629 1.32-1.73 1.32H5.908V4.673zm0 6.788V8.598h1.73c1.217 0 1.88.492 1.88 1.415 0 .943-.643 1.449-1.832 1.449H5.907z"/>
            </svg>
          </button>
          <button
            type="button"
            className="toolbar-btn"
            onClick={() => handleInsert('*', '*')}
            title="Italic (Ctrl+I)"
            disabled={disabled}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M7.991 11.674 9.53 4.455c.123-.595.246-.71 1.347-.807l.11-.52H7.211l-.11.52c1.06.096 1.128.212 1.005.807L6.57 11.674c-.123.595-.246.71-1.346.806l-.11.52h3.774l.11-.52c-1.06-.095-1.129-.211-1.006-.806z"/>
            </svg>
          </button>
          <button
            type="button"
            className="toolbar-btn"
            onClick={() => handleInsert('~~', '~~')}
            title="Strikethrough"
            disabled={disabled}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M6.333 5.686c0 .31.083.581.27.814H5.166a2.776 2.776 0 0 1-.099-.76c0-1.627 1.436-2.768 3.48-2.768 1.969 0 3.39 1.175 3.445 2.85h-1.23c-.11-1.08-.964-1.743-2.25-1.743-1.23 0-2.18.602-2.18 1.607zm2.194 7.478c-2.153 0-3.589-1.107-3.705-2.81h1.23c.144 1.06 1.129 1.703 2.544 1.703 1.34 0 2.31-.705 2.31-1.675 0-.827-.547-1.374-1.914-1.675L8.046 8.5H1v-1h14v1h-3.504c.468.437.675.994.675 1.697 0 1.826-1.436 2.967-3.644 2.967z"/>
            </svg>
          </button>
          <span className="toolbar-divider" />
          <button
            type="button"
            className="toolbar-btn"
            onClick={() => handleInsert('[', '](url)')}
            title="Link"
            disabled={disabled}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M6.354 5.5H4a3 3 0 0 0 0 6h3a3 3 0 0 0 2.83-4H9c-.086 0-.17.01-.25.031A2 2 0 0 1 7 10.5H4a2 2 0 1 1 0-4h1.535c.218-.376.495-.714.82-1z"/>
              <path d="M9 5.5a3 3 0 0 0-2.83 4h1.098A2 2 0 0 1 9 6.5h3a2 2 0 1 1 0 4h-1.535a4.02 4.02 0 0 1-.82 1H12a3 3 0 1 0 0-6H9z"/>
            </svg>
          </button>
          <button
            type="button"
            className="toolbar-btn"
            onClick={() => handleInsert('`', '`')}
            title="Inline Code"
            disabled={disabled}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M5.854 4.854a.5.5 0 1 0-.708-.708l-3.5 3.5a.5.5 0 0 0 0 .708l3.5 3.5a.5.5 0 0 0 .708-.708L2.707 8l3.147-3.146zm4.292 0a.5.5 0 0 1 .708-.708l3.5 3.5a.5.5 0 0 1 0 .708l-3.5 3.5a.5.5 0 0 1-.708-.708L13.293 8l-3.147-3.146z"/>
            </svg>
          </button>
          <button
            type="button"
            className="toolbar-btn"
            onClick={() => handleInsert('```\n', '\n```')}
            title="Code Block"
            disabled={disabled}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M10.478 1.647a.5.5 0 1 0-.956-.294l-4 13a.5.5 0 0 0 .956.294l4-13zM4.854 4.146a.5.5 0 0 1 0 .708L1.707 8l3.147 3.146a.5.5 0 0 1-.708.708l-3.5-3.5a.5.5 0 0 1 0-.708l3.5-3.5a.5.5 0 0 1 .708 0zm6.292 0a.5.5 0 0 0 0 .708L14.293 8l-3.147 3.146a.5.5 0 0 0 .708.708l3.5-3.5a.5.5 0 0 0 0-.708l-3.5-3.5a.5.5 0 0 0-.708 0z"/>
            </svg>
          </button>
          <button
            type="button"
            className="toolbar-btn"
            onClick={() => handleInsert('\n- ')}
            title="Bullet List"
            disabled={disabled}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path fillRule="evenodd" d="M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm-3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
            </svg>
          </button>
        </div>

        <div className="toolbar-right">
          <button
            type="button"
            className={`mode-btn ${mode === 'write' ? 'active' : ''}`}
            onClick={() => setMode('write')}
          >
            Write
          </button>
          <button
            type="button"
            className={`mode-btn ${mode === 'preview' ? 'active' : ''}`}
            onClick={() => setMode('preview')}
          >
            Preview
          </button>
        </div>
      </div>

      <div className="markdown-content">
        {mode === 'write' ? (
          <textarea
            className="markdown-textarea"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            style={{ minHeight }}
          />
        ) : (
          <div className="markdown-preview-container" style={{ minHeight }}>
            {value ? (
              <MarkdownPreview content={value} />
            ) : (
              <p className="empty-preview">Nothing to preview</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
