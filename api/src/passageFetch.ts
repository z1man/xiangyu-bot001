import { request } from 'undici';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';

export async function fetchReadableText(url: string): Promise<{ title: string; text: string }> {
  const res = await request(url, {
    method: 'GET',
    headers: {
      // Some sites return different content depending on UA.
      'user-agent': 'Mozilla/5.0 (compatible; ap-lang-app/1.0; +https://github.com/z1man/xiangyu-bot001)',
    },
  });

  const contentType = String(res.headers['content-type'] ?? 'text/html');
  const body = await res.body.text();

  // If it's not HTML, treat as plain text.
  if (!/text\/html/i.test(contentType)) {
    const title = url;
    const text = body.trim();
    if (!text || text.length < 400) throw new Error(`Text content too short: ${url}`);
    return { title, text };
  }

  const dom = new JSDOM(body, { url });
  const reader = new Readability(dom.window.document);
  const article = reader.parse();

  const title = (article?.title || dom.window.document.title || url).trim();
  const text = (article?.textContent || '').trim();

  if (!text || text.length < 400) {
    throw new Error(`Failed to extract readable text from URL (too short): ${url}`);
  }

  return { title, text };
}
