import { createContext, useContext, useState, ReactNode } from 'react';
import { AuthenticationForm } from '../components/AuthForm'; // adjust this path accordingly
import { PaperProps } from '@mantine/core'; // import PaperProps type if needed

interface ModalContextType {
  modalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

// Create a new context
const ModalContext = createContext<ModalContextType | undefined>(undefined);

// Export a custom hook that wraps useContext for easier usage
export const useModalContext = (): ModalContextType => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModalContext must be used within a ModalProvider');
  }
  return context;
};

interface ModalProviderProps {
  children: ReactNode;
}

// The provider component that wraps any components that want to access the modal
export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [modalOpen, setModalOpen] = useState(false);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  return (
    <ModalContext.Provider value={{ modalOpen, openModal, closeModal }}>
      {children}
      {modalOpen && <AuthenticationForm />}
    </ModalContext.Provider>
  );
};