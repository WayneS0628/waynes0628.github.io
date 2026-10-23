// Site-wide settings. Wayne: this is the one file to edit for contact info,
// the status chip, and the stats strip. Anything marked TODO is a placeholder.

export const site = {
  name: 'Wayne Simmons',
  title: 'Wayne Simmons, ML Engineer',
  description:
    "I'm Wayne, an ML engineer in Queens building AI that finds what matters in messy data, and someday protects the people it's about.",
  status: 'Open to 2027 ML internships',
  // TODO: Wayne. The address shown in the click-to-copy button.
  email: '',
  // TODO: Wayne. Drop your resume at public/resume.pdf (or change this path).
  resume: '/resume.pdf',
  links: {
    github: 'https://github.com/WayneS0628',
    linkedin: 'https://www.linkedin.com/in/wayne-simmons-56808b201/',
  },
  // Ambient audio loop played while audio is on. Leave empty until the guitar
  // recording exists, then put the file in public/audio/ and set the path here.
  ambient: '',
};

// Stats strip on the homepage. Real numbers only.
// `shipped` is filled in automatically from the projects collection.
export const stats: { value: string; label: string }[] = [
  { value: '4 yrs', label: 'at Apple Retail' },
  { value: '2027', label: 'CS grad, Queens College' },
  // TODO: Wayne. Add more real numbers here (e.g. a CUAD result once public).
];

export const nav = [
  { n: '01', label: 'Work', href: '/work/' },
  { n: '02', label: 'About', href: '/about/' },
  { n: '03', label: 'Writing', href: '/writing/' },
  { n: '04', label: 'Contact', href: '/contact/' },
];
