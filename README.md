# MSL Block Explorer

A simple, terminal-styled block explorer to monitor the progress of a blockchain node or scanner. This application displays the latest block scanned by a local Docker container and shows its sync progress against the live blockchain's current block number.

![Screenshot](public/screenshot.png)

## 🚀 Features

- **Real-time Block Monitoring**: Fetches the latest scanned block number from a specified Docker container's logs.
- **Sync Progress**: Compares the scanned block to the current block number from an Ethereum RPC and displays a progress bar.
- **Terminal UI**: A retro, terminal-inspired interface built with Astro, React, Tailwind CSS, and shadcn/ui.
- **Dockerized**: Includes a multi-stage `Dockerfile` for easy production deployment.

## 🛠️ Project Structure

- `/public`: Static assets.
- `/src/components`: React components, including the main `BlockNumberDisplay`.
- `/src/pages/api`: Server-side API endpoints for fetching block data.
- `/src/styles`: Global styles and Tailwind configuration.
- `Dockerfile`: Configuration for building the production Docker image.
- `astro.config.mjs`: Astro project configuration.
- `tailwind.config.cjs`: Tailwind CSS theme and plugin configuration.

## ⚙️ Setup & Configuration

### 1. Install Dependencies

This project uses `pnpm` as the package manager.

```sh
pnpm install
```

### 2. Environment Variables

Create a `.env` file in the root of the project by copying the example file:

```sh
cp env.example .env
```

Update the `.env` file with your specific configuration:

- `DOCKER_CONTAINER_NAME`: The name of the Docker container whose logs you want to monitor.
- `ETH_RPC_URL`: The URL for an Ethereum JSON-RPC endpoint (e.g., from Infura, Alchemy, or your own node).

## 💻 Running Locally

To start the local development server, run:

```sh
pnpm run dev
```

The application will be available at `http://localhost:4321`.

## 📦 Docker Deployment

A multi-stage `Dockerfile` is included for creating an optimized production image.

### 1. Build the Image

From the root of the project, run the following command to build the Docker image:

```sh
docker build -t msl-block-explorer .
```

### 2. Run the Container

Once the image is built, you can run it as a container. Make sure to pass the required environment variables.

```sh
docker run -p 4321:4321 \
  -e DOCKER_CONTAINER_NAME="your_container_name" \
  -e ETH_RPC_URL="your_rpc_url" \
  --name msl-block-explorer-container \
  -v /var/run/docker.sock:/var/run/docker.sock \
  msl-block-explorer
```

### 3. Using the Start Script (Recommended)

An executable script is provided at `scripts/start.sh` to simplify the build and run process. This script will automatically:

1.  Build the Docker image.
2.  Stop and remove any existing container with the same name.
3.  Start a new container.

To use it, simply run:

```sh
./scripts/start.sh
```

By default, the application will be exposed on port `3000`. You can specify a different host port by passing it as an argument:

```sh
./scripts/start.sh 8080
```

This will map port `8080` on your host to port `3000` in the container.

### 4. Stopping the Container

To stop and remove the container, you can use the provided script:

```sh
./scripts/stop.sh
```

This script will find the container by name, stop it if it's running, and then permanently remove it.

**Note on Docker Socket:** The command above mounts the Docker socket (`/var/run/docker.sock`) into the container. This is necessary for the application to read logs from other containers. Be aware of the security implications of providing access to the Docker socket.

The application will be accessible at `http://localhost:4321`.
