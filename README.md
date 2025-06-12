# Refugee Learning Platform

The Refugee Learning Platform is a modular application designed to provide educational resources to refugees, with offline-first functionality and scalable deployment.

## Description

This project aims to bridge the gap in education for refugees by providing a platform that works seamlessly in low-connectivity environments. The platform includes a React-based frontend with offline support using PouchDB and a Django-based backend with CouchDB for data synchronization.

## GitHub Repository

[GitHub Repository Link](https://github.com/your-username/refugee-learning-platform)

## How to Set Up the Environment and the Project

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:
   - Windows:
     ```bash
     .\venv\Scripts\activate
     ```
   - Unix/MacOS:
     ```bash
     source venv/bin/activate
     ```

4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Run migrations:
   ```bash
   python manage.py migrate
   ```

6. Start the development server:
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

## Designs

### Figma Mockups

[Figma Design Link](https://www.figma.com/file/example)

### Circuit Diagram

![Circuit Diagram](path/to/circuit-diagram.png)

### Screenshots of the App Interfaces

- **Login Page**  
  ![Login Page](path/to/login-screenshot.png)

- **Dashboard**  
  ![Dashboard](path/to/dashboard-screenshot.png)

## Deployment Plan

This project adopts a modular deployment structure to ensure reliability, scalability, and offline support for users in low-connectivity environments:

### Frontend (React + PouchDB)

The frontend will be deployed using **Netlify**, which offers continuous deployment from GitHub. The application is built with React and leverages PouchDB for client-side data storage. This enables offline-first functionality, allowing users to access and interact with educational content without an internet connection. When a connection is restored, PouchDB will automatically synchronize with the central CouchDB database.

### Backend (Django + CouchDB)

The backend will be developed using the Django framework and hosted on **Heroku**, which supports Python applications. Instead of a traditional SQL database, CouchDB will be used as the primary data store. Django will handle API requests, authentication, and business logic, while facilitating data sync between CouchDB and PouchDB for consistent and reliable data exchange.

## Video Demo

[Video Demo Link](https://www.youtube.com/watch?v=example)

## API Documentation

The API documentation is available at:
- Swagger UI: [http://localhost:8000/swagger/](http://localhost:8000/swagger/)
- ReDoc: [http://localhost:8000/redoc/](http://localhost:8000/redoc/)

## Contributing

Contributions are welcome! Please follow the guidelines in the `CONTRIBUTING.md` file.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
