import React from 'react';
import Header from './Header';
import MobileNav from './MobileNav';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50/50">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-12 sm:px-8 lg:px-12 pb-20 md:pb-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-md border-t border-gray-100 mt-auto">
        <div className="max-w-7xl mx-auto py-8 px-6 sm:px-8 lg:px-12">
                      <div className="flex justify-between items-center">
              <p className="text-gray-400 text-sm font-light">
                © 2024 Emergence. AI Agent Management Platform.
              </p>
              <div className="flex space-x-8">
                <button className="text-gray-400 hover:text-gray-600 text-sm font-light transition-colors">
                  Privacy
                </button>
                <button className="text-gray-400 hover:text-gray-600 text-sm font-light transition-colors">
                  Terms
                </button>
                <button className="text-gray-400 hover:text-gray-600 text-sm font-light transition-colors">
                  Contact
                </button>
              </div>
            </div>
        </div>
      </footer>

      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  );
};

export default Layout;
