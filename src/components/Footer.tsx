import { BarChart3, ClipboardList, Pencil, Sun } from "lucide-react";
import { useEffect, useState } from "react";

function formatDateTime(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(
    date.getDate(),
  )} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function Footer() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <footer className="footer-bar">
      <div className="footer-icons">
        <button type="button" aria-label="編集">
          <Pencil size={14} />
        </button>
        <button type="button" aria-label="リスト">
          <ClipboardList size={14} />
        </button>
        <button type="button" aria-label="グラフ">
          <BarChart3 size={14} />
        </button>
      </div>
      <span className="footer-datetime">{formatDateTime(now)}</span>
      <button type="button" aria-label="テーマ切替">
        <Sun size={14} />
      </button>
    </footer>
  );
}
