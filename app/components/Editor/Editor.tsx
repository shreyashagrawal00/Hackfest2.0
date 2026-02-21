'use client';

import React, { useState } from 'react';
import './editor.css';
import { BRD } from '@/app/types';

interface EditorProps {
  brd: BRD | null;
  onAIMessage: (msg: string) => void;
  onUpdateBRD: (fields: Partial<BRD>) => void;
  aiMessages: Array<{ type: string; text: string }>;
  aiProcessing: boolean;
}

export default function Editor({ brd, onAIMessage, onUpdateBRD, aiMessages, aiProcessing }: EditorProps) {
  const [activeSection, setActiveSection] = useState(brd?.sections[0]?.id || '');
  const [aiInput, setAiInput] = useState('');
  const [editMode, setEditMode] = useState(true);
  const [exporting, setExporting] = useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages]);

  if (!brd) {
    return (
      <div className="empty-doc-view">
        <div className="empty-doc">
          <div className="big">✦</div>
          <p>No document generated yet.</p>
        </div>
      </div>
    );
  }

  const handleSendAI = () => {
    if (aiInput.trim()) {
      onAIMessage(aiInput);
      setAiInput('');
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const element = document.getElementById('brd-content');
      if (!element) throw new Error('Document content not found');
      const opt = {
        margin: [15, 15] as [number, number],
        filename: `${brd.projectName.replace(/\s+/g, '_')}_BRD.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error('PDF Export Error:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleContentBlur = (sectionId: string, e: React.FocusEvent<HTMLDivElement>) => {
    const updatedSections = brd.sections.map((s) =>
      s.id === sectionId ? { ...s, content: e.target.innerHTML } : s
    );
    onUpdateBRD({ sections: updatedSections });
  };

  return (
    <div className="editor-layout">
      {/* Section nav */}
      <nav className="doc-nav">
        <div className="doc-nav-title">Sections</div>
        {brd.sections.map((sec, i: number) => (
          <div
            key={sec.id}
            className={`doc-nav-item ${activeSection === sec.id ? 'sec-active' : ''}`}
            onClick={() => {
              setActiveSection(sec.id);
              document.getElementById(`sec-${sec.id}`)?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <span className="doc-nav-num">{i + 1}.</span>{sec.title}
          </div>
        ))}
      </nav>

      {/* Document body */}
      <div className="doc-body">
        <div className="doc-toolbar">
          <button
            className={`tbtn ${editMode ? 'ton' : ''}`}
            onClick={() => setEditMode(true)}
          >
            Edit
          </button>
          <button
            className={`tbtn ${!editMode ? 'ton' : ''}`}
            onClick={() => setEditMode(false)}
          >
            Preview
          </button>
          <div className="tsep"></div>
          <span className="doc-title-meta">{brd.projectName} · v1.0</span>
          <button className="export-btn" onClick={handleExport} disabled={exporting}>
            {exporting ? <span className="spinner" style={{ borderTopColor: 'var(--gold)' }}></span> : 'Export PDF'}
          </button>
        </div>

        <div id="brd-content">
          <div
            contentEditable={editMode}
            suppressContentEditableWarning={true}
            className="doc-h1"
            onBlur={(e) => onUpdateBRD({ projectName: e.target.innerText })}
            style={{ outline: 'none' }}
          >
            {brd.projectName}
          </div>

          <div className="doc-meta-row">
            <div className="doc-meta-item">Status <strong style={{ color: 'var(--gold)' }}>Draft</strong></div>
            <div className="doc-meta-item">Created <strong>{new Date(brd.createdAt).toLocaleDateString()}</strong></div>
            <div className="doc-meta-item">Sections <strong>{brd.sections.length}</strong></div>
            {brd.conflicts > 0 && <div className="doc-meta-item" style={{ color: 'var(--rust)' }}>⚠ <strong>{brd.conflicts} Conflicts</strong></div>}
          </div>

          {brd.sections.map((sec, i: number) => (
            <div key={sec.id} className="doc-section" id={`sec-${sec.id}`}>
              <div className="doc-section-title">
                <span className="sec-num">§{i + 1}</span>
                {sec.title}
              </div>
              <div
                className={`doc-content ${!editMode ? 'readonly' : ''}`}
                contentEditable={editMode}
                suppressContentEditableWarning={true}
                dangerouslySetInnerHTML={{ __html: sec.content }}
                onBlur={(e) => handleContentBlur(sec.id, e)}
                style={{ outline: 'none' }}
              />
              {sec.requirements && (
                <table className="req-table">
                  <thead><tr><th>ID</th><th>Requirement</th><th>Priority</th></tr></thead>
                  <tbody>
                    {sec.requirements.map((r) => (
                      <tr key={r.id}>
                        <td className="req-id">{r.id}</td>
                        <td>{r.description || r.text}</td>
                        <td>
                          <span className={`pbadge ${r.priority === 'High' ? 'p-high' : r.priority === 'Medium' ? 'p-med' : 'p-low'}`}>
                            {r.priority}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* AI Panel */}
      <div className="ai-panel">
        <div className="ai-panel-head">
          <div className="ai-status"><div className="ai-pulse"></div><span className="ai-lbl">AI Edit Assistant</span></div>
          <span className="ai-model-tag">claude-3.5-sonnet</span>
        </div>
        <div className="ai-messages">
          {aiMessages.map((m, i) => (
            <div key={i} className={`ai-msg ${m.type}`}>
              {m.text}
            </div>
          ))}
          {aiProcessing && <div className="ai-typing"><span></span><span></span><span></span></div>}
          <div ref={messagesEndRef} />
        </div>
        <div className="ai-input-row">
          <textarea
            className="ai-ta"
            placeholder="Ask Claude to edit..."
            value={aiInput}
            onChange={e => setAiInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendAI())}
          />
          <button className="ai-send" onClick={handleSendAI} disabled={aiProcessing}>→</button>
        </div>
      </div>
    </div>
  );
}
