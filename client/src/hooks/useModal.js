import { useState } from "react";

const useModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => {
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const Modal = ({ children }) => {

    if (!isOpen) return null;

    return (
      <div
        className="absolute p-4 h-max w-max bg-slate-200 shadow-2xl rounded"
        style={{
          minWidth: "350px",
          minHeight: "550px",
          left: "40%",
          top: "30%",
        }}
      >
        <div className="modal">
          <button
            className="mr-2 px-4 py-2 rounded-md text-xl bg-black text-white"
            onClick={closeModal}
          >
            x
          </button>
          <div className="p-4">{children}</div>
        </div>
      </div>
    );
  };

  return { isOpen, openModal, closeModal, Modal };
};

export default useModal

