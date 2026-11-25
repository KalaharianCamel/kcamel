// Replace bracketed text with real content. Leave optional URLs empty to omit links.
// Add or remove entries in experience, activities, coursework, and honors as needed.
export const portfolio = {
  name: '[Name]',
  introduction: '[Short introduction]',
  interests: '[Research interests]',
  funFacts: ['fun fact 1', 'fun fact 2', 'fun fact 3', 'fun fact 4', 'fun fact 5', 'fun fact 6', 'fun fact 7', 'fun fact 8'],
  projects: [
    { id: 'project-01', title: '[Project 01 title]', summary: '[A short description of the question, idea, or problem behind this project.]', role: '[Role]', methods: '[Methods and tools]', result: '[Result or current progress]', description: '[Describe the project: the question you explored, what you did, and what you learned.]', image: '', imageAlt: '', links: [] },
    { id: 'project-02', title: '[Project 02 title]', summary: '[A short description of what you investigated, designed, or built.]', role: '[Role]', methods: '[Methods and tools]', result: '[Result or current progress]', description: '[Describe your approach, the challenges you worked through, and your contribution.]', image: '', imageAlt: '', links: [] },
    { id: 'project-03', title: '[Project 03 title]', summary: '[A short description of the work and why the subject interests you.]', role: '[Role]', methods: '[Methods and tools]', result: '[Result or current progress]', description: '[Describe the work, the evidence you collected, and what you would explore next.]', image: '', imageAlt: '', links: [] },
  ],
  experience: [
    { organization: '[Organization or activity]', role: '[Role]', dates: '[Dates]', contribution: '[What you contributed, investigated, or helped make possible.]' },
    { organization: '[Organization or activity]', role: '[Role]', dates: '[Dates]', contribution: '[Your responsibilities and contribution.]' },
  ],
  academics: { school: '[School]', graduation: '[Graduation year]', statistics: [{ label: '[Academic statistic]', value: '[Value]' }], coursework: ['[Relevant coursework]'], honors: [{ title: '[Honor or award]', detail: '[Awarding organization · Year]' }] },
  contact: { invitation: '[Contact invitation]', email: '', emailLabel: '[Email address]', links: [], resume: '' },
};
