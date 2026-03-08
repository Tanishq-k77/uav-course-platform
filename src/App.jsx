import React from 'react';
import { Helmet } from 'react-helmet';
import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import Courses from '@/components/Courses';
import Testimonials from '@/components/Testimonials';
import Instructors from '@/components/Instructors';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import EnrollmentModal from '@/components/EnrollmentModal';
import { Toaster } from '@/components/ui/toaster';
import { EnrollmentProvider } from '@/hooks/useEnrollment.jsx';

function App() {
  return (
    <EnrollmentProvider>
      <Helmet>
        <title>Propellex - Deeptech Courses for the Future</title>
        <meta name="description" content="Explore cutting-edge courses in Aeromodelling, Unmanned Systems, Robotics, Coding, and Drone Piloting. Join Propellex, a Wolf Dynamics company." />
      </Helmet>
      <div className="min-h-screen bg-slate-950 text-white">
        <Navigation />
        <Hero />
        <Courses />
        <Testimonials />
        <Instructors />
        <Contact />
        <Footer />
        <EnrollmentModal />
        <Toaster />
      </div>
    </EnrollmentProvider>
  );
}

export default App;