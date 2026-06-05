# NDS Sorting Application

A web application for sorting and comparing colleges based on various parameters.

## Project Structure

The project consists of two main parts:

- **Frontend**: A React application built with TypeScript, Vite, and Tailwind CSS
- **Backend**: A FastAPI server that provides college data and search functionality

## Features

- Recursive sorting of colleges based on multiple parameters
- Comparison of colleges
- Sorting history tracking
- Search functionality for college information

## Getting Started

### Prerequisites

- Node.js (v16+)
- Python (v3.8+)
- npm or yarn
- Docker and Docker Compose (for containerized deployment)

### Installation

#### Local Development

##### Backend

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install the required Python packages:
   ```
   pip install -r requirements.txt
   ```

3. Create a `.env` file with the following variables (optional for search functionality):
   ```
   GOOGLE_SEARCH_API_KEY=your_google_api_key
   GOOGLE_SEARCH_CX=your_google_cx_id
   ```

4. Start the backend server:
   ```
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```

##### Frontend

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install the required npm packages:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

#### Docker Deployment

1. Make sure Docker and Docker Compose are installed on your system.

2. Create a `.env` file in the backend directory with your API keys (optional).

3. Run the application using Docker Compose:
   ```
   docker-compose up -d
   ```

4. Access the application at http://localhost:80

## Deployment on Coolify

This application is configured for easy deployment on Coolify using Docker Compose.

### Setup Instructions

1. **Fork or clone this repository to your GitHub account**

2. **Connect your Coolify instance to your GitHub repository**:
   - In Coolify, go to "Sources" and connect your GitHub account
   - Select the repository you just forked/cloned

3. **Create a new service in Coolify**:
   - Select "Docker Compose" as the deployment type
   - Choose the repository and branch (usually `master` or `main`)
   - Set the Docker Compose file path to `docker-compose.coolify.yml`
   - Configure the following environment variables:
     - `GOOGLE_SEARCH_API_KEY`: Your Google Search API key (optional)
     - `GOOGLE_SEARCH_CX`: Your Google Search CX ID (optional)
     - `BACKEND_URL`: The URL where your backend will be accessible
     - `FRONTEND_PORT`: Port for the frontend (default: 80)
     - `BACKEND_PORT`: Port for the backend (default: 8000)

4. **Add the CSV file as a volume**:
   - In the Coolify service configuration, add a volume:
     - Source: `Scores with Names.csv`
     - Destination: `/app/Scores with Names.csv`

5. **Deploy the application**:
   - Click "Deploy" to start the deployment process
   - Coolify will build and deploy both the frontend and backend containers

6. **Access your application**:
   - Once deployment is complete, access your application using the URL provided by Coolify

### Updating the Application

When you make changes to the code:

1. Commit and push your changes to GitHub:
   ```
   ./deploy.sh
   ```
   This script will commit your changes and push them to GitHub.

2. In Coolify, go to your service and click "Deploy" to update the application with your changes.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 