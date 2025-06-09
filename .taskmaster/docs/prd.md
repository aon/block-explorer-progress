# Product Requirements Document: MSL Block Explorer

## Overview

This document outlines the requirements for the MSL Block Explorer, a simple web application designed to monitor the progress of a blockchain data processing service running in a Docker container. The application will provide a real-time view of the latest block number processed by the service, giving developers and administrators immediate insight into the processor's status.

The target audience is developers and system administrators responsible for maintaining the MSL (My Super Ledger, assuming) data processing pipeline.

## Core Features

1.  **Dynamic Log Fetching:** The application will fetch logs from a specified Docker container.
2.  **Block Number Parsing:** It will parse the log entries to find and extract the `blockNumber` from structured log messages.
3.  **Real-time Display:** The latest `blockNumber` will be displayed on the web interface.
4.  **Auto-Polling:** The application will automatically poll for new logs every 30 seconds to keep the displayed `blockNumber` updated.
5.  **Configurable Container:** The name of the Docker container to monitor will be configurable via an environment variable.

## User Experience

- **User Persona:** Developer/System Administrator.
- **User Flow:**
  1.  The user opens the web application.
  2.  The application immediately fetches the logs from the configured Docker container.
  3.  It parses the logs to find the most recent `blockNumber`.
  4.  The `blockNumber` is displayed clearly on the page.
  5.  The application continues to poll for new logs every 30 seconds in the background and updates the displayed `blockNumber` if a new one is found.
- **UI/UX Considerations:**
  - The UI should be clean and minimalist.
  - The primary focus should be on displaying the latest `blockNumber` prominently.
  - A timestamp indicating the last update time would be beneficial.
  - Displaying the container name being monitored would also be useful.

## Technical Architecture

- **Frontend Framework:** Astro with the React integration. This allows for a fast, content-focused site with the ability to use dynamic React components.
- **Backend/Data Fetching:**
  - An API endpoint (server-side rendered part of Astro) will be responsible for interacting with the Docker daemon.
  - This endpoint will use a Docker SDK (like `dockerode` for Node.js) to get the logs from the specified container.
  - The container name will be retrieved from an environment variable (e.g., `DOCKER_CONTAINER_NAME`).
- **Log Parsing:** The backend will need a robust function to parse JSON log entries and filter for the ones containing `blockNumber`.
- **Polling Mechanism:** The frontend React component will use a `setInterval` or a library like `SWR` or `React Query` with a `refreshInterval` to call the backend API endpoint every 30 seconds.
- **Deployment:** The application will be a standard Node.js application that can be deployed anywhere that supports Node.js. It could also be deployed as a static site with serverless functions for the dynamic parts if using a platform like Vercel or Netlify.

## Development Roadmap

- **MVP Requirements:**

  1.  Set up an Astro project with React.
  2.  Create a backend API endpoint in Astro that can execute Docker commands.
  3.  Implement logic to read logs from the Docker container specified by an environment variable.
  4.  Implement the log parsing logic to extract the latest `blockNumber`.
  5.  Create a simple React component to display the fetched `blockNumber`.
  6.  Implement the 30-second polling mechanism on the frontend.
  7.  Basic styling to present the information clearly.

- **Future Enhancements:**
  - Display a historical graph of `blockNumber` over time.
  - Allow the user to select the container from a list of running containers.
  - Show other relevant information from the logs.
  - Add error handling and display for cases where the container is not running or logs cannot be fetched.
  - Display full log entries on demand.

## Logical Dependency Chain

1.  **Foundation:** Initialize the Astro + React project.
2.  **Backend Logic:** Create the API endpoint to connect to Docker and fetch logs. This is the core functionality and must be built first.
3.  **Frontend Display:** Build the React component that calls the API endpoint and displays the data.
4.  **Polling:** Add the auto-refreshing logic to the frontend component.
5.  **Styling & UX:** Polish the UI.

## Risks and Mitigations

- **Risk:** Docker daemon access from the web server.
  - **Mitigation:** Ensure the application is run in a secure environment. If the Docker socket is exposed, it must be done with appropriate permissions. For production, using the Docker TCP socket with TLS would be more secure.
- **Risk:** Performance impact of polling logs every 30 seconds.
  - **Mitigation:** The log fetching should be efficient. We should only request logs from the last few minutes or since the last poll to avoid pulling the entire log history each time. The Docker SDK should support this (`since` or `tail` options).
- **Risk:** Parsing malformed or unexpected log formats.
  - **Mitigation:** The parsing logic should be wrapped in `try-catch` blocks to handle JSON parsing errors gracefully and ignore log lines that don't match the expected format.
