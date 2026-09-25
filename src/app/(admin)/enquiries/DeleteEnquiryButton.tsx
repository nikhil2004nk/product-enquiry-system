"use client";

import { useState, useTransition, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Trash2, AlertTriangle, X } from "lucide-react";
import { deleteEnquiry } from "./actions";

export default function DeleteEnquiryButton({ enquiryId }: { enquiryId: string }) {
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteEnquiry(enquiryId);
      if (!result.success) {
        alert(result.error);
      } else {
        router.refresh();
      }
      setIsOpen(false);
      setStep(1);
    });
  };

  const modal = isOpen ? (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative animate-fade-up">
        <button
          onClick={() => {
            setIsOpen(false);
            setStep(1);
          }}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-4 text-red-600">
          <div className="p-3 bg-red-50 rounded-full">
            <AlertTriangle size={24} />
          </div>
          <h2 className="text-xl font-bold">
            {step === 1 ? "Delete Customer Data" : "Double Confirmation"}
          </h2>
        </div>

        <div className="text-gray-600 text-sm mb-6 space-y-3">
          {step === 1 ? (
            <>
              <p>
                <strong>WARNING:</strong> Deleting this enquiry will also permanently delete this <strong>CUSTOMER</strong> and <strong>ALL their other enquiries</strong> from the system.
              </p>
              <p>Do you want to proceed?</p>
            </>
          ) : (
            <>
              <p className="font-bold text-red-600">
                Are you absolutely sure?
              </p>
              <p>
                All data related to this customer will be lost forever. This action <strong>CANNOT</strong> be undone.
              </p>
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 mt-8 border-t border-gray-100 pt-5">
          <button
            onClick={() => {
              setIsOpen(false);
              setStep(1);
            }}
            disabled={isPending}
            className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            Cancel
          </button>

          {step === 1 ? (
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-sm shadow-red-200"
            >
              Yes, Proceed
            </button>
          ) : (
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-sm shadow-red-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Trash2 size={16} />
              )}
              {isPending ? "Deleting..." : "Permanently Delete"}
            </button>
          )}
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-1 shrink-0"
        title="Delete Enquiry"
      >
        <Trash2 size={16} />
      </button>

      {mounted && modal && createPortal(modal, document.body)}
    </>
  );
}
