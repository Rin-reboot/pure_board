import { useEffect, useRef, useState } from "react";

const HISTORY_LENGTH = 40;

/**
 * 波形グラフ用のデータ。
 * 「モックで仮置き」とのことだったけど、実はCPU使用率自体は既に本物の値を
 * ポーリングできているので、過去N件をバッファするだけで実データの波形になる。
 * ネットワーク/Pingのような未着手のロジックとは違い追加コストがほぼ無いので、
 * ここだけ実データにしてます。完全なダミーに戻したければ Array.from で
 * ランダム値を生成する形に変えてもOK。
 */
export function useCpuHistory(currentValue: number | undefined) {
  const [history, setHistory] = useState<number[]>(() =>
    Array(HISTORY_LENGTH).fill(0),
  );
  const lastValue = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (currentValue === undefined || currentValue === lastValue.current) {
      return;
    }
    lastValue.current = currentValue;
    setHistory((prev) => [...prev.slice(1), currentValue]);
  }, [currentValue]);

  return history;
}
