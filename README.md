# SHS Canteen Kiosk

A complete web application system designed to streamline ordering and manage queues at the senior high school canteen. It features a student-facing kiosk interface and an administration dashboard for stall owners to manage their products, orders, and view student feedback.

## Features

- **Student Kiosk**: 
  - Browse stores and their available menus
  - Add items to tray and checkout
  - Real-time cart calculation
  - Order status tracking (via Email notifications)
  - Leave ratings and feedback for stores/products

- **Admin Dashboard**:
  - Secure login for stall administrators
  - Order management (Accept, Prepare, Complete)
  - Real-time inventory toggling (In-stock / Sold-out)
  - Business analytics (Total Revenue, Orders, Average Rating, Popular Items)
  - Direct view of student feedback and ratings

## Tech Stack

- **Frontend**: Vanilla HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **External Services**: EmailJS (for order notifications)

## Getting Started (Local Development)

### 1. Backend Setup
Navigate to the `server` directory and install dependencies:
```bash
cd server
npm install
```
Create a `.env` file in the `server` directory with your MongoDB connection string and EmailJS credentials, then run:
```bash
npm run dev
```

### 2. Frontend Setup
The frontend uses plain HTML/CSS/JS. You can serve the `client` directory using any local web server (e.g., VS Code Live Server plug-in):
1. Open the project in VS Code.
2. Right-click `client/index.html` and select **"Open with Live Server"**.
3. *Note: For local testing, ensure the `window.config.apiUrl` in HTML files points to your local backend (`http://localhost:5000/api`) if you aren't using the deployed version.*
