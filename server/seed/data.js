// Demo catalog used to seed a fresh database.
const V = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/';
const CLIPS = [
  'ForBiggerBlazes',
  'ForBiggerEscapes',
  'ForBiggerFun',
  'ForBiggerJoyrides',
  'ForBiggerMeltdowns',
].map((n) => `${V}${n}.mp4`);
let clip = 0;
const video = () => CLIPS[clip++ % CLIPS.length];

export const CATEGORIES = [
  { name: 'Web Development', slug: 'web-development', icon: 'Code2' },
  { name: 'Data Science', slug: 'data-science', icon: 'BarChart3' },
  { name: 'AI & Machine Learning', slug: 'ai-machine-learning', icon: 'Brain' },
  { name: 'Design', slug: 'design', icon: 'Palette' },
  { name: 'Business', slug: 'business', icon: 'Briefcase' },
  { name: 'Marketing', slug: 'marketing', icon: 'Megaphone' },
];

export const EXTRA_INSTRUCTORS = [
  {
    key: 'david',
    name: 'David Chen',
    email: 'david.chen@learnhub.dev',
    headline: 'Data Scientist at a Fortune 500',
    bio: 'David builds ML systems for a living and loves making data science approachable.',
  },
  {
    key: 'priya',
    name: 'Priya Sharma',
    email: 'priya.sharma@learnhub.dev',
    headline: 'Lead Product Designer',
    bio: 'Priya has designed products used by millions and mentors designers worldwide.',
  },
  {
    key: 'marcus',
    name: 'Marcus Johnson',
    email: 'marcus.johnson@learnhub.dev',
    headline: 'Growth Marketer & Founder',
    bio: 'Marcus has scaled three startups and teaches practical, no-fluff marketing.',
  },
];

// Lessons: [title, minutes, isPreview?]
const lessons = (rows) =>
  rows.map(([title, duration, isPreview = false]) => ({
    title,
    duration,
    isPreview,
    videoUrl: video(),
    description: `In this lesson we cover ${title.toLowerCase()} with practical, real-world examples.`,
  }));

