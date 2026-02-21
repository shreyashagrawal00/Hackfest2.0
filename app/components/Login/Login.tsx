'use client';

import React, { useState, useEffect } from 'react';

declare global {
  interface Window {
    google: any;
  }
}
import './login.css';
import { auth } from '../../utils/auth';

interface LoginProps {
  onLogin: (name: string, isSocial?: boolean, accessToken?: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('demo@company.com');
  const [password, setPassword] = useState('demo123');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAccountSelector, setShowAccountSelector] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [tokenClient, setTokenClient] = useState<any>(null);

  useEffect(() => {
    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
          callback: handleGoogleResponse,
          auto_select: false,
          itp_support: true,
        });

        // Render the official Google button
        const parent = document.getElementById('google-btn-container');
        if (parent) {
          window.google.accounts.id.renderButton(parent, {
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            shape: 'rectangular',
            width: 280
          });
        }

        // Initialize Token Client for Gmail Scopes
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
          scope: 'https://www.googleapis.com/auth/gmail.readonly',
          callback: (tokenResponse: any) => {
            if (tokenResponse && tokenResponse.access_token) {
              const session = auth.getSession();
              if (session) {
                onLogin(session.name, true, tokenResponse.access_token);
              }
            }
          },
        });
        setTokenClient(client);
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleGoogleResponse = (response: any) => {
    try {
      // Decode JWT (standard way for Google One Tap / Button)
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const user = JSON.parse(jsonPayload);
      onLogin(user.name, true);
      auth.setSession({ email: user.email, name: user.name });
    } catch (err) {
      setError('Failed to process Google login.');
    }
  };

  const mockAccounts = {
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
    if (provider === 'Google') {
      if (window.google && window.google.accounts) {
        // If we already have a session, just request the token
        const session = auth.getSession();
        if (session && tokenClient) {
          tokenClient.requestAccessToken();
        } else {
          // Otherwise, the Sign-In button handles the initial authentication
          setError('Please use the "Sign in with Google" button below first.');
        }
      } else {
        setError('Google login not initialized yet. Please wait a moment.');
      }
      return;
    }
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
          <div id="google-btn-container" style={{ margin: '0 auto' }}></div>
        </div>
        <div className="oauth-row" style={{ marginTop: '12px' }}>
          <button className="oauth-btn" style={{ width: '100%' }} onClick={() => handleOAuthClick('Slack')} disabled={loading}># &nbsp;Slack SSO</button>
        </div>
        {!loading && !success && (
          <div className="demo-hint">Demo: demo@company.com / demo123 (or enter any new email/password)</div>
        )}
      </div>
    </div>
  );
}
