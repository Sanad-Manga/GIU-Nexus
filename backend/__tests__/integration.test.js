// Mock external services before anything else is imported
jest.mock('../services/classificationService', () => ({
  classifyJobCategory: jest.fn().mockResolvedValue('Backend'),
}));

jest.mock('../services/hfService', () => ({
  tokenClassification: jest.fn().mockResolvedValue([
    { entity_group: 'MISC', word: 'JavaScript' },
    { entity_group: 'ORG', word: 'Node.js' },
  ]),
  featureExtraction: jest.fn().mockResolvedValue([[0.1, 0.2], [0.3, 0.4]]),
}));

jest.mock('../services/emailService', () => ({
  sendResetEmail: jest.fn().mockResolvedValue(undefined),
}));

process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_EXPIRE = '7d';
process.env.NODE_ENV = 'test';

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app');
const { USERS, JOB } = require('./fixtures');
const { authLimiterStore } = require('../middleware/rateLimiter');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
}, 30000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await authLimiterStore.resetAll();
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

const registerUser = (data) =>
  request(app).post('/api/v1/auth/register').send(data);

const loginUser = (email, password) =>
  request(app).post('/api/v1/auth/login').send({ email, password });

async function registerAndLogin(role, suffix = '') {
  const base = USERS[role];
  const email = suffix ? `${base.email.split('@')[0]}${suffix}@test.com` : base.email;

  await registerUser({ ...base, email });

  if (role === 'recruiter') {
    const User = require('../models/User');
    await User.findOneAndUpdate({ email }, { status: 'approved' });
  }

  const res = await loginUser(email, base.password);
  return { token: res.body.token, userId: res.body.user?._id, email };
}

async function createTestJob(recruiterToken) {
  return request(app)
    .post('/api/v1/jobs')
    .set('Authorization', `Bearer ${recruiterToken}`)
    .send(JOB);
}

// ─── Register ────────────────────────────────────────────────────────────────

describe('Auth — Register', () => {
  it('registers a jobSeeker and returns 201 with a token', async () => {
    const res = await registerUser(USERS.jobSeeker);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('jobSeeker');
    expect(res.body.user.status).toBe('approved');
  });

  it('registers a recruiter with pending status', async () => {
    const res = await registerUser(USERS.recruiter);

    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('recruiter');
    expect(res.body.user.status).toBe('pending');
  });

  it('blocks admin role from self-registration with 400', async () => {
    const res = await registerUser({
      name: 'Admin User',
      email: 'admin@test.com',
      password: USERS.jobSeeker.password,
      role: 'admin',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('rejects a duplicate email with 400', async () => {
    await registerUser(USERS.jobSeeker);
    const res = await registerUser(USERS.jobSeeker);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/email already in use/i);
  });
});

// ─── Login ───────────────────────────────────────────────────────────────────

describe('Auth — Login', () => {
  beforeEach(async () => {
    await registerUser(USERS.jobSeeker);
  });

  it('returns 200 and a JWT for valid credentials', async () => {
    const { email, password } = USERS.jobSeeker;
    const res = await loginUser(email, password);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(email);
  });

  it('returns 401 for a wrong password', async () => {
    const res = await loginUser(USERS.jobSeeker.email, 'wrongpassword');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('returns 401 for an unknown email', async () => {
    const res = await loginUser('nobody@test.com', USERS.jobSeeker.password);

    expect(res.status).toBe(401);
  });
});

// ─── Create Job with AI Category ─────────────────────────────────────────────

describe('Jobs — Create with AI category', () => {
  it('creates a job and assigns the mocked AI category', async () => {
    const { token } = await registerAndLogin('recruiter');

    const res = await createTestJob(token);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.job.title).toBe('Node.js Backend Developer');
    expect(res.body.job.category).toBe('Backend'); // classifyJobCategory is mocked
  });

  it('returns 403 when recruiter account is still pending', async () => {
    const pendingEmail = 'pending@test.com';
    await registerUser({ ...USERS.recruiter, email: pendingEmail });
    const loginRes = await loginUser(pendingEmail, USERS.recruiter.password);

    const res = await createTestJob(loginRes.body.token);

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/pending approval/i);
  });
});

// ─── Apply to Job ─────────────────────────────────────────────────────────────

describe('Applications — Apply to job', () => {
  let seekerToken, jobId;

  beforeEach(async () => {
    const { token: rToken } = await registerAndLogin('recruiter', '1');
    const { token: sToken } = await registerAndLogin('jobSeeker', '1');
    seekerToken = sToken;

    const jobRes = await createTestJob(rToken);
    jobId = jobRes.body.job._id;
  });

  it('submits an application and returns 201', async () => {
    const res = await request(app)
      .post(`/api/v1/applications/${jobId}/apply`)
      .set('Authorization', `Bearer ${seekerToken}`)
      .send({ coverLetter: 'I am very interested in this position.' });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Application submitted');
    expect(res.body.application.status).toBe('pending');
  });

  it('rejects a duplicate application with 400', async () => {
    await request(app)
      .post(`/api/v1/applications/${jobId}/apply`)
      .set('Authorization', `Bearer ${seekerToken}`)
      .send({ coverLetter: 'First application.' });

    const res = await request(app)
      .post(`/api/v1/applications/${jobId}/apply`)
      .set('Authorization', `Bearer ${seekerToken}`)
      .send({ coverLetter: 'Trying again.' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already applied/i);
  });

  it('returns 404 for a non-existent job', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .post(`/api/v1/applications/${fakeId}/apply`)
      .set('Authorization', `Bearer ${seekerToken}`)
      .send({});

    expect(res.status).toBe(404);
  });
});

// ─── Extract Skills ───────────────────────────────────────────────────────────

describe('Profile — Extract Skills', () => {
  it('extracts skills from bio via mocked HuggingFace NER', async () => {
    const { token, userId } = await registerAndLogin('jobSeeker', '2');
    const User = require('../models/User');
    await User.findByIdAndUpdate(userId, { bio: 'JavaScript and Node.js developer' });

    const res = await request(app)
      .post('/api/v1/profile/extract-skills')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.skills)).toBe(true);
    expect(res.body.skills.length).toBeGreaterThan(0);
  });

  it('returns 400 when bio is empty', async () => {
    const { token } = await registerAndLogin('jobSeeker', '3');

    const res = await request(app)
      .post('/api/v1/profile/extract-skills')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/bio is empty/i);
  });
});

// ─── Rate Limiting ────────────────────────────────────────────────────────────

describe('Auth — Rate Limiting', () => {
  it('returns 429 after exceeding 10 auth requests from the same IP', async () => {
    for (let i = 0; i < 10; i++) {
      await registerUser({ ...USERS.jobSeeker, email: `flood${i}@test.com` });
    }

    const res = await registerUser({ ...USERS.jobSeeker, email: 'flood10@test.com' });

    expect(res.status).toBe(429);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/too many attempts/i);
  });
});
