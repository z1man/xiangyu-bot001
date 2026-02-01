// Source pool for automatic ingestion (AP Lang-friendly nonfiction).
// These should be stable HTML pages with substantial text.

export const PASSAGE_URL_POOL: Array<{ url: string; author?: string }> = [
  // Wikisource (works well when the page contains a substantial excerpt)
  { url: 'https://en.wikisource.org/wiki/Gettysburg_Address', author: 'Abraham Lincoln' },
  { url: 'https://en.wikisource.org/wiki/A_Modest_Proposal', author: 'Jonathan Swift' },
  { url: 'https://en.wikisource.org/wiki/Self-Reliance', author: 'Ralph Waldo Emerson' },
  { url: 'https://en.wikisource.org/wiki/Civil_Disobedience', author: 'Henry David Thoreau' },

  // Wikipedia (speech/article pages are long and extract cleanly)
  { url: 'https://en.wikipedia.org/wiki/I_Have_a_Dream', author: 'Martin Luther King Jr.' },
  { url: 'https://en.wikipedia.org/wiki/We_shall_fight_on_the_beaches', author: 'Winston Churchill' },
  { url: 'https://en.wikipedia.org/wiki/Blood,_Toil,_Tears_and_Sweat', author: 'Winston Churchill' },
  { url: 'https://en.wikipedia.org/wiki/Four_Freedoms', author: 'Franklin D. Roosevelt' },
  { url: 'https://en.wikipedia.org/wiki/An_Essay_on_Man', author: 'Alexander Pope' },
  { url: 'https://en.wikipedia.org/wiki/Letter_from_Birmingham_Jail', author: 'Martin Luther King Jr.' },

  // US National Archives
  { url: 'https://www.archives.gov/milestone-documents/truman-doctrine', author: 'Harry S. Truman' },
  { url: 'https://www.archives.gov/milestone-documents/marshall-plan', author: 'George C. Marshall' },
];
