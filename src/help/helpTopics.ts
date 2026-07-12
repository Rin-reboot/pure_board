import gettingStarted from "./content/getting-started.md?raw";
import ideas from "./content/ideas.md?raw";
import layoutEditing from "./content/layout-editing.md?raw";
import networkPing from "./content/network-ping.md?raw";
import settings from "./content/settings.md?raw";
import shortcuts from "./content/shortcuts.md?raw";
import systemMonitor from "./content/system-monitor.md?raw";
import todo from "./content/todo.md?raw";
import troubleshooting from "./content/troubleshooting.md?raw";
import windowControls from "./content/window-controls.md?raw";

export const HELP_CATEGORIES = [
  "基本",
  "機能",
  "カスタマイズ",
  "サポート",
] as const;

export type HelpCategory = (typeof HELP_CATEGORIES)[number];

interface HelpTopic {
  id: string;
  title: string;
  category: HelpCategory;
  content: string;
}

export const HELP_TOPICS = [
  {
    id: "getting-started",
    title: "はじめに",
    category: "基本",
    content: gettingStarted,
  },
  {
    id: "window-controls",
    title: "画面操作",
    category: "基本",
    content: windowControls,
  },
  {
    id: "system-monitor",
    title: "CPU・RAM",
    category: "機能",
    content: systemMonitor,
  },
  {
    id: "network-ping",
    title: "Network",
    category: "機能",
    content: networkPing,
  },
  { id: "todo", title: "TODO", category: "機能", content: todo },
  { id: "ideas", title: "Ideas", category: "機能", content: ideas },
  {
    id: "shortcuts",
    title: "Shortcuts",
    category: "機能",
    content: shortcuts,
  },
  {
    id: "layout-editing",
    title: "レイアウト",
    category: "カスタマイズ",
    content: layoutEditing,
  },
  {
    id: "settings",
    title: "Settings",
    category: "カスタマイズ",
    content: settings,
  },
  {
    id: "troubleshooting",
    title: "困ったとき",
    category: "サポート",
    content: troubleshooting,
  },
] as const satisfies readonly HelpTopic[];

export type HelpTopicId = (typeof HELP_TOPICS)[number]["id"];
