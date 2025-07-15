import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";
import ModelForm from "./ModelosAdmin";
import CategoryForm from "./CategoriasAdmin";
import {
  Package,
  Tag,
  Palette,
  ShoppingBag,
  Users,
  User,
  Plus,
  Edit,
  Trash2,
  Eye,
  Save,
  X,
  Search,
  ChartBar,
} from "lucide-react";
import { models3D, categories } from "../data/mockData"; // Asegúrate de que mockData exista y tenga los datos
import "../stayle/Admin.css"; // Importa tu archivo CSS puro
import ModelosAdmin from "./ModelosAdmin";
import { getPedidosPorMes, getIngresosPorMes } from "../services/metrick-service";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import UsuariosAdmin from "../components/UsuariosAdmin";
import PedidosAdmin from "../components/PedidosAdmin";
export default function Admin() {
  const { user, isAdmin } = useAuth();
  const [activeSection, setActiveSection] = useState("models");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Mock data states (in real app, these would come from API/database)
  const [_modelsData, _setModelsData] = useState(models3D);
  const [categoriesData, setCategoriesData] = useState(categories);
  const [pedidosPorMes, setPedidosPorMes] = useState([]);
  const [ingresosPorMes, setIngresosPorMes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [anioSeleccionado, setAnioSeleccionado] = useState(new Date().getFullYear());
  const [aniosDisponibles, setAniosDisponibles] = useState([]);

 useEffect(() => {
  let isMounted = true;

  const cargarMetricas = async () => {
    if (activeSection === 'metric') {
      console.log('Iniciando carga de métricas...');
      setLoading(true);
      setError(null);
      
      try {
        const [pedidos, ingresos] = await Promise.all([
          getPedidosPorMes(),
          getIngresosPorMes()
        ]);
        
        console.log('Datos recibidos:', { pedidos, ingresos });
        
        // Extraer años disponibles
        const todosAnios = [...new Set([
          ...pedidos.map(p => p.anio),
          ...ingresos.map(i => i.anio)
        ])].sort((a, b) => b - a); // Orden descendente
        
        if (isMounted) {
          setAniosDisponibles(todosAnios);
          if (todosAnios.length > 0 && !todosAnios.includes(anioSeleccionado)) {
            setAnioSeleccionado(todosAnios[0]); // Establecer el año más reciente
          }
          setPedidosPorMes(pedidos);
          setIngresosPorMes(ingresos);
        }
      } catch (err) {
        console.error('Error al cargar métricas:', err);
        if (isMounted) {
          setError(err.message || 'Error al cargar métricas');
          setPedidosPorMes([]);
          setIngresosPorMes([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
  };

  cargarMetricas();

  return () => {
    isMounted = false;
  };
}, [activeSection, anioSeleccionado]); // Añade anioSeleccionado como dependencia


  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const menuItems = [
    { id: "models", label: "Gestión de Modelos", icon: Package },
    { id: "categories", label: "Categorías", icon: Tag },
    { id: "orders", label: "Pedidos", icon: ShoppingBag },
    { id: "metric", label: "Metricas", icon: ChartBar},
    { id: "users", label: "Usuarios", icon: Users },
    { id: "profile", label: "Mi Perfil", icon: User },
  ];

  const handleSave = (data) => {
    switch (activeSection) {
      case "models":
        if (editingItem) {
          _setModelsData((prev) =>
            prev.map((item) =>
              item.id === editingItem.id
                ? { ...data, id: editingItem.id }
                : item
            )
          );
        } else {
          _setModelsData((prev) => [
            ...prev,
            { ...data, id: Date.now().toString() },
          ]);
        }
        break;
      case "categories":
        if (editingItem) {
          setCategoriesData((prev) =>
            prev.map((item) =>
              item.id === editingItem.id
                ? { ...data, id: editingItem.id }
                : item
            )
          );
        } else {
          setCategoriesData((prev) => [
            ...prev,
            { ...data, id: Date.now().toString() },
          ]);
        }
        break;        case "colors":
          // Función deshabilitada temporalmente
          break;
        default:
          // Manejar otros casos o un error si es necesario
          break;
    }
    setShowModal(false);
    setEditingItem(null);
  };

  const handleDelete = (id) => {
    if (confirm("¿Estás seguro de que quieres eliminar este elemento?")) {
      switch (activeSection) {
        case "models":
          // Función deshabilitada temporalmente
          break;
        case "categories":
          setCategoriesData((prev) => prev.filter((item) => item.id !== id));
          break;
        case "colors":
          // Función deshabilitada temporalmente
          break;
        default:
          // Manejar otros casos o un error si es necesario
          break;
      }
    }
  };

  const renderModelsSection = () => {
    return <ModelosAdmin />;
  };

  const renderCategoriesSection = () => <CategoryForm />;

  const renderColorsSection = () => <ColoresAdmin />;

  const renderOrdersSection = () => <PedidosAdmin />;
const renderMetricSection = () => {
    const nombresMeses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN'
        }).format(value);
    };

    // Filtrar datos por año seleccionado
    const pedidosFiltrados = pedidosPorMes.filter(item => item.anio === anioSeleccionado);
    const ingresosFiltrados = ingresosPorMes.filter(item => item.anio === anioSeleccionado);

    // Crear estructura completa de 12 meses
    const crearEstructuraMensual = (datos, campo) => {
        const estructuraCompleta = nombresMeses.map((nombre, index) => {
            const mes = index + 1;
            const datoExistente = datos.find(d => d.mes === mes);
            return {
                mes,
                mesNombre: nombre,
                [campo]: datoExistente ? datoExistente[campo] : 0,
                anio: anioSeleccionado
            };
        });
        return estructuraCompleta;
    };

    // Datos para gráficos con todos los meses
    const datosGraficoPedidos = crearEstructuraMensual(pedidosFiltrados, 'cantidad');
    const datosGraficoIngresos = crearEstructuraMensual(ingresosFiltrados, 'ingresos');
    

    // Calcular totales
    const totalPedidos = datosGraficoPedidos.reduce((acc, item) => acc + item.cantidad, 0);
    const totalIngresos = datosGraficoIngresos.reduce((acc, item) => acc + item.ingresos, 0);
    return (
        <div className="section-content">
            <h2 className="text-2xl font-bold text-secondary-900 mb-6">
                Métricas de la Tienda
            </h2>

            {/* Selector de Año */}
            <div className="mb-6 flex items-center">
                <label htmlFor="anio-select" className="mr-2 font-medium">Año:</label>
                <select
                    id="anio-select"
                    value={anioSeleccionado}
                    onChange={(e) => setAnioSeleccionado(Number(e.target.value))}
                    className="border rounded px-3 py-1"
                    disabled={loading}
                >
                    {aniosDisponibles.map(anio => (
                        <option key={anio} value={anio}>{anio}</option>
                    ))}
                </select>
            </div>

            {/* Tarjetas de Total */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
                    <h3 className="text-lg font-semibold text-gray-700">Total de Pedidos</h3>
                    <p className="text-2xl font-bold text-blue-600">{totalPedidos}</p>
                    <p className="text-sm text-gray-500">Año {anioSeleccionado}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
                    <h3 className="text-lg font-semibold text-gray-700">Total de Ingresos</h3>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(totalIngresos)}</p>
                    <p className="text-sm text-gray-500">Año {anioSeleccionado}</p>
                </div>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Pedidos por Mes</h3>
                    <div style={{ height: 300  }}>
                        {datosGraficoPedidos.length > 0 ? (
                            <ResponsiveContainer width="120%" height="100%">
                                <BarChart data={datosGraficoPedidos}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="mesNombre" />
                                    <YAxis />
                                    <Tooltip 
                                        formatter={(value) => [value, 'Pedidos']}
                                        labelFormatter={(value) => `Mes: ${value}`}
                                    />
                                    <Bar dataKey="cantidad" fill="#8884d8" name="Pedidos" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                No hay datos para el año seleccionado
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Ingresos por Mes</h3>
                    <div style={{ height: 300 }}>
                        {datosGraficoIngresos.length > 0 ? (
                            <ResponsiveContainer width="120%" height="100%">
                                <BarChart data={datosGraficoIngresos}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="mesNombre" />
                                    <YAxis />
                                    <Tooltip 
                                        formatter={(value) => [formatCurrency(value), 'Ingresos']}
                                        labelFormatter={(value) => `Mes: ${value}`}
                                    />
                                    <Bar dataKey="ingresos" fill="#82ca9d" name="Ingresos" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                No hay datos para el año seleccionado
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

  const renderUsersSection = () => <UsuariosAdmin />;

  const renderProfileSection = () => (
    <div className="section-content">
      <h2 className="text-2xl font-bold text-secondary-900">
        Mi Perfil de Administrador
      </h2>

      <div className="card p-6">
        <div className="form-grid md-cols-2">
          <div className="form-group">
            <label className="form-label">Nombre</label>
            <input
              type="text"
              defaultValue={user?.name}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              defaultValue={user?.email}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Teléfono</label>
            <input
              type="tel"
              defaultValue={user?.phone}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Dirección</label>
            <input
              type="text"
              defaultValue={user?.address}
              className="form-input"
            />
          </div>
        </div>
        <div className="mt-6">
          <button className="btn-primary">Guardar Cambios</button>
        </div>
      </div>
    </div>
  );

  const renderModal = () => {
    if (!showModal) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h3>
              {editingItem ? "Editar" : "Crear"}{" "}
              {activeSection === "models"
                ? "Modelo"
                : activeSection === "categories"
                ? "Categoría"
                : activeSection === "colors"
                ? "Color"
                : ""}
            </h3>
            <button
              onClick={() => setShowModal(false)}
              className="modal-close-btn"
            >
              <X className="icon" />
            </button>
          </div>

          {activeSection === "models" && (
            <ModelForm
              initialData={editingItem}
              categories={categoriesData}
              onSave={handleSave}
              onCancel={() => setShowModal(false)}
            />
          )}

          {activeSection === "categories" && (
            <CategoryForm
              initialData={editingItem}
              onSave={handleSave}
              onCancel={() => setShowModal(false)}
            />
          )}

          {activeSection === "colors" && (
            <ColorForm
              initialData={editingItem}
              onSave={handleSave}
              onCancel={() => setShowModal(false)}
            />
          )}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      case "models":
        return renderModelsSection();
      case "categories":
        return renderCategoriesSection();
      case "colors":
        return renderColorsSection();
      case "orders":
        return renderOrdersSection();
      case "metric":
        return renderMetricSection();
      case "users":
        return renderUsersSection();
      case "profile":
        return renderProfileSection();
      default:
        return renderModelsSection();
    }
  };

  return (
    <div className="admin-dashboard-container">
      <div className="admin-content-wrapper">
        {/* Header */}
        <div className="admin-header">
          <h1>Panel de Administrador</h1>
          <p>Gestiona tu tienda de modelos 3D</p>
        </div>

        <div className="admin-grid">
          {/* Sidebar */}
          <div className="admin-sidebar-col">
            <div className="admin-sidebar">
              <nav className="admin-nav">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`admin-nav-item ${
                        activeSection === item.id ? "active" : ""
                      }`}
                    >
                      <Icon className="icon" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="admin-main-content-col">{renderContent()}</div>
        </div>

        {renderModal()}
      </div>
    </div>
  );
}
