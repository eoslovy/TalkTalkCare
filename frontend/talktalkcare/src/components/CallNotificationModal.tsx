// CallNotificationModal.tsx
import React from "react";

interface CallNotificationModalProps {
  title: string;
  message: string;
  isOpen: boolean;
  onAccept: () => void;
  onReject: () => void;
}

const CallNotificationModal: React.FC<CallNotificationModalProps> = ({
  title,
  message,
  isOpen,
  onAccept,
  onReject,
}) => {
  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.container}>
        <h2 style={styles.title}>{title}</h2>
        <p style={styles.message}>{message}</p>
        <div style={styles.buttonContainer}>
          <button onClick={onAccept} style={{ ...styles.button, backgroundColor: "#28a745" }}>
            수락
          </button>
          <button onClick={onReject} style={{ ...styles.button, backgroundColor: "#dc3545" }}>
            거절
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed" as "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1000,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
    maxWidth: "400px",
    width: "300px",
  },
  title: {
    margin: 0,
    fontSize: "1.5rem",
    marginBottom: "10px",
  },
  message: {
    fontSize: "1rem",
    marginBottom: "20px",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "space-between",
  },
  button: {
    padding: "10px 20px",
    border: "none",
    borderRadius: "4px",
    color: "#fff",
    cursor: "pointer",
  },
};

export default CallNotificationModal;
