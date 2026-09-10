# Cortexx SIH 2026: Crop Disease & Pest Management

This repository contains the complete microservice architecture for the Smart India Hackathon problem statement **SIH26131**.

## How to Run the Application

I have configured a root script so you can run the entire system with a single command!

### 1. Start Everything Together
Open your terminal in the root `Cortexx_SIH` folder and run:
```bash
npm run dev
```
*(This uses a tool called `concurrently` to start the Node Backend, the Python ML Service, the Farmer React App, and the Admin React App all at the same time in one terminal).*

### 2. View the Database
To view and manage your PostgreSQL database visually using Prisma Studio, open a second terminal tab in the root folder and run:
```bash
npm run studio
```
*(This will open the Prisma Studio UI in your browser).*

---

### Important Requirements:
* **Database**: Ensure you have PostgreSQL installed locally or update the `DATABASE_URL` in `backend/.env` to a cloud database (like Supabase or Render). You will need to run `npx prisma db push` inside the `backend` folder to create the tables in your database before logging in or running the app for the first time.
