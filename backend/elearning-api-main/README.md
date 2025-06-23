# E-Learning API
API design for an e-learning platform that is aimed to empower refugees in Rwanda through education and economic opportunities. The platform is designed to operate in low-connectivity environments, support multiple languages (e.g., Kinyarwanda, English, French, Swahili), and provide personalized learning paths, digital literacy training, and job linkages.

## Getting Started
Follow these steps to set up and run the project on your local machine.

### Prerequisites
Ensure you have the following installed:
- Python 3.10 or higher
- Git

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/elearning-api.git

2. **Navigate into the Project Folder**
   ```bash
   cd elearning-api

3. **Create a Virtual Environment**
   ```bash
   python -m venv env

4. **Activate the Virtual Environment**
   ```bash
    Windows (Powershell):
      . env\Scripts\Activate

    Git Bash:
      . source env/Scripts/activate

    macOS/Linux:
      . source env/bin/activate

5. **Install Dependencies**
   ```bash
   pip install -r requirements.txt

6. **Remember to create a .env file and add you keys/password in the file**
   .env Variables

   SECRET_KEY=

   DEBUG=

   ALLOWED_HOSTS=

   CACHE_TIMEOUT=

   CORS_ALLOW_ALL_ORIGINS=

   CORS_ALLOWED_ORIGINS=

   EMAIL_BACKEND=

   EMAIL_PORT=

   EMAIL_USE_TLS=

   EMAIL_HOST_USER=

   EMAIL_HOST_PASSWORD=

1. **Running the Project (Run the Development Server)**
   ```bash
   python manage.py runserver
