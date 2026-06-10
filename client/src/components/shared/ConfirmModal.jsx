import React from "react";
import { Modal } from "@heroui/react";
import { X } from "lucide-react";

export default function ConfirmModal({ isOpen, onOpenChange, title, message, onConfirm }) {
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Backdrop className="bg-black/40 fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        <Modal.Container size="md" className="w-full max-w-md outline-none">
          <Modal.Dialog className="outline-none bg-white rounded-[24px] w-full shadow-xl">
            <Modal.Header className="flex flex-col gap-1 px-8 py-5 relative">
              <h2 className="text-xl font-bold text-primaryText">{title}</h2>
              <Modal.CloseTrigger className="absolute top-5 right-5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full w-8 h-8 flex items-center justify-center cursor-pointer transition-colors">
                <X className="size-4" />
              </Modal.CloseTrigger>
            </Modal.Header>
            <Modal.Body className="px-8 pb-8 pt-2">
              <p className="text-secundaryText mb-6">{message}</p>
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => onOpenChange(false)} 
                  className="px-4 py-2 rounded-lg font-medium text-secundaryText hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => {
                    onConfirm();
                    onOpenChange(false);
                  }} 
                  className="px-4 py-2 rounded-lg font-medium bg-red-500 text-white hover:bg-red-600 transition-colors cursor-pointer"
                >
                  Confirmar
                </button>
              </div>
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
