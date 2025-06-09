import type { APIRoute } from "astro";
import { dockerClient } from "../../lib/docker";

function parseTextBlockNumbers(
  logs: string[]
): Array<{ blockNumber: number; timestamp: string; fullLog: string }> {
  const blockLogs: Array<{
    blockNumber: number;
    timestamp: string;
    fullLog: string;
  }> = [];
  const blockRegex = /number=([0-9]+)/;
  for (const log of logs) {
    const match = log.match(blockRegex);
    if (match) {
      const blockNumber = parseInt(match[1], 10);
      // Try to extract timestamp from the log line (ISO or RFC3339)
      const timestampMatch = log.match(
        /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z/
      );
      blockLogs.push({
        blockNumber,
        timestamp: timestampMatch
          ? timestampMatch[0]
          : new Date().toISOString(),
        fullLog: log,
      });
    }
  }
  // Sort by block number descending
  return blockLogs.sort((a, b) => b.blockNumber - a.blockNumber);
}

export const GET: APIRoute = async ({ url }) => {
  try {
    const tail = parseInt(url.searchParams.get("tail") || "100", 10);
    const since = url.searchParams.get("since") || undefined;

    // Fetch logs from Docker container
    const logs = await dockerClient.getContainerLogs(since, tail);

    // Parse JSON logs for blockNumber
    const jsonBlockLogs = dockerClient.parseBlockNumbers(logs);
    // Parse text logs for block numbers (e.g., reth logs)
    const textBlockLogs = parseTextBlockNumbers(logs);

    // Combine and deduplicate by blockNumber
    const allBlockLogs = [...jsonBlockLogs, ...textBlockLogs].reduce(
      (acc, log) => {
        if (!acc.some((l) => l.blockNumber === log.blockNumber)) {
          acc.push(log);
        }
        return acc;
      },
      [] as Array<{ blockNumber: number; timestamp: string; fullLog: any }>
    );

    // Sort by block number descending
    allBlockLogs.sort((a, b) => b.blockNumber - a.blockNumber);

    const latest = allBlockLogs[0] || null;

    return new Response(
      JSON.stringify({
        success: true,
        latestBlock: latest,
        allBlockLogs,
        totalLogLines: logs.length,
        sampleLogs: logs.slice(0, 5),
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Block logs API error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Unknown error occurred",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
