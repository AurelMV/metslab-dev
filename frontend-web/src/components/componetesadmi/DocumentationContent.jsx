import React from "react";
import Card from "./Card";
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
const DocumentationContent = () => {
  return (
    <>
      <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4 lg:mb-6">
        Documentation
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <Card title="Getting Started" className="lg:col-span-2">
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border-l-4 border-blue-400">
              <h3 className="font-medium text-blue-900">Installation</h3>
              <p className="text-sm text-blue-700 mt-1">
                Follow these steps to set up your development environment.
              </p>
            </div>

            <div className="p-4 bg-green-50 border-l-4 border-green-400">
              <h3 className="font-medium text-green-900">Configuration</h3>
              <p className="text-sm text-green-700 mt-1">
                Configure your application settings and environment variables.
              </p>
            </div>

            <div className="p-4 bg-purple-50 border-l-4 border-purple-400">
              <h3 className="font-medium text-purple-900">Deployment</h3>
              <p className="text-sm text-purple-700 mt-1">
                Deploy your application to production environments.
              </p>
            </div>
          </div>
        </Card>

        <Card title="Quick Links">
          <div className="space-y-3">
            <button className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors">
              <p className="font-medium text-gray-900">API Reference</p>
              <p className="text-sm text-gray-500">
                Complete API documentation
              </p>
            </button>

            <button className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors">
              <p className="font-medium text-gray-900">Examples</p>
              <p className="text-sm text-gray-500">
                Code examples and tutorials
              </p>
            </button>

            <button className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors">
              <p className="font-medium text-gray-900">Support</p>
              <p className="text-sm text-gray-500">Get help from community</p>
            </button>
          </div>
        </Card>
      </div>
    </>
  );
};
export default DocumentationContent;
