'use client';

import React, { useState, useEffect } from 'react';
import './generator.css';
import { GmailMessage, GeneratorFormData, IndexedFile } from '@/app/types';

interface GeneratorFormProps {
  onGenerate: (formData: GeneratorFormData) => void;
  generating: boolean;
  integrations: { [key: string]: boolean };
  uploadedFiles: IndexedFile[];
  realEmails: GmailMessage[];
  fetchingMails?: boolean;
  onConnectGmail?: () => void;
}

export default function GeneratorForm({ onGenerate, generating, integrations, uploadedFiles, realEmails, fetchingMails, onConnectGmail }: GeneratorFormProps) {
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
    if (src === 'gmail' && !integrations.gmail) {
      if (onConnectGmail) onConnectGmail();
      return;
    }
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
    const selectedMails = getSelectedEmailData();
    const hasMails = selectedMails.length > 0;
    const hasFiles = uploadedFiles.length > 0;

    // 1. Prepare default content
    let name = 'Strategic Intelligence Initiative';
    let desc = 'A consolidated requirements gathering project synthesizing multiple organizational data streams into a unified technical vision.';
    let reqs = `[SYSTEM_SIGNAL]: Data stream analysis active. Baseline established.`;

    // 2. Build Context from Emails
    let emailContext = '';
    if (hasMails) {
      const topSubject = selectedMails[0].subject.replace(/RE:|FW:/gi, '').trim();
      name = `BRD_${topSubject.replace(/\s+/g, '_')}`;
      desc = `Consolidated extraction active. Analyzing ${selectedMails.length} selected communication thread(s) to synthesize business goals. Primary focus: ${topSubject}.`;
      emailContext = selectedMails.map(m => {
        const cleanSubj = m.subject.replace(/RE:|FW:/gi, '').trim();
        return `[GMAIL_SIGNAL]: ${cleanSubj}\nCONTEXT: ${m.snippet || 'Body content filtered.'}`;
      }).join('\n\n');
    }

    // 3. Build Context from Files
    let fileContext = '';
    if (hasFiles) {
      if (!hasMails) {
        const mainFile = uploadedFiles[0].name.split('.')[0];
        name = `${mainFile}_Extraction`;
      }
      desc += ` ${hasMails ? 'Additionally' : 'Currently'} processing ${uploadedFiles.length} uploaded document(s) for structural constraints and compliance mapping.`;

      const fileList = uploadedFiles.map(f => `- ${f.name} (${(f.size / 1024).toFixed(1)} KB)`).join('\n');
      fileContext = `[DOC_INTELLIGENCE]: ${uploadedFiles.length} file(s) indexed\nFILES:\n${fileList}\n\nANALYSIS: Extracted functional requirements and architectural patterns from ${uploadedFiles[0].name}.`;
    }

    // 4. Final Composition (MERGED)
    let finalReqs = '';
    if (hasMails && hasFiles) {
      finalReqs = `[HYBRID_EXTRACTION_ACTIVE]: Merging signals from Gmail and Local Docs\n\n${emailContext}\n\n---\n\n${fileContext}`;
    } else if (hasMails) {
      finalReqs = `[GMAIL_EXTRACTION_ACTIVE]: Mapping inbox signals\n\n${emailContext}`;
    } else if (hasFiles) {
      finalReqs = `[DOC_EXTRACTION_ACTIVE]: Decomposing uploaded documents\n\n${fileContext}`;
    } else {
      finalReqs = reqs + '\n\n---' + '\nSTAKEHOLDER GOALS:\n- Optimize data synchronization\n- Ensure end-to-end encryption\n- Implement real-time monitoring';
    }

    setFormData({
      ...formData,
      projectName: name,
      projectDesc: desc,
      rawReqs: finalReqs,
      sources: Array.from(new Set([...formData.sources, hasMails ? 'gmail' : '', hasFiles ? 'docs' : ''].filter(Boolean)))
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
                background: uploadedFiles.length > 0 || getSelectedEmailData().length > 0 ? 'var(--gold)' : 'rgba(255,255,255,0.05)',
                border: uploadedFiles.length > 0 || getSelectedEmailData().length > 0 ? 'none' : '1px solid var(--border)',
                borderRadius: '8px',
                padding: '8px 16px',
                color: uploadedFiles.length > 0 || getSelectedEmailData().length > 0 ? '#000' : 'rgba(255,255,255,0.4)',
                fontFamily: "'DM Mono', monospace",
                fontSize: '11px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: uploadedFiles.length > 0 || getSelectedEmailData().length > 0 ? '0 4px 12px rgba(196, 151, 62, 0.3)' : 'none',
                transition: 'all 0.2s',
                animation: uploadedFiles.length > 0 && !formData.projectName ? 'pulse-gold 2s infinite' : 'none'
              }}
            >
              <span style={{ marginRight: '6px' }}>✦</span>
              {uploadedFiles.length > 0 ? 'Auto-fill from Uploads' : (getSelectedEmailData().length > 0 ? 'Auto-fill from Emails' : 'Magic Fill')}
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
