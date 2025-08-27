import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../Modal";
import quizProgressService from "../../services/quizProgressService";

/**
 * NavigationBlocker
 * - If there is saved quiz progress, show a confirm modal before rendering children.
 * - On confirm: proceed and render children, keeping the saved progress intact.
 * - On cancel: navigate to home page.
 */
export default function NavigationBlocker({
  children,
  message = "偵測到尚有未完成的測驗進度，確定要前往此頁面嗎？",
}) {
  const navigate = useNavigate();
  const [shouldPrompt, setShouldPrompt] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    // Only prompt if there is saved progress
    if (quizProgressService.hasProgress()) {
      setShouldPrompt(true);
    }
  }, []);

  if (shouldPrompt && !confirmed) {
    return (
      <Modal
        message={message}
        onConfirm={() => setConfirmed(true)}
        onCancel={() => navigate("/")}
        isVisible
      />
    );
  }

  return <>{children}</>;
}
