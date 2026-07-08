import { useEffect, useRef, useState } from "react";

export const DEFAULT_USAGE_HISTORY_LENGTH = 40;

interface UseUsageHistoryOptions {
  length?: number;
}

export function useUsageHistory(
  currentValue: number | undefined,
  options: UseUsageHistoryOptions = {},
) {
  const historyLength = options.length ?? DEFAULT_USAGE_HISTORY_LENGTH;
  const [history, setHistory] = useState<number[]>(() =>
    Array(historyLength).fill(0),
  );
  const lastValue = useRef<number | undefined>(undefined);

  useEffect(() => {
    setHistory((prev) => {
      if (prev.length === historyLength) return prev;
      if (prev.length > historyLength) return prev.slice(-historyLength);
      return [...Array(historyLength - prev.length).fill(0), ...prev];
    });
  }, [historyLength]);

  useEffect(() => {
    if (currentValue === undefined || currentValue === lastValue.current) {
      return;
    }
    lastValue.current = currentValue;
    setHistory((prev) => [...prev.slice(1), currentValue]);
  }, [currentValue]);

  return history;
}
