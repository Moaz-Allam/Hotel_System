# Hotel System

A single-page web application for managing hotel staff and HR processes, built with modern React tools and Firebase.

## Features

* **Employee Management**: Add, edit, and remove employee profiles.
* **Scheduling**: Create and track shift assignments, interviews, and other appointments.
* **PDF Generation**: Generate contracts, pay stubs, and reports on the fly using html2pdf.js.
* **Email Notifications**: Send offer letters, reminders, and other transactional emails via EmailJS.
* **Authentication & Data Storage**: Secure user sign-in and real-time database with Firebase.

## Tech Stack

* **Frontend**: React (Create React App), React Router v6
* **UI Library**: Material UI (MUI) & MUI Data Grid
* **Forms**: React Hook Form
* **Backend Services**: Firebase (Authentication, Firestore) & firebase-admin
* **Email**: EmailJS (`emailjs-com`)
* **PDFs**: html2pdf.js
* **Date Utilities**: date-fns

## Getting Started

### Prerequisites

* [Node.js](https://nodejs.org/) (>=14.x)
* npm (comes with Node.js)
* A Firebase project with Firestore and Authentication enabled

### Installation

1. **Clone the repo**

   ```bash
   git clone https://github.com/Moaz-Allam/Hotel_System.git
   cd Hotel_System
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure Firebase**

   * Copy `.env.example` to `.env` and fill in your Firebase config values.
   * Place your service account JSON under `src/firebase/` and update the import path if necessary.

4. **Run the app locally**

   ```bash
   npm start
   ```

The application will be available at `http://localhost:3000`.

### Build for Production

```bash
npm run build
```

The optimized build will be in the `build/` directory.

## Project Structure

```
Hotel_System/
├── public/               # Static assets
├── src/
│   ├── components/       # Reusable UI components
│   ├── pages/            # Route-based page components
│   ├── firebase/         # Firebase config & admin SDK
│   ├── forms/            # React Hook Form definitions
│   ├── utils/            # Utility functions (e.g., date formatting)
│   └── App.js            # Main app and router
├── .env.example          # Firebase environment variables template
├── firebase.json         # Firebase hosting & functions config
├── package.json
└── README.md
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'Add feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
