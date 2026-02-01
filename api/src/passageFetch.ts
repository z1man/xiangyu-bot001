import { request } from 'undici';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';

const BAD_PATTERNS: RegExp[] = [
  /page not found/i,
  /does not have a text with this exact name/i,
  /wikisource does not have a text with this exact name/i,
  /search for \".*\" in other texts/i,
];

function looksBad(title: string, text: string): boolean {
  const t = `${title}\n${text}`;
  return BAD_PATTERNS.some((r) => r.test(t));
}

function extractWikimedia(dom: JSDOM): { title: string; text: string } {
  const doc = dom.window.document;
  const title = (doc.querySelector('#firstHeading')?.textContent || doc.title || '').trim();

  const content = doc.querySelector('#mw-content-text') || doc.body;
  if (!content) return { title, text: '' };

  content
    .querySelectorAll(
      '.mw-editsection, .mw-indicators, .toc, .navbox, .metadata, .noprint, .mw-references-wrap, .mw-jump, .mw-footer, .mw-portlet, #mw-navigation, #footer'
    )
    .forEach((el) => el.remove());

  const text = (content.textContent || '').replace(/\n{3,}/g, '\n\n').trim();
  return { title, text };
}

export async function fetchReadableText(url: string): Promise<{ title: string; text: string }> {
  const res = await request(url, {
    method: 'GET',
    headers: {
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
    if (looksBad(title, text)) throw new Error(`Bad content detected: ${url}`);
    return { title, text };
  }

  const dom = new JSDOM(body, { url });

  // Wikisource/Wikipedia extraction
  if (/wikisource\.org|wikipedia\.org/i.test(url)) {
    const w = extractWikimedia(dom);
    if (w.text && w.text.length >= 400 && !looksBad(w.title, w.text)) return w;
    throw new Error(`Bad/short wikimedia content: ${url}`);
  }

  const reader = new Readability(dom.window.document);
  const article = reader.parse();

  const title = (article?.title || dom.window.document.title || url).trim();
  const text = (article?.textContent || '').trim();

  if (!text || text.length < 400) throw new Error(`Failed to extract readable text from URL (too short): ${url}`);
  if (looksBad(title, text)) throw new Error(`Bad content detected: ${url}`);

  return { title, text };
}
