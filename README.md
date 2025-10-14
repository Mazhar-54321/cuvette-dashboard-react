# 🚀 Cuvette API Logger Integration Guide

This guide explains how to integrate and use the **Cuvette API Logger** in your project.

---

## 🧩 Steps to Use

### Step 1: Install the Package
npm install cuvette-api-tracer

### Step 2: Import and Use the Logger
Add the following in your `index.js` file:
import logger from 'cuvette-api-tracer';
app.use(logger());

### Step 3: Attach API Key in Request Headers
When making requests, include your API key in the headers:
x-api-key: <your-api-key>

---

## ⚙️ Notes

- We follow 24-hour time format for all logs.
- Always check the Configuration tab if data is not found.
- We are using a free instance of Render, which will spin down with inactivity — this may cause a delay of 50 seconds or more for the first request.

---

## 💻 Example Usage

Below is a sample setup for integrating the logger into an Express app:

import express from 'express';
import logger from 'cuvette-api-tracer';

const app = express();
app.use(logger());

app.get('/', (req, res) => {
  res.send('Cuvette API Logger is running successfully 🚀');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

---

### Example API Request

Attach your API key in the header while sending a request:
curl -X GET http://localhost:5000/ -H "x-api-key: <your-api-key>"

---

✅ Now you’re all set!
Start your server, make some API requests, and check the Cuvette dashboard for live request logs.