export const COURSES = [
  {
    instructor: 'sarah',
    category: 'web-development',
    title: 'The Complete MERN Stack Bootcamp',
    subtitle: 'Build full-stack apps with MongoDB, Express, React and Node.js from scratch',
    level: 'Beginner',
    price: 49.99,
    theme: 0,
    rating: 4.8,
    ratingCount: 1284,
    outcomes: [
      'Build REST APIs with Express and Node.js',
      'Model data with MongoDB & Mongoose',
      'Create modern UIs with React hooks',
      'Add JWT authentication and deploy to the cloud',
    ],
    requirements: ['Basic HTML, CSS and JavaScript', 'A computer with internet access'],
    sections: [
      {
        title: 'Getting Started',
        lessons: lessons([
          ['Welcome to the bootcamp', 4, true],
          ['How the MERN stack fits together', 9, true],
          ['Setting up your environment', 12],
        ]),
      },
      {
        title: 'Backend with Node & Express',
        lessons: lessons([
          ['Your first Express server', 14],
          ['Routing and middleware', 18],
          ['Connecting MongoDB with Mongoose', 21],
        ]),
      },
      {
        title: 'Frontend with React',
        lessons: lessons([
          ['Components, props and state', 16],
          ['Fetching data from your API', 19],
          ['React Router and protected pages', 15],
        ]),
      },
      {
        title: 'Authentication & Deployment',
        lessons: lessons([
          ['JWT authentication end to end', 24],
          ['Deploying to the cloud', 13],
        ]),
      },
    ],
  },
  {
    instructor: 'sarah',
    category: 'web-development',
    title: 'Modern JavaScript: ES6 to ES2024',
    subtitle: 'Master the JavaScript every modern developer needs to know',
    level: 'All levels',
    price: 0,
    theme: 1,
    rating: 4.7,
    ratingCount: 3410,
    outcomes: [
      'Write clean modern JavaScript',
      'Understand async/await and promises',
      'Use modules, classes and destructuring',
    ],
    requirements: ['No prior experience needed'],
    sections: [
      {
        title: 'Language Fundamentals',
        lessons: lessons([
          ['Variables, scope and hoisting', 10, true],
          ['Arrow functions and this', 12],
        ]),
      },
      {
        title: 'Working with Data',
        lessons: lessons([
          ['Destructuring and spread', 9],
          ['Array methods you will use daily', 15],
        ]),
      },
      {
        title: 'Asynchronous JavaScript',
        lessons: lessons([
          ['Promises explained', 14],
          ['async / await in practice', 13],
        ]),
      },
    ],
  },
  {
    instructor: 'sarah',
    category: 'web-development',
    title: 'React & Tailwind CSS: Build Beautiful UIs',
    subtitle: 'Design and ship polished, responsive interfaces fast',
    level: 'Intermediate',
    price: 34.99,
    theme: 2,
    rating: 4.6,
    ratingCount: 642,
    outcomes: [
      'Build responsive layouts with Tailwind',
      'Create reusable React components',
      'Ship a production-ready dashboard',
    ],
    requirements: ['Basic React knowledge'],
    sections: [
      {
        title: 'Tailwind Essentials',
        lessons: lessons([
          ['Utility-first CSS mindset', 8, true],
          ['Responsive design with breakpoints', 11],
        ]),
      },
      {
        title: 'Component Patterns',
        lessons: lessons([
          ['Building a design system', 17],
          ['Forms, modals and toasts', 16],
        ]),
      },
      {
        title: 'Project: Admin Dashboard',
        lessons: lessons([
          ['Layout and navigation', 18],
          ['Charts and data tables', 20],
        ]),
      },
    ],
  },
  {
    instructor: 'david',
    category: 'data-science',
    title: 'Python for Data Analysis',
    subtitle: 'Analyze real datasets with Python, Pandas and visualization',
    level: 'Beginner',
    price: 39.99,
    theme: 3,
    rating: 4.7,
    ratingCount: 2105,
    outcomes: [
      'Clean and transform data with Pandas',
      'Create insightful charts',
      'Answer business questions with data',
    ],
    requirements: ['No programming experience required'],
    sections: [
      {
        title: 'Python Basics',
        lessons: lessons([
          ['Why Python for data?', 6, true],
          ['Variables, lists and dictionaries', 14],
        ]),
      },
      {
        title: 'Pandas in Depth',
        lessons: lessons([
          ['DataFrames 101', 16],
          ['Cleaning messy data', 19],
          ['Grouping and aggregation', 17],
        ]),
      },
      {
        title: 'Visualization',
        lessons: lessons([
          ['Charts with Matplotlib', 13],
          ['Telling stories with data', 11],
        ]),
      },
    ],
  },
  {
    instructor: 'david',
    category: 'ai-machine-learning',
    title: 'Machine Learning A–Z: Hands-On',
    subtitle: 'From linear regression to neural networks, with real projects',
    level: 'Intermediate',
    price: 59.99,
    theme: 4,
    rating: 4.9,
    ratingCount: 987,
    outcomes: [
      'Understand core ML algorithms',
      'Train and evaluate models',
      'Build a neural network from scratch',
    ],
    requirements: ['Basic Python', 'High-school math'],
    sections: [
      {
        title: 'Foundations',
        lessons: lessons([
          ['What is machine learning?', 9, true],
          ['Training vs. test data', 11],
        ]),
      },
      {
        title: 'Supervised Learning',
        lessons: lessons([
          ['Linear regression', 18],
          ['Classification with logistic regression', 17],
          ['Decision trees and random forests', 20],
        ]),
      },
      {
        title: 'Deep Learning',
        lessons: lessons([
          ['Neural networks intuition', 15],
          ['Building your first network', 22],
        ]),
      },
    ],
  },
  {
    instructor: 'priya',
    category: 'design',
    title: 'UI/UX Design Masterclass with Figma',
    subtitle: 'Design user-friendly apps and websites from research to prototype',
    level: 'Beginner',
    price: 44.99,
    theme: 5,
    rating: 4.8,
    ratingCount: 1530,
    outcomes: [
      'Run user research and build personas',
      'Design wireframes and high-fidelity UI',
      'Prototype and test in Figma',
    ],
    requirements: ['A free Figma account'],
    sections: [
      {
        title: 'UX Foundations',
        lessons: lessons([
          ['What great UX looks like', 7, true],
          ['User research and personas', 15],
        ]),
      },
      {
        title: 'Designing in Figma',
        lessons: lessons([
          ['Frames, auto layout and components', 18],
          ['Typography and color systems', 14],
        ]),
      },
      {
        title: 'Prototyping',
        lessons: lessons([
          ['Interactive prototypes', 13],
          ['Usability testing', 12],
        ]),
      },
    ],
  },
  {
    instructor: 'marcus',
    category: 'marketing',
    title: 'Digital Marketing Strategy 2026',
    subtitle: 'SEO, social, email and paid ads — a complete growth playbook',
    level: 'All levels',
    price: 29.99,
    theme: 6,
    rating: 4.5,
    ratingCount: 811,
    outcomes: [
      'Build a full-funnel marketing plan',
      'Grow organic traffic with SEO',
      'Run profitable ad campaigns',
    ],
    requirements: ['No experience needed'],
    sections: [
      {
        title: 'Strategy',
        lessons: lessons([
          ['The modern marketing funnel', 9, true],
          ['Finding your ideal customer', 11],
        ]),
      },
      {
        title: 'Channels',
        lessons: lessons([
          ['SEO that actually works', 17],
          ['Email marketing automation', 14],
          ['Paid ads on a budget', 16],
        ]),
      },
    ],
  },
  {
    instructor: 'marcus',
    category: 'business',
    title: 'Freelancing & Client Acquisition',
    subtitle: 'Land high-paying clients and build a sustainable freelance business',
    level: 'Beginner',
    price: 0,
    theme: 7,
    rating: 4.6,
    ratingCount: 1922,
    outcomes: [
      'Position yourself in a profitable niche',
      'Write proposals that win',
      'Price your services with confidence',
    ],
    requirements: ['A skill you want to sell'],
    sections: [
      {
        title: 'Getting Started',
        lessons: lessons([
          ['Choosing your niche', 8, true],
          ['Building a portfolio that sells', 12],
        ]),
      },
      {
        title: 'Winning Clients',
        lessons: lessons([
          ['Writing winning proposals', 15],
          ['Pricing and negotiation', 13],
        ]),
      },
    ],
  },
  {
    instructor: 'david',
    category: 'web-development',
    status: 'pending',
    title: 'Docker & Kubernetes for Developers',
    subtitle: 'Containerize, ship and scale your applications with confidence',
    level: 'Intermediate',
    price: 54.99,
    theme: 2,
    rating: 0,
    ratingCount: 0,
    outcomes: [
      'Containerize any app with Docker',
      'Orchestrate services with Kubernetes',
      'Set up CI/CD pipelines',
    ],
    requirements: ['Comfortable with the command line'],
    sections: [
      {
        title: 'Docker Fundamentals',
        lessons: lessons([
          ['Containers vs virtual machines', 9, true],
          ['Writing your first Dockerfile', 15],
        ]),
      },
      {
        title: 'Kubernetes',
        lessons: lessons([
          ['Pods, deployments and services', 18],
          ['Scaling and rolling updates', 16],
        ]),
      },
    ],
  },
];

