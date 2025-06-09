import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ScannedBlockData {
  blockNumber: number;
  timestamp: string;
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
  const [scannedBlock, setScannedBlock] = useState<ScannedBlockData | null>(
    null
  );
  const [currentBlock, setCurrentBlock] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const fetchData = async () => {
    if (!scannedBlock) {
      setLoading(true);
    }
    setError(null);

    try {
      const [scannedRes, currentRes] = await Promise.all([
        fetch("/api/block-logs"),
        fetch("/api/current-block"),
      ]);

      const scannedJson = await scannedRes.json();
      const currentJson = await currentRes.json();

      if (scannedJson.success && scannedJson.latestBlock) {
        setScannedBlock({
          blockNumber: scannedJson.latestBlock.blockNumber,
          timestamp: scannedJson.latestBlock.timestamp,
          containerName: scannedJson.containerName || undefined,
        });
      } else {
        throw new Error(scannedJson.error || "No scanned block data available");
      }

      if (currentJson.success && currentJson.currentBlock) {
        setCurrentBlock(currentJson.currentBlock);
      } else {
        throw new Error(currentJson.error || "No current block data available");
      }

      setLastUpdated(new Date().toLocaleTimeString());
    } catch (e: any) {
      setError(e.message || "Failed to fetch block data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const getProgress = () => {
    if (!currentBlock || !scannedBlock) return 0;
    if (scannedBlock.blockNumber >= currentBlock) return 100;
    return (scannedBlock.blockNumber / currentBlock) * 100;
  };

  const TerminalContent = () => {
    if (loading) {
      return (
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-400"></div>
          <span>Loading block data...</span>
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
    if (!scannedBlock) {
      return <div>No block data available.</div>;
    }

    return (
      <div className="space-y-2">
        <div className="flex justify-between">
          <p>
            <span className="text-green-400">❯</span> Scanned Blocks:
            <span className="font-bold ml-2 text-yellow-400">
              {scannedBlock.blockNumber.toLocaleString()}
            </span>
          </p>
          <p>
            Current Block:
            <span className="font-bold ml-2 text-yellow-400">
              {currentBlock.toLocaleString() ?? "..."}
            </span>
          </p>
        </div>

        <Progress value={getProgress()} />

        {lastUpdated && (
          <p className="text-xs text-zinc-500 pt-2">
            Last updated: {lastUpdated}
          </p>
        )}
      </div>
    );
  };

  return (
    <Card className="w-full max-w-2xl mx-auto my-8 bg-black border-zinc-700 font-mono text-sm text-zinc-200 shadow-2xl shadow-green-500/10">
      <TerminalHeader containerName={scannedBlock?.containerName} />
      <CardContent className="p-4">
        <TerminalContent />
      </CardContent>
    </Card>
  );
};
