import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';

const API_BASE = (import.meta as any).env?.VITE_API_BASE ?? 'http://127.0.0.1:3001';

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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [genLoading, setGenLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await authedFetch('/settings/llm');
        if (res.configured) {
          setEndpoint(res.endpoint ?? '');
          setDeployment(res.deployment ?? '');
          setApiVersion(res.apiVersion ?? '2024-02-01');
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold text-slate-900">Settings</h2>
        <p className="text-sm text-slate-600">Configure Azure OpenAI for automatic content generation.</p>
      </div>

      {error && (
        <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}
      {okMsg && (
        <div className="mt-6 rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{okMsg}</div>
      )}

      <div className="mt-8 grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Azure OpenAI</CardTitle>
            <CardDescription>
              Saving will run a test call to verify endpoint, deployment, API version, and key.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-slate-700">Endpoint</label>
                <Input
                  value={endpoint}
                  onChange={(e) => setEndpoint(e.target.value)}
                  placeholder="https://YOUR-RESOURCE.openai.azure.com"
                  disabled={loading}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-slate-700">Deployment</label>
                <Input
                  value={deployment}
                  onChange={(e) => setDeployment(e.target.value)}
                  placeholder="my-deployment"
                  disabled={loading}
                />
                <div className="text-xs text-slate-500">Azure OpenAI uses deployment name (not model name).</div>
              </div>

              <div className="grid gap-2 sm:col-span-2">
                <label className="text-sm font-medium text-slate-700">API key</label>
                <Input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Paste your key"
                  disabled={loading}
                />
                <div className="text-xs text-slate-500">
                  If you already saved a key before, you can leave this blank to keep the existing key.
                </div>
              </div>
            </div>

            <details className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <summary className="cursor-pointer text-sm font-medium text-slate-900">Advanced</summary>
              <div className="mt-3 grid gap-2">
                <label className="text-sm font-medium text-slate-700">API version</label>
                <Input value={apiVersion} onChange={(e) => setApiVersion(e.target.value)} disabled={loading} />
                <div className="text-xs text-slate-500">
                  Azure OpenAI REST requires api-version. If you are unsure, keep the default.
                </div>
              </div>
            </details>

            <div className="mt-4 flex items-center gap-2">
              <Button
                disabled={saving || loading}
                onClick={async () => {
                  setError(null);
                  setOkMsg(null);
                  setSaving(true);
                  try {
                    await authedFetch('/settings/llm', { endpoint, deployment, apiVersion, apiKey });
                    setApiKey('');
                    setOkMsg('Saved and verified.');
                  } catch (e: any) {
                    setError(e.message ?? 'Failed to save');
                  } finally {
                    setSaving(false);
                  }
                }}
              >
                {saving ? 'Saving…' : 'Save (test connection)'}
              </Button>
              <Button variant="outline" disabled={loading} onClick={() => window.location.reload()}>
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Generate content</CardTitle>
            <CardDescription>Create 10 new passages and 10 questions per passage, then save to the database.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
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
            </Button>

            <Button variant="secondary" onClick={() => nav('/practice')}>
              Go to Practice
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
