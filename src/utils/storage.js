// ─── Storage Keys ────────────────────────────────────────────────────────────
const KEYS = {
  USERS: 'oes_users',
  EXAMS: 'oes_exams',
  QUESTIONS: 'oes_questions',
  RESULTS: 'oes_results',
  CURRENT_USER: 'oes_current_user',
};

// ─── Seed Default Data ────────────────────────────────────────────────────────
export function seedDefaultData() {
  const defaults = [
    { id: 'u1', username: 'admin',   password: 'admin123',   role: 'admin',   name: 'Admin User'  },
    { id: 'u2', username: 'student', password: 'student123', role: 'student', name: 'John Doe'    },
    { id: 'u3', username: 'alice',   password: 'alice123',   role: 'student', name: 'Alice Smith' },
  ];

  if (!localStorage.getItem(KEYS.USERS)) {
    localStorage.setItem(KEYS.USERS, JSON.stringify(defaults));
  } else {
    // Merge defaults so they are always present, but keep other registered users
    const existing = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
    defaults.forEach(def => {
      if (!existing.some(u => u.username === def.username)) {
        existing.push(def);
      }
    });
    localStorage.setItem(KEYS.USERS, JSON.stringify(existing));
  }

  // Clear stale session that is missing the username field
  const session = localStorage.getItem(KEYS.CURRENT_USER);
  if (session) {
    const parsed = JSON.parse(session);
    if (!parsed.username) localStorage.removeItem(KEYS.CURRENT_USER);
  }

  if (!localStorage.getItem(KEYS.EXAMS)) {
    const exams = [
      {
        id: 'ex1',
        title: 'JavaScript Fundamentals',
        description: 'Test your knowledge of JavaScript basics including variables, functions, and ES6+.',
        duration: 30,
        totalMarks: 100,
        passingMarks: 60,
        createdAt: new Date().toISOString(),
        isActive: true,
      },
      {
        id: 'ex2',
        title: 'React & Component Design',
        description: 'Assess your understanding of React concepts, hooks, and state management.',
        duration: 45,
        totalMarks: 100,
        passingMarks: 65,
        createdAt: new Date().toISOString(),
        isActive: true,
      },
    ];
    localStorage.setItem(KEYS.EXAMS, JSON.stringify(exams));
  }

  if (!localStorage.getItem(KEYS.QUESTIONS)) {
    const questions = [
      // ex1 questions
      { id: 'q1',  examId: 'ex1', text: 'Which keyword is used to declare a block-scoped variable in JavaScript?', options: ['var', 'let', 'function', 'define'], correctAnswer: 1, marks: 10, timeLimit: 30 },
      { id: 'q2',  examId: 'ex1', text: 'What does the `typeof` operator return for `null`?', options: ['"null"', '"undefined"', '"object"', '"boolean"'], correctAnswer: 2, marks: 10, timeLimit: 30 },
      { id: 'q3',  examId: 'ex1', text: 'Which method is used to add an element at the end of an array?', options: ['shift()', 'unshift()', 'push()', 'pop()'], correctAnswer: 2, marks: 10, timeLimit: 30 },
      { id: 'q4',  examId: 'ex1', text: 'What is the output of `console.log(0.1 + 0.2 === 0.3)`?', options: ['true', 'false', 'undefined', 'NaN'], correctAnswer: 1, marks: 10, timeLimit: 30 },
      { id: 'q5',  examId: 'ex1', text: 'Which ES6 feature allows you to unpack values from arrays?', options: ['Spread operator', 'Rest parameters', 'Destructuring', 'Template literals'], correctAnswer: 2, marks: 10, timeLimit: 30 },
      { id: 'q6',  examId: 'ex1', text: 'What does `Promise.all()` do?', options: ['Runs promises sequentially', 'Returns the first resolved promise', 'Waits for all promises to resolve', 'Cancels all pending promises'], correctAnswer: 2, marks: 10, timeLimit: 30 },
      { id: 'q7',  examId: 'ex1', text: 'Which method converts a JSON string to a JavaScript object?', options: ['JSON.stringify()', 'JSON.parse()', 'JSON.convert()', 'JSON.toObject()'], correctAnswer: 1, marks: 10, timeLimit: 30 },
      { id: 'q8',  examId: 'ex1', text: 'What is a closure in JavaScript?', options: ['A loop that runs once', 'A function with access to its outer scope', 'A type of class', 'An async function'], correctAnswer: 1, marks: 10, timeLimit: 30 },
      { id: 'q9',  examId: 'ex1', text: 'Which symbol is used for template literals?', options: ['Single quotes', 'Double quotes', 'Backticks', 'Curly braces'], correctAnswer: 2, marks: 10, timeLimit: 30 },
      { id: 'q10', examId: 'ex1', text: 'What does `Array.prototype.map()` return?', options: ['A boolean', 'The original array', 'A new array', 'undefined'], correctAnswer: 2, marks: 10, timeLimit: 30 },
      // ex2 questions
      { id: 'q11', examId: 'ex2', text: 'What hook is used to manage state in a functional component?', options: ['useEffect', 'useContext', 'useState', 'useReducer'], correctAnswer: 2, marks: 10, timeLimit: 45 },
      { id: 'q12', examId: 'ex2', text: 'What does the `useEffect` hook with an empty dependency array do?', options: ['Runs on every render', 'Runs only once after mount', 'Never runs', 'Runs before each render'], correctAnswer: 1, marks: 10, timeLimit: 45 },
      { id: 'q13', examId: 'ex2', text: 'What is the purpose of React keys in lists?', options: ['Apply styling', 'Help React identify changed items', 'Trigger re-renders', 'Define component props'], correctAnswer: 1, marks: 10, timeLimit: 45 },
      { id: 'q14', examId: 'ex2', text: 'Which hook would you use to access a DOM element directly?', options: ['useState', 'useCallback', 'useRef', 'useMemo'], correctAnswer: 2, marks: 10, timeLimit: 45 },
      { id: 'q15', examId: 'ex2', text: 'What is JSX?', options: ['A JavaScript library', 'A syntax extension for JavaScript', 'A database query language', 'A CSS framework'], correctAnswer: 1, marks: 10, timeLimit: 45 },
      { id: 'q16', examId: 'ex2', text: 'What does lifting state up mean in React?', options: ['Using Redux', 'Moving state to a parent component', 'Using global variables', 'Using localStorage'], correctAnswer: 1, marks: 10, timeLimit: 45 },
      { id: 'q17', examId: 'ex2', text: 'What is the React Context API used for?', options: ['Routing', 'Styling', 'Sharing state without prop drilling', 'Fetching data'], correctAnswer: 2, marks: 10, timeLimit: 45 },
      { id: 'q18', examId: 'ex2', text: 'Which lifecycle method is equivalent to `useEffect(() => {}, [])`?', options: ['componentDidUpdate', 'componentWillUnmount', 'componentDidMount', 'shouldComponentUpdate'], correctAnswer: 2, marks: 10, timeLimit: 45 },
      { id: 'q19', examId: 'ex2', text: 'What is a Higher-Order Component (HOC)?', options: ['A class component', 'A function that takes and returns a component', 'A Redux store', 'A lifecycle method'], correctAnswer: 1, marks: 10, timeLimit: 45 },
      { id: 'q20', examId: 'ex2', text: 'What does `React.memo()` do?', options: ['Memoizes function results', 'Prevents unnecessary re-renders', 'Creates a new component', 'Handles errors'], correctAnswer: 1, marks: 10, timeLimit: 45 },
    ];
    localStorage.setItem(KEYS.QUESTIONS, JSON.stringify(questions));
  } else {
    // Migrate old questions that are missing timeLimit
    const existing = JSON.parse(localStorage.getItem(KEYS.QUESTIONS) || '[]');
    const needsMigration = existing.some(q => q.timeLimit === undefined);
    if (needsMigration) {
      const migrated = existing.map(q => ({ timeLimit: 0, ...q }));
      localStorage.setItem(KEYS.QUESTIONS, JSON.stringify(migrated));
    }
  }

  if (!localStorage.getItem(KEYS.RESULTS)) {
    localStorage.setItem(KEYS.RESULTS, JSON.stringify([]));
  }
}

