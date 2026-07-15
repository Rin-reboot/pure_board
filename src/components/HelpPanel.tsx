import { BookOpen, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  HELP_CATEGORIES,
  HELP_TOPICS,
  type HelpTopicId,
} from "../help/helpTopics";

const DEFAULT_TOPIC_ID: HelpTopicId = "getting-started";

interface HelpPanelProps {
  initialTopicId?: HelpTopicId;
}

export function HelpPanel({
  initialTopicId = DEFAULT_TOPIC_ID,
}: HelpPanelProps) {
  const [selectedTopicId, setSelectedTopicId] =
    useState<HelpTopicId>(initialTopicId);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const selectedTopic =
    HELP_TOPICS.find((topic) => topic.id === selectedTopicId) ?? HELP_TOPICS[0];

  return (
    <section className="help-panel" aria-label="Help">
      <div className="help-panel-header">
        <div className="help-panel-header-title">
          <BookOpen size={17} aria-hidden="true" />
          <span>Help</span>
        </div>
        <button
          type="button"
          className="help-sidebar-toggle"
          aria-controls="help-sidebar"
          aria-expanded={isSidebarOpen}
          aria-label={isSidebarOpen ? "目次を閉じる" : "目次を開く"}
          title={isSidebarOpen ? "目次を閉じる" : "目次を開く"}
          onClick={() => setIsSidebarOpen((current) => !current)}
        >
          {isSidebarOpen ? (
            <PanelLeftClose size={16} aria-hidden="true" />
          ) : (
            <PanelLeftOpen size={16} aria-hidden="true" />
          )}
        </button>
      </div>

      <div
        className={
          isSidebarOpen
            ? "help-layout"
            : "help-layout help-layout-sidebar-closed"
        }
      >
        <nav
          id="help-sidebar"
          className="help-sidebar"
          aria-label="ヘルプ項目"
          hidden={!isSidebarOpen}
        >
          {HELP_CATEGORIES.map((category) => (
            <div className="help-nav-group" key={category}>
              <span className="help-nav-category">{category}</span>
              {HELP_TOPICS.filter((topic) => topic.category === category).map(
                (topic) => (
                  <button
                    key={topic.id}
                    type="button"
                    className={
                      topic.id === selectedTopicId ? "help-nav-item-active" : ""
                    }
                    aria-current={
                      topic.id === selectedTopicId ? "page" : undefined
                    }
                    onClick={() => setSelectedTopicId(topic.id)}
                  >
                    {topic.title}
                  </button>
                ),
              )}
            </div>
          ))}
        </nav>

        <article className="help-article">
          <ReactMarkdown>{selectedTopic.content}</ReactMarkdown>
        </article>
      </div>
    </section>
  );
}
