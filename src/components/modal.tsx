import { FC, MouseEventHandler, useCallback, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { styled } from "../styles/config";

interface IModalProps extends React.HTMLAttributes<HTMLDivElement> {
  show: boolean;
  onClose: () => void;
}

const Modal: FC<IModalProps> = ({ show, onClose, children, title }) => {
  const [isBrowser, setIsBrowser] = useState(false);

  useEffect(() => {
    setIsBrowser(true);
  }, []);

  const handleCloseClick: MouseEventHandler<HTMLButtonElement> = useCallback(
    (e) => {
      e.preventDefault();
      onClose();
    },
    []
  );

  const handleOverlayClick: MouseEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      onClose();
    },
    []
  );

  const handleWrapperClick: MouseEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
    },
    []
  );

  const escapeHandler = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  }, []);

  useEffect(() => {
    const [body] = document.getElementsByTagName("body");
    if (show) {
      window.addEventListener("keyup", escapeHandler);

      body.dataset.isModalActive = "true";
      return;
    }

    delete body.dataset.isModalActive;
    window.removeEventListener("keyup", escapeHandler);
  }, [show]);

  useEffect(() => {
    return () => {
      window.removeEventListener("keyup", escapeHandler);
    };
  }, []);

  const modalContent = show ? (
    <ModalOverlay onClick={handleOverlayClick}>
      <ModalWrapper onClick={handleWrapperClick}>
        <ModalHeader>
          {title && <ModalTitle>{title}</ModalTitle>}
          <ModalCloseHandler onClick={handleCloseClick}>x</ModalCloseHandler>
        </ModalHeader>
        <ModalBody>{children}</ModalBody>
      </ModalWrapper>
    </ModalOverlay>
  ) : null;

  if (isBrowser) {
    return ReactDOM.createPortal(
      modalContent,
      document.getElementById("modal-root")!
    );
  } else {
    return null;
  }
};

const ModalOverlay = styled("div", {
  position: "fixed",
  zIndex: 10,
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "$overlayColor",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});
const ModalWrapper = styled("div", {
  background: "$white",
  width: "100%",
  margin: "0 $10",
  height: 200,
  color: "$black",
  "@s": {
    width: "100%",
    margin: "0 calc(2* $10)",
  },
  "@minM": {
    width: 400,
    height: 200,
  },
  zIndex: 11,
});
const ModalHeader = styled("div", {
  background: "rgba(0,0,0,0.2)",
  display: "flex",
  flexDirection: "row",
  padding: "$4",
  position: "relative",
  height: 40,
  alignItems: "center",
});
const ModalCloseHandler = styled("button", {
  position: "absolute",
  top: 0,
  right: "$1",
  width: 40,
  height: 40,
  background: "transparent",
  fontWeight: "bold",
  border: 0,
  fontSize: "$m",
  cursor: "pointer",
});
const ModalTitle = styled("div", {
  fontWeight: "bold",
});
const ModalBody = styled("div", {
  padding: "$4",
});

export default Modal;
