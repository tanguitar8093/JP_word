import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../Modal";
import quizProgressService from "../../services/quizProgressService";
import readingProgressService from "../../services/readingProgressService";
import fillinProgressService from "../../services/fillinProgressService";

/**
 * NavigationBlocker
 * - If there is saved quiz progress, show a confirm modal before rendering children.
 * - On confirm: proceed and render children, keeping the saved progress intact.
 * - On cancel: navigate to home page.
 */
export default function NavigationBlocker({
  children,
  message = "偵測到尚有未完成的學習進度（測驗/閱讀/拼字），確定要前往此頁面嗎？",
  clearOnConfirm = false,
  considerQuiz = true,
  considerReading = true,
  considerFillin = true,
}) {
  const navigate = useNavigate();
  const [shouldPrompt, setShouldPrompt] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    // Only prompt if there is saved progress
    const hasQuiz = considerQuiz && quizProgressService.hasProgress();
    const hasReading = considerReading && readingProgressService.hasProgress();
    const hasFillin = considerFillin && fillinProgressService.hasProgress();
    if (hasQuiz || hasReading || hasFillin) {
      setShouldPrompt(true);
    }
  }, [considerQuiz, considerReading, considerFillin]);

  if (shouldPrompt && !confirmed) {
    return (
      <Modal
        message={message}
        onConfirm={() => {
          if (clearOnConfirm) {
            if (considerQuiz) {
              try {
                quizProgressService.clearProgress();
              } catch {}
            }
            if (considerReading) {
              try {
                readingProgressService.clearProgress();
              } catch {}
            }
            if (considerFillin) {
              try {
                fillinProgressService.clearProgress();
              } catch {}
            }
          }
          setConfirmed(true);
        }}
        onCancel={() => navigate("/")}
        isVisible
      />
    );
  }

  return <>{children}</>;
}
