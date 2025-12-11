# QuickNotes

A minimal, modern notes app built with the MERN stack — React (Vite), Express, and MongoDB Atlas.  
Designed as a polished portfolio project with full CRUD, a clean dark UI, and smooth interactions.

---

## Demo
> Live Frontend: **_add your Vercel URL here_**  
> Live Backend: **_add your Render/Heroku URL here_**

![QuickNotes Demo](assets/demo.gif)  
> Replace `assets/demo.gif` with your real demo GIF path or URL.

---

## Features

- Create, read, update and delete notes (CRUD).  
- Notes stored in MongoDB Atlas.  
- Responsive, modern gradient + glassmorphism UI.  
- Edit notes in a focused modal with keyboard support.  
- Simple, deployable architecture (client + server separated).

---

## Tech stack

**Frontend**  
- Vite + React  
- Plain CSS (component-styled, responsive)

**Backend**  
- Node.js + Express  
- Mongoose (MongoDB Atlas)

**Tooling**  
- Git, GitHub, Nodemon, Vite dev server

---

## Project structure (important files)

quicknotes-mern/
├── client/ # Vite React app (frontend)
│ ├── src/
│ │ ├── App.jsx
│ │ ├── styles.css
│ │ └── main.jsx
│ └── package.json
├── server/ # Express backend
│ ├── index.js
│ ├── models/Note.js
│ ├── .env # (not committed) contains MONGO_URI
│ └── package.json
└── README.md

yaml
Copy code

---

## Local setup (developer)

> Make sure you have Node.js (LTS 22.x) installed.

### 1. Clone & install


git clone <your-repo-url>
cd quicknotes-mern

# server deps
cd server
npm install

# client deps
cd ../client
npm install
2. Create .env for server
Create server/.env with:

ini
Copy code
MONGO_URI=mongodb+srv://<db_user>:<ENCODED_PASSWORD>@<cluster>.mongodb.net/quicknotesdb?retryWrites=true&w=majority
PORT=5000
If your DB password includes special characters, URL-encode it (encodeURIComponent).

3. Run locally
Open two terminals:

bash
Copy code
# terminal 1 (server)
cd server
npm run dev

# terminal 2 (client)
cd client
npm run dev
Frontend runs at http://localhost:5173 and backend at http://localhost:5000.

API Endpoints
GET /api/ping → { message: 'pong' }

GET /api/notes → list of notes

POST /api/notes → create note { title, body }

PUT /api/notes/:id → update note { title, body }

DELETE /api/notes/:id → delete note

Deployment (high level)
Deploy server to Render / Heroku (set MONGO_URI in env vars).

Deploy client to Vercel (set proxy or point to server URL in production).

I recommend Render (free) for server and Vercel for client.

I can give step-by-step Deploy instructions once you confirm you want to deploy.

Notes & Future improvements
Add authentication and user accounts (multi-user notes).

Add tags, search, and pagination.

Add CI, tests, and E2E checks for reliability.

Improve accessibility (aria, contrast) and add unit tests.

Author
Priyanshu Shrivastava
Email: priyanshushrivastavaa@gmail.com
Portfolio : https://portfolio-priyanshushrivastavaa.vercel.app/
