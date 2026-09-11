import "./NotificationPanel.css";

function NotificationPanel({ isOpen }) {
  return (
    <div
      className={`global-bottom-nav-notification-panel ${
        isOpen ? "is-open" : ""
      }`}
      aria-hidden={!isOpen}
    />
  );
}

export default NotificationPanel;
