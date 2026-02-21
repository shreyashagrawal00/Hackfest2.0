'use client';

import React, { useState } from 'react';
import { auth } from './utils/auth';
import AppLayout from './components/Layout/AppLayout';
import Login from './components/Login/Login';
import Dashboard from './components/Dashboard/Dashboard';
import Integrations from './components/Integrations/Integrations';
import GeneratorForm from './components/Generator/GeneratorForm';
import Editor from './components/Editor/Editor';

export default function Home() {
  const [user, setUser] = useState<{ name: string; avatar: string } | null>(null);

  // Persistence: Check session on mount
  React.useEffect(() => {
    const session = auth.getSession();
    if (session) {
      setUser({ name: session.name, avatar: session.name.slice(0, 2).toUpperCase() });
    }
  }, []);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [integrations, setIntegrations] = useState({ gmail: false, slack: false, fireflies: false });
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [brds, setBrds] = useState<any[]>([]);
  const [currentBRDIndex, setCurrentBRDIndex] = useState<number | null>(null);
  const [generating, setGenerating] = useState(false);
  const [aiMessages, setAiMessages] = useState<any[]>([
    { type: 'sys', text: '✦ Hello! I can help you edit sections, add requirements, and refine your BRD.' }
  ]);
  const [aiProcessing, setAiProcessing] = useState(false);

  const handleLogin = (name: string, isSocial?: boolean) => {
    setUser({ name, avatar: name.slice(0, 2).toUpperCase() });
    setActiveTab('dashboard');
    if (isSocial) {
      setIntegrations(prev => ({ ...prev, gmail: true }));
    }
  };

  const handleLogout = () => {
    auth.setSession(null);
    setUser(null);
  };

  const toggleIntegration = (name: string) => {
    setIntegrations(prev => ({ ...prev, [name]: !prev[name as keyof typeof integrations] }));
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

  const generateBRD = (formData: any) => {
    setGenerating(true);
    // Simulate generation
    setTimeout(() => {
      const newBRD = {
        projectName: formData.projectName,
        createdAt: Date.now(),
        conflicts: 0,
        sections: formData.sections.map((s: string) => ({
          id: s,
          title: s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          content: `<p>This is the generated content for ${s}. Based on your input: ${formData.projectDesc}</p>`,
          requirements: s.includes('requirements') ? [
            { id: 'FR-001', description: 'The system shall process inputs automatically.', priority: 'High' },
            { id: 'FR-002', description: 'Stakeholders must be able to export reports.', priority: 'Medium' }
          ] : null
        }))
      };
      setBrds([...brds, newBRD]);
      setCurrentBRDIndex(brds.length);
      setActiveTab('editor');
      setGenerating(false);
    }, 3000);
  };

  const updateBRD = (index: number, updatedFields: any) => {
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
            const updatedSections = currentBRD.sections.map((s: any) => {
              if (s.id.includes('functional_requirements')) {
                return {
                  ...s,
                  requirements: [
                    ...(s.requirements || []),
                    { id: `FR-00${(s.requirements?.length || 0) + 1}`, description: reqText, priority: 'Medium' }
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
        />
      )}
      {activeTab === 'integrations' && (
        <Integrations
          integrations={integrations}
          uploadedFiles={uploadedFiles}
          onToggleIntegration={toggleIntegration}
          onAddFiles={addFiles}
          onRemoveFile={removeFile}
        />
      )}
      {activeTab === 'generate' && (
        <GeneratorForm
          onGenerate={generateBRD}
          generating={generating}
          integrations={integrations}
          uploadedFiles={uploadedFiles}
        />
      )}
      {activeTab === 'editor' && (
        <Editor
          brd={currentBRDIndex !== null ? brds[currentBRDIndex] : null}
          onAIMessage={handleAIMessage}
          onUpdateBRD={(fields: any) => currentBRDIndex !== null && updateBRD(currentBRDIndex, fields)}
          aiMessages={aiMessages}
          aiProcessing={aiProcessing}
        />
      )}
    </AppLayout>
  );
}
