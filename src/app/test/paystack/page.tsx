'use client';

import { useState } from 'react';
import { T } from '@/lib/theme';
import { Card } from '@/components/ui';

interface TestResult {
  success?: boolean;
  error?: string;
  subscription?: any;
  transaction?: any;
  message?: string;
  details?: any;
}

export default function PaystackTestPage() {
  const [email, setEmail] = useState('test@example.com');
  const [planCode, setPlanCode] = useState('');
  const [reference, setReference] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);

  const handleInitSubscription = async () => {
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch('/api/test/paystack/init-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          plan_code: planCode || 'PLN_default',
          quantity: 1,
        }),
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyTransaction = async () => {
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch('/api/test/paystack/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference }),
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px 20px', maxWidth: 800, margin: '0 auto' }}>
      <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 30, color: T.text }}>
        🧪 Paystack Subscription Test
      </h1>

      {/* Initialize Subscription */}
      <Card style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: T.text }}>
          1. Initialize Subscription
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: T.textS }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="test@example.com"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                border: `1px solid ${T.border}`,
                fontSize: 14,
                fontFamily: 'inherit',
                color: T.text,
                background: T.bg,
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: T.textS }}>
              Plan Code (Optional)
            </label>
            <input
              type="text"
              value={planCode}
              onChange={(e) => setPlanCode(e.target.value)}
              placeholder="e.g., PLN_default"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                border: `1px solid ${T.border}`,
                fontSize: 14,
                fontFamily: 'inherit',
                color: T.text,
                background: T.bg,
              }}
            />
            <div style={{ fontSize: 11, color: T.textM, marginTop: 4 }}>
              Leave blank to use default plan. Make sure this plan exists in your Paystack account.
            </div>
          </div>

          <button
            onClick={handleInitSubscription}
            disabled={loading}
            style={{
              padding: '12px 16px',
              background: T.accent,
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              fontSize: 14,
            }}
          >
            {loading ? 'Initializing...' : 'Initialize Subscription'}
          </button>
        </div>
      </Card>

      {/* Verify Transaction */}
      <Card style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: T.text }}>
          2. Verify Transaction
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: T.textS }}>
              Payment Reference
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g., 123456789"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                border: `1px solid ${T.border}`,
                fontSize: 14,
                fontFamily: 'inherit',
                color: T.text,
                background: T.bg,
              }}
            />
          </div>

          <button
            onClick={handleVerifyTransaction}
            disabled={loading}
            style={{
              padding: '12px 16px',
              background: T.success,
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              fontSize: 14,
            }}
          >
            {loading ? 'Verifying...' : 'Verify Transaction'}
          </button>
        </div>
      </Card>

      {/* Test Cards Reference */}
      <Card style={{ marginBottom: 20, background: `${T.warn}15` }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: T.text }}>
          📋 Paystack Test Cards
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 12 }}>
          <div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>✅ Successful Payment</div>
            <div style={{ color: T.textS }}>
              Card: <code>4084084084084081</code><br/>
              Exp: <code>12/25</code><br/>
              CVV: <code>123</code>
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>❌ Failed Payment</div>
            <div style={{ color: T.textS }}>
              Use an expired card or incorrect CVV
            </div>
          </div>
        </div>
      </Card>

      {/* Results */}
      {result && (
        <Card style={{ background: result.error ? `${T.danger}15` : `${T.success}15` }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: T.text }}>
            {result.error ? '❌ Error' : '✅ Success'}
          </h3>
          <pre
            style={{
              background: T.bg,
              padding: 12,
              borderRadius: 8,
              fontSize: 11,
              overflow: 'auto',
              color: T.textS,
              fontFamily: 'monospace',
            }}
          >
            {JSON.stringify(result, null, 2)}
          </pre>
        </Card>
      )}
    </div>
  );
}