export function getUsers() {
  return JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
}

export function registerUser(name, username, password) {
  const users = getUsers();
  if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
    throw new Error('Username already exists');
  }
  const newUser = {
    id: `u_${Date.now()}`,
    name,
    username,
    password,
    role: 'student'
  };
  users.push(newUser);
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  return newUser;
}

export function resetStudentPassword(username, fullName, newPassword) {
  const users = getUsers();
  const idx = users.findIndex(u => 
    u.role === 'student' && 
    u.username.toLowerCase() === username.toLowerCase() && 
    u.name.toLowerCase() === fullName.toLowerCase()
  );
  if (idx === -1) {
    throw new Error('Student account details not found. Make sure username and full name match.');
  }
  users[idx].password = newPassword;
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  return users[idx];
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export function login(username, password) {
  const users = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    const { password: _, ...safeUser } = user;
    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(safeUser));
    return safeUser;
  }
  return null;
}

export function logout() {
  localStorage.removeItem(KEYS.CURRENT_USER);
}

export function getCurrentUser() {
  const user = localStorage.getItem(KEYS.CURRENT_USER);
  return user ? JSON.parse(user) : null;
}

// ─── Exams ────────────────────────────────────────────────────────────────────
export function getExams() {
  return JSON.parse(localStorage.getItem(KEYS.EXAMS) || '[]');
}

