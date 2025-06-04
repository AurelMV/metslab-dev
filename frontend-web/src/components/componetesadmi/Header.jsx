import React from "react";
import {
  Menu,
  X,
  BarChart3,
  FileText,
  Users,
  Settings,
  Home,
  Book,
  GitBranch,
} from "lucide-react";
const Header = ({ toggleSidebar, isSidebarOpen }) => {
  return (
    <header className="bg-gray-900 text-white p-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-md hover:bg-gray-700"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-sm">L</span>
          </div>
          <span className="font-semibold">Laravel Starter Kit</span>
        </div>
      </div>
      <nav className="hidden md:flex items-center space-x-6">
        <a href="#" className="text-gray-300 hover:text-white">
          Dashboard
        </a>
      </nav>
    </header>
  );
};
export default Header;
