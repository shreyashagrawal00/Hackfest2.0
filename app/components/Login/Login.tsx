'use client';

import React, { useState } from 'react';
import './login.css';

interface LoginProps {
  onLogin: (name: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('demo@company.com');
  const [password, setPassword] = useState('demo123');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if ((email === 'demo@company.com' && password === 'demo123') || (email && password.length >= 4)) {
      const name = email.split('@')[0].replace(/[^a-zA-Z]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      onLogin(name);
    } else {
      setError('Invalid credentials. Try demo@company.com / demo123');
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg"></div>
      <div className="login-grid-bg"></div>
      <div className="login-card">
        <div className="login-logo">BRD<em>agent</em></div>
        <div className="login-tag">// AUTOMATED REQUIREMENTS INTELLIGENCE</div>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="lbl">Email address</div>
          <input
            className="linput"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <div className="lbl">Password</div>
          <input
            className="linput"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button className="login-btn" type="submit">Sign in →</button>
        </form>

        <div className="login-divider">or</div>
        <div className="oauth-row">
          <button className="oauth-btn" onClick={() => onLogin('Google User')}>G &nbsp;Google</button>
          <button className="oauth-btn" onClick={() => onLogin('Slack User')}># &nbsp;Slack SSO</button>
        </div>
        <div className="demo-hint">Demo: demo@company.com / demo123</div>
      </div>
    </div>
  );
}
