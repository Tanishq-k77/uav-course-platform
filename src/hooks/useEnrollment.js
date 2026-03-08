import React, { createContext, useContext, useState } from 'react';
import { getToken } from '@/utils/auth.js';

const EnrollmentContext = createContext();

export const EnrollmentProvider = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const openModal = (course) => {
    if (!getToken()) {
      window.location.href = '/login';
      return;
    }
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedCourse(null), 300);
  };

  return (
    <EnrollmentContext.Provider value={{ isModalOpen, selectedCourse, openModal, closeModal }}>
      {children}
    </EnrollmentContext.Provider>
  );
};

export const useEnrollment = () => {
  const context = useContext(EnrollmentContext);
  if (!context) {
    throw new Error('useEnrollment must be used within EnrollmentProvider');
  }
  return context;
};