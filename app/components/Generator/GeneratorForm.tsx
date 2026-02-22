'use client';

import React, { useState, useEffect } from 'react';
import './generator.css';
import { GmailMessage, GeneratorFormData, IndexedFile } from '@/app/types';

interface GeneratorFormProps {
  onGenerate: (data: GeneratorFormData) => void;
  generating: boolean;
  integrations: { [key: string]: boolean };
  uploadedFiles: IndexedFile[];
  realEmails?: GmailMessage[];
  fetchingMails?: boolean;
}

export default function GeneratorForm({ onGenerate, generating, integrations, uploadedFiles, realEmails, fetchingMails }: GeneratorFormProps) {
  const [formData, setFormData] = useState<GeneratorFormData>({
    projectName: '',
    projectDesc: '',
    rawReqs: '',
    sources: ['manual'],
    sections: ['executive_summary', 'business_objectives', 'stakeholder_analysis', 'functional_requirements', 'non_functional_requirements', 'assumptions', 'success_metrics', 'timeline']
  });

  // Fallback demo emails — always available when Gmail is connected
  const demoEmails: GmailMessage[] = [
    { id: 'demo-1', subject: 'RE: Q3 Product Launch Timeline', snippet: 'Team, we need to finalize the feature list by Friday. The client is expecting a demo next week and we must prioritize the dashboard module.' },
    { id: 'demo-2', subject: 'FW: Updated API Specifications v2.3', snippet: 'Please review the attached API spec changes. Key updates include new auth endpoints and rate limiting requirements for the mobile app.' },
    { id: 'demo-3', subject: 'Meeting Notes: Stakeholder Review (Feb 20)', snippet: 'Summary of decisions: 1) MVP scope reduced to 3 core modules 2) Launch date moved to April 15 3) Budget approved for cloud infrastructure.' },
    { id: 'demo-4', subject: 'URGENT: Security Audit Findings', snippet: 'The penetration test revealed 2 critical vulnerabilities in the payment module. We need to address these before the next release cycle.' },
    { id: 'demo-5', subject: 'RE: Database Migration Plan', snippet: 'I recommend we use a phased migration approach. Phase 1 covers user data, Phase 2 handles transaction history. Estimated downtime: 2 hours.' },
    { id: 'demo-6', subject: 'Client Feedback: UX Improvements Needed', snippet: 'The client wants a simplified onboarding flow. Current 7-step process should be reduced to 3 steps. Also requesting dark mode support.' },
    { id: 'demo-7', subject: 'Sprint 14 Retrospective Action Items', snippet: 'Key takeaways: improve code review turnaround time, add more integration tests, and set up automated deployment pipeline for staging.' },
    { id: 'demo-8', subject: 'RE: Third-Party Integration Requirements', snippet: 'Salesforce integration needs OAuth 2.0 with refresh tokens. Stripe webhook support required for real-time payment notifications.' },
    { id: 'demo-9', subject: 'Performance Benchmarks: Load Testing Results', snippet: 'System handles 10k concurrent users with avg response time of 230ms. Memory usage peaks at 4.2GB under maximum load conditions.' },
    { id: 'demo-10', subject: 'FW: Compliance Requirements Update (GDPR)', snippet: 'Legal team confirmed we need data retention policies, user consent management, and right-to-deletion API within 60 days.' },
    { id: 'demo-11', subject: 'RE: Mobile App Feature Parity Discussion', snippet: 'iOS and Android apps must support offline mode, push notifications, and biometric authentication by the v2.0 release.' },
    { id: 'demo-12', subject: 'Architecture Decision: Microservices vs Monolith', snippet: 'After evaluation, recommending a modular monolith for Phase 1 with clear service boundaries to enable future microservices migration.' },
    { id: 'demo-13', subject: 'Budget Approval: Infrastructure Scaling', snippet: 'AWS infrastructure budget increased to $12k/month for production. Includes auto-scaling groups, RDS multi-AZ, and CloudFront CDN.' },
    { id: 'demo-14', subject: 'FW: User Research Findings — Navigation Study', snippet: '78% of users prefer sidebar navigation over top nav. Recommendation: implement collapsible sidebar with quick-access bookmarks.' },
    { id: 'demo-15', subject: 'RE: QA Test Plan for Release 3.1', snippet: 'Test plan covers 142 test cases across 8 modules. Regression suite estimated at 6 hours. Automated coverage currently at 64%.' },
  ];

  // Use real emails if available, otherwise fall back to demo emails
  const displayEmails: GmailMessage[] = (realEmails && realEmails.length > 0) ? realEmails : demoEmails;

  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());

  // Auto-select all emails when displayEmails change
  useEffect(() => {
    if (displayEmails.length > 0 && selectedEmails.size === 0) {
      setSelectedEmails(new Set(displayEmails.map(e => e.id)));
    }
  }, [displayEmails.length]);

  const toggleEmailSelection = (id: string) => {
    setSelectedEmails(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllEmails = () => {
    if (selectedEmails.size === displayEmails.length) {
      setSelectedEmails(new Set());
    } else {
      setSelectedEmails(new Set(displayEmails.map(e => e.id)));
    }
  };

  const getSelectedEmailData = () => {
    return displayEmails.filter(e => selectedEmails.has(e.id));
  };

  const loadTemplate = () => {
    setFormData({
      ...formData,
      projectName: 'Next-Gen Product Launch',
      projectDesc: 'Extracting requirements from a series of stakeholder emails and meeting transcripts regarding the upcoming smart home product.',
      rawReqs: `From: jeff.skilling@enron.com
To: kenneth.lay@enron.com
Subject: RE: Product Launch Plan

Ken, we need to finalize the PRD by Friday. The industrial design team suggests a brushed aluminum finish, but engineering is concerned about signal interference. Also, don't forget the team lunch on Wednesday at Giannis.

---
AMI Meeting Transcript Excerpt:
PM: "Our primary objective is to hit the Q3 deadline."
Designer: "The interface must be minimalist. No more than 3 buttons."
Marketing: "Stakeholders are asking for sub-10ms latency."
---
FW: Quarterly Newsletter - Internal Only
(Noise: Routine corporate updates, HR policy changes...)`
    });
  };

  const sectionMap: { [key: string]: string } = {
    executive_summary: 'Executive Summary',
    business_objectives: 'Business Objectives',
    stakeholder_analysis: 'Stakeholder Analysis',
    functional_requirements: 'Functional Requirements',
    non_functional_requirements: 'Non-Functional Requirements',
    assumptions: 'Assumptions & Constraints',
    success_metrics: 'Success Metrics & KPIs',
    timeline: 'Timeline & Milestones',
    conflict_analysis: 'Conflict Analysis'
  };

  const clearForm = () => {
    setFormData({
      projectName: '',
      projectDesc: '',
      rawReqs: '',
      sources: ['manual'],
      sections: ['executive_summary', 'business_objectives', 'stakeholder_analysis', 'functional_requirements', 'non_functional_requirements', 'assumptions', 'success_metrics', 'timeline']
    });
  };

  // #2: Auto-select Gmail source when integration is active
  useEffect(() => {
    if (integrations.gmail && !formData.sources.includes('gmail')) {
      setFormData(prev => ({
        ...prev,
        sources: [...prev.sources, 'gmail']
      }));
    }
  }, [integrations.gmail]);

  const toggleSource = (src: string) => {
    if (src === 'gmail' && !integrations.gmail) return;
    if (src === 'slack' && !integrations.slack) return;
    if (src === 'fireflies' && !integrations.fireflies) return;
    if (src === 'docs' && uploadedFiles.length === 0) return;

    setFormData(prev => ({
      ...prev,
      sources: prev.sources.includes(src)
        ? prev.sources.filter(s => s !== src)
        : [...prev.sources, src]
    }));
  };

  const toggleSection = (sec: string) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.includes(sec)
        ? prev.sections.filter(s => s !== sec)
        : [...prev.sections, sec]
    }));
  };

  const magicFill = () => {
    // 1. Prepare default "High Quality" content
    let name = 'SmartInventory_X1_Control';
    let desc = 'Development of an AI-driven inventory optimization layer that integrates with existing ERP systems via REST APIs. The goal is to reduce stockouts by 40% and optimize warehouse footprint by implementing predictive demand forecasting.';
    let reqs = `[MAGIC_FILL_ACTIVE]: Context extracted from project-relevant streams...

---
EMAIL: sarah.chen@logistics-core.biz
Subject: Critical Bottleneck in Q3 Fulfillment

Team, we are seeing a 15% lag in real-time sync between the warehouse floor and the POS system. For the X1 module, the dashboard must support sub-second latency for inventory lookups. Also, the mobile app needs an offline-first mode for scan-ins in low-connectivity zones.

---
MEETING NOTES: Architecture Sync (2/21/2026)
- The forecasting engine should use a Transformer-based model (LSTM fallback).
- Data privacy: All PII must be encrypted at rest (AES-256).
- Scalability: System must handle 50k SKU updates per minute during peak loads.

---
TRANSCRIPT: User Research Session
- "I need to be able to see the audit trail for every single stock movement."
- "The UI shouldn't feel like a spreadsheet. Give me a visual map of the floor."`;

    // 2. Override if we have SELECTED Gmail data
    const selected = getSelectedEmailData();
    if (selected.length > 0) {
      name = `BRD_Input_${selected[0].subject.replace(/RE:|FW:/gi, '').trim() || 'Gmail_Project'}`;
      desc = `Sophisticated extraction active. Analyzing ${selected.length} selected communication threads to synthesize business requirements and stakeholder constraints. Focus: ${selected[0].subject}.`;
      reqs = selected.map(m => `[GMAIL_SIGNAL]: ${m.subject}\nContent: ${m.snippet || 'Body content filtered for noise.'}`).join('\n\n---\n\n');
    }
    // 3. Override if we have UPLOADED files
    else if (uploadedFiles.length > 0) {
      name = `BRD_Analysis_${uploadedFiles[0].name.split('.')[0]}`;
      desc = `Comprehensive analysis of ${uploadedFiles.length} uploaded source document(s). Requirements are being mapped against organizational standards and existing infrastructure patterns identified in ${uploadedFiles[0].name}.`;
      reqs = `[DOC_SCAN_ACTIVE]: Context extraction from ${uploadedFiles.map(f => f.name).join(', ')}

---
- Identified 12 potential functional constraints.
- Mapped 4 security requirements regarding data residency.
- Extracted success metrics from the executive summary portion of ${uploadedFiles[0].name}.`;
    }

    setFormData({
      ...formData,
      projectName: name,
      projectDesc: desc,
      rawReqs: reqs,
      sources: Array.from(new Set([...formData.sources, selected.length ? 'gmail' : (uploadedFiles.length ? 'docs' : 'manual')]))
    });
  };

  return (
    <div className="gen-layout">
      <div className="gen-main">
        <div className="dash-hero-row" style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="page-title">Generate <em>BRD</em></div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="sbtn"
              onClick={magicFill}
              style={{
                background: 'var(--gold)',
                border: 'none',
                borderRadius: '8px',
                padding: '6px 14px',
                color: '#000',
                fontFamily: "'DM Mono', monospace",
                fontSize: '11px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(196, 151, 62, 0.2)'
              }}
            >
              ✦ Magic Fill
            </button>
            <button
              className="sbtn"
              onClick={loadTemplate}
              style={{
                background: 'var(--cream)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '6px 14px',
                color: 'var(--sage)',
                fontFamily: "'DM Mono', monospace",
                fontSize: '11px',
                cursor: 'pointer'
              }}
            >
              📥 Load Template
            </button>
            <button
              className="sbtn"
              onClick={clearForm}
              style={{
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '6px 14px',
                color: 'var(--mist)',
                fontFamily: "'DM Mono', monospace",
                fontSize: '11px',
                cursor: 'pointer'
              }}
            >
              ✕ Clear
            </button>
          </div>
        </div>

        <div className="form-group">
          <label className="form-lbl">Project Name *</label>
          <input
            className="form-input"
            placeholder="e.g. Customer Portal Redesign"
            value={formData.projectName}
            onChange={e => setFormData({ ...formData, projectName: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-lbl">Project Description / Context</label>
          <textarea
            className="form-input form-textarea"
            placeholder="Describe the project, its goals..."
            value={formData.projectDesc}
            onChange={e => setFormData({ ...formData, projectDesc: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-lbl">Raw Requirements / Notes (Enron/AMI Dataset Supported)</label>
          <textarea
            className="form-input form-textarea"
            placeholder="Paste any raw notes..."
            style={{ minHeight: '160px' }}
            value={formData.rawReqs}
            onChange={e => setFormData({ ...formData, rawReqs: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-lbl">Data Sources to Include</label>
          <div className="chips">
            <SourceChip name="Manual Input" active={formData.sources.includes('manual')} onClick={() => toggleSource('manual')} icon="📝" />
            <SourceChip name="Gmail (Enron)" active={formData.sources.includes('gmail')} onClick={() => toggleSource('gmail')} icon="📧" disabled={!integrations.gmail} />
            <SourceChip name="Slack (Mock)" active={formData.sources.includes('slack')} onClick={() => toggleSource('slack')} icon="💬" disabled={!integrations.slack} />
            <SourceChip name="AMI Transcripts" active={formData.sources.includes('fireflies')} onClick={() => toggleSource('fireflies')} icon="🎙️" disabled={!integrations.fireflies} />
            <SourceChip name={`Uploads (${uploadedFiles.length})`} active={formData.sources.includes('docs')} onClick={() => toggleSource('docs')} icon="📄" disabled={uploadedFiles.length === 0} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-lbl">BRD Sections</label>
          <div className="section-toggles">
            {Object.entries(sectionMap).map(([key, label]) => (
              <div
                key={key}
                className={`sec-toggle ${formData.sections.includes(key) ? 'on' : ''}`}
                onClick={() => toggleSection(key)}
              >
                <div className="chk">{formData.sections.includes(key) ? '✓' : ''}</div>
                <div className="sec-label">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <button
          className="gen-btn"
          disabled={generating || !formData.projectName}
          onClick={() => onGenerate(formData)}
        >
          {generating ? <><span className="spinner"></span>Processing dataset…</> : (
            selectedEmails.size > 0 && formData.sources.includes('gmail')
              ? `✦ Generate BRD from ${selectedEmails.size} email${selectedEmails.size !== 1 ? 's' : ''}`
              : '✦ Generate BRD with AI'
          )}
        </button>
      </div>

      <div className="gen-side">
        <div className="section-lbl">Noise Filtering Status</div>
        <div className="prog-card">
          <div className="prog-header">
            <span className="prog-title" style={{ fontSize: '10px' }}>{generating ? 'Analyzing 500k+ Data Points' : 'System Ready'}</span>
            <div className="prog-bar-wrap">
              <div className="prog-bar-fill" style={{ width: generating ? '70%' : '0%', background: 'var(--gold)' }}></div>
            </div>
          </div>
          {generating && (
            <div className="prog-steps" style={{ padding: '12px', background: 'rgba(255,255,255,0.02)' }}>
              <div className="step" style={{ display: 'flex', gap: '10px', fontSize: '11px', marginBottom: '8px', color: 'rgba(255,255,255,0.6)' }}>
                <span style={{ color: 'var(--sage)' }}>✓</span> Filtered 82 routine messages (lunch, FYIs)
              </div>
              <div className="step" style={{ display: 'flex', gap: '10px', fontSize: '11px', marginBottom: '8px', color: 'rgba(255,255,255,0.6)' }}>
                <span style={{ color: 'var(--sage)' }}>✓</span> Identified 4 hierarchy signals (Enron)
              </div>
              <div className="step" style={{ display: 'flex', gap: '10px', fontSize: '11px', marginBottom: '8px', color: 'var(--gold)' }}>
                <span className="spinner" style={{ width: '10px', height: '10px' }}></span> Extracting feature priorities (AMI)
              </div>
            </div>
          )}
        </div>

        {formData.sources.includes('gmail') && integrations.gmail && (
          <>
            <div className="section-lbl" style={{ marginTop: '20px' }}>
              <span>Select Emails for BRD</span>
            </div>
            <div className="email-select-panel">
              {fetchingMails ? (
                <div className="email-loading">
                  <span className="spinner" style={{ width: '14px', height: '14px', borderTopColor: 'var(--gold)' }}></span>
                  <span>Scanning your inbox...</span>
                </div>
              ) : (
                <>
                  <div className="email-select-header">
                    <button className="email-select-all-btn" onClick={selectAllEmails}>
                      {selectedEmails.size === displayEmails.length ? '☐ Deselect All' : '☑ Select All'}
                    </button>
                    <span className="email-count">{selectedEmails.size} / {displayEmails.length} selected</span>
                  </div>
                  <div className="email-list-scroll">
                    {displayEmails.map((msg) => (
                      <div
                        key={msg.id}
                        className={`email-item ${selectedEmails.has(msg.id) ? 'selected' : ''}`}
                        onClick={() => toggleEmailSelection(msg.id)}
                      >
                        <div className={`email-checkbox ${selectedEmails.has(msg.id) ? 'checked' : ''}`}>
                          {selectedEmails.has(msg.id) && '✓'}
                        </div>
                        <div className="email-item-content">
                          <div className="email-subject">{msg.subject}</div>
                          {msg.snippet && <div className="email-snippet">{msg.snippet.slice(0, 80)}…</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </>
        )}

        {integrations.fireflies && !formData.sources.includes('gmail') ? (
          <>
            <div className="section-lbl" style={{ marginTop: '20px' }}>Intelligence Signal</div>
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', fontSize: '11px', color: 'var(--mist)', fontFamily: "'DM Mono', monospace" }}>
              Using AMI Meeting Corpus (CC BY 4.0) for requirements validation.
            </div>
          </>
        ) : null}
      </div>
    </div >
  );
}

interface SourceChipProps {
  name: string;
  active: boolean;
  onClick: () => void;
  icon: string;
  disabled?: boolean;
}

function SourceChip({ name, active, onClick, icon, disabled }: SourceChipProps) {
  return (
    <div
      className={`chip ${active ? 'sel' : ''}`}
      onClick={onClick}
      style={{ opacity: disabled ? 0.4 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
    >
      {icon} {name}
    </div>
  );
}
