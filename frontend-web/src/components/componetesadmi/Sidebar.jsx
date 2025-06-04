import React from "react";
import MenuItem from "./MenuItem";
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
const Sidebar = ({ isOpen, currentPage, setCurrentPage }) => {
  const menuItems = [
    { icon: Home, label: "Dashboard", id: "dashboard" },
    { icon: GitBranch, label: "Repository", id: "repository" },
    { icon: Book, label: "Documentation", id: "documentation" },
  ];

  return (
    <aside
      className={`bg-gray-800 text-white w-64 min-h-screen transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0 fixed lg:relative z-30`}
    >
      <div className="p-4">
        <h2 className="text-gray-400 text-sm font-medium mb-4">Platform</h2>
        <nav className="space-y-2">
          {menuItems.map((item, index) => (
            <MenuItem
              key={index}
              {...item}
              active={currentPage === item.id}
              onClick={() => setCurrentPage(item.id)}
            />
          ))}
        </nav>
      </div>

      {/* User Profile at bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium">M</span>
          </div>
          <span className="text-sm">Marco</span>
        </div>
      </div>
    </aside>
  );
};
export default Sidebar;
