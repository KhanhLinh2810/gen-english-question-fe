import React, { useEffect } from "react";

export default function Sidebar({ isOpen, onClose, title, children }) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <div className="relative w-80 bg-white shadow-xl z-50 p-4 animate-slideIn">
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded hover:bg-gray-200"
          >
            ✕
          </button>
        </div>

        <div className="overflow-auto h-full">{children}</div>
      </div>
    </div>
  );
}
