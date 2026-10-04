# AI Developer

A collaborative, chat-first development workspace. Create a project, invite teammates, and chat in real time. Mention `@ai` in a message and an AI assistant (Google Gemini) replies with explanations and **generated project files** that you can edit and run right in the browser.

**Live demo:** https://ai-developer-frontend-fawn.vercel.app

---

## Features (current)

- **Authentication**: register and log in with email and password. Passwords are hashed with bcrypt and sessions use JWT.
- **Token blacklisting on logout**: logged-out tokens are stored in Redis so they can no longer be used.
- **Projects**: create projects and see all the ones you belong to.
- **Collaborators**: add other registered users to a project.
- **Real-time team chat**: Socket.io rooms per project, so everyone in a project sees messages instantly.
- **AI assistant**: include `@ai` in a message to get a reply from Gemini, rendered as Markdown with highlighted code blocks.
- **AI-generated file tree**: the AI can return a set of files (for example a small Express app) which appear in the workspace.
- **In-browser code editor**: open, edit and save generated files. Changes are persisted to the project.
- **Run in the browser**: install dependencies and start the generated app using [WebContainers](https://webcontainers.io/), with a live preview panel.
- **Modern UI**: chat-first full-screen layout, responsive design, and a **light/dark theme** that follows your system setting and remembers your choice.

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, Tailwind CSS, React Router, Axios |
| Real-time | Socket.io (client and server) |
| In-browser runtime | `@webcontainer/api` |
| Backend | Node.js, Express, express-validator, Morgan |
| Database | MongoDB (Mongoose) |
| Cache / auth blacklist | Redis (ioredis) |
| AI | Google Generative AI (Gemini) |
| Hosting | Vercel (frontend), Render (backend) |

---

## Project structure

```
AI-developer/
├── backend/
│   ├── app.js                 # Express app, middleware, routes
│   ├── server.js              # HTTP + Socket.io server, AI trigger on @ai
│   ├── controllers/           # Request handlers (user, project, ai)
│   ├── services/              # Business logic (user, project, ai, redis)
│   ├── models/                # Mongoose models (user, project)
│   ├── routes/                # API routes
│   ├── middleware/            # JWT auth middleware
│   └── db/                    # MongoDB connection
└── frontend/
    ├── src/
    │   ├── screens/           # Login, Register, Home, Project
    │   ├── components/        # ThemeToggle, AuthShell
    │   ├── context/           # User and Theme providers
    │   ├── auth/              # Protected route wrapper
    │   ├── config/            # Axios, Socket, WebContainer setup
    │   └── routes/            # App routes
    └── vercel.json
```

---

## API overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/users/register` | Create an account |
| POST | `/users/login` | Log in |
| GET | `/users/profile` | Current user (auth) |
| GET | `/users/logout` | Log out and blacklist token (auth) |
| GET | `/users/all` | List other users (auth) |
| POST | `/projects/create` | Create a project (auth) |
| GET | `/projects/all` | Projects for the current user (auth) |
| PUT | `/projects/add-user` | Add collaborators (auth) |
| GET | `/projects/get-project/:projectId` | Project details (auth) |
| PUT | `/projects/update-file-tree` | Save the project's files (auth) |
| GET | `/ai/get-result` | Run an AI prompt (auth) |

Socket event: `project-message` is broadcast within a project room. Messages containing `@ai` trigger an AI response.

---

## Getting started

### Prerequisites

- Node.js 18+
- A MongoDB database (for example MongoDB Atlas)
- A Redis instance (for example Redis Cloud)
- A Google AI (Gemini) API key

### 1. Clone

```bash
git clone https://github.com/Kh123ushi/AI-developer.git
cd AI-developer
```

### 2. Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=a_long_random_secret
GOOGLE_AI_KEY=your_gemini_api_key
REDIS_HOST=your_redis_host        # host only, no port and no redis://
REDIS_PORT=your_redis_port
REDIS_PASSWORD=your_redis_password
```

Run it:

```bash
node server.js
```

You should see `Server is running`, `Connected to MongoDB` and `Redis connected`.

### 3. Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```env
VITE_API_URL=http://localhost:3000
```

Run it:

```bash
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173).

> **Never commit `.env` files or share secrets.** Both are listed in `.gitignore`.

---

## Deployment

- **Frontend (Vercel):** set `VITE_API_URL` to your backend URL (no trailing slash) in the Vercel project settings, then redeploy. Vite reads this value at build time.
- **Backend (Render):** add the environment variables listed above, with the start command `node server.js`.

---

## Roadmap / future improvements

**Product**
- [ ] Create project list refresh immediately after creating a project (no reload needed)
- [ ] Logout button and user menu in the UI
- [ ] Delete / rename projects and remove collaborators
- [ ] Chat history persisted in the database, so messages survive a refresh
- [ ] Typing indicators, online presence and message timestamps
- [ ] File management: create, rename and delete files and folders; support more languages in the editor
- [ ] Download a project as a ZIP
- [ ] Streaming AI responses and a "thinking" indicator
- [ ] Choose different AI models, or keep per-project AI context

**Engineering**
- [ ] Add `"start": "node server.js"` and `"dev"` scripts to the backend `package.json`
- [ ] Review the Gemini model name in `ai.service.js` and keep it on a currently supported model
- [ ] Restrict Socket.io and Express CORS to the deployed frontend origin instead of `*`
- [ ] Rate limiting on auth and AI endpoints
- [ ] Handle Redis `error` events and add health-check endpoint
- [ ] Input validation and clearer error messages on the frontend
- [ ] Code-split the frontend bundle (it is currently over 1 MB)
- [ ] Add tests (API and component tests) and a CI workflow on pull requests
- [ ] Switch the code editor to Monaco or CodeMirror for a better editing experience
- [ ] TypeScript migration

---

## Contributing

1. Fork the repo and create a branch: `git checkout -b feature/my-feature`
2. Commit your changes and push the branch
3. Open a pull request

---

## Author

**Khushi** — [@Kh123ushi](https://github.com/Kh123ushi)
