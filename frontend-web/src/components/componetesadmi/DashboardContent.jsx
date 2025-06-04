import React from "react";
import Card from "./Card";
import CrearCate from "../CrearCate.jsx";
import CrearModelo from "../../pages/CrearModelo.jsx";
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
const DashboardContent = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card title="Crear Categoria" className="col-span-1">
        <CrearCate />
      </Card>
      <Card title="Crear Modelo" className="col-span-1">
        <CrearModelo />
      </Card>
      <Card title="Estadísticas" className="col-span-1">
        {/* Aquí puedes agregar gráficos o estadísticas */}
        <p>Gráficos y estadísticas vendrán pronto.</p>
      </Card>
    </div>
  );
};
export default DashboardContent;
