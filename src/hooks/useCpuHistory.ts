import { useUsageHistory } from "./useUsageHistory";

export function useCpuHistory(currentValue: number | undefined) {
  return useUsageHistory(currentValue);
}
