const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'GIU Nexus API',
      version: '1.0.0',
      description:
        'AI-Powered Career & Talent Platform — full API documentation including auth, jobs, applications, and profile endpoints.',
    },
    servers: [
      {
        url: 'http://localhost:5000/api/v1',
        description: 'Local development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Paste your JWT token here (obtained from /auth/login or /auth/register)',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id:            { type: 'string', example: '664a1f2e3b1a2c4d5e6f7890' },
            name:           { type: 'string', example: 'Eyad Nader' },
            email:          { type: 'string', example: 'eyad.gamaleldin@student.giu-uni.de' },
            role:           { type: 'string', enum: ['jobSeeker', 'recruiter', 'admin'] },
            status:         { type: 'string', enum: ['pending', 'approved', 'rejected'] },
            bio:            { type: 'string', example: 'Full-stack developer with React and Node.js experience' },
            skills:         { type: 'array', items: { type: 'string' }, example: ['React', 'Node.js'] },
            profilePicture: { type: 'string', example: '/uploads/profile-pictures/abc123.jpg' },
            createdAt:      { type: 'string', format: 'date-time' },
          },
        },
        Job: {
          type: 'object',
          properties: {
            _id:          { type: 'string' },
            title:        { type: 'string', example: 'Backend Intern' },
            company:      { type: 'string', example: 'GIU' },
            description:  { type: 'string' },
            requirements: { type: 'array', items: { type: 'string' }, example: ['Node.js', 'MongoDB'] },
            location:     { type: 'string', example: 'Cairo' },
            type:         { type: 'string', enum: ['full-time', 'part-time', 'internship'] },
            category:     { type: 'string', example: 'Backend' },
            status:       { type: 'string', enum: ['open', 'closed'] },
            salary:       { type: 'number', example: 5000 },
            totalSlots:   { type: 'number', example: 3 },
            createdBy:    { type: 'string', example: '664a1f2e3b1a2c4d5e6f7890' },
            createdAt:    { type: 'string', format: 'date-time' },
          },
        },
        Application: {
          type: 'object',
          properties: {
            _id:         { type: 'string' },
            user:        { type: 'string' },
            job:         { type: 'string' },
            status:      { type: 'string', enum: ['pending', 'shortlisted', 'rejected'] },
            coverLetter: { type: 'string' },
            appliedAt:   { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'An error occurred' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Auth',         description: 'Registration, login, logout, password reset, OTP' },
      { name: 'Profile',      description: 'View and update your own profile, extract skills, upload picture' },
      { name: 'Jobs',         description: 'Browse, create, edit, save, and apply to jobs' },
      { name: 'Applications', description: 'View and manage job applications' },
      { name: 'Users',        description: 'Admin-only user management' },
    ],
    paths: {
      // ── AUTH ──────────────────────────────────────────────────────────────
      '/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Register a new user',
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'email', 'password', 'role'],
                  properties: {
                    name:     { type: 'string', example: 'nexus' },
                    email:    { type: 'string', example: 'sara@example.com' },
                    password: { type: 'string', example: 'secret123' },
                    role:     { type: 'string', enum: ['jobSeeker', 'recruiter'] },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'User created successfully' },
            400: { description: 'Validation error or email already in use', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            429: { description: 'Too many requests (rate limited)' },
          },
        },
      },
      '/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Login and receive a JWT',
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email:    { type: 'string', example: 'sara@example.com' },
                    password: { type: 'string', example: 'secret123' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Login successful — returns JWT token' },
            401: { description: 'Invalid credentials' },
            429: { description: 'Too many requests (rate limited)' },
          },
        },
      },
      '/auth/logout': {
        post: {
          tags: ['Auth'],
          summary: 'Logout — blacklists the current token (SCRUM-25)',
          responses: {
            200: { description: 'Logged out successfully' },
            401: { description: 'Unauthorized' },
          },
        },
      },
      '/auth/forgot-password': {
        post: {
          tags: ['Auth'],
          summary: 'Request OTP for password reset (SCRUM-27)',
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email'],
                  properties: {
                    email: { type: 'string', example: 'sara@example.com' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'OTP sent to email (always 200 to prevent enumeration)' },
            429: { description: 'Too many requests (rate limited)' },
          },
        },
      },
      '/auth/verify-otp': {
        post: {
          tags: ['Auth'],
          summary: 'Verify OTP — issues reset link on success (SCRUM-27)',
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'otp'],
                  properties: {
                    email: { type: 'string', example: 'sara@example.com' },
                    otp:   { type: 'string', example: '482910' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'OTP verified — reset link emailed' },
            400: { description: 'OTP is invalid or has expired' },
          },
        },
      },
      '/auth/reset-password/{token}': {
        patch: {
          tags: ['Auth'],
          summary: 'Reset password using token from email',
          security: [],
          parameters: [{ in: 'path', name: 'token', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['password'],
                  properties: { password: { type: 'string', example: 'newSecret123' } },
                },
              },
            },
          },
          responses: {
            200: { description: 'Password reset successfully — returns new JWT' },
            400: { description: 'Token invalid or expired' },
          },
        },
      },

      // ── PROFILE ──────────────────────────────────────────────────────────
      '/profile': {
        get: {
          tags: ['Profile'],
          summary: 'Get your own profile',
          responses: {
            200: { description: 'Profile data returned' },
            401: { description: 'Unauthorized' },
          },
        },
        patch: {
          tags: ['Profile'],
          summary: 'Update profile — name, bio, and/or profile picture (SCRUM-30)',
          requestBody: {
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    name:           { type: 'string' },
                    bio:            { type: 'string' },
                    profilePicture: { type: 'string', format: 'binary', description: 'Image file (jpg, png, gif, webp — max 5 MB)' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Profile updated' },
            400: { description: 'Invalid file type' },
            401: { description: 'Unauthorized' },
          },
        },
      },
      '/profile/change-password': {
        patch: {
          tags: ['Profile'],
          summary: 'Change password while logged in',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['currentPassword', 'newPassword'],
                  properties: {
                    currentPassword: { type: 'string' },
                    newPassword:     { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Password updated' },
            401: { description: 'Current password incorrect' },
          },
        },
      },
      '/profile/extract-skills': {
        post: {
          tags: ['Profile'],
          summary: 'Extract skills from bio using AI NER (Job Seeker only)',
          responses: {
            200: { description: 'Skills extracted and saved to profile' },
            400: { description: 'Bio is empty' },
            403: { description: 'Not a job seeker' },
          },
        },
      },

      // ── JOBS ─────────────────────────────────────────────────────────────
      '/jobs': {
        get: {
          tags: ['Jobs'],
          summary: 'List all jobs (public, paginated, filterable)',
          security: [],
          parameters: [
            { in: 'query', name: 'keyword',  schema: { type: 'string' } },
            { in: 'query', name: 'location', schema: { type: 'string' } },
            { in: 'query', name: 'type',     schema: { type: 'string', enum: ['full-time', 'part-time', 'internship'] } },
            { in: 'query', name: 'status',   schema: { type: 'string', enum: ['open', 'closed'] } },
            { in: 'query', name: 'page',     schema: { type: 'integer', default: 1 } },
            { in: 'query', name: 'limit',    schema: { type: 'integer', default: 10 } },
          ],
          responses: { 200: { description: 'Paginated job list' } },
        },
        post: {
          tags: ['Jobs'],
          summary: 'Create a job post — AI auto-classifies category (Recruiter only)',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['title', 'company', 'description', 'requirements', 'location', 'type'],
                  properties: {
                    title:        { type: 'string' },
                    company:      { type: 'string' },
                    description:  { type: 'string' },
                    requirements: { type: 'array', items: { type: 'string' } },
                    location:     { type: 'string' },
                    type:         { type: 'string', enum: ['full-time', 'part-time', 'internship'] },
                    salary:       { type: 'number' },
                    totalSlots:   { type: 'number' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Job created with AI category assigned' },
            403: { description: 'Account pending approval' },
          },
        },
      },
      '/jobs/recommended': {
        get: {
          tags: ['Jobs'],
          summary: 'Get AI-ranked job recommendations for the logged-in job seeker',
          responses: { 200: { description: 'Jobs ranked by cosine similarity score' } },
        },
      },
      '/jobs/my-jobs': {
        get: {
          tags: ['Jobs'],
          summary: 'Get all jobs posted by the logged-in recruiter',
          responses: { 200: { description: 'Recruiter\'s job posts' } },
        },
      },
      '/jobs/saved': {
        get: {
          tags: ['Jobs'],
          summary: 'Get saved/bookmarked jobs for the logged-in job seeker',
          responses: { 200: { description: 'Saved jobs list' } },
        },
      },
      '/jobs/{id}': {
        get: {
          tags: ['Jobs'],
          summary: 'Get a single job by ID (public)',
          security: [],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Job details' }, 404: { description: 'Job not found' } },
        },
        patch: {
          tags: ['Jobs'],
          summary: 'Update a job (Recruiter owner only)',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          requestBody: {
            content: {
              'application/json': {
                schema: { type: 'object', properties: { title: { type: 'string' }, status: { type: 'string' } } },
              },
            },
          },
          responses: { 200: { description: 'Job updated' }, 403: { description: 'Not authorized' } },
        },
        delete: {
          tags: ['Jobs'],
          summary: 'Delete a job (Recruiter owner or Admin)',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Job deleted' }, 403: { description: 'Not authorized' } },
        },
      },
      '/jobs/{id}/save': {
        post: {
          tags: ['Jobs'],
          summary: 'Toggle save/unsave a job (Job Seeker only)',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Job saved or removed from saved list' }, 400: { description: 'Cannot save a closed job' } },
        },
      },
      '/jobs/{jobId}/apply': {
        post: {
          tags: ['Jobs'],
          summary: 'Apply to a job (Job Seeker only)',
          parameters: [{ in: 'path', name: 'jobId', required: true, schema: { type: 'string' } }],
          requestBody: {
            content: {
              'application/json': {
                schema: { type: 'object', properties: { coverLetter: { type: 'string' } } },
              },
            },
          },
          responses: {
            201: { description: 'Application submitted' },
            400: { description: 'Already applied' },
            404: { description: 'Job not found' },
          },
        },
      },
      '/jobs/{jobId}/applicants': {
        get: {
          tags: ['Jobs'],
          summary: 'Get all applicants for a job (Recruiter owner only)',
          parameters: [{ in: 'path', name: 'jobId', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Applicants list' }, 403: { description: 'Not authorized' } },
        },
      },

      // ── APPLICATIONS ─────────────────────────────────────────────────────
      '/applications/my': {
        get: {
          tags: ['Applications'],
          summary: 'Get all applications submitted by the logged-in job seeker',
          responses: { 200: { description: 'Applications list with job details' } },
        },
      },
      '/applications/{id}/status': {
        patch: {
          tags: ['Applications'],
          summary: 'Update application status (Recruiter who owns the job)',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['status'],
                  properties: { status: { type: 'string', enum: ['pending', 'shortlisted', 'rejected'] } },
                },
              },
            },
          },
          responses: { 200: { description: 'Status updated' }, 403: { description: 'Not authorized' } },
        },
      },
      '/applications': {
        get: {
          tags: ['Applications'],
          summary: 'Get all applications on the platform (Admin only)',
          parameters: [
            { in: 'query', name: 'page',  schema: { type: 'integer', default: 1 } },
            { in: 'query', name: 'limit', schema: { type: 'integer', default: 20 } },
          ],
          responses: { 200: { description: 'Paginated applications list' } },
        },
      },

      // ── USERS (ADMIN) ─────────────────────────────────────────────────────
      '/users': {
        get: {
          tags: ['Users'],
          summary: 'List all users (Admin only)',
          parameters: [
            { in: 'query', name: 'role',   schema: { type: 'string' } },
            { in: 'query', name: 'status', schema: { type: 'string' } },
            { in: 'query', name: 'page',   schema: { type: 'integer', default: 1 } },
            { in: 'query', name: 'limit',  schema: { type: 'integer', default: 20 } },
          ],
          responses: { 200: { description: 'Paginated user list' } },
        },
      },
      '/users/{id}': {
        get: {
          tags: ['Users'],
          summary: 'Get single user by ID (Admin only)',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'User data' }, 404: { description: 'Not found' } },
        },
        delete: {
          tags: ['Users'],
          summary: 'Delete a user (Admin only)',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'User deleted' }, 404: { description: 'Not found' } },
        },
      },
      '/users/{id}/status': {
        patch: {
          tags: ['Users'],
          summary: 'Approve / reject / reset a user status (Admin only)',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['status'],
                  properties: { status: { type: 'string', enum: ['approved', 'rejected', 'pending'] } },
                },
              },
            },
          },
          responses: { 200: { description: 'Status updated' } },
        },
      },
      '/admin/stats': {
        get: {
          tags: ['Users'],
          summary: 'Platform-wide statistics (Admin only)',
          responses: { 200: { description: 'Stats object with user/job/application counts' } },
        },
      },
    },
  },
  apis: [], // all paths defined inline above
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;