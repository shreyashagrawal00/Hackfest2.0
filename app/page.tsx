'use client';

import React, { useState } from 'react';
import AppLayout from './components/Layout/AppLayout';
import Login from './components/Login/Login';
import Dashboard from './components/Dashboard/Dashboard';
import Integrations from './components/Integrations/Integrations';
import GeneratorForm from './components/Generator/GeneratorForm';
import Editor from './components/Editor/Editor';

export default function Home() {
  const [user, setUser] = useState<{ name: string; avatar: string } | null>(null);
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

  const handleLogin = (name: string) => {
    setUser({ name, avatar: name.slice(0, 2).toUpperCase() });
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
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

  const handleAIMessage = (text: string) => {
    setAiMessages(prev => [...prev, { type: 'usr', text }]);
    setAiProcessing(true);
    // Simulate AI response
    setTimeout(() => {
      setAiMessages(prev => [...prev, { type: 'sys', text: `I've analyzed your request: "${text}". I have updated the relevant section in the document.` }]);
      setAiProcessing(false);
    }, 2000);
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
          aiMessages={aiMessages}
          aiProcessing={aiProcessing}
        />
      )}
    </AppLayout>
  );
}
