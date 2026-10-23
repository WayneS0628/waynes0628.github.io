// Site-wide settings. Wayne: this is the one file to edit for contact info,
// the status chip, and the stats strip. Anything marked TODO is a placeholder.

export const site = {
  name: 'Wayne Simmons',
  title: 'Wayne Simmons, ML Engineer',
  description:
    "I'm Wayne, an ML engineer in Queens building AI that finds what matters in messy data, and someday protects the people it's about.",
  status: 'Open to 2027 ML internships',
  email: 'waynesimmonsjr@icloud.com',
  resume: '/resume.pdf', // the file lives at public/resume.pdf
  links: {
    github: 'https://github.com/WayneS0628',
    linkedin: 'https://www.linkedin.com/in/wayne-simmons-56808b201/',
  },
  // Background music while audio is on. Empty = the generative lofi loop
  // (src/scripts/lofi.ts). To use a recording instead, put the file in
  // public/audio/ and set its path here, e.g. '/audio/guitar.mp3'.
  ambient: '',
  // Last.fm account for the "last played" widget. Both empty = widget hidden.
  // The API key is a public read-only key from https://www.last.fm/api/account/create
  lastfm: { user: '', apiKey: '' },
};

// Stats strip on the homepage. Real numbers only.
// `shipped` is filled in automatically from the projects collection.
export const stats: { value: string; label: string }[] = [
  { value: '4 yrs', label: 'at Apple Retail' },
  { value: '2027', label: 'CS grad, Queens College' },
  { value: '4,300+', label: 'applied to Break Through Tech AI. I got in.' },
];

export const nav = [
  { n: '01', label: 'Work', href: '/work/' },
  { n: '02', label: 'About', href: '/about/' },
  { n: '03', label: 'Writing', href: '/writing/' },
  { n: '04', label: 'Contact', href: '/contact/' },
];
