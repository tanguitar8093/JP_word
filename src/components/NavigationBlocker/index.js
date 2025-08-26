import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../../store/contexts/AppContext";
import Modal from "../Modal";

export function NavigationBlocker() {
  const { state } = useApp();
  const { learningProgress } = state;
  const [showModal, setShowModal] = React.useState(false);
  const [pendingNavigation, setPendingNavigation] = React.useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // 檢查是否應該阻止導航
  const shouldBlock = React.useCallback(
    (targetPath) => {
      if (!learningProgress.inProgress) return false;

      // 如果要去的是當前正在進行的學習頁面，允許導航
      if (learningProgress.type === "quiz" && targetPath === "/quiz")
        return false;
      if (learningProgress.type === "reading" && targetPath === "/reading")
        return false;

      return true;
    },
    [learningProgress]
  );

  // 監聽點擊事件來攔截連結點擊
  React.useEffect(() => {
    const handleClick = (e) => {
      if (e.target.tagName === "A" && e.target.href) {
        const targetPath = new URL(e.target.href).pathname;
        if (shouldBlock(targetPath)) {
          e.preventDefault();
          setPendingNavigation(targetPath);
          setShowModal(true);
        }
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [shouldBlock]);

  const handleConfirm = () => {
    if (pendingNavigation) {
      navigate(pendingNavigation);
    }
    setShowModal(false);
    setPendingNavigation(null);
  };

  const handleCancel = () => {
    setShowModal(false);
    setPendingNavigation(null);
  };

  const message = `${
    learningProgress.type === "quiz" ? "測驗" : "閱讀練習"
  }尚未完成，要結束當前進度嗎？`;

  return (
    <Modal
      isOpen={showModal}
      message={message}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );
}
