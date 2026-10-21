# Attendance Buffer

A full stack web application that tells students **how many classes they can still skip** (or **how many they must attend in a row**) to keep their attendance above the required percentage.

Built with **Node.js, Express.js and MongoDB (Mongoose)** and a plain HTML/CSS/JavaScript frontend.

## Objective
Most students only know their current attendance percentage. This project answers the questions that actually matter: *Can I skip tomorrow's class? How many classes do I need to attend to get back to 75%?*

## Features
- Add subjects with a custom target percentage (default 75%)
- Mark each class as Present or Absent
- Live percentage with Safe / Warning / Danger colour status
- "Classes you can skip" and "classes you must attend" calculator
- "What if I skip N classes?" predictor
- Overall dashboard built with MongoDB aggregation pipelines
- Server-side validation, error handling and unit tests for the calculation logic

## How the maths works
- Skippable classes `x`: attended / (held + x) >= target/100  ->  x = floor(attended*100/target - held)
- Classes to attend `y`: (attended + y) / (held + y) >= target/100  ->  y = ceil((target*held - 100*attended) / (100 - target))

## Tech Stack
| Layer | Technology |
|-------|------------|
| Frontend | HTML, CSS, JavaScript (Fetch API) |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose ODM |
| Testing | Node.js built-in test runner, Postman |
| Tools | Git, GitHub, VS Code |

## Project Structure
```
attendance-buffer/
|-- server.js            # Entry point, middleware, DB connection
|-- models/Subject.js    # Mongoose schema + validation
|-- routes/subjects.js   # REST API (CRUD, mark, what-if, summary)
|-- utils/calc.js        # Attendance calculation logic
|-- test/calc.test.js    # Unit tests
|-- public/index.html    # Frontend UI
`-- .env.example
```

## Execution Steps
1. Install Node.js (v18+) and set up MongoDB (local) or a free MongoDB Atlas cluster
2. `git clone <repo-url>` and `cd attendance-buffer`
3. `npm install`
4. Copy `.env.example` to `.env` and set `MONGO_URI`
5. `npm test` (optional) to run unit tests
6. `npm start` and open `http://localhost:3000`

## API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/subjects | Add a subject |
| GET | /api/subjects | List subjects with calculated stats |
| GET | /api/subjects/summary | Overall dashboard (aggregation) |
| POST | /api/subjects/:id/mark | Mark a class `{ "present": true/false }` |
| GET | /api/subjects/:id/whatif?skip=N | Predict percentage if N classes are skipped |
| PUT | /api/subjects/:id | Edit a subject |
| DELETE | /api/subjects/:id | Delete a subject |

## Output
Screenshots are in the `screenshots/` folder.

## Author
Fardeen Malik | 1NH23CS148 | 7 / C
