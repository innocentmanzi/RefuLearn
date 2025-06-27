const allCourses = [
  {
    id: 1,
    title: 'Data Analysis Fundamentals',
    description: 'Learn to analyze, interpret, and visualize data using tools like Excel, SQL, and Python.',
    overview: 'Learn to analyze, interpret, and visualize data using tools like Excel, SQL, and Python.',
    level: 'Beginner',
    duration: '8 weeks',
    students: 750,
    category: 'Data Science',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=500&q=60',
    learningObjectives: [
      'Understand data analysis workflows',
      'Perform basic statistics and data cleaning',
      'Visualize data insights',
      'Use Excel, SQL, and Python (pandas)'
    ],
    modules: [
      'Introduction to Data Analysis',
      'Excel for Beginners',
      'Introduction to Python for Data',
      'Data Cleaning Techniques',
      'SQL for Data Exploration',
      'Data Visualization (Excel & Python)'
    ],
    resources: {
      books: ['Data Science from Scratch by Joel Grus'],
      tools: ['Google Colab', 'Jupyter', 'DB Browser for SQLite', 'Excel'],
      sites: ['Kaggle', 'Coursera']
    }
  },
  {
    id: 2,
    title: 'Digital Skills Fundamentals',
    description: 'Covers essential digital competencies required for modern careers and communication.',
    overview: `In today's fast-paced digital world, foundational digital skills are no longer optional—they're essential. Digital Skills Fundamentals is a comprehensive, beginner-friendly course designed to equip learners with the core competencies required to thrive in a technology-driven society and workplace.\n\nThis course offers hands-on experience with digital tools, internet safety, online communication, productivity software, and essential problem-solving techniques. Whether you're preparing for a digital career, returning to the workforce, or simply want to build confidence using everyday technology, this course serves as the ideal starting point.\n\nYou'll explore real-world applications, engage in interactive exercises, and develop practical skills that are immediately useful at home, in school, or on the job. No prior technical knowledge is required—just a willingness to learn and engage.`,
    level: 'Beginner',
    duration: '6 weeks',
    students: 850,
    category: 'IT & Software',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=500&q=60',
    learningObjectives: [
      'Navigate computers and operating systems',
      'Use office productivity tools',
      'Safely browse and communicate online',
      'Collaborate digitally'
    ],
    modules: [
      'Computer Basics',
      'Using Microsoft Word, Excel, PowerPoint',
      'Email & Internet Navigation',
      'Google Workspace Tools',
      'Digital Safety & Cybersecurity',
      'Cloud Storage and Collaboration'
    ],
    resources: {
      platforms: ['Google Applied Digital Skills', 'GCFGlobal.org Tutorials'],
      tools: ['Zoom', 'Trello', 'Google Docs']
    }
  },
  {
    id: 3,
    title: 'Advanced Programming',
    description: 'Deepens your coding skills, focusing on algorithms, data structures, and software development.',
    overview: 'Deep dive into advanced programming concepts and best practices.',
    level: 'Advanced',
    duration: '10 weeks',
    students: 1000,
    category: 'Web Development',
    image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=500&q=60',
    learningObjectives: [
      'Apply OOP and advanced logic',
      'Build and debug projects',
      'Use APIs and version control'
    ],
    modules: [
      'Advanced Python or JavaScript',
      'Object-Oriented Programming',
      'Data Structures & Algorithms',
      'REST APIs & JSON',
      'Git & GitHub',
      'Final Project Development'
    ],
    resources: {
      books: ['Automate the Boring Stuff with Python'],
      platforms: ['GitHub', 'Codecademy'],
      tools: ['VS Code', 'Postman']
    }
  },
  {
    id: 4,
    title: 'Financial Literacy',
    description: 'Empowers learners to manage money, budgeting, saving, and investing.',
    overview: 'Empowers learners to manage money, budgeting, saving, and investing.',
    level: 'Beginner',
    duration: '6 weeks',
    students: 650,
    category: 'Finance',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=500&q=60',
    learningObjectives: [
      'Understand personal budgeting',
      'Learn banking & credit basics',
      'Make informed financial decisions'
    ],
    modules: [
      'Basics of Money Management',
      'Budgeting & Tracking Expenses',
      'Credit, Loans, and Interest',
      'Saving & Investing',
      'Taxes & Insurance',
      'Financial Planning Tools'
    ],
    resources: {
      books: ['Rich Dad Poor Dad by Robert Kiyosaki'],
      tools: ['Mint', 'PocketGuard'],
      platforms: ['Investopedia', 'Khan Academy']
    }
  },
  {
    id: 5,
    title: 'Medical Terminology',
    description: 'Learn the vocabulary used in healthcare, anatomy, and clinical communication.',
    overview: 'Learn the vocabulary used in healthcare, anatomy, and clinical communication.',
    level: 'Intermediate',
    duration: '5 weeks',
    students: 450,
    category: 'Medical',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?auto=format&fit=crop&w=500&q=60',
    learningObjectives: [
      'Break down medical words',
      'Understand body systems',
      'Communicate medical information clearly'
    ],
    modules: [
      'Introduction to Medical Language',
      'Prefixes, Suffixes, Root Words',
      'Body Systems Terminology',
      'Clinical Procedures & Terms',
      'Common Abbreviations',
      'Patient Communication'
    ],
    resources: {
      books: ['Medical Terminology Made Easy'],
      platforms: ['Quizlet', 'MedlinePlus'],
      tools: ['Flashcards', 'Online quizzes']
    }
  },
  {
    id: 6,
    title: 'Architectural Design Basics',
    description: 'Explores basic principles of architecture and design thinking.',
    overview: 'Explores basic principles of architecture and design thinking.',
    level: 'Beginner',
    duration: '9 weeks',
    students: 320,
    category: 'Architecture',
    image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=500&q=60',
    learningObjectives: [
      'Understand basic architectural elements',
      'Read and interpret blueprints',
      'Use simple design software'
    ],
    modules: [
      'Introduction to Architecture',
      'Design Principles and Concepts',
      'Reading Plans and Elevations',
      'Materials and Construction Basics',
      'CAD Software Introduction (SketchUp)',
      'Portfolio Project'
    ],
    resources: {
      tools: ['SketchUp Free'],
      books: ['Architecture: Form, Space, and Order by Francis Ching'],
      sites: ['ArchDaily', 'DesignBoom']
    }
  },
  {
    id: 7,
    title: 'Digital Art Fundamentals',
    description: 'Foundational course on visual art and design techniques.',
    overview: 'Foundational course on visual art and design techniques.',
    level: 'Beginner',
    duration: '7 weeks',
    students: 580,
    category: 'Art & Design',
    image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?auto=format&fit=crop&w=500&q=60',
    learningObjectives: [
      'Understand design elements (line, shape, color)',
      'Practice drawing and digital design',
      'Create original artworks'
    ],
    modules: [
      'Introduction to Art and Design',
      'Elements & Principles of Design',
      'Drawing & Composition',
      'Color Theory',
      'Digital Tools (Canva, Adobe Express)',
      'Creative Project'
    ],
    resources: {
      tools: ['Canva', 'Adobe Express'],
      books: ['Design Basics by David A. Lauer'],
      platforms: ['Skillshare']
    }
  },
  {
    id: 8,
    title: 'Job Search Strategies',
    description: 'Prepares learners to search, apply, and interview for jobs successfully.',
    overview: 'Prepares learners to search, apply, and interview for jobs successfully.',
    level: 'Intermediate',
    duration: '4 weeks',
    students: 950,
    category: 'Marketing',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=500&q=60',
    learningObjectives: [
      'Create professional resumes and cover letters',
      'Use job platforms effectively',
      'Master interview techniques'
    ],
    modules: [
      'Resume and Cover Letter Writing',
      'Online Job Portals (LinkedIn, Indeed)',
      'Job Searching Strategies',
      'Preparing for Interviews',
      'Networking Basics',
      'Follow-up & Negotiation'
    ],
    resources: {
      tools: ['Resume.io', 'Zety'],
      books: ['What Color is Your Parachute?'],
      platforms: ['LinkedIn Learning']
    }
  },
  {
    id: 9,
    title: 'Professional Networking',
    description: 'Learn how to build professional relationships for career success.',
    overview: 'Learn how to build professional relationships for career success.',
    level: 'Intermediate',
    duration: '5 weeks',
    students: 700,
    category: 'Marketing',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=500&q=60',
    learningObjectives: [
      'Use LinkedIn and networking tools',
      'Build lasting career connections',
      'Attend events and follow up professionally'
    ],
    modules: [
      'Introduction to Networking',
      'Crafting Elevator Pitches',
      'LinkedIn Profile Optimization',
      'Reaching Out and Following Up',
      'Informational Interviews',
      'Networking Events and Etiquette'
    ],
    resources: {
      books: ['Never Eat Alone by Keith Ferrazzi'],
      platforms: ['LinkedIn'],
      tools: ['Hunter.io', 'Calendly']
    }
  },
  {
    id: 10,
    title: 'Accounting Basics',
    description: 'Understand key accounting principles for personal and business finances.',
    overview: 'Understand key accounting principles for personal and business finances.',
    level: 'Beginner',
    duration: '6 weeks',
    students: 420,
    category: 'Accounting',
    image: 'https://images.unsplash.com/photo-1554224154-26032cdc-3045?auto=format&fit=crop&w=500&q=60',
    learningObjectives: [
      'Understand financial documents',
      'Perform basic bookkeeping',
      'Analyze simple financial statements'
    ],
    modules: [
      'Introduction to Accounting',
      'Debits, Credits, and the Accounting Cycle',
      'Income Statements & Balance Sheets',
      'Bookkeeping Tools (Excel, QuickBooks)',
      'Cash Flow Management',
      'Practice Exercises'
    ],
    resources: {
      books: ['Accounting Made Simple by Mike Piper'],
      tools: ['Wave', 'QuickBooks'],
      platforms: ['Khan Academy']
    }
  },
  {
    id: 11,
    title: 'Basic English Communication',
    description: 'Covers practical English speaking, listening, reading, and writing for everyday use.',
    overview: 'Covers practical English speaking, listening, reading, and writing for everyday use.',
    level: 'Beginner',
    duration: '8 weeks',
    students: 1200,
    category: 'Language',
    image: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=500&q=60',
    learningObjectives: [
      'Improve grammar and vocabulary',
      'Practice real-world conversations',
      'Build confidence in public speaking'
    ],
    modules: [
      'Greetings and Introductions',
      'Everyday Conversations',
      'Grammar Essentials',
      'Reading Comprehension',
      'Writing Basics (Emails, Messages)',
      'Speaking Practice and Presentations'
    ],
    resources: {
      tools: ['Duolingo', 'BBC Learning English'],
      books: ['English Grammar in Use by Raymond Murphy'],
      platforms: ['Memrise', 'ESL Lab']
    }
  },
  {
    id: 12,
    title: 'Leadership Skills',
    description: 'Teaches key leadership theories and practices for professional and personal growth.',
    overview: 'Teaches key leadership theories and practices for professional and personal growth.',
    level: 'Advanced',
    duration: '7 weeks',
    students: 980,
    category: 'Business',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=500&q=60',
    learningObjectives: [
      'Understand leadership styles',
      'Develop team management skills',
      'Practice decision-making and empathy'
    ],
    modules: [
      'Introduction to Leadership',
      'Leadership Styles & Theories',
      'Communication & Emotional Intelligence',
      'Team Building',
      'Conflict Resolution',
      'Leading Projects'
    ],
    resources: {
      books: ['Leaders Eat Last by Simon Sinek'],
      platforms: ['Coursera', 'TED Talks'],
      tools: ['Notion', 'Miro']
    }
  }
];

export default allCourses; 