import { PASSAGE_URL_POOL } from '../src/contentSources.js';
import { fetchReadableText } from '../src/passageFetch.js';

async function main() {
  for (const s of PASSAGE_URL_POOL) {
    try {
      const { title, text } = await fetchReadableText(s.url);
      console.log('OK', title.slice(0,80), 'len', text.length, s.url);
    } catch (e: any) {
      console.log('FAIL', s.url, String(e.message || e));
    }
  }
}

main();
