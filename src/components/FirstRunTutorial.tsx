import {
  Activity,
  Bell,
  CircleHelp,
  LayoutDashboard,
  type LucideIcon,
  Settings,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface TutorialStep {
  description: string;
  icon: LucideIcon;
  title: string;
}

const TUTORIAL_STEPS: readonly TutorialStep[] = [
  {
    title: "pure_boardへようこそ",
    description:
      "システム情報と日々のタスクを、ひとつのダッシュボードで確認できます。主要な機能を順番に紹介します。",
    icon: LayoutDashboard,
  },
  {
    title: "システムの状態を確認",
    description:
      "CPU、RAM、Networkのカードで現在の使用状況を確認できます。NetworkカードからはPingも測定できます。",
    icon: Activity,
  },
  {
    title: "自分用のダッシュボードに",
    description:
      "画面下部の鉛筆からカードの並び順と表示を編集できます。TODO、Ideas、Shortcutsも同じ画面から利用できます。",
    icon: Settings,
  },
  {
    title: "通知領域でも状態を確認",
    description:
      "Windows 11の通知領域にはミニグラフが表示されます。指標や更新間隔、常に表示する方法は右上のSettingsから確認できます。",
    icon: Bell,
  },
  {
    title: "いつでもヘルプを確認",
    description:
      "画面下部の「?」から詳しい使い方を確認できます。それではpure_boardを始めましょう。",
    icon: CircleHelp,
  },
];

interface FirstRunTutorialProps {
  onDismiss: () => void;
}

export function FirstRunTutorial({ onDismiss }: FirstRunTutorialProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const primaryButtonRef = useRef<HTMLButtonElement | null>(null);
  const step = TUTORIAL_STEPS[stepIndex];
  const StepIcon = step.icon;
  const isLastStep = stepIndex === TUTORIAL_STEPS.length - 1;

  useEffect(() => {
    primaryButtonRef.current?.focus();
  }, []);

  const handlePrimaryAction = () => {
    if (isLastStep) {
      onDismiss();
      return;
    }
    setStepIndex((current) => current + 1);
  };

  return (
    <div
      className="first-run-tutorial"
      role="dialog"
      aria-modal="true"
      aria-labelledby="first-run-tutorial-title"
    >
      <section className="first-run-tutorial-card">
        <div className="first-run-tutorial-header">
          <span className="first-run-tutorial-progress">
            {stepIndex + 1} / {TUTORIAL_STEPS.length}
          </span>
          <button
            type="button"
            className="first-run-tutorial-skip"
            onClick={onDismiss}
          >
            スキップ
          </button>
        </div>

        <div className="first-run-tutorial-icon" aria-hidden="true">
          <StepIcon size={28} />
        </div>
        <h2 id="first-run-tutorial-title">{step.title}</h2>
        <p aria-live="polite">{step.description}</p>

        <div className="first-run-tutorial-dots" aria-hidden="true">
          {TUTORIAL_STEPS.map((tutorialStep, index) => (
            <span
              key={tutorialStep.title}
              className={index === stepIndex ? "is-active" : ""}
            />
          ))}
        </div>

        <div className="first-run-tutorial-actions">
          {stepIndex > 0 ? (
            <button
              type="button"
              className="first-run-tutorial-secondary"
              onClick={() => setStepIndex((current) => current - 1)}
            >
              戻る
            </button>
          ) : (
            <span />
          )}
          <button
            ref={primaryButtonRef}
            type="button"
            className="first-run-tutorial-primary"
            onClick={handlePrimaryAction}
          >
            {isLastStep ? "pure_boardを始める" : "次へ"}
          </button>
        </div>
      </section>
    </div>
  );
}
