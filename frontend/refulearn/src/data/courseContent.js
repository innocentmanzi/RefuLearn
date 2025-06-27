// Detailed course content with modules, videos, resources, and embedded quizzes/assessments
export const courseModules = {
  'Data Analysis Fundamentals': [
    {
      id: 1,
      title: 'Introduction to Data Analysis',
      content: 'Data analysis is the process of inspecting, cleaning, transforming, and modeling data to discover useful information, draw conclusions, and support decision-making. In this module, you\'ll learn the fundamental concepts and workflow of data analysis.',
      video: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      resources: [
        { name: 'Data Analysis Handbook', link: '#', type: 'pdf' }
      ],
      quiz: [
        {
          question: 'What is the first step in the data analysis process?',
          options: ['Data cleaning', 'Data collection', 'Data visualization', 'Data interpretation'],
          answer: 1,
          explanation: 'Data collection is the first step in the data analysis process, followed by data cleaning, analysis, and interpretation.'
        }
      ]
    },
    {
      id: 2,
      title: 'Excel for Beginners',
      content: 'Microsoft Excel is one of the most powerful and widely-used tools for data analysis. This module covers essential Excel functions and features for data manipulation and analysis.',
      video: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      resources: [
        { name: 'Excel Cheat Sheet', link: '#', type: 'pdf' }
      ],
      quiz: [
        {
          question: 'Which Excel function is used to find the average of a range of cells?',
          options: ['SUM()', 'AVERAGE()', 'COUNT()', 'MAX()'],
          answer: 1,
          explanation: 'The AVERAGE() function calculates the arithmetic mean of a range of cells in Excel.'
        }
      ]
    },
    {
      id: 3,
      title: 'Introduction to Python for Data',
      content: 'Python has become the go-to programming language for data analysis due to its simplicity and powerful libraries. This module introduces Python basics and key data analysis libraries.',
      video: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      resources: [
        { name: 'Python for Data Analysis Guide', link: '#', type: 'pdf' }
      ],
      quiz: [
        {
          question: 'Which Python library is most commonly used for data analysis?',
          options: ['NumPy', 'Pandas', 'Matplotlib', 'Scikit-learn'],
          answer: 1,
          explanation: 'Pandas is the most commonly used Python library for data manipulation and analysis.'
        }
      ]
    },
    {
      id: 4,
      title: 'Data Cleaning Techniques',
      content: 'Data cleaning is a crucial step in the data analysis process. This module covers techniques for identifying and fixing data quality issues.',
      video: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      resources: [
        { name: 'Data Cleaning Best Practices', link: '#', type: 'pdf' }
      ],
      quiz: [
        {
          question: 'What is the primary purpose of data cleaning?',
          options: ['To make data look better', 'To remove all data', 'To ensure data quality and accuracy', 'To reduce file size'],
          answer: 2,
          explanation: 'Data cleaning ensures data quality and accuracy by identifying and fixing errors, inconsistencies, and missing values.'
        }
      ]
    },
    {
      id: 5,
      title: 'SQL for Data Exploration',
      content: 'SQL (Structured Query Language) is essential for extracting and analyzing data from databases. This module covers SQL fundamentals for data exploration.',
      video: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      resources: [
        { name: 'SQL Reference Guide', link: '#', type: 'pdf' }
      ],
      quiz: [
        {
          question: 'What type of chart is best for showing trends over time?',
          options: ['Pie chart', 'Bar chart', 'Line chart', 'Scatter plot'],
          answer: 2,
          explanation: 'Line charts are ideal for showing trends and changes over time.'
        }
      ]
    },
    {
      id: 6,
      title: 'Data Visualization (Excel & Python)',
      content: 'Effective data visualization is key to communicating insights. This module covers creating compelling charts and graphs using both Excel and Python.',
      video: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      resources: [
        { name: 'Data Visualization Guide', link: '#', type: 'pdf' }
      ],
      quiz: []
    }
  ],
  'Digital Skills Fundamentals': [
    {
      id: 1,
      title: 'Computer Basics',
      objectives: [
        'Identify main computer hardware components',
        'Understand operating system basics',
        'Practice file management and organization',
        'Apply basic troubleshooting techniques'
      ],
      content: 'This module introduces the essential parts of a computer, operating systems, and basic troubleshooting.',
      resources: [
        { name: 'Computer Basics Guide', link: 'https://example.com/computer-basics-guide.pdf', type: 'pdf' },
        { name: 'Hardware Components Article', link: 'https://example.com/hardware-article', type: 'article' }
      ],
      videos: [
        { title: 'Computer Hardware Explained', link: 'https://www.youtube.com/watch?v=1zR7Qqk0q6w' },
        { title: 'Operating System Basics', link: 'https://www.youtube.com/watch?v=2eebptXfEvw' }
      ],
      assignments: [
        { title: 'Identify Your Computer Parts', link: 'https://external-assignment.com/assignment1' },
        { title: 'File Management Practice', link: 'https://external-assignment.com/assignment2' }
      ],
      activities: [
        { title: 'Discussion: What was your first computer experience?' }
      ],
      quizzes: [
        { title: 'Quiz: Computer Hardware', link: 'https://external-quiz.com/quiz1' },
        { title: 'Quiz: Operating Systems', link: 'https://external-quiz.com/quiz2' }
      ],
      quiz: [
        {
          question: 'Which of these is NOT a computer hardware component?',
          options: ['CPU', 'RAM', 'Monitor', 'Spreadsheet'],
          answer: 3,
          explanation: 'A spreadsheet is software, not hardware.'
        }
      ]
    },
    {
      id: 2,
      title: 'Using Microsoft Word, Excel, PowerPoint',
      objectives: [
        'Create and format documents in Word',
        'Build spreadsheets and use formulas in Excel',
        'Design presentations in PowerPoint',
        'Collaborate using Office tools'
      ],
      content: 'Learn the basics of Microsoft Office tools for productivity and collaboration.',
      video: 'https://www.youtube.com/embed/2eebptXfEvw',
      resources: [
        { name: 'Microsoft Office Guide', link: '#', type: 'pdf' }
      ],
      assignments: [
        { title: 'Create a Resume in Word', description: 'Use a template or start from scratch to create a professional resume.' },
        { title: 'Budget Spreadsheet', description: 'Track your weekly expenses in Excel.' }
      ],
      activities: [
        { title: 'Peer Review: Share your presentation and get feedback.' }
      ],
      quiz: [
        {
          question: 'Which Office tool is best for creating presentations?',
          options: ['Word', 'Excel', 'PowerPoint', 'Access'],
          answer: 2,
          explanation: 'PowerPoint is designed for presentations.'
        }
      ]
    },
    {
      id: 3,
      title: 'Email & Internet Navigation',
      objectives: [
        'Send and receive emails',
        'Practice email etiquette',
        'Browse the web safely',
        'Use search engines effectively'
      ],
      content: 'Master the basics of email communication and safe, effective web browsing.',
      video: 'https://www.youtube.com/embed/8O8R6Fzj3zY',
      resources: [
        { name: 'Email Etiquette Guide', link: '#', type: 'pdf' }
      ],
      assignments: [
        { title: 'Professional Email', description: 'Write and send a professional email to your instructor.' }
      ],
      activities: [
        { title: 'Discussion: Share a time you found useful information online.' }
      ],
      quiz: [
        {
          question: 'What should you do if you receive a suspicious email?',
          options: ['Click all links', 'Reply immediately', 'Delete it without opening', 'Forward to friends'],
          answer: 2,
          explanation: 'Delete suspicious emails without opening.'
        }
      ]
    },
    {
      id: 4,
      title: 'Google Workspace Tools',
      objectives: [
        'Create and share documents in Google Docs',
        'Collaborate in real time',
        'Organize files in Google Drive',
        'Use Google Calendar for scheduling'
      ],
      content: 'Explore Google Workspace for cloud-based productivity and collaboration.',
      video: 'https://www.youtube.com/embed/ElC8gi3a2dM',
      resources: [
        { name: 'Google Workspace Guide', link: '#', type: 'pdf' }
      ],
      assignments: [
        { title: 'Collaborative Document', description: 'Work with a partner to create and edit a shared Google Doc.' }
      ],
      activities: [
        { title: 'Activity: Organize your Google Drive folders.' }
      ],
      quiz: [
        {
          question: 'Which Google tool is best for spreadsheets?',
          options: ['Docs', 'Sheets', 'Slides', 'Forms'],
          answer: 1,
          explanation: 'Google Sheets is for spreadsheets.'
        }
      ]
    },
    {
      id: 5,
      title: 'Digital Safety & Cybersecurity',
      objectives: [
        'Create strong passwords',
        'Recognize phishing attempts',
        'Protect your privacy online',
        'Understand basic cybersecurity threats'
      ],
      content: 'Learn how to stay safe online and protect your digital identity.',
      video: 'https://www.youtube.com/embed/2z0R8lFQnTY',
      resources: [
        { name: 'Cybersecurity Guide', link: '#', type: 'pdf' }
      ],
      assignments: [
        { title: 'Password Audit', description: 'Check your passwords and update any weak ones.' }
      ],
      activities: [
        { title: 'Discussion: Share a tip for staying safe online.' }
      ],
      quiz: [
        {
          question: 'Which of the following is a good password practice?',
          options: ['Using your name', 'Using the same password everywhere', 'Using a mix of letters, numbers, and symbols', 'Writing passwords on paper'],
          answer: 2,
          explanation: 'A mix of letters, numbers, and symbols is best.'
        }
      ]
    },
    {
      id: 6,
      title: 'Cloud Storage and Collaboration',
      objectives: [
        'Use cloud storage platforms',
        'Share files securely',
        'Collaborate on projects remotely',
        'Understand version control basics'
      ],
      content: 'Discover how to use cloud storage and collaboration tools for modern work.',
      video: 'https://www.youtube.com/embed/1KqFQ8Q5v1k',
      resources: [
        { name: 'Cloud Tools Guide', link: '#', type: 'pdf' }
      ],
      assignments: [
        { title: 'Group Project', description: 'Work in a group to complete a project using Google Drive and Trello.' }
      ],
      activities: [
        { title: 'Activity: Try a video call with a classmate.' }
      ],
      quiz: [
        {
          question: 'What is the main advantage of cloud storage?',
          options: ['It\'s always free', 'Access files from anywhere', 'It\'s faster than local storage', 'It never needs maintenance'],
          answer: 1,
          explanation: 'Cloud storage allows access from anywhere.'
        }
      ]
    }
  ],
  'Advanced Programming': [
    {
      id: 1,
      title: 'Advanced Python or JavaScript',
      content: 'Deepen your understanding of advanced programming concepts in Python or JavaScript, including closures, decorators, and async programming.',
      video: 'https://www.youtube.com/embed/Oe421EPjeBE',
      resources: [
        { name: 'Automate the Boring Stuff with Python', link: 'https://automatetheboringstuff.com/', type: 'book' }
      ],
      quiz: [
        {
          question: 'What is a closure in programming?',
          options: ['A function with no parameters', 'A function that remembers its lexical scope', 'A class method', 'A global variable'],
          answer: 1,
          explanation: 'A closure is a function that retains access to its lexical scope even when executed outside that scope.'
        }
      ]
    },
    {
      id: 2,
      title: 'Object-Oriented Programming',
      content: 'Learn about classes, inheritance, encapsulation, and polymorphism in OOP.',
      video: 'https://www.youtube.com/embed/SS-9y0H3Si8',
      resources: [
        { name: 'OOP Concepts', link: 'https://www.geeksforgeeks.org/object-oriented-programming-oops-concept-in-java/', type: 'article' }
      ],
      quiz: [
        {
          question: 'Which of the following is NOT an OOP principle?',
          options: ['Encapsulation', 'Polymorphism', 'Recursion', 'Inheritance'],
          answer: 2,
          explanation: 'Recursion is a programming technique, not an OOP principle.'
        }
      ]
    },
    {
      id: 3,
      title: 'Data Structures & Algorithms',
      content: 'Explore advanced data structures (trees, graphs) and algorithms (sorting, searching, recursion).',
      video: 'https://www.youtube.com/embed/8hly31xKli0',
      resources: [
        { name: 'Data Structures Visualizations', link: 'https://visualgo.net/en', type: 'site' }
      ],
      quiz: [
        {
          question: 'Which data structure is best for implementing a queue?',
          options: ['Array', 'Stack', 'Linked List', 'Tree'],
          answer: 2,
          explanation: 'A linked list is commonly used to implement a queue.'
        }
      ]
    }
  ],
  'Financial Literacy': [
    {
      id: 1,
      title: 'Basics of Money Management',
      content: 'Understand the fundamentals of managing money, including budgeting, saving, and spending wisely.',
      video: 'https://www.youtube.com/embed/vz6z6q8bQw8',
      resources: [
        { name: 'Rich Dad Poor Dad', link: 'https://www.richdad.com/', type: 'book' }
      ],
      quiz: [
        {
          question: 'What is the 50/30/20 rule in budgeting?',
          options: ['50% needs, 30% wants, 20% savings', '50% savings, 30% needs, 20% wants', '50% wants, 30% savings, 20% needs', 'None of the above'],
          answer: 0,
          explanation: 'The 50/30/20 rule allocates 50% to needs, 30% to wants, and 20% to savings.'
        }
      ]
    },
    {
      id: 2,
      title: 'Credit, Loans, and Interest',
      content: 'Learn how credit works, how loans are structured, and how interest is calculated.',
      video: 'https://www.youtube.com/embed/8XGQGhli0IY',
      resources: [
        { name: 'Investopedia: Credit', link: 'https://www.investopedia.com/terms/c/credit.asp', type: 'site' }
      ],
      quiz: [
        {
          question: 'What does APR stand for?',
          options: ['Annual Percentage Rate', 'Annual Payment Rate', 'Average Percentage Rate', 'Annual Principal Rate'],
          answer: 0,
          explanation: 'APR stands for Annual Percentage Rate.'
        }
      ]
    }
  ],
  'Medical Terminology': [
    {
      id: 1,
      title: 'Introduction to Medical Language',
      content: 'Learn the basics of medical language, including roots, prefixes, and suffixes.',
      video: 'https://www.youtube.com/embed/8lL4ZbB1EFA',
      resources: [
        { name: 'Medical Terminology Made Easy', link: 'https://www.amazon.com/Medical-Terminology-Made-Easy/dp/0723438837', type: 'book' }
      ],
      quiz: [
        {
          question: 'What does the prefix "cardio-" refer to?',
          options: ['Lungs', 'Heart', 'Brain', 'Liver'],
          answer: 1,
          explanation: '"Cardio-" refers to the heart.'
        }
      ]
    },
    {
      id: 2,
      title: 'Body Systems Terminology',
      content: 'Understand the terminology related to different body systems (e.g., cardiovascular, respiratory).',
      video: 'https://www.youtube.com/embed/1XyA4dXk4lA',
      resources: [
        { name: 'MedlinePlus', link: 'https://medlineplus.gov/', type: 'site' }
      ],
      quiz: [
        {
          question: 'Which system does the term "neuro-" relate to?',
          options: ['Digestive', 'Nervous', 'Muscular', 'Skeletal'],
          answer: 1,
          explanation: '"Neuro-" relates to the nervous system.'
        }
      ]
    }
  ],
  'Architectural Design Basics': [
    {
      id: 1,
      title: 'Introduction to Architecture',
      content: 'Explore the history and principles of architecture, including famous styles and architects.',
      video: 'https://www.youtube.com/embed/3uEtdDvK6Xo',
      resources: [
        { name: 'Architecture: Form, Space, and Order', link: 'https://www.amazon.com/Architecture-Form-Space-Order-4th/dp/1118745086', type: 'book' }
      ],
      quiz: [
        {
          question: 'Who is known as the father of modern architecture?',
          options: ['Frank Lloyd Wright', 'Le Corbusier', 'I.M. Pei', 'Zaha Hadid'],
          answer: 1,
          explanation: 'Le Corbusier is often called the father of modern architecture.'
        }
      ]
    },
    {
      id: 2,
      title: 'Reading Plans and Elevations',
      content: 'Learn how to read and interpret architectural plans and elevation drawings.',
      video: 'https://www.youtube.com/embed/1QX6h8Fz1y8',
      resources: [
        { name: 'ArchDaily', link: 'https://www.archdaily.com/', type: 'site' }
      ],
      quiz: [
        {
          question: 'What does an elevation drawing show?',
          options: ['A floor plan', 'A side view of a building', 'A roof plan', 'A site plan'],
          answer: 1,
          explanation: 'An elevation drawing shows a side view of a building.'
        }
      ]
    }
  ],
  'Digital Art Fundamentals': [
    {
      id: 1,
      title: 'Elements & Principles of Design',
      content: 'Understand the basic elements (line, shape, color) and principles (balance, contrast) of design.',
      video: 'https://www.youtube.com/embed/3eLfn7Ewx_s',
      resources: [
        { name: 'Design Basics by David A. Lauer', link: 'https://www.amazon.com/Design-Basics-David-Lauer/dp/1285858220', type: 'book' }
      ],
      quiz: [
        {
          question: 'Which is NOT a principle of design?',
          options: ['Balance', 'Contrast', 'Harmony', 'Multiplication'],
          answer: 3,
          explanation: 'Multiplication is not a principle of design.'
        }
      ]
    },
    {
      id: 2,
      title: 'Digital Tools (Canva, Adobe Express)',
      content: 'Learn to use popular digital art tools for creating graphics and layouts.',
      video: 'https://www.youtube.com/embed/2VbWnG9A0tA',
      resources: [
        { name: 'Canva', link: 'https://www.canva.com/', type: 'site' }
      ],
      quiz: [
        {
          question: 'Which tool is best for quick online graphic design?',
          options: ['Photoshop', 'Canva', 'Illustrator', 'Paint'],
          answer: 1,
          explanation: 'Canva is a popular online tool for quick graphic design.'
        }
      ]
    }
  ],
  'Job Search Strategies': [
    {
      id: 1,
      title: 'Resume and Cover Letter Writing',
      content: 'Learn how to write effective resumes and cover letters that get noticed by employers.',
      video: 'https://www.youtube.com/embed/5Qj8p-PEwbI',
      resources: [
        { name: 'Resume.io', link: 'https://resume.io/', type: 'site' }
      ],
      quiz: [
        {
          question: 'What is the main purpose of a cover letter?',
          options: ['To summarize your resume', 'To introduce yourself and explain your interest', 'To list references', 'To show your salary expectations'],
          answer: 1,
          explanation: 'A cover letter introduces you and explains your interest in the job.'
        }
      ]
    },
    {
      id: 2,
      title: 'Job Searching Strategies',
      content: 'Explore effective job search techniques, including networking and using online platforms.',
      video: 'https://www.youtube.com/embed/1mHjMNZZvFo',
      resources: [
        { name: 'LinkedIn Learning', link: 'https://www.linkedin.com/learning/', type: 'site' }
      ],
      quiz: [
        {
          question: 'Which platform is best for professional job searching?',
          options: ['Facebook', 'LinkedIn', 'Instagram', 'Reddit'],
          answer: 1,
          explanation: 'LinkedIn is the leading platform for professional job searching.'
        }
      ]
    }
  ],
  'Professional Networking': [
    {
      id: 1,
      title: 'Introduction to Networking',
      content: 'Understand the basics of professional networking and why it matters for your career.',
      video: 'https://www.youtube.com/embed/2z5QwQXw2J8',
      resources: [
        { name: 'Never Eat Alone by Keith Ferrazzi', link: 'https://www.amazon.com/Never-Eat-Alone-Expanded-Updated/dp/0385346654', type: 'book' }
      ],
      quiz: [
        {
          question: 'What is the main benefit of professional networking?',
          options: ['Making friends', 'Building career connections', 'Finding hobbies', 'Learning a language'],
          answer: 1,
          explanation: 'Professional networking helps you build career connections.'
        }
      ]
    },
    {
      id: 2,
      title: 'LinkedIn Profile Optimization',
      content: 'Learn how to create and optimize your LinkedIn profile for networking and job searching.',
      video: 'https://www.youtube.com/embed/0u-eU2lQOZk',
      resources: [
        { name: 'LinkedIn', link: 'https://www.linkedin.com/', type: 'site' }
      ],
      quiz: [
        {
          question: 'What is most important for a LinkedIn profile?',
          options: ['Profile photo', 'Number of connections', 'Birthday', 'Favorite color'],
          answer: 0,
          explanation: 'A professional profile photo is very important for LinkedIn.'
        }
      ]
    }
  ],
  'Accounting Basics': [
    {
      id: 1,
      title: 'Introduction to Accounting',
      content: 'Learn the basics of accounting, including key terms and the accounting cycle.',
      video: 'https://www.youtube.com/embed/7v6hZ6a2R3A',
      resources: [
        { name: 'Accounting Made Simple by Mike Piper', link: 'https://www.amazon.com/Accounting-Made-Simple-Explained-Understood/dp/1623153576', type: 'book' }
      ],
      quiz: [
        {
          question: 'What is the accounting equation?',
          options: ['Assets = Liabilities + Equity', 'Assets = Revenue - Expenses', 'Assets = Liabilities - Equity', 'Assets = Cash + Inventory'],
          answer: 0,
          explanation: 'The accounting equation is Assets = Liabilities + Equity.'
        }
      ]
    },
    {
      id: 2,
      title: 'Bookkeeping Tools (Excel, QuickBooks)',
      content: 'Explore popular bookkeeping tools and how to use them for managing finances.',
      video: 'https://www.youtube.com/embed/1p8sE5l5U2A',
      resources: [
        { name: 'QuickBooks', link: 'https://quickbooks.intuit.com/', type: 'site' }
      ],
      quiz: [
        {
          question: 'Which tool is commonly used for small business bookkeeping?',
          options: ['Photoshop', 'QuickBooks', 'Word', 'PowerPoint'],
          answer: 1,
          explanation: 'QuickBooks is a popular bookkeeping tool for small businesses.'
        }
      ]
    }
  ],
  'Basic English Communication': [
    {
      id: 1,
      title: 'Greetings and Introductions',
      content: 'Practice common greetings and introductions in English for everyday situations.',
      video: 'https://www.youtube.com/embed/WRy1pEc7Q4Y',
      resources: [
        { name: 'English Grammar in Use by Raymond Murphy', link: 'https://www.amazon.com/English-Grammar-Use-Raymond-Murphy/dp/1108457657', type: 'book' }
      ],
      quiz: [
        {
          question: 'Which of the following is a greeting in English?',
          options: ['Bonjour', 'Hello', 'Ciao', 'Hola'],
          answer: 1,
          explanation: '"Hello" is a common English greeting.'
        }
      ]
    },
    {
      id: 2,
      title: 'Grammar Essentials',
      content: 'Learn the basics of English grammar, including tenses, nouns, and verbs.',
      video: 'https://www.youtube.com/embed/eIho2S0ZahI',
      resources: [
        { name: 'BBC Learning English', link: 'https://www.bbc.co.uk/learningenglish/', type: 'site' }
      ],
      quiz: [
        {
          question: 'What is the past tense of "go"?',
          options: ['Goed', 'Went', 'Go', 'Gone'],
          answer: 1,
          explanation: 'The past tense of "go" is "went".'
        }
      ]
    }
  ],
  'Leadership Skills': [
    {
      id: 1,
      title: 'Introduction to Leadership',
      content: 'Explore different leadership styles and what makes a great leader.',
      video: 'https://www.youtube.com/embed/5MgBikgcWnY',
      resources: [
        { name: 'Leaders Eat Last by Simon Sinek', link: 'https://www.amazon.com/Leaders-Eat-Last-Together-Others/dp/1591848016', type: 'book' }
      ],
      quiz: [
        {
          question: 'Which is a leadership style?',
          options: ['Democratic', 'Chaotic', 'Lazy', 'Silent'],
          answer: 0,
          explanation: 'Democratic is a recognized leadership style.'
        }
      ]
    },
    {
      id: 2,
      title: 'Team Building',
      content: 'Learn how to build and manage effective teams as a leader.',
      video: 'https://www.youtube.com/embed/HAnw168huqA',
      resources: [
        { name: 'TED Talks: Leadership', link: 'https://www.ted.com/topics/leadership', type: 'site' }
      ],
      quiz: [
        {
          question: 'What is important for team success?',
          options: ['Clear communication', 'Ignoring feedback', 'Micromanaging', 'Blaming others'],
          answer: 0,
          explanation: 'Clear communication is key to team success.'
        }
      ]
    }
  ]
}; 