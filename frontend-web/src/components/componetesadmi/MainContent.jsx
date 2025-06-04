import React from "react";
import DashboardContent from "./DashboardContent";
import RepositoryContent from "./RepositoryContent";
import DocumentationContent from "./DocumentationContent";
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
const MainContent = ({ currentPage }) => {
  const renderContent = () => {
    switch (currentPage) {
      case "dashboard":
        return <DashboardContent />;
      case "repository":
        return <RepositoryContent />;
      case "documentation":
        return <DocumentationContent />;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <main className="flex-1 p-4 lg:p-6 bg-gray-50 min-h-screen overflow-auto">
      <div className="max-w-7xl mx-auto">{renderContent()}</div>
    </main>
  );
};
export default MainContent;
