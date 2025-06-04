import React, { useState } from "react";
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
import "../App.css"; // Importando o CSS global
import Sidebar from "../components/componetesadmi/Sidebar";
import Header from "../components/componetesadmi/Header";
import MainContent from "../components/componetesadmi/MainContent";
import DashboardContent from "../components/componetesadmi/DashboardContent";
const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState("dashboard");

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          isOpen={isSidebarOpen}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />

        {/* Overlay para mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
            onClick={toggleSidebar}
          />
        )}

        <MainContent currentPage={currentPage} />
      </div>
    </div>
  );
};

export default Dashboard;
