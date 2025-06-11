// src/components/Dashboard/MainContent.jsx
import React from 'react'
import DashboardItem from './DashboardItem'
import CreacionMode from '../Screens/CreacionModelos'
import CategoriasManager from '../Screens/CategoriasManager '
import Pedido from '../Screens/Pedidos'
import Usuarios from '../Screens/UsuariosLista'

const MainContent = ({ activeSection, menuItems, user }) => {
  const currentItem = menuItems.find((item) => item.id === activeSection)

  const sectionComponents = {
    inicio: <CreacionMode />,
    usuarios: <CategoriasManager />,
    reportes: <Pedido />,
    configuracion: <Usuarios />
  }

  const getEmptyStateMessage = (section) => {
    const messages = {
      inicio: 'Bienvenido a tu  de control. Aquí verás un resumen de tu actividad.',
      usuarios:
        'No hay usuarios registrados. Aquí podrás gestionar todos los usuarios del sistema.',
      reportes: 'No hay  disponibles. Aquí podrás generar y ver reportes detallados.',
      configuracion: 'Configura tu aplicación. Aquí podrás ajustar las preferencias del sistema.',
      inventario: 'No hay productos en inventario. Aquí podrás gestionar tu stock.',
      ventas: 'No hay ventas registradas. Aquí podrás ver y gestionar todas las ventas.',
      clientes: 'No hay clientes registrados. Aquí podrás gestionar tu base de clientes.',
      productos: 'No hay productos registrados. Aquí podrás gestionar tu catálogo de productos.'
    }
    return messages[section] || 'Contenido no disponible.'
  }

  const getActionSuggestions = (section) => {
    const suggestions = {
      inicio: ['Ver estadísticas', 'Acceso rápido', 'Configurar dashboard'],
      usuarios: ['Agregar usuario', 'Importar usuarios', 'Configurar roles'],
      reportes: ['Generar reporte', 'Programar reporte', 'Exportar datos'],
      configuracion: ['Configurar notificaciones', 'Cambiar tema', 'Configurar API'],
      inventario: ['Agregar producto', 'Importar inventario', 'Configurar alertas'],
      ventas: ['Nueva venta', 'Ver historial', 'Configurar facturación'],
      clientes: ['Agregar cliente', 'Importar clientes', 'Configurar segmentos'],
      productos: ['Agregar producto', 'Importar catálogo', 'Configurar categorías']
    }
    return suggestions[section] || []
  }

  return (
    <div className="main-content">
      <div className="content-header">
        <h1>
          <span className="header-icon">{currentItem?.icon}</span>
          {currentItem?.name}
        </h1>
        <p className="header-subtitle">
          Hola, {user?.username}. Aquí tienes tu sección de {currentItem?.name.toLowerCase()}.
        </p>
      </div>

      <div className="content-body">
        {sectionComponents[activeSection] ? (
          sectionComponents[activeSection]
        ) : (
          <DashboardItem
            title={`${currentItem?.name} - Estado Actual`}
            message={getEmptyStateMessage(activeSection)}
            actions={getActionSuggestions(activeSection)}
            icon={currentItem?.icon}
            isEmpty={true}
          />
        )}
      </div>
    </div>
  )
}

export default MainContent
