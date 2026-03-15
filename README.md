<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Elibuy - Frontend (Vite + React)

This is the frontend for the Elibuy e-commerce platform, built with Vite, React, and Tailwind CSS.

## Run Locally

**Prerequisites:**
*   Node.js (v18 or higher recommended)
*   A running instance of the `elibuy-server` backend.

### Setup

1. Install dependencies:
   `npm install`

2. Create a `.env` file in this directory (`elibuy/`) and add the following environment variables:
   ```
   # The URL of your running backend server
   VITE_API_URL=http://localhost:3000

   # Your public key from the Paystack dashboard
   VITE_PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

3. Run the development server:
   `npm run dev`
