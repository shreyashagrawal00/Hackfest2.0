'use client';

import React from 'react';
import './dashboard.css';
import { BRD, IndexedFile, GmailMessage } from '@/app/types';

interface DashboardProps {
  brds: BRD[];
  integrations: { [key: string]: boolean };
  uploadedFiles: IndexedFile[];
  onNavigateToGenerate: () => void;
  onNavigateToIntegrations: () => void;
  onOpenBRD: (index: number) => void;
  onQuickGenerate: () => void;
  userName: string;
  realEmails: GmailMessage[];
}

export default function Dashboard({
  brds,
  integrations,
  uploadedFiles,
  onNavigateToGenerate,
  onNavigateToIntegrations,
  onOpenBRD,
  onQuickGenerate,
  userName,
  realEmails
}: DashboardProps) {

  // Demo emails for preview when real ones aren't available
  const previewEmails = (realEmails && realEmails.length > 0) ? realEmails.slice(0, 4) : [
    { id: 'd1', subject: 'RE: Q3 Product Launch Timeline', snippet: 'Team, we need to finalize the feature list by Friday...' },
    { id: 'd2', subject: 'FW: Updated API Specifications v2.3', snippet: 'Please review the attached API spec changes...' },
    { id: 'd3', subject: 'Meeting Notes: Stakeholder Review', snippet: 'Summary of decisions: MVP scope reduced to 3 modules...' },
    { id: 'd4', subject: 'URGENT: Security Audit Findings', snippet: 'The penetration test revealed 2 critical vulnerabilities...' },
  ];
  const totalBRDs = brds.length;
  const sourcesCount = Object.values(integrations).filter(Boolean).length;
  const filesCount = uploadedFiles.length;
  const conflictsCount = brds.reduce((a, b) => a + (b.conflicts || 0), 0);

  return (
    <div className="main">
      <div className="dash-wrap">
        <div className="dash-hero-row">
          <div className="page-h">
            <div className="page-title">Welcome, <em>{userName}</em></div>
            <div className="page-sub">{totalBRDs} documents generated · {sourcesCount} sources connected</div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {integrations.gmail && (
              <button className="quick-gen-btn" onClick={onQuickGenerate}>
                📧 Quick Generate from Emails
              </button>
            )}
            <button className="new-btn" onClick={onNavigateToGenerate}>
              ✦ &nbsp;New BRD
            </button>
          </div>
        </div>

        <div className="stat-row">
          <div className="stat-card" style={{ cursor: 'default' }}>
            <div className="stat-lbl">Total BRDs</div>
            <div className="stat-val">{totalBRDs}</div>
            <div className="stat-note">{totalBRDs === 0 ? 'none yet' : `+${totalBRDs} generated`}</div>
          </div>
          <div className="stat-card" onClick={onNavigateToIntegrations} style={{ cursor: 'pointer' }}>
            <div className="stat-lbl">Sources Connected</div>
            <div className="stat-val">{sourcesCount}</div>
            <div className="stat-note">integrations active</div>
          </div>
          <div className="stat-card" onClick={onNavigateToIntegrations} style={{ cursor: 'pointer' }}>
            <div className="stat-lbl">Files Uploaded</div>
            <div className="stat-val">{filesCount}</div>
            <div className="stat-note">ready to process</div>
          </div>
          <div className="stat-card" style={{ cursor: 'default' }}>
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
                  <div className="empty-steps">
                    <div className="empty-step" onClick={onNavigateToIntegrations}>
                      <div className="step-num">1</div>
                      <div className="step-icon">📧</div>
                      <div className="step-text">Connect Gmail</div>
                    </div>
                    <div className="step-arrow">→</div>
                    <div className="empty-step" onClick={onNavigateToGenerate}>
                      <div className="step-num">2</div>
                      <div className="step-icon">✓</div>
                      <div className="step-text">Select Emails</div>
                    </div>
                    <div className="step-arrow">→</div>
                    <div className="empty-step" onClick={onNavigateToGenerate}>
                      <div className="step-num">3</div>
                      <div className="step-icon">✦</div>
                      <div className="step-text">Generate BRD</div>
                    </div>
                  </div>
                  <div className="empty-text" style={{ marginTop: '16px' }}>
                    Get started in 3 simple steps. <span className="action-link" onClick={onNavigateToGenerate}>Start now →</span>
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

            {/* Email Preview (#4) */}
            {integrations.gmail && (
              <div style={{ marginTop: '24px' }}>
                <div className="section-lbl">Recent Email Feed</div>
                <div className="email-preview-card">
                  {previewEmails.map((msg) => (
                    <div key={msg.id} className="email-preview-item">
                      <div className="email-preview-dot"></div>
                      <div className="email-preview-info">
                        <div className="email-preview-subj">{msg.subject}</div>
                        {msg.snippet && <div className="email-preview-snip">{msg.snippet.slice(0, 60)}…</div>}
                      </div>
                    </div>
                  ))}
                  <button className="quick-gen-link" onClick={onQuickGenerate}>
                    ✦ Generate BRD from these emails →
                  </button>
                </div>
              </div>
            )}
          </div>
          <div>
            <div className="section-lbl">Data Sources</div>
            <div className="sources-card">
              <SourceItem
                icon="📧"
                name="Gmail (Enron)"
                connected={integrations.gmail}
                count={integrations.gmail ? "~500,000 emails indexed" : "Not connected"}
                bgColor="rgba(234,67,53,0.1)"
              />
              <SourceItem
                icon="💬"
                name="Slack (Mock)"
                connected={integrations.slack}
                count={integrations.slack ? "~25,000 msgs indexed" : "Not connected"}
                bgColor="rgba(74,21,75,0.08)"
              />
              <SourceItem
                icon="🎙️"
                name="AMI Transcripts"
                connected={integrations.fireflies}
                count={integrations.fireflies ? "279 meetings indexed" : "Not connected"}
                bgColor="rgba(201,168,76,0.1)"
              />
              <SourceItem
                icon="📄"
                name="Corp. Archive"
                connected={filesCount > 0}
                count={`${filesCount > 0 ? '1.2 GB data indexed' : 'Local uploads'}`}
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

interface SourceItemProps {
  icon: string;
  name: string;
  connected: boolean;
  count: string;
  bgColor: string;
  isLast?: boolean;
}

function SourceItem({ icon, name, connected, count, bgColor, isLast }: SourceItemProps) {
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
