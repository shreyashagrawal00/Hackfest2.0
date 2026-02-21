'use client';

import React from 'react';
import './dashboard.css';

interface DashboardProps {
  brds: any[];
  integrations: { [key: string]: boolean };
  uploadedFiles: any[];
  onNavigateToGenerate: () => void;
  onNavigateToIntegrations: () => void;
  onOpenBRD: (index: number) => void;
}

export default function Dashboard({
  brds,
  integrations,
  uploadedFiles,
  onNavigateToGenerate,
  onNavigateToIntegrations,
  onOpenBRD
}: DashboardProps) {
  const totalBRDs = brds.length;
  const sourcesCount = Object.values(integrations).filter(Boolean).length;
  const filesCount = uploadedFiles.length;
  const conflictsCount = brds.reduce((a, b) => a + (b.conflicts || 0), 0);

  return (
    <div className="main">
      <div className="dash-wrap">
        <div className="dash-hero-row">
          <div className="page-h">
            <div className="page-title">Good morning, <em>User</em></div>
            <div className="page-sub">// {totalBRDs} documents generated · {sourcesCount} sources connected</div>
          </div>
          <button className="new-btn" onClick={onNavigateToGenerate}>
            ✦ &nbsp;New BRD
          </button>
        </div>

        <div className="stat-row">
          <div className="stat-card">
            <div className="stat-lbl">Total BRDs</div>
            <div className="stat-val">{totalBRDs}</div>
            <div className="stat-note">{totalBRDs === 0 ? 'none yet' : `+${totalBRDs} generated`}</div>
          </div>
          <div className="stat-card">
            <div className="stat-lbl">Sources Connected</div>
            <div className="stat-val">{sourcesCount}</div>
            <div className="stat-note">integrations active</div>
          </div>
          <div className="stat-card">
            <div className="stat-lbl">Files Uploaded</div>
            <div className="stat-val">{filesCount}</div>
            <div className="stat-note">ready to process</div>
          </div>
          <div className="stat-card">
            <div className="stat-lbl">Conflicts Found</div>
            <div className="stat-val" style={{ color: 'var(--rust)' }}>{conflictsCount}</div>
            <div className="stat-note" style={{ color: 'var(--mist)' }}>across all docs</div>
          </div>
        </div>

        <div className="dash-grid">
          <div>
            <div className="section-lbl">Generated Documents</div>
            <div className="brd-list">
              {brds.length === 0 ? (
                <div className="empty-list-card">
                  <div className="empty-icon">✦</div>
                  <div className="empty-text">
                    No BRDs yet. <span className="action-link" onClick={onNavigateToGenerate}>Generate your first one →</span>
                  </div>
                </div>
              ) : (
                brds.map((brd, i) => (
                  <div key={i} className="brd-row" onClick={() => onOpenBRD(i)}>
                    <div className="brd-dot"></div>
                    <div className="brd-info">
                      <div className="brd-name">{brd.projectName}</div>
                      <div className="brd-meta">
                        {brd.sections.length} sections · {brd.conflicts || 0} conflicts
                      </div>
                    </div>
                    <span className="badge badge-done">Complete</span>
                  </div>
                ))
              )}
            </div>
          </div>
          <div>
            <div className="section-lbl">Data Sources</div>
            <div className="sources-card">
              <SourceItem
                icon="📧"
                name="Gmail"
                connected={integrations.gmail}
                count={integrations.gmail ? "~1,200 emails indexed" : "Not connected"}
                bgColor="rgba(234,67,53,0.1)"
              />
              <SourceItem
                icon="💬"
                name="Slack"
                connected={integrations.slack}
                count={integrations.slack ? "~8,500 msgs indexed" : "Not connected"}
                bgColor="rgba(74,21,75,0.08)"
              />
              <SourceItem
                icon="🎙️"
                name="Fireflies.ai"
                connected={integrations.fireflies}
                count={integrations.fireflies ? "~47 transcripts indexed" : "Not connected"}
                bgColor="rgba(201,168,76,0.1)"
              />
              <SourceItem
                icon="📄"
                name="Uploaded Docs"
                connected={filesCount > 0}
                count={`${filesCount} file${filesCount !== 1 ? 's' : ''}${filesCount > 0 ? ' indexed' : ''}`}
                bgColor="rgba(138,155,168,0.1)"
                isLast
              />
              <div style={{ marginTop: '14px' }}>
                <button className="manage-btn" onClick={onNavigateToIntegrations}>
                  + Manage Integrations
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SourceItem({ icon, name, connected, count, bgColor, isLast }: any) {
  return (
    <div className="src-item" style={isLast ? { borderBottom: 'none', paddingBottom: 0 } : {}}>
      <div className="src-icon" style={{ background: bgColor }}>{icon}</div>
      <div className="src-info">
        <div className="src-name">{name}</div>
        <div className="src-count">{count}</div>
      </div>
      <div className="src-dot" style={{ background: connected ? 'var(--sage)' : 'var(--mist)' }}></div>
    </div>
  );
}
