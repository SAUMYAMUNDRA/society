# Society Management System

A full-stack web application built to manage various aspects of a residential society, including notice management, maintenance tracking, member authentication, complaint handling, and financial oversight.

## 🚀 Features

- 🔐 **Role-Based Authentication**: Secure login/logout functionality for members and the secretary using session-based authentication.
- 📢 **Notice Management**: Post and display notices in real-time using MongoDB.
- 🛠️ **Complaint Ticketing System**: Members can raise complaints; coordinators can view and resolve them.
- 💰 **Financial Management** *(planned/optional)*: Basic ledger or tracking of maintenance payments.
- 🧾 **QR-based Attendance (Optional)**: Generate and scan QR codes for events or daily attendance *(if implemented)*.
- 📱 **Responsive UI**: Clean and modern interface using Tailwind CSS, optimized for all screen sizes.

## 🛠️ Tech Stack

- **Frontend**: HTML, Tailwind CSS, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (using Mongoose)
- **Session Management**: `express-session`, cookies
## 📁 Project Structure

society-management-system/
│
├── public/           # Static assets (CSS, JS)
├── views/            # HTML files (notices, login, dashboard, etc.)
├── routes/           # Express routes (auth, notices, complaints)
├── models/           # Mongoose models (User, Notice, Complaint)
├── app.js            # Main server file
├── package.json
└── README.md

## 🔧 Installation

1. **Clone the repository**

```bash
git clone https://github.com/your-username/society-management-system.git
cd society-management-system
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up MongoDB**

Make sure you have MongoDB installed locally or use a MongoDB Atlas cloud database.

Create a `.env` file in the root directory and add:

```env
MONGO_URI=your_mongodb_connection_string
SESSION_SECRET=your_session_secret
PORT=3000
```

4. **Run the application**

```bash
node app.js
```

5. **Open in Browser**

Navigate to: [http://localhost:3000](http://localhost:3000)