// Quiz per course (questions: [question, options, correctIndex, explanation])
export const QUIZZES = {
  'The Complete MERN Stack Bootcamp': [
    [
      'Which part of the MERN stack is the database?',
      ['Express', 'MongoDB', 'React', 'Node.js'],
      1,
      'MongoDB is the document database in MERN.',
    ],
    [
      'What does Express provide?',
      ['A UI library', 'A web framework for Node.js', 'A CSS framework', 'A database'],
      1,
      'Express is a minimal web framework for building APIs on Node.js.',
    ],
    [
      'Which React hook stores component state?',
      ['useEffect', 'useRef', 'useState', 'useMemo'],
      2,
      'useState returns a state value and a setter.',
    ],
    [
      'What is a JWT mainly used for?',
      ['Styling pages', 'Authentication', 'Database indexing', 'Image compression'],
      1,
      'JSON Web Tokens carry signed identity claims for auth.',
    ],
  ],
  'Modern JavaScript: ES6 to ES2024': [
    [
      'Which keyword declares a block-scoped constant?',
      ['var', 'let', 'const', 'static'],
      2,
      'const is block-scoped and cannot be reassigned.',
    ],
    [
      'What does await pause on?',
      ['A callback', 'A Promise', 'A loop', 'An event'],
      1,
      'await waits for a Promise to settle.',
    ],
    [
      '[1,2,3].map(x => x * 2) returns…',
      ['[2,4,6]', '6', '[1,2,3]', 'undefined'],
      0,
      'map returns a new array with each item transformed.',
    ],
  ],
  'React & Tailwind CSS: Build Beautiful UIs': [
    [
      'Tailwind is best described as…',
      ['A component library', 'A utility-first CSS framework', 'A JS bundler', 'A state manager'],
      1,
      'Tailwind gives you low-level utility classes.',
    ],
    [
      'Which prefix applies a style from the medium breakpoint up?',
      ['sm:', 'md:', 'lg:', 'hover:'],
      1,
      'md: applies at the md breakpoint and above.',
    ],
    [
      'Props in React are…',
      [
        'Mutable by the child',
        'Read-only inputs to a component',
        'Global variables',
        'CSS classes',
      ],
      1,
      'Props are read-only data passed from a parent.',
    ],
  ],
  'Python for Data Analysis': [
    [
      'Which library provides DataFrames?',
      ['NumPy', 'Pandas', 'Requests', 'Flask'],
      1,
      'Pandas introduces the DataFrame structure.',
    ],
    [
      'df.groupby() is used for…',
      ['Sorting', 'Aggregating by category', 'Plotting', 'Reading files'],
      1,
      'groupby splits data into groups for aggregation.',
    ],
    [
      'Which is a Python dictionary?',
      ['[1, 2]', '(1, 2)', "{'a': 1}", '{1, 2}'],
      2,
      'Dictionaries map keys to values.',
    ],
  ],
  'Machine Learning A–Z: Hands-On': [
    [
      'Predicting a house price is a…',
      ['Classification task', 'Regression task', 'Clustering task', 'Ranking task'],
      1,
      'Predicting a continuous number is regression.',
    ],
    [
      'Why split data into train and test sets?',
      ['To save memory', 'To evaluate on unseen data', 'To speed up training', 'It is not needed'],
      1,
      'Test data estimates performance on new data.',
    ],
    [
      'A random forest is an ensemble of…',
      ['Neural networks', 'Decision trees', 'Linear models', 'Clusters'],
      1,
      'Random forests combine many decision trees.',
    ],
  ],
  'UI/UX Design Masterclass with Figma': [
    [
      'A persona represents…',
      ['A typical user', 'A developer', 'A color palette', 'A font'],
      0,
      'Personas summarize a representative user.',
    ],
    [
      'Auto layout in Figma helps you…',
      ['Export code', 'Build responsive, resizing frames', 'Pick colors', 'Write copy'],
      1,
      'Auto layout makes frames resize with their content.',
    ],
    [
      'Usability testing is done to…',
      ['Choose fonts', 'Find problems real users face', 'Write CSS', 'Increase price'],
      1,
      'Testing reveals where users struggle.',
    ],
  ],
  'Digital Marketing Strategy 2026': [
    [
      'SEO stands for…',
      [
        'Search Engine Optimization',
        'Social Engagement Online',
        'Sales Email Outreach',
        'Site Error Output',
      ],
      0,
      'SEO improves organic search visibility.',
    ],
    [
      'The top of the funnel focuses on…',
      ['Retention', 'Awareness', 'Checkout', 'Refunds'],
      1,
      'Top-of-funnel is about attracting attention.',
    ],
    [
      'Email automation is best for…',
      ['Nurturing leads over time', 'Designing logos', 'Hosting websites', 'Coding apps'],
      0,
      'Automated sequences nurture leads.',
    ],
  ],
  'Freelancing & Client Acquisition': [
    [
      'A niche helps you…',
      ['Compete only on price', 'Stand out to specific clients', 'Avoid clients', 'Work for free'],
      1,
      'Specializing makes you the obvious choice.',
    ],
    [
      'A strong proposal should focus on…',
      ['Your hobbies', "The client's problem and outcome", 'Long biographies', 'Discount codes'],
      1,
      'Clients care about their problem and results.',
    ],
  ],
};

export const STUDENT_NAMES = [
  'Emma Wilson',
  'Liam Brown',
  'Olivia Davis',
  'Noah Garcia',
  'Ava Martinez',
  'Ethan Lee',
  'Sophia Taylor',
  'Mason Anderson',
  'Isabella Thomas',
  'Lucas Moore',
  'Mia Jackson',
  'Aiden White',
  'Amelia Harris',
  'James Martin',
  'Harper Thompson',
  'Benjamin Clark',
  'Evelyn Lewis',
  'Henry Walker',
  'Abigail Hall',
  'Daniel Young',
  'Ella King',
  'Matthew Wright',
  'Aria Lopez',
  'Samuel Hill',
  'Chloe Scott',
  'Omar Siddiqui',
  'Fatima Khan',
  'Ali Raza',
  'Zara Ahmed',
  'Hassan Malik',
];