export function getExamById(id) {
  return getExams().find(e => e.id === id) || null;
}

export function saveExam(exam) {
  const exams = getExams();
  const idx = exams.findIndex(e => e.id === exam.id);
  if (idx >= 0) {
    exams[idx] = exam;
  } else {
    exams.push({ ...exam, id: `ex_${Date.now()}`, createdAt: new Date().toISOString() });
  }
  localStorage.setItem(KEYS.EXAMS, JSON.stringify(exams));
}

export function deleteExam(id) {
  const exams = getExams().filter(e => e.id !== id);
  localStorage.setItem(KEYS.EXAMS, JSON.stringify(exams));
  // Also delete associated questions and results
  const questions = getQuestions().filter(q => q.examId !== id);
  localStorage.setItem(KEYS.QUESTIONS, JSON.stringify(questions));
}

// ─── Questions ────────────────────────────────────────────────────────────────
export function getQuestions() {
  return JSON.parse(localStorage.getItem(KEYS.QUESTIONS) || '[]');
}

export function getQuestionsByExam(examId) {
  return getQuestions().filter(q => q.examId === examId);
}

export function saveQuestion(question) {
  const questions = getQuestions();
  const idx = questions.findIndex(q => q.id === question.id);
  if (idx >= 0) {
    questions[idx] = question;
  } else {
    questions.push({ ...question, id: `q_${Date.now()}` });
  }
  localStorage.setItem(KEYS.QUESTIONS, JSON.stringify(questions));
}

export function deleteQuestion(id) {
  const questions = getQuestions().filter(q => q.id !== id);
  localStorage.setItem(KEYS.QUESTIONS, JSON.stringify(questions));
}

// ─── Results ──────────────────────────────────────────────────────────────────
export function getResults() {
  return JSON.parse(localStorage.getItem(KEYS.RESULTS) || '[]');
}

export function getResultsByExam(examId) {
  return getResults().filter(r => r.examId === examId);
}

export function getResultByUser(examId, userId) {
  return getResults().find(r => r.examId === examId && r.userId === userId) || null;
}

export function saveResult(result) {
  const results = getResults();
  const existing = results.findIndex(r => r.examId === result.examId && r.userId === result.userId);
  const entry = { ...result, id: `res_${Date.now()}`, submittedAt: new Date().toISOString() };
  if (existing >= 0) {
    results[existing] = entry;
  } else {
    results.push(entry);
  }
  localStorage.setItem(KEYS.RESULTS, JSON.stringify(results));
  return entry;
}
