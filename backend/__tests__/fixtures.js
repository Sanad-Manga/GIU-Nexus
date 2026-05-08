const USERS = {
  jobSeeker: {
    name: 'Test Seeker',
    email: 'testseeker@test.com',
    password: 'password123',
    role: 'jobSeeker',
  },
  recruiter: {
    name: 'Test Recruiter',
    email: 'testrecruiter@test.com',
    password: 'password123',
    role: 'recruiter',
  },
};

const JOB = {
  title: 'Node.js Backend Developer',
  company: 'TechCorp',
  description: 'Build REST APIs with Node.js, Express, and MongoDB.',
  requirements: ['Node.js', 'MongoDB', 'Express'],
  location: 'Cairo',
  type: 'full-time',
  totalSlots: 3,
  salary: 15000,
};

module.exports = { USERS, JOB };
