import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { LockdownBanner } from './LockdownBanner';
import { RateLimitAlert } from '../ui/RateLimitAlert';

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F6F4EF] text-[#1F2421]">
      <LockdownBanner />
      <Navbar />
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6">
        <Outlet />
      </main>
      <Footer />
      <RateLimitAlert />
    </div>
  );
};

