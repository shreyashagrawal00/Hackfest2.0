'use client';

import React, { useState, useCallback } from 'react';
import { auth } from './utils/auth';
import AppLayout from './components/Layout/AppLayout';
import Login from './components/Login/Login';
import Dashboard from './components/Dashboard/Dashboard';
import Integrations from './components/Integrations/Integrations';
import GeneratorForm from './components/Generator/GeneratorForm';
import Editor from './components/Editor/Editor';
import { BRD, GmailMessage, IndexedFile, GeneratorFormData } from './types';

export default function Home() {
  const [user, setUser] = useState<{ name: string; avatar: string } | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [tokenClient, setTokenClient] = useState<{ requestAccessToken: () => void } | null>(null);

  // Centralized Google Auth Initialization (Runs once on mount)
  React.useEffect(() => {
    // 1. Check for existing session
    const session = auth.getSession();
    if (session) {
      setUser({ name: session.name, avatar: session.name.slice(0, 2).toUpperCase() });
    }

    // 2. Load GIS script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      setScriptLoaded(true);
      if (window.google && window.google.accounts) {
        // Initialize Token Client for Gmail
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
          scope: 'https://www.googleapis.com/auth/gmail.readonly',
          callback: (tokenResponse: { access_token?: string; error?: string }) => {
            if (tokenResponse && tokenResponse.access_token) {
              setGmailToken(tokenResponse.access_token);
              setIntegrations(prev => ({ ...prev, gmail: true }));

              // Ensure user is set if we are logging in via this token flow
              const currentSession = auth.getSession();
              if (currentSession) {
                setUser(prev => prev || {
                  name: currentSession.name,
                  avatar: currentSession.name.slice(0, 2).toUpperCase()
                });
              }
            }
          },
        });
        setTokenClient(client);
      }
    };

    return () => {
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existingScript) document.body.removeChild(existingScript);
    };
  }, []); // Empty dependency array prevents infinite loops

  const [activeTab, setActiveTab] = useState('dashboard');
  const [integrations, setIntegrations] = useState({ gmail: false, slack: false, fireflies: false });
  const [uploadedFiles, setUploadedFiles] = useState<IndexedFile[]>([]);
  const [brds, setBrds] = useState<BRD[]>([]);
  const [currentBRDIndex, setCurrentBRDIndex] = useState<number | null>(null);
  const [generating, setGenerating] = useState(false);
  const [aiMessages, setAiMessages] = useState<Array<{ type: string; text: string }>>([
    { type: 'sys', text: '✦ Hello! I can help you edit sections, add requirements, and refine your BRD.' }
  ]);
  const [aiProcessing, setAiProcessing] = useState(false);
  const [gmailToken, setGmailToken] = useState<string | null>(null);
  const [realEmails, setRealEmails] = useState<GmailMessage[]>([]);
  const [fetchingMails, setFetchingMails] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchRealMails = useCallback(async () => {
    if (!gmailToken) return;
    setFetchingMails(true);
    try {
      const res = await fetch(`/api/gmail?token=${gmailToken}`);
      const data = await res.json();
      if (data.messages && data.messages.length > 0) {
        setRealEmails(data.messages);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setFetchingMails(false);
    }
  }, [gmailToken]);

  const handleLogin = (name: string, isSocial?: boolean, token?: string) => {
    setUser({ name, avatar: name.slice(0, 2).toUpperCase() });
    setActiveTab('dashboard');
    if (isSocial) {
      setIntegrations(prev => ({ ...prev, gmail: true }));
      if (token) setGmailToken(token);
      showToast('Gmail connected successfully!', 'success');
    }
  };

  const handleLogout = () => {
    auth.setSession(null);
    setUser(null);
    setGmailToken(null);
    setRealEmails([]);
  };

  React.useEffect(() => {
    if (gmailToken && integrations.gmail && realEmails.length === 0) {
      fetchRealMails();
    }
  }, [gmailToken, integrations.gmail, realEmails.length, fetchRealMails]);

  const toggleIntegration = (name: string) => {
    if (name === 'gmail' && !integrations.gmail && !gmailToken) {
      handleConnectGmail();
      return;
    }

    setIntegrations(prev => {
      const newState = { ...prev, [name]: !prev[name as keyof typeof integrations] };
      // If Gmail is being turned off, clear its data
      if (name === 'gmail' && !newState.gmail) {
        setGmailToken(null);
        setRealEmails([]);
      }
      return newState;
    });
  };

  const handleConnectGmail = () => {
    if (tokenClient) {
      tokenClient.requestAccessToken();
    } else {
      console.error('Google Token Client not ready');
    }
  };

  const addFiles = (files: File[]) => {
    const newFiles = files.map(f => ({ name: f.name, size: f.size, indexed: false }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
    showToast(`${files.length} file(s) uploaded and indexing...`, 'info');

    // Simulate indexing
    newFiles.forEach((file, i) => {
      setTimeout(() => {
        setUploadedFiles(prev => prev.map(f => f.name === file.name ? { ...f, indexed: true } : f));
      }, 1500 + i * 500);
    });
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };



  const generateBRD = (formData: GeneratorFormData) => {
    setGenerating(true);

    // Build email context from realEmails or demo fallback
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
    ];

    const emails = (realEmails && realEmails.length > 0) ? realEmails : (formData.sources.includes('gmail') ? demoEmails : []);
    const hasEmailData = emails.length > 0;

    // Parse raw requirements into structured requirements
    const rawLines = formData.rawReqs.split('\n').filter(l => l.trim().length > 10);

    // Also extract requirement-like lines from email snippets
    const emailReqLines: string[] = [];
    emails.forEach(e => {
      if (e.snippet) {
        // Extract sentences that sound like requirements
        const sentences = e.snippet.split(/[.!]/).filter(s => s.trim().length > 15);
        sentences.forEach(s => {
          const t = s.trim();
          if (t.match(/need|must|should|require|want|shall|support|implement|handle/i)) {
            emailReqLines.push(t);
          }
        });
      }
    });

    const allReqLines = [...rawLines, ...emailReqLines];
    const parsedReqs = allReqLines.map((line, idx) => ({
      id: `FR-${String(idx + 1).padStart(3, '0')}`,
      description: line.trim().replace(/^\d+[\.\)]\s*/, ''),
      priority: idx < Math.ceil(allReqLines.length * 0.3) ? 'High' as const : (idx < Math.ceil(allReqLines.length * 0.65) ? 'Medium' as const : 'Low' as const)
    }));

    // Compute conflicts (overlapping priorities in emails)
    const conflictCount = hasEmailData ? Math.min(Math.floor(emails.length / 4), 3) : 0;

    // Group emails by theme for smarter summarization
    const securityEmails = emails.filter(e => (e.subject + ' ' + (e.snippet || '')).match(/security|audit|vulnerability|penetration|compliance|GDPR|privacy/i));
    const perfEmails = emails.filter(e => (e.subject + ' ' + (e.snippet || '')).match(/performance|benchmark|load|scale|concurrent|latency/i));
    const uxEmails = emails.filter(e => (e.subject + ' ' + (e.snippet || '')).match(/UX|user experience|onboarding|client feedback|navigation|UI|dark mode/i));
    const techEmails = emails.filter(e => (e.subject + ' ' + (e.snippet || '')).match(/API|database|migration|integration|architecture|microservice|deploy/i));
    const planEmails = emails.filter(e => (e.subject + ' ' + (e.snippet || '')).match(/timeline|sprint|launch|milestone|deadline|budget|MVP|scope/i));

    // Build section content that summarizes email data
    const getSectionContent = (id: string): string => {
      switch (id) {
        case 'executive_summary': {
          const themes: string[] = [];
          if (securityEmails.length > 0) themes.push('security hardening');
          if (perfEmails.length > 0) themes.push('performance optimization');
          if (uxEmails.length > 0) themes.push('user experience improvements');
          if (techEmails.length > 0) themes.push('technical infrastructure');
          if (planEmails.length > 0) themes.push('project planning & delivery');
          const themeStr = themes.length > 0 ? themes.join(', ') : 'core product development';

          let summary = `<p><strong>Project Overview:</strong> ${formData.projectName} addresses critical business needs identified through analysis of ${hasEmailData ? emails.length + ' communication threads' : 'stakeholder inputs'}. ${formData.projectDesc || 'This initiative consolidates requirements from multiple sources into actionable deliverables.'}</p>`;
          summary += `<p><strong>Key Themes Identified:</strong> ${themeStr}.</p>`;
          if (hasEmailData) {
            summary += `<p><strong>Data-Driven Insights:</strong> Analysis of email communications revealed ${parsedReqs.length} actionable requirements across ${themes.length} thematic areas. ${conflictCount > 0 ? `${conflictCount} potential priority conflicts were detected and flagged for stakeholder review.` : 'No priority conflicts were detected.'}</p>`;
            summary += `<ul>`;
            emails.slice(0, 5).forEach(e => {
              summary += `<li><strong>${e.subject.replace(/^(RE:|FW:)\s*/gi, '')}</strong> — ${(e.snippet || '').slice(0, 100)}${(e.snippet || '').length > 100 ? '...' : ''}</li>`;
            });
            summary += `</ul>`;
            if (emails.length > 5) summary += `<p><em>...and ${emails.length - 5} additional communication threads analyzed.</em></p>`;
          }
          return summary;
        }

        case 'business_objectives': {
          let content = `<p>The following business objectives were derived from ${hasEmailData ? `analysis of ${emails.length} email threads and ` : ''}stakeholder-provided requirements for ${formData.projectName}:</p><ul>`;
          if (planEmails.length > 0) {
            planEmails.forEach(e => {
              content += `<li><strong>Derived from:</strong> "${e.subject.replace(/^(RE:|FW:)\s*/gi, '')}" — ${(e.snippet || '').slice(0, 120)}</li>`;
            });
          }
          if (uxEmails.length > 0) content += `<li>Improve user experience based on ${uxEmails.length} client feedback thread(s)</li>`;
          if (securityEmails.length > 0) content += `<li>Address ${securityEmails.length} security concern(s) identified in audit communications</li>`;
          if (perfEmails.length > 0) content += `<li>Meet performance benchmarks outlined in load testing results</li>`;
          if (techEmails.length > 0) content += `<li>Implement technical infrastructure changes across ${techEmails.length} area(s)</li>`;
          if (!hasEmailData) {
            content += `<li>Centralize data sources and requirements gathering</li>`;
            content += `<li>Reduce manual document processing time by 30%</li>`;
            content += `<li>Improve accuracy of business requirements documentation</li>`;
          }
          content += `</ul>`;
          return content;
        }

        case 'stakeholder_analysis': {
          let content = `<p>Stakeholder analysis based on ${hasEmailData ? 'communication thread analysis' : 'project context'}:</p>`;
          if (hasEmailData) {
            const roles: string[] = [];
            emails.forEach(e => {
              const text = (e.subject + ' ' + (e.snippet || '')).toLowerCase();
              if (text.match(/client|customer|feedback/)) roles.push('Client / End Users');
              if (text.match(/security|audit|compliance|legal/)) roles.push('Security & Compliance Team');
              if (text.match(/api|database|deploy|architecture/)) roles.push('Engineering Team');
              if (text.match(/ux|onboarding|design|navigation/)) roles.push('UX/Design Team');
              if (text.match(/budget|scope|timeline|stakeholder/)) roles.push('Project Management');
              if (text.match(/performance|load|benchmark/)) roles.push('DevOps / Infrastructure');
            });
            const uniqueRoles = [...new Set(roles)];
            content += `<p><strong>${uniqueRoles.length} stakeholder groups</strong> were identified from email communications:</p><ul>`;
            uniqueRoles.forEach(r => content += `<li>${r}</li>`);
            content += `</ul>`;
            content += `<p>Each group has been represented in at least one communication thread. Cross-functional alignment is recommended before finalizing requirements.</p>`;
          } else {
            content += `<ul><li>Project Managers</li><li>Business Analysts</li><li>Technical Leads</li><li>End Users</li></ul>`;
          }
          return content;
        }

        case 'functional_requirements': {
          let content = `<p>The following functional requirements were extracted from ${hasEmailData ? `${emails.length} email thread(s) and ` : ''}manual input. ${parsedReqs.length} requirements identified, prioritized by urgency and impact.</p>`;
          if (hasEmailData) {
            content += `<p><strong>Source breakdown:</strong> ${rawLines.length} from manual input, ${emailReqLines.length} extracted from email analysis.</p>`;
          }
          return content;
        }

        case 'non_functional_requirements': {
          let content = `<p>Non-functional requirements for ${formData.projectName}:</p><ul>`;
          if (perfEmails.length > 0) {
            perfEmails.forEach(e => {
              content += `<li><strong>Performance:</strong> ${(e.snippet || '').slice(0, 150)}</li>`;
            });
          } else {
            content += `<li><strong>Performance:</strong> System should maintain response times under 500ms for 95th percentile of requests.</li>`;
          }
          if (securityEmails.length > 0) {
            securityEmails.forEach(e => {
              content += `<li><strong>Security:</strong> ${(e.snippet || '').slice(0, 150)}</li>`;
            });
          } else {
            content += `<li><strong>Security:</strong> All data must be encrypted at rest and in transit.</li>`;
          }
          content += `<li><strong>Scalability:</strong> System must support horizontal scaling.</li>`;
          content += `<li><strong>Availability:</strong> Target 99.9% uptime SLA.</li>`;
          content += `</ul>`;
          return content;
        }

        case 'assumptions': {
          let content = `<p><strong>Assumptions:</strong></p><ul>`;
          if (hasEmailData) {
            content += `<li>Email communications analyzed (${emails.length} threads) represent the latest stakeholder decisions.</li>`;
            if (planEmails.length > 0) content += `<li>Timeline and budget constraints referenced in planning emails are current and approved.</li>`;
            if (securityEmails.length > 0) content += `<li>Security findings are from recent audits and reflect the current system state.</li>`;
          }
          content += `<li>Key stakeholders are available for requirement validation.</li>`;
          content += `<li>Development team has the necessary technical skills.</li>`;
          content += `</ul><p><strong>Constraints:</strong></p><ul>`;
          if (planEmails.length > 0) {
            const budgetEmail = emails.find(e => (e.snippet || '').match(/budget|\$/i));
            if (budgetEmail) content += `<li>Budget: ${(budgetEmail.snippet || '').slice(0, 100)}</li>`;
            const timeEmail = emails.find(e => (e.snippet || '').match(/deadline|launch|april|date/i));
            if (timeEmail) content += `<li>Timeline: ${(timeEmail.snippet || '').slice(0, 100)}</li>`;
          }
          content += `<li>Must comply with existing enterprise architecture standards.</li>`;
          content += `</ul>`;
          return content;
        }

        case 'success_metrics': {
          let content = `<p>Key Performance Indicators (KPIs) for ${formData.projectName}:</p><ul>`;
          if (perfEmails.length > 0) content += `<li><strong>Performance Target:</strong> Derived from benchmarks — ${perfEmails[0].snippet?.slice(0, 100)}</li>`;
          if (uxEmails.length > 0) content += `<li><strong>UX Improvement:</strong> ${uxEmails.length} client-feedback items resolved successfully</li>`;
          if (securityEmails.length > 0) content += `<li><strong>Security:</strong> Zero critical vulnerabilities in post-fix audit</li>`;
          content += `<li><strong>Requirement Coverage:</strong> ${parsedReqs.length} functional requirements implemented and tested</li>`;
          content += `<li><strong>Stakeholder Satisfaction:</strong> ≥ 85% approval in post-delivery review</li>`;
          content += `</ul>`;
          return content;
        }

        case 'timeline': {
          let content = `<p>Proposed timeline for ${formData.projectName}:</p>`;
          if (planEmails.length > 0) {
            content += `<p><em>Timeline informed by communication thread analysis:</em></p><ul>`;
            planEmails.forEach(e => {
              content += `<li>"${e.subject.replace(/^(RE:|FW:)\s*/gi, '')}" — ${(e.snippet || '').slice(0, 120)}</li>`;
            });
            content += `</ul>`;
          }
          content += `<table><thead><tr><th>Phase</th><th>Milestone</th><th>Duration</th></tr></thead><tbody>`;
          content += `<tr><td>Phase 1</td><td>Requirements Finalization & Architecture</td><td>2 weeks</td></tr>`;
          content += `<tr><td>Phase 2</td><td>Core Development (${parsedReqs.filter(r => r.priority === 'High').length} high-priority items)</td><td>4 weeks</td></tr>`;
          content += `<tr><td>Phase 3</td><td>Integration & Testing</td><td>2 weeks</td></tr>`;
          content += `<tr><td>Phase 4</td><td>UAT & Deployment</td><td>1 week</td></tr>`;
          content += `</tbody></table>`;
          return content;
        }

        case 'conflict_analysis': {
          if (!hasEmailData || conflictCount === 0) {
            return `<p>No conflicts detected in the current set of requirements and communications.</p>`;
          }
          let content = `<p><strong>${conflictCount} potential conflicts</strong> detected from cross-referencing ${emails.length} communication threads:</p><ul>`;
          if (securityEmails.length > 0 && planEmails.length > 0) content += `<li><strong>Security vs. Timeline:</strong> Security remediation may impact the proposed launch date referenced in planning discussions.</li>`;
          if (perfEmails.length > 0 && uxEmails.length > 0) content += `<li><strong>Performance vs. UX:</strong> Rich UI features requested by clients may conflict with performance benchmarks.</li>`;
          if (techEmails.length > 0 && planEmails.length > 0) content += `<li><strong>Technical Debt vs. Scope:</strong> Infrastructure migrations may require scope adjustments to the MVP.</li>`;
          content += `</ul><p>Recommended action: Schedule a conflict resolution workshop with identified stakeholders.</p>`;
          return content;
        }

        default:
          return `<p>Analysis for the ${id.replace(/_/g, ' ')} phase based on ${hasEmailData ? emails.length + ' email threads' : 'provided inputs'}. ${formData.projectDesc ? formData.projectDesc.slice(0, 150) : 'Further details pending stakeholder review.'}${(formData.projectDesc || '').length > 150 ? '...' : ''}</p>`;
      }
    };

    // Simulate generation
    setTimeout(() => {
      const newBRD: BRD = {
        projectName: formData.projectName,
        createdAt: Date.now(),
        conflicts: conflictCount,
        sections: formData.sections.map((s: string) => ({
          id: s,
          title: s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          content: getSectionContent(s),
          requirements: s.includes('requirement') ? (parsedReqs.length > 0 ? parsedReqs : [
            { id: 'FR-001', description: 'The system shall process inputs automatically.', priority: 'High' as const },
            { id: 'FR-002', description: 'Stakeholders must be able to export reports.', priority: 'Medium' as const }
          ]) : []
        }))
      };
      setBrds([...brds, newBRD]);
      setCurrentBRDIndex(brds.length);
      setActiveTab('editor');
      setGenerating(false);
      showToast('BRD generated successfully!', 'success');
    }, 3000);
  };

  const handleQuickGenerate = () => {
    setActiveTab('generate');
    // Gmail source will be auto-selected via improvement #2
  };

  const updateBRD = (index: number, updatedFields: Partial<BRD>) => {
    setBrds(prev => prev.map((brd, i) => i === index ? { ...brd, ...updatedFields } : brd));
  };

  const handleAIMessage = (text: string) => {
    setAiMessages(prev => [...prev, { type: 'usr', text }]);
    setAiProcessing(true);

    // Simulate AI response logic
    setTimeout(() => {
      let sysResp = `I've analyzed your request: "${text}". I have updated the relevant section in the document.`;

      if (currentBRDIndex !== null) {
        const lower = text.toLowerCase();
        const currentBRD = brds[currentBRDIndex];

        // Keyword Trigger: Change Project Name
        if (lower.includes('change name to') || lower.includes('rename project to')) {
          const newName = text.split(/to/i)[1]?.trim().replace(/[".]/g, '');
          if (newName) {
            updateBRD(currentBRDIndex, { projectName: newName });
            sysResp = `Of course! I've updated the project name to "**${newName}**".`;
          }
        }
        // Keyword Trigger: Add Requirement
        else if (lower.includes('add requirement') || lower.includes('new requirement')) {
          const reqText = text.split(/requirement/i)[1]?.trim();
          if (reqText) {
            const updatedSections = currentBRD.sections.map((s) => {
              if (s.id.includes('functional_requirements')) {
                return {
                  ...s,
                  requirements: [
                    ...(s.requirements || []),
                    { id: `FR-00${(s.requirements?.length || 0) + 1}`, description: reqText, priority: 'Medium' as const }
                  ]
                };
              }
              return s;
            });
            updateBRD(currentBRDIndex, { sections: updatedSections });
            sysResp = `Understood. I've added the new requirement: "**${reqText}**" to the Functional Requirements section.`;
          }
        }
      }

      setAiMessages(prev => [...prev, { type: 'sys', text: sysResp }]);
      setAiProcessing(false);
    }, 1500);
  };

  if (!user) return <Login
    onLogin={handleLogin}
    scriptLoaded={scriptLoaded}
    tokenClient={tokenClient}
  />;

  return (
    <>
      <AppLayout
        user={user}
        onLogout={handleLogout}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      >
        {activeTab === 'dashboard' && (
          <Dashboard
            brds={brds}
            integrations={integrations}
            uploadedFiles={uploadedFiles}
            onNavigateToGenerate={() => setActiveTab('generate')}
            onNavigateToIntegrations={() => setActiveTab('integrations')}
            onOpenBRD={(index) => { setCurrentBRDIndex(index); setActiveTab('editor'); }}
            onQuickGenerate={handleQuickGenerate}
            userName={user.name}
            realEmails={realEmails}
          />
        )}
        {activeTab === 'integrations' && (
          <Integrations
            integrations={integrations}
            uploadedFiles={uploadedFiles}
            onToggleIntegration={toggleIntegration}
            onAddFiles={addFiles}
            onRemoveFile={removeFile}
            onFetchGmail={fetchRealMails}
            realEmails={realEmails}
            fetchingMails={fetchingMails}
            onNavigateToGenerate={() => setActiveTab('generate')}
          />
        )}
        {activeTab === 'generate' && (
          <GeneratorForm
            onGenerate={generateBRD}
            generating={generating}
            integrations={integrations}
            uploadedFiles={uploadedFiles}
            realEmails={realEmails}
            fetchingMails={fetchingMails}
            onConnectGmail={handleConnectGmail}
          />
        )}
        {activeTab === 'editor' && (
          <Editor
            brd={currentBRDIndex !== null ? brds[currentBRDIndex] : null}
            onAIMessage={handleAIMessage}
            onUpdateBRD={(fields: Partial<BRD>) => currentBRDIndex !== null && updateBRD(currentBRDIndex, fields)}
            aiMessages={aiMessages}
            aiProcessing={aiProcessing}
          />
        )}
      </AppLayout>

      {/* Toast Notification */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          <span className="toast-icon">
            {toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'ℹ'}
          </span>
          {toast.message}
        </div>
      )}
    </>
  );
}
