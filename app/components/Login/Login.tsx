'use client';

import React, { useState } from 'react';
import './login.css';
import { auth } from '../../utils/auth';

interface LoginProps {
  onLogin: (name: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('demo@company.com');
  const [password, setPassword] = useState('demo123');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAccountSelector, setShowAccountSelector] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('');

  const mockAccounts = {
    'Google': [
      { name: 'Shreyash Agrawal', email: 'shreyash@gmail.com', avatar: 'SA' },
      { name: 'Admin User', email: 'admin@company.com', avatar: 'AD' },
      { name: 'Product Manager', email: 'pm@hackfest.org', avatar: 'PM' }
    ],
    'Slack': [
      { name: 'Shreyash (Slack)', email: 'shreyash@slack.com', avatar: 'SS' }
    ]
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!email || password.length < 4) {
      setError('Please enter a valid email and a password (at least 4 characters).');
      setLoading(false);
      return;
    }

    // Simulate a brief delay for realistic feel
    setTimeout(() => {
      try {
        const { user, isNew } = auth.login(email, password);
        auth.setSession(user);

        if (isNew) {
          setSuccess(`Welcome! A new account has been created for ${email}.`);
          setTimeout(() => onLogin(user.name), 2000);
        } else {
          onLogin(user.name);
        }
      } catch (err: any) {
        setError(err.message || 'Login failed');
      } finally {
        setLoading(false);
      }
    }, 800);
  };

  const handleOAuthClick = (provider: string) => {
    setSelectedProvider(provider);
    setShowAccountSelector(true);
  };

  const handleSelectAccount = (account: any) => {
    auth.setSession({ email: account.email, name: account.name });
    onLogin(account.name);
  };

  return (
    <div className="login-page">
      <div className="login-bg"></div>
      <div className="login-grid-bg"></div>
      <div className="login-card">
        {showAccountSelector && (
          <div className="account-selector-overlay">
            <div className="account-selector-title">Choose an account</div>
            <div className="account-selector-sub">to continue to BRDagent</div>

            <div className="account-list">
              {(mockAccounts[selectedProvider as keyof typeof mockAccounts] || []).map((acc, i) => (
                <div key={i} className="account-item" onClick={() => handleSelectAccount(acc)}>
                  <div className="account-avatar">{acc.avatar}</div>
                  <div className="account-info">
                    <div className="account-name">{acc.name}</div>
                    <div className="account-email">{acc.email}</div>
                  </div>
                </div>
              ))}
              <div className="account-item" onClick={() => setShowAccountSelector(false)}>
                <div className="account-avatar" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' }}>+</div>
                <div className="account-info">
                  <div className="account-name" style={{ color: 'rgba(255,255,255,0.5)' }}>Use another account</div>
                </div>
              </div>
            </div>

            <button className="back-to-login" onClick={() => setShowAccountSelector(false)}>
              ← Back to sign in
            </button>
          </div>
        )}

        <div className="login-logo">BRD<em>agent</em></div>
        <div className="login-tag">AUTOMATED REQUIREMENTS INTELLIGENCE</div>

        {error && <div className="login-error">{error}</div>}
        {success && <div className="login-success" style={{
          background: 'rgba(61, 90, 71, 0.15)',
          border: '1px solid rgba(61, 90, 71, 0.3)',
          borderRadius: '8px',
          padding: '10px 14px',
          fontFamily: "'DM Mono', monospace",
          fontSize: '12px',
          color: '#547A62',
          marginBottom: '16px'
        }}>{success}</div>}

        <form onSubmit={handleLogin}>
          <div className="lbl">Email address</div>
          <input
            className="linput"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={loading}
          />
          <div className="lbl">Password</div>
          <input
            className="linput"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={loading}
          />
          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? <span className="spinner"></span> : null}
            {loading ? 'Processing...' : 'Sign in →'}
          </button>
        </form>

        <div className="login-divider">or</div>
        <div className="oauth-row">
          <button className="oauth-btn" onClick={() => handleOAuthClick('Google')} disabled={loading}>G &nbsp;Google</button>
          <button className="oauth-btn" onClick={() => handleOAuthClick('Slack')} disabled={loading}># &nbsp;Slack SSO</button>
        </div>
        {!loading && !success && (
          <div className="demo-hint">Demo: demo@company.com / demo123 (or enter any new email/password)</div>
        )}
      </div>
    </div>
  );
}
