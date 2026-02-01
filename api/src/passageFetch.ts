import { request } from 'undici';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';

export async function fetchReadableText(url: string): Promise<{ title: string; text: string }>
{
  const res = await request(url, { method: 'GET' });
  const html = await res.body.text();

  const dom = new JSDOM(html, { url });
  const reader = new Readability(dom.window.document);
  const article = reader.parse();

  const title = (article?.title || dom.window.document.title || url).trim();
  const text = (article?.textContent || '').trim();

  if (!text || text.length < 400) {
    throw new Error(`Failed to extract readable text from URL (too short): ${url}`);
  }

  return { title, text };
}
