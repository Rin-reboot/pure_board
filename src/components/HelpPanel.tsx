import { BookOpen } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  HELP_CATEGORIES,
  HELP_TOPICS,
  type HelpTopicId,
} from "../help/helpTopics";

const DEFAULT_TOPIC_ID: HelpTopicId = "getting-started";

export function HelpPanel() {
  const [selectedTopicId, setSelectedTopicId] =
    useState<HelpTopicId>(DEFAULT_TOPIC_ID);
  const selectedTopic =
    HELP_TOPICS.find((topic) => topic.id === selectedTopicId) ?? HELP_TOPICS[0];

  return (
    <section className="help-panel" aria-label="Help">
      <div className="help-panel-header">
        <BookOpen size={17} aria-hidden="true" />
        <span>Help</span>
      </div>

      <div className="help-layout">
        <nav className="help-sidebar" aria-label="ヘルプ項目">
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
