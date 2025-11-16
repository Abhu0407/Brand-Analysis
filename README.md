# MERN Brand Monitor

A brand monitoring application built with the MERN stack (MongoDB, Express, React, Node.js). This tool uses hybrid collectors to gather data from various sources and performs sentiment and topic analysis.

## Features

- **Data Collection**: Gathers brand mentions from sources like Twitter and Reddit.
- **Sentiment Analysis**: Automatically determines the sentiment (positive/negative) of each mention.
- **Topic Heuristics**: Basic topic identification for collected data.
- **MERN Stack**: A full-stack JavaScript application.

---

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (which includes npm)
- [MongoDB](https://www.mongodb.com/try/download/community) (ensure the service is running)

### Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone <your-repository-url>
    cd <repository-folder>
    ```

2.  **Set up the Backend:**
    ```sh
    cd backend
    npm install
    cp .env.example .env
    ```
    > **Important**: Open the newly created `.env` file and add your API keys for Twitter, Reddit, and any other required services.

3.  **Set up the Frontend:**
    ```sh
    cd ../frontend
    npm install
    ```

### Running the Application

- **Start the backend server:**
  ```sh
  # From the /backend directory
  npm run dev
  ```

- **Start the frontend development server:**
  ```sh
  # From the /frontend directory
  npm run dev
  ```

---

## Important Notes

*   This starter project uses simple in-process collectors and basic sentiment/topic heuristics.
*   For a production environment, it is highly recommended to:
    - Move data collectors to dedicated background workers (e.g., using message queues like RabbitMQ or a service like Bull).
    - Implement proper OAuth authentication flows for external APIs.
    - Add robust error handling and rate-limiting strategies to avoid being blocked by APIs.
