# NYC Car Accident Tracker

A web application that allows users to search for car accidents in New York City by car make and model.

## Project Structure

- `frontend/`: Next.js frontend application
- `backend/`: Python FastAPI backend

## Prerequisites

- Node.js (v14 or higher)
- Python (v3.8 or higher)
- npm or yarn

## Setup and Running

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows, use: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the backend server:
   ```bash
   python main.py
   ```

The backend server will run on `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

The frontend will be available at `http://localhost:3000`

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Enter a car make and model in the search form
3. Click "Search Accidents" to view accident data

## Note

This is a demonstration project. The backend currently returns mock data. To get real accident data, you would need to:

1. Register for the NYC Open Data API
2. Update the backend code to make actual API calls to the NYC Open Data platform
3. Handle authentication and rate limiting as required by the API 