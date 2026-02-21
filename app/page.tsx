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

  // Persistence: Check session on mount
  React.useEffect(() => {
    const session = auth.getSession();
    if (session) {
      setUser({ name: session.name, avatar: session.name.slice(0, 2).toUpperCase() });
    }

    // Load GIS script for OAuth
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.google && window.google.accounts) {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
          scope: 'https://www.googleapis.com/auth/gmail.readonly',
          callback: (tokenResponse: { access_token?: string }) => {
            if (tokenResponse && tokenResponse.access_token) {
              setGmailToken(tokenResponse.access_token);
              setIntegrations(prev => ({ ...prev, gmail: true }));
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
  }, []);

  const [tokenClient, setTokenClient] = useState<{ requestAccessToken: () => void } | null>(null);

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

    // Simple parsing logic for requirements
    const lines = formData.rawReqs.split('\n').filter(l => l.trim().length > 10);
    const parsedReqs = lines.map((line, idx) => ({
      id: `FR-${String(idx + 1).padStart(3, '0')}`,
      description: line.trim(),
      priority: idx % 3 === 0 ? 'High' as const : (idx % 2 === 0 ? 'Medium' as const : 'Low' as const)
    }));

    // Realistic content templates
    const getSectionContent = (id: string) => {
      switch (id) {
        case 'executive_summary':
          return `<p><strong>Project Overview:</strong> ${formData.projectName} is designed to address key challenges in the current workflow. ${formData.projectDesc}</p><p>This initiative focuses on streamlining operations and enhancing stakeholder engagement through automated analysis and intelligent reporting.</p>`;
        case 'business_objectives':
          return `<p>The primary objective of ${formData.projectName} is to improve efficiency by at least 30% within the first six months. Key goals include:</p><ul><li>Centralization of data sources</li><li>Reduction in manual document processing time</li><li>Improved accuracy of business requirements documentation</li></ul>`;
        case 'functional_requirements':
          return `<p>The following requirements specify the necessary behavior and capabilities of ${formData.projectName}. They have been derived from initial stakeholder interviews and internal documentation.</p>`;
        case 'stakeholder_analysis':
          return `<p>Key stakeholders identified for this project include Project Managers, Business Analysts, and Technical Leads. The system must cater to varying levels of technical expertise and provide intuitive interfaces for collaborative editing.</p>`;
        default:
          return `<p>Standard documentation for the ${id.replace(/_/g, ' ')} phase. This section covers the necessary protocols and standards required for successful project implementation based on the provided inputs: ${formData.projectDesc.slice(0, 100)}...</p>`;
      }
    };

    // Simulate generation
    setTimeout(() => {
      const newBRD: BRD = {
        projectName: formData.projectName,
        createdAt: Date.now(),
        conflicts: 0,
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
    }, 3000);
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

  if (!user) return <Login onLogin={handleLogin} />;

  return (
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
          userName={user.name}
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
  );
}
