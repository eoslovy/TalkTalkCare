// KeyPadModal.tsx
import React from "react";

interface KeyPadModalProps {
  title: string;
  message: string;
  isOpen: boolean;
  onClose: () => void;
}

const KeyPadModal: React.FC<KeyPadModalProps> = ({ title, message, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2>{title}</h2>
        <p>{message}</p>
        <button onClick={onClose} style={styles.closeButton}>
          닫기
        </button>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed" as "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "8px",
    textAlign: "center" as "center",
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
    maxWidth: "400px",
    width: "80%",
  },
  closeButton: {
    marginTop: "20px",
    padding: "10px 20px",
    backgroundColor: "#c8e6c9",
    color: "#214005",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    fontWeight: "bold" as "bold",
  },
};

export default KeyPadModal;
