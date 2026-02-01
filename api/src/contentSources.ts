// Source pool for automatic ingestion.
// Using English Wikisource pages tends to be stable and readable (HTML) for extraction.

export const PASSAGE_URL_POOL: Array<{ url: string; author?: string }> = [
  { url: 'https://en.wikisource.org/wiki/Declaration_of_Independence_(United_States)', author: 'Continental Congress' },
  { url: 'https://en.wikisource.org/wiki/Gettysburg_Address', author: 'Abraham Lincoln' },
  { url: 'https://en.wikisource.org/wiki/Second_Inaugural_Address_of_Abraham_Lincoln', author: 'Abraham Lincoln' },
  { url: 'https://en.wikisource.org/wiki/A_Modest_Proposal', author: 'Thomas Paine' },
  { url: 'https://en.wikisource.org/wiki/The_American_Crisis/Number_I', author: 'Thomas Paine' },
  { url: 'https://en.wikisource.org/wiki/Self-Reliance', author: 'Ralph Waldo Emerson' },
  { url: 'https://en.wikisource.org/wiki/Civil_Disobedience', author: 'Henry David Thoreau' },
  { url: 'https://en.wikisource.org/wiki/Federalist_No._10', author: 'James Madison' },
  { url: 'https://en.wikisource.org/wiki/Women%27s_Rights_are_Human_Rights', author: 'Hillary Rodham Clinton' },
  { url: 'https://en.wikisource.org/wiki/Letter_to_Horace_Greeley', author: 'Abraham Lincoln' },
];
