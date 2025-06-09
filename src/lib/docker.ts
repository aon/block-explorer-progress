import Docker from "dockerode";
import { DOCKER_CONTAINER_NAME } from "astro:env/server";

// Docker connection configuration
export class DockerClient {
  private docker: Docker;

  constructor() {
    // Initialize Docker connection
    // In development, this will connect to the local Docker socket
    // In production, you might want to use TCP with TLS
    this.docker = new Docker({
      socketPath: "/var/run/docker.sock", // Default Docker socket on Unix systems
    });
  }

  /**
   * Get the Docker instance
   */
  getDocker(): Docker {
    return this.docker;
  }

  /**
   * Get a container by name from environment variable
   */
  getContainer(): Docker.Container | null {
    const containerName = DOCKER_CONTAINER_NAME;

    if (!containerName) {
      console.error("DOCKER_CONTAINER_NAME environment variable is not set");
      return null;
    }

    try {
      return this.docker.getContainer(containerName);
    } catch (error) {
      console.error(`Failed to get container ${containerName}:`, error);
      return null;
    }
  }

  /**
   * Test Docker connection by listing containers
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.docker.listContainers();
      return true;
    } catch (error) {
      console.error("Docker connection test failed:", error);
      return false;
    }
  }

  /**
   * Get logs from the specified container
   * @param since - Get logs since this timestamp (optional)
   * @param tail - Number of lines to return from the end of logs (optional)
   */
  async getContainerLogs(since?: string, tail?: number): Promise<string[]> {
    const container = this.getContainer();

    if (!container) {
      throw new Error("Container not found or not configured");
    }

    try {
      const logStream = await container.logs({
        stdout: true,
        stderr: true,
        timestamps: true,
        since: since || undefined,
        tail: tail || 100, // Default to last 100 lines
      });

      // Convert the log stream to string array
      const logString = logStream.toString("utf8");

      // Split by lines and filter out empty lines
      const logLines = logString
        .split("\n")
        .map((line) => {
          // Remove Docker log prefix (first 8 bytes are header info)
          if (line.length > 8) {
            return line.substring(8);
          }
          return line;
        })
        .filter((line) => line.trim().length > 0);

      return logLines;
    } catch (error) {
      console.error("Failed to fetch container logs:", error);
      throw error;
    }
  }

  /**
   * Parse logs to find block numbers
   * @param logs - Array of log lines
   */
  parseBlockNumbers(
    logs: string[]
  ): Array<{ blockNumber: number; timestamp: string; fullLog: any }> {
    const blockLogs: Array<{
      blockNumber: number;
      timestamp: string;
      fullLog: any;
    }> = [];

    // Regex to match ISO timestamp at the start of the line, followed by a space
    const timestampRegex =
      /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z)\s+(.*)$/;

    for (const log of logs) {
      console.log("Log:", log);
      let jsonPart = log;
      let timestamp = new Date().toISOString();

      // Check for timestamp prefix
      const match = log.match(timestampRegex);
      if (match) {
        timestamp = match[1];
        jsonPart = match[2];
      }

      try {
        // Try to parse the JSON part
        const parsed = JSON.parse(jsonPart);

        // Check if this log contains a blockNumber
        if (parsed.blockNumber && typeof parsed.blockNumber === "number") {
          blockLogs.push({
            blockNumber: parsed.blockNumber,
            timestamp: parsed.timestamp || timestamp,
            fullLog: parsed,
          });
        }
      } catch (error) {
        // Skip lines that aren't valid JSON after timestamp
        continue;
      }
    }

    // Sort by block number descending to get the latest first
    return blockLogs.sort((a, b) => b.blockNumber - a.blockNumber);
  }

  /**
   * Get the latest block number from container logs
   */
  async getLatestBlockNumber(): Promise<{
    blockNumber: number;
    timestamp: string;
    lastUpdate: string;
  } | null> {
    try {
      const logs = await this.getContainerLogs();
      const blockLogs = this.parseBlockNumbers(logs);

      if (blockLogs.length > 0) {
        const latest = blockLogs[0];
        return {
          blockNumber: latest.blockNumber,
          timestamp: latest.timestamp,
          lastUpdate: new Date().toISOString(),
        };
      }

      return null;
    } catch (error) {
      console.error("Failed to get latest block number:", error);
      throw error;
    }
  }
}

// Export a singleton instance
export const dockerClient = new DockerClient();
