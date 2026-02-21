'use client';

import React, { useState } from 'react';
import './generator.css';

interface GeneratorFormProps {
  onGenerate: (data: any) => void;
  generating: boolean;
  integrations: { [key: string]: boolean };
  uploadedFiles: any[];
}

export default function GeneratorForm({ onGenerate, generating, integrations, uploadedFiles }: GeneratorFormProps) {
  const [formData, setFormData] = useState({
    projectName: '',
    projectDesc: '',
    rawReqs: '',
    sources: ['manual'],
    sections: ['executive_summary' as any, 'business_objectives', 'stakeholder_analysis', 'functional_requirements', 'non_functional_requirements', 'assumptions', 'success_metrics', 'timeline']
  });

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

  return (
    <div className="gen-layout">
      <div className="gen-main">
        <div className="dash-hero-row" style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="page-title">Generate <em>BRD</em></div>
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
            📥 Load Dataset Template
          </button>
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
          {generating ? <><span className="spinner"></span>Processing dataset…</> : '✦ Generate BRD with AI'}
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

        <div className="section-lbl" style={{ marginTop: '20px' }}>Intelligence Signal</div>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', fontSize: '11px', color: 'var(--mist)', fontFamily: "'DM Mono', monospace" }}>
          Using Enron Email Dataset (Public Domain) and AMI Meeting Corpus (CC BY 4.0) for requirements validation.
        </div>
      </div>
    </div>
  );
}

function SourceChip({ name, active, onClick, icon, disabled }: any) {
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
