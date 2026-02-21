'use client';

import React from 'react';
import './integrations.css';

interface IntegrationsProps {
  integrations: { [key: string]: boolean };
  uploadedFiles: any[];
  onToggleIntegration: (name: string) => void;
  onAddFiles: (files: File[]) => void;
  onRemoveFile: (index: number) => void;
  onFetchGmail: () => void;
  realEmails: any[];
}

export default function Integrations({
  integrations,
  uploadedFiles,
  onToggleIntegration,
  onAddFiles,
  onRemoveFile,
  onFetchGmail,
  realEmails
}: IntegrationsProps) {
  const [connectingId, setConnectingId] = React.useState<string | null>(null);

  const handleToggle = (id: string) => {
    if (integrations[id]) {
      onToggleIntegration(id);
      return;
    }

    setConnectingId(id);
    setTimeout(() => {
      onToggleIntegration(id);
      if (id === 'gmail') onFetchGmail();
      setConnectingId(null);
    }, 1500);
  };

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
          <div className="page-sub">Connect channels · Claude extracts only project-relevant information</div>
        </div>

        <div className="section-lbl">Communication Channels</div>
        <div className="int-grid">
          <IntegrationCard
            id="gmail"
            icon="📧"
            name="Enron Email Base"
            desc="Process signals from ~500k professional emails. Advanced noise filtering for project requirements."
            connected={integrations.gmail}
            connecting={connectingId === 'gmail'}
            onToggle={() => handleToggle('gmail')}
            bgColor="rgba(234,67,53,0.1)"
            realEmails={realEmails}
          />
          <IntegrationCard
            id="slack"
            icon="💬"
            name="Slack Archive"
            desc="Ingest project-specific channels and direct messages. Extracts decision signals from chat."
            connected={integrations.slack}
            connecting={connectingId === 'slack'}
            onToggle={() => handleToggle('slack')}
            bgColor="rgba(74,21,75,0.08)"
          />
          <IntegrationCard
            id="fireflies"
            icon="🎙️"
            name="AMI Transcripts"
            desc="279 meeting transcripts with abstractive summaries. Identifies stakeholder disagreements & feature prioritization."
            connected={integrations.fireflies}
            connecting={connectingId === 'fireflies'}
            onToggle={() => handleToggle('fireflies')}
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

function IntegrationCard({ id, icon, name, desc, connected, connecting, onToggle, bgColor, realEmails }: any) {
  return (
    <div className={`int-card ${connected ? 'connected' : ''} ${connecting ? 'connecting' : ''}`} onClick={!connecting ? onToggle : undefined}>
      <div className="int-head">
        <div className="int-ico" style={{ background: bgColor }}>{icon}</div>
        <span className={`int-badge ${connected ? 'on' : 'off'}`}>
          {connecting ? <span className="spinner" style={{ borderTopColor: '#fff', width: '10px', height: '10px' }}></span> : (connected ? '● Connected' : 'Connect')}
        </span>
      </div>
      <div className="int-name">{name}</div>
      <div className="int-desc">{desc}</div>
      {connected && id === 'gmail' && realEmails && realEmails.length > 0 && (
        <div className="real-data-preview">
          <div className="preview-label">Latest Signals Identified:</div>
          {realEmails.map((msg: any) => (
            <div key={msg.id} className="preview-item">
              <span className="dot"></span> {msg.subject}
            </div>
          ))}
        </div>
      )}
      {connected && <div className="int-sync">↻ Synced just now</div>}
      {connecting && <div className="int-sync" style={{ color: 'var(--mist)' }}>🔐 Establishing secure link...</div>}
    </div>
  );
}
