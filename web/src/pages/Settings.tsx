import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../lib/api';

const API_BASE = (import.meta as any).env?.VITE_API_BASE ?? 'http://localhost:3001';

async function authedFetch(path: string, body?: any) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    method: body ? 'POST' : 'GET',
    headers: {
      'content-type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(data?.error ?? `Request failed: ${res.status}`);
  return data;
}

export function SettingsPage() {
  const nav = useNavigate();
  const [endpoint, setEndpoint] = useState('');
  const [deployment, setDeployment] = useState('');
  const [apiVersion, setApiVersion] = useState('2024-02-01');
  const [apiKey, setApiKey] = useState('');
  const [_configured, setConfigured] = useState(false);
  const [saving, setSaving] = useState(false);
  const [genLoading, setGenLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await authedFetch('/settings/llm');
        if (res.configured) {
          setConfigured(true);
          setEndpoint(res.endpoint ?? '');
          setDeployment(res.deployment ?? '');
          setApiVersion(res.apiVersion ?? '2024-02-01');
        }
      } catch {
        // ignore
      }
    })();
  }, []);

  return (
    <div>
      <h2>Settings</h2>
      <p style={{ color: '#666' }}>Configure Azure OpenAI for automatic content generation.</p>

      <div style={{ display: 'grid', gap: 10, maxWidth: 560 }}>
        <label>
          Azure OpenAI endpoint
          <input value={endpoint} onChange={(e) => setEndpoint(e.target.value)} placeholder="https://YOUR-RESOURCE.openai.azure.com" />
        </label>
        <label>
          Deployment name
          <input value={deployment} onChange={(e) => setDeployment(e.target.value)} placeholder="gpt-4o-mini" />
        </label>
        <label>
          API version
          <input value={apiVersion} onChange={(e) => setApiVersion(e.target.value)} />
        </label>
        <label>
          API key
          <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="Your Azure OpenAI key" />
        </label>

        {error && <div style={{ color: 'crimson' }}>{error}</div>}
        {okMsg && <div style={{ color: 'green' }}>{okMsg}</div>}

        <button
          disabled={saving}
          onClick={async () => {
            setError(null);
            setOkMsg(null);
            setSaving(true);
            try {
              await authedFetch('/settings/llm', { endpoint, deployment, apiVersion, apiKey });
              setConfigured(true);
              setApiKey('');
              setOkMsg('Saved.');
            } catch (e: any) {
              setError(e.message ?? 'Failed to save');
            } finally {
              setSaving(false);
            }
          }}
        >
          {saving ? 'Saving…' : 'Save'}
        </button>

        <hr />

        <h3>Generate content</h3>
        <p style={{ color: '#666' }}>Create 10 new passages and 10 questions per passage, then save to the database.</p>
        <button
          disabled={genLoading}
          onClick={async () => {
            setError(null);
            setOkMsg(null);
            setGenLoading(true);
            try {
              const res = await authedFetch('/content/generate', { count: 10 });
              setOkMsg(`Created ${res.created?.length ?? 0} passages.`);
            } catch (e: any) {
              setError(e.message ?? 'Generation failed');
            } finally {
              setGenLoading(false);
            }
          }}
        >
          {genLoading ? 'Generating…' : 'Generate 10 passages'}
        </button>

        <button onClick={() => nav('/practice')}>Go to Practice</button>
      </div>
    </div>
  );
}
