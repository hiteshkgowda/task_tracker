import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Loader from "./Loader";

function ConfirmModal({ open, title, message, loading, onCancel, onConfirm }) {
  const cancelButtonRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    cancelButtonRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !loading) onCancel();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, loading, onCancel]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 px-4"
          onClick={() => !loading && onCancel()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.18 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-modal-title"
            aria-describedby="confirm-modal-message"
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 w-full max-w-sm"
          >
            <h3 id="confirm-modal-title" className="text-lg font-semibold text-gray-800">
              {title}
            </h3>
            <p id="confirm-modal-message" className="text-sm text-gray-500 mt-2">
              {message}
            </p>

            <div className="flex gap-3 pt-5">
              <button
                ref={cancelButtonRef}
                type="button"
                onClick={onCancel}
                disabled={loading}
                aria-label="Cancel delete"
                className="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                aria-label="Confirm delete"
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
              >
                {loading ? (
                  <>
                    <Loader size="sm" label="Deleting" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ConfirmModal;
