# Elibuy Deployment Guide

This guide explains how to deploy the Elibuy application as a decoupled system: **Backend on Render** and **Frontend on Vercel**.

## 📋 Prerequisites

1.  **MongoDB Atlas**: A running cluster. Ensure "Allow Access from Anywhere" (0.0.0.0/0) is enabled in Network Access.
2.  **Paystack Account**: Get your Public and Secret keys from the Paystack Dashboard (Settings > API Keys & Webhooks).
3.  **GitHub Repository**: Your code should be pushed to a GitHub repository.

---

## 🚀 Step 1: Backend Deployment (Render.com)

1.  **Create a New Web Service**:
    *   Connect your GitHub repository.
    *   **Name**: `elibuy-api` (or similar).
    *   **Environment**: `Node`.
    *   **Build Command**: `npm install`
    *   **Start Command**: `npm start`
2.  **Environment Variables**:
    Add the following in the "Environment" tab:
    *   `NODE_ENV`: `production`
    *   `MONGODB_URI`: `mongodb+srv://...` (Your full connection string)
    *   `JWT_SECRET`: `your_random_secret_string`
    *   `PAYSTACK_SECRET_KEY`: `sk_live_...` or `sk_test_...`
    *   `FRONTEND_URL`: `https://your-app.vercel.app` (You will update this after Step 2).
3.  **Deploy**: Render will provide a URL like `https://elibuy-api.onrender.com`. **Copy this URL.**

---

## 🚀 Step 2: Frontend Deployment (Vercel.com)

1.  **Create a New Project**:
    *   Import your GitHub repository.
2.  **Configure Project**:
    *   **Framework Preset**: `Vite`.
    *   **Build Command**: `npm run build`.
    *   **Output Directory**: `dist`.
3.  **Environment Variables**:
    Add the following in the "Environment Variables" section:
    *   `VITE_API_URL`: `https://elibuy-api.onrender.com` (The URL you copied from Render).
    *   `VITE_PAYSTACK_PUBLIC_KEY`: `pk_live_...` or `pk_test_...`.
4.  **Deploy**: Vercel will provide a URL like `https://elibuy-app.vercel.app`. **Copy this URL.**

---

## 🔗 Step 3: Connect the Two

1.  Go back to your **Render Dashboard**.
2.  Open your `elibuy-api` service.
3.  Go to **Environment**.
4.  Update `FRONTEND_URL` with your actual Vercel URL: `https://elibuy-app.vercel.app`.
5.  Save changes. Render will redeploy.

---

## 🛠️ Troubleshooting

### CORS Errors
If you see "CORS" errors in the browser console:
*   Ensure `FRONTEND_URL` on Render matches your Vercel URL exactly (no trailing slash).
*   Ensure `VITE_API_URL` on Vercel matches your Render URL exactly.

### Database Connection
If the app says "Database: disconnected":
*   Check your `MONGODB_URI` for typos.
*   Ensure your IP is whitelisted in MongoDB Atlas (Network Access > 0.0.0.0/0).

### Payment Issues
*   Ensure you are using the **Public Key** on Vercel (`VITE_` prefix) and the **Secret Key** on Render.
*   For testing, use Paystack test keys and test cards.
