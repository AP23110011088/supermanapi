# HeroVault

HeroVault is a private superhero roster manager. Create your own entries, upload character images, and import published character data from the Superhero API when you want a faster starting point.

## Features

- Account registration and sign-in with JWT authentication
- Private rosters scoped to each user
- Create, edit, delete, and search saved heroes
- Local image uploads, with optional Cloudinary storage
- Superhero API search and one-click imports

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (running locally or MongoDB Atlas connection string)
- Superhero API key (get it from [superheroapi.com](https://superheroapi.com/))

## Setup Instructions

### Windows npm note

If PowerShell blocks `npm`, either use `npm.cmd` for the commands below or run this once in PowerShell as Administrator:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 1. Backend Setup

```bash
npm install

npm run dev
```

Before starting the server, update `.env`:

- `MONGODB_URI`: MongoDB Atlas or local MongoDB connection string
- `JWT_SECRET`: long random signing secret
- `SUPERHERO_API_KEY`: key from [superheroapi.com](https://superheroapi.com/)
- `CLOUDINARY_*`: optional; local uploads are used when these are missing

The backend runs on `http://localhost:5000`.

### 2. Frontend Setup

```bash
cd client
npm install
npm start
```

The frontend will run on port 3000.

For a production-style local run, build the client and start the server. Express will serve `client/build` automatically:

```bash
npm run build
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Superheroes
- `GET /api/superheroes` - Get all user's superheroes
- `GET /api/superheroes/:id` - Get single superhero
- `POST /api/superheroes` - Create superhero (with image upload)
- `PUT /api/superheroes/:id` - Update superhero (with image upload)
- `DELETE /api/superheroes/:id` - Delete superhero

### Superhero API
- `GET /api/superhero-api/search/:name` - Search superheroes by name
- `GET /api/superhero-api/:id` - Get superhero by API ID

## Usage

1. Register or sign in.
2. Add a hero manually or import one from the roster page.
3. Edit details, replace images, or remove entries as your roster changes.

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Multer for file uploads
- Axios for API requests

### Frontend
- React
- Axios
- React Router

## License

MIT
