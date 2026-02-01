import { request } from 'undici';

export type AzureChatConfig = {
  endpoint: string; // e.g. https://xxx.openai.azure.com
  deployment: string;
  apiVersion: string;
  apiKey: string;
};

export async function azureChatJSON<T>(cfg: AzureChatConfig, system: string, user: string, jsonSchemaHint?: string): Promise<T> {
  if (process.env.FAKE_LLM === '1') {
    // For CI/local without external calls.
    throw new Error('FAKE_LLM is enabled but azureChatJSON was called. Use fake generator path.');
  }

  const url = `${cfg.endpoint.replace(/\/$/, '')}/openai/deployments/${encodeURIComponent(cfg.deployment)}/chat/completions?api-version=${encodeURIComponent(cfg.apiVersion)}`;

  const body: any = {
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user + (jsonSchemaHint ? `\n\nReturn ONLY valid JSON.\nSchema: ${jsonSchemaHint}` : '') },
    ],
    temperature: 0.7,
  };

  const res = await request(url, {
    method: 'POST',
    headers: {
      'api-key': cfg.apiKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const text = await res.body.text();
  if (res.statusCode < 200 || res.statusCode >= 300) {
    throw new Error(`Azure OpenAI error ${res.statusCode}: ${text}`);
  }

  const json = JSON.parse(text);
  const content = json?.choices?.[0]?.message?.content;
  if (!content || typeof content !== 'string') throw new Error('No message content returned from Azure OpenAI');

  // Strict JSON only (user prompt instructs it). Still handle code fences defensively.
  const cleaned = content.trim().replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
  return JSON.parse(cleaned) as T;
}
