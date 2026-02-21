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
        <div className="page-title" style={{ marginBottom: '28px' }}>Generate <em>BRD</em></div>

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
          <label className="form-lbl">Raw Requirements / Notes</label>
          <textarea
            className="form-input form-textarea"
            placeholder="Paste any raw notes..."
            value={formData.rawReqs}
            onChange={e => setFormData({ ...formData, rawReqs: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-lbl">Data Sources to Include</label>
          <div className="chips">
            <SourceChip name="Manual Input" active={formData.sources.includes('manual')} onClick={() => toggleSource('manual')} icon="📝" />
            <SourceChip name="Gmail" active={formData.sources.includes('gmail')} onClick={() => toggleSource('gmail')} icon="📧" disabled={!integrations.gmail} />
            <SourceChip name="Slack" active={formData.sources.includes('slack')} onClick={() => toggleSource('slack')} icon="💬" disabled={!integrations.slack} />
            <SourceChip name="Fireflies" active={formData.sources.includes('fireflies')} onClick={() => toggleSource('fireflies')} icon="🎙️" disabled={!integrations.fireflies} />
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
          {generating ? <><span className="spinner"></span>Generating…</> : '✦ Generate BRD with AI'}
        </button>
      </div>

      <div className="gen-side">
        <div className="section-lbl">Generation Status</div>
        <div className="prog-card">
          {/* Progress bar and steps go here - can be simplified for now */}
          <div className="prog-header">
            <span className="prog-title">{generating ? 'Processing...' : 'Ready'}</span>
            <div className="prog-bar-wrap">
              <div className="prog-bar-fill" style={{ width: generating ? '45%' : '0%' }}></div>
            </div>
          </div>
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
