import Card from "./Card";
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
const RepositoryContent = () => {
  return (
    <>
      <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4 lg:mb-6">
        Repository
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <Card title="Projects">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div>
                <p className="font-medium text-gray-900">Laravel App</p>
                <p className="text-sm text-gray-500">Updated 2 hours ago</p>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                Active
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div>
                <p className="font-medium text-gray-900">React Dashboard</p>
                <p className="text-sm text-gray-500">Updated 1 day ago</p>
              </div>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                Development
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div>
                <p className="font-medium text-gray-900">API Gateway</p>
                <p className="text-sm text-gray-500">Updated 3 days ago</p>
              </div>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                Testing
              </span>
            </div>
          </div>
        </Card>

        <Card title="Commits">
          <div className="text-2xl lg:text-3xl font-bold text-purple-600 mb-2">
            127
          </div>
          <p className="text-gray-500 text-sm mb-4">This month</p>
          <div className="bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full"
              style={{ width: "68%" }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">68% of monthly goal</p>
        </Card>
      </div>
    </>
  );
};
export default RepositoryContent;
