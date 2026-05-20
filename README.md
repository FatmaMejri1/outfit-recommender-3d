# 3D Fashion Marketplace

A modern, AI-powered e-commerce platform that offers personalized clothing recommendations based on user body measurements, morphological similarity, NLP-based text matching, and historical purchase data.

---

## 🏗️ Architecture overview

This project consists of three main layers:

1. **Express Backend** (`/backend`)
   - Handles REST API, authentication, database modeling (Sequelize), order processing, and administrative statistics.
   - Computes real-time morpho-similarity ("Body Twins") directly against the MySQL database.
   - Acts as a proxy to the AI microservice for recommendations.

2. **FastAPI AI Service** (`/ai-service`)
   - Predicts fit scores (Gaussian curve models mapping body size to product dimensions).
   - Generates user preference scores and historical return risk probabilities (RandomForest classifiers).
   - Utilizes NLP (TF-IDF Cosine Similarity) to match user search queries against product descriptions.

3. **React Frontend** *(Pending Integration)*
   - User-facing marketplace interface and 3D rendering.

---

## 🛠️ Tech Stack

*   **Database**: MySQL
*   **Backend Framework**: Node.js / Express.js
*   **ORM**: Sequelize
*   **AI Microservice**: Python / FastAPI / Scikit-Learn
*   **Documentation**: Swagger UI

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- [Node.js](https://nodejs.org/) installed
- [Python 3.x](https://www.python.org/) installed
- [MySQL](https://www.mysql.com/) installed and running locally.

### 2. Database Setup
Create the main database in MySQL:
```sql
CREATE DATABASE fashion_marketplace;
```

### 3. Configure the Express Backend
Navigate to the `backend` directory, install dependencies, and configure your environment:
```bash
cd backend
npm install
```

Make sure your `.env` file in the `backend/` directory looks like this:
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASS=your_mysql_password
DB_NAME=fashion_marketplace
DB_PORT=3306
JWT_SECRET=your_super_secret_key_here
AI_SERVICE_URL=http://localhost:8002
```

### 4. Seed the Database
Populate your MySQL database with realistic users, products, orders, and body measurements:
```bash
node seed.js
```
*This will create an admin account (`admin@marketplace.com` / `password123`) and several standard users with realistic body shapes.*

### 5. Start the Express Backend
```bash
node app.js
```
The REST API will be available at: **http://localhost:3000**
The interactive Swagger API Documentation will be at: **http://localhost:3000/api-docs**

### 6. Start the FastAPI AI Microservice
In a new terminal window, navigate to the `ai-service` directory and boot up the AI engine:
```bash
cd ai-service
pip install -r requirements.txt
python -m uvicorn app.main:app --port 8002
```

---

## 🧪 Testing the AI Pipeline

Once both servers are running, you can test the full AI recommendation pipeline through Swagger:
1. Go to `http://localhost:3000/api-docs`
2. **Login** (`POST /api/auth/login`) using a seeded user like `emma@example.com` (password: `password123`).
3. Copy the returned JWT token.
4. Click the **"Authorize"** button at the top of Swagger and paste your token.
5. Execute **`POST /api/recommend`**.

You will instantly receive a list of products scored and ranked by:
- **Fit Score**: How well it fits the user's body.
- **Similarity Score**: How popular the product is among users with the same body measurements.
- **Preference Score**: The AI's prediction of whether the user will like it.
- **Return Penalty**: The AI's calculation of the probability the user will return it.
