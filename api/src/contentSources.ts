// A curated set of high-quality nonfiction passages suitable for AP Lang practice.
// For now: URLs only; we fetch and extract readable text.
// You can expand/replace this list anytime.

export const PASSAGE_URL_POOL: Array<{ url: string; author?: string }> = [
  // Public domain / government sources tend to be safest for redistribution.
  { url: 'https://www.archives.gov/milestone-documents/president-john-f-kennedy-inaugural-address', author: 'John F. Kennedy' },
  { url: 'https://www.archives.gov/milestone-documents/four-freedoms-speech', author: 'Franklin D. Roosevelt' },
  { url: 'https://www.archives.gov/milestone-documents/letter-from-birmingham-jail', author: 'Martin Luther King Jr.' },
  { url: 'https://www.archives.gov/milestone-documents/gettysburg-address', author: 'Abraham Lincoln' },
  { url: 'https://www.archives.gov/milestone-documents/seneca-falls-declaration', author: 'Elizabeth Cady Stanton (et al.)' },
  // Add more as needed.
];
