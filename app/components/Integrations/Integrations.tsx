'use client';

import React from 'react';
import './integrations.css';

interface IntegrationsProps {
  integrations: { [key: string]: boolean };
  uploadedFiles: any[];
  onToggleIntegration: (name: string) => void;
  onAddFiles: (files: File[]) => void;
  onRemoveFile: (index: number) => void;
}

export default function Integrations({
  integrations,
  uploadedFiles,
  onToggleIntegration,
  onAddFiles,
  onRemoveFile
}: IntegrationsProps) {

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('dragging');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('dragging');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('dragging');
    onAddFiles(Array.from(e.dataTransfer.files));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onAddFiles(Array.from(e.target.files));
    }
  };

  return (
    <div className="main">
      <div className="int-wrap">
        <div className="page-h">
          <div className="page-title">Data Sources & <em>Integrations</em></div>
          <div className="page-sub">// Connect channels · Claude extracts only project-relevant information</div>
        </div>

        <div className="section-lbl">Communication Channels</div>
        <div className="int-grid">
          <IntegrationCard
            id="gmail"
            icon="📧"
            name="Gmail"
            desc="Import emails, threads, and discussions. Automatically filters project-relevant content."
            connected={integrations.gmail}
            onToggle={() => onToggleIntegration('gmail')}
            bgColor="rgba(234,67,53,0.1)"
          />
          <IntegrationCard
            id="slack"
            icon="💬"
            name="Slack"
            desc="Index messages from key channels like #product, #engineering, and #stakeholders."
            connected={integrations.slack}
            onToggle={() => onToggleIntegration('slack')}
            bgColor="rgba(74,21,75,0.08)"
          />
          <IntegrationCard
            id="fireflies"
            icon="🎙️"
            name="Fireflies.ai"
            desc="Meeting transcripts with auto-extracted decisions, action items, and stakeholder feedback."
            connected={integrations.fireflies}
            onToggle={() => onToggleIntegration('fireflies')}
            bgColor="rgba(201,168,76,0.1)"
          />
        </div>

        <div className="section-lbl">Upload Documents</div>
        <div
          className="drop-zone"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-input')?.click()}
        >
          <input
            type="file"
            id="file-input"
            multiple
            accept=".pdf,.docx,.txt,.md,.xlsx,.pptx,.csv"
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />
          <div className="drop-icon">⬆️</div>
          <div className="drop-title">Drop files here or click to browse</div>
          <div className="drop-sub">Meeting notes, spec docs, requirements, emails — any format</div>
          <div className="drop-types">
            <span className="type-tag">.pdf</span>
            <span className="type-tag">.docx</span>
            <span className="type-tag">.txt</span>
            <span className="type-tag">.md</span>
            <span className="type-tag">.xlsx</span>
            <span className="type-tag">.csv</span>
          </div>
        </div>

        <div className="file-list">
          {uploadedFiles.map((f, i) => (
            <div key={i} className="file-row">
              <div className="file-icon">📄</div>
              <div className="file-info">
                <div className="file-name">{f.name}</div>
                <div className="file-meta">
                  {Math.round(f.size / 1024)} KB · {f.indexed ? 'Indexed ✓' : 'Processing…'}
                </div>
              </div>
              <span className={`badge ${f.indexed ? 'badge-done' : 'badge-draft'}`}>
                {f.indexed ? 'Indexed' : 'Indexing'}
              </span>
              <button className="file-remove" onClick={() => onRemoveFile(i)}>✕</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function IntegrationCard({ id, icon, name, desc, connected, onToggle, bgColor }: any) {
  return (
    <div className={`int-card ${connected ? 'connected' : ''}`} onClick={onToggle}>
      <div className="int-head">
        <div className="int-ico" style={{ background: bgColor }}>{icon}</div>
        <span className={`int-badge ${connected ? 'on' : 'off'}`}>
          {connected ? '● Connected' : 'Connect'}
        </span>
      </div>
      <div className="int-name">{name}</div>
      <div className="int-desc">{desc}</div>
      {connected && <div className="int-sync">↻ Synced just now</div>}
    </div>
  );
}
