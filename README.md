# GIU Nexus — AI-Powered Career & Talent Platform

A full-stack MERN web application that connects German International University 
students with internships and jobs using AI-powered skill matching and job recommendations.

## Project Description
GIU Nexus is a smart job board where:
- **Students** can build profiles, get AI-suggested skills, and apply to jobs
- **Recruiters** can post jobs that are auto-categorized by AI
- **Admins** can manage the platform, approve recruiters, and view analytics

## Tech Stack
- **Frontend:** React.js
- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **AI:** Hugging Face Inference API

## Team Members
| Name |
|------|
| Ziad Mohamed |
| Abdelrahman ALGabarty |
| Aly Issa | 
| Ahmed Sanad |
| Baraa Ibrahim |
| Eyad Nader | 
| Mohamed Walid | 
| Mostafa Ayman |

## Project Structure

## Docker Setup
Start the backend API and MongoDB together with one command:

```bash
docker compose up --build
```

The API will be available on `http://localhost:5000` and Swagger docs on `http://localhost:5000/api-docs`.

For containerized local development, copy `.env.example` to `.env` and make sure the values are set. `docker-compose.yml` forwards the backend environment variables explicitly, and defaults `MONGO_URI_DOCKER` to the local Mongo container.
