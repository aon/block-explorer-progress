import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface BlockNumberData {
  blockNumber: number;
  timestamp: string;
  lastUpdate?: string;
  containerName?: string;
}

const TerminalHeader = ({ containerName }: { containerName?: string }) => (
  <CardHeader className="flex flex-row items-center justify-between p-2 px-4 border-b bg-zinc-800 rounded-t-lg">
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
    </div>
    <div className="text-sm text-zinc-400">
      {containerName ? `bash — ${containerName}` : "bash"}
    </div>
    <div className="w-16"></div>
  </CardHeader>
);

export const BlockNumberDisplay: React.FC = () => {
  const [data, setData] = useState<BlockNumberData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const fetchBlockNumber = async () => {
    // Keep existing loading state for first load, but not for subsequent fetches
    if (!data) {
      setLoading(true);
    }
    setError(null);
    try {
      const res = await fetch("/api/block-logs");
      const json = await res.json();
      if (json.success && json.latestBlock) {
        setData({
          blockNumber: json.latestBlock.blockNumber,
          timestamp: json.latestBlock.timestamp,
          containerName: json.containerName || undefined,
        });
        setLastUpdated(new Date().toLocaleTimeString());
      } else {
        setError(json.error || "No block data available");
      }
    } catch (e: any) {
      setError(e.message || "Failed to fetch block number");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlockNumber();
    const interval = setInterval(fetchBlockNumber, 5000); // Poll more frequently
    return () => clearInterval(interval);
  }, []);

  const TerminalContent = () => {
    if (loading) {
      return (
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-400"></div>
          <span>Loading latest block...</span>
        </div>
      );
    }
    if (error) {
      return (
        <div>
          <span className="text-red-500">Error:</span> {error}
        </div>
      );
    }
    if (!data) {
      return <div>No block data available.</div>;
    }

    return (
      <div>
        <p>
          <span className="text-green-400">❯</span> Latest Block Number:
          <span className="font-bold ml-2 text-yellow-400">
            {data.blockNumber}
          </span>
        </p>
        <p>
          <span className="text-green-400">❯</span> Timestamp:
          <span className="ml-2">{data.timestamp}</span>
        </p>
        {lastUpdated && (
          <p className="text-xs text-zinc-500 mt-4">
            Last updated: {lastUpdated}
          </p>
        )}
      </div>
    );
  };

  return (
    <Card className="w-full max-w-2xl mx-auto my-8 bg-black border-zinc-700 font-mono text-sm text-zinc-200 shadow-2xl shadow-green-500/10">
      <TerminalHeader containerName={data?.containerName} />
      <CardContent className="p-4">
        <TerminalContent />
      </CardContent>
    </Card>
  );
};
