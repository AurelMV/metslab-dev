import React, { useEffect, useState } from 'react'
import { getPedidosPorMes, getIngresosPorMes } from '../services/metrick-service'
import { Bar } from 'react-chartjs-2'
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const meses = [
  '',
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre'
]

export default function TablasEstadistica() {
  const [pedidos, setPedidos] = useState([])
  const [ingresos, setIngresos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError('')
      try {
        const pedidosData = await getPedidosPorMes()
        const ingresosData = await getIngresosPorMes()
        setPedidos(pedidosData)
        setIngresos(ingresosData)
      } catch (err) {
        setError(err.message || 'Error al cargar métricas')
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  // Prepara datos para los gráficos
  const pedidosLabels = pedidos.map((item) => `${meses[item.mes]} ${item.anio}`)
  const pedidosDataSet = pedidos.map((item) => item.cantidad)
  const ingresosLabels = ingresos.map((item) => `${meses[item.mes]} ${item.anio}`)
  const ingresosDataSet = ingresos.map((item) => item.ingresos)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-8 px-2">
      <h2 className="text-2xl font-bold text-gray-800 mb-8">Estadísticas Mensuales</h2>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      {loading ? (
        <div className="text-gray-500 mb-4">Cargando métricas...</div>
      ) : (
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Tabla de pedidos por mes */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-bold text-gray-700 mb-4">Pedidos por mes</h3>
            <div className="mb-6">
              <Bar
                data={{
                  labels: pedidosLabels,
                  datasets: [
                    {
                      label: 'Pedidos',
                      data: pedidosDataSet,
                      backgroundColor: 'rgba(59, 130, 246, 0.6)'
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  plugins: { legend: { display: false } },
                  scales: { y: { beginAtZero: true } }
                }}
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 uppercase">
                    <th className="px-4 py-2">Año</th>
                    <th className="px-4 py-2">Mes</th>
                    <th className="px-4 py-2">Cantidad</th>
                  </tr>
                </thead>
                <tbody>
                  {pedidos.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center py-4 text-gray-500">
                        Sin datos
                      </td>
                    </tr>
                  ) : (
                    pedidos.map((item, idx) => (
                      <tr key={idx} className="border-b last:border-none hover:bg-gray-50">
                        <td className="px-4 py-2">{item.anio}</td>
                        <td className="px-4 py-2">{meses[item.mes]}</td>
                        <td className="px-4 py-2 font-semibold text-blue-700">{item.cantidad}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          {/* Tabla de ingresos por mes */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-bold text-gray-700 mb-4">Ingresos por mes</h3>
            <div className="mb-6">
              <Bar
                data={{
                  labels: ingresosLabels,
                  datasets: [
                    {
                      label: 'Ingresos',
                      data: ingresosDataSet,
                      backgroundColor: 'rgba(34,197,94,0.6)'
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  plugins: { legend: { display: false } },
                  scales: { y: { beginAtZero: true } }
                }}
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 uppercase">
                    <th className="px-4 py-2">Año</th>
                    <th className="px-4 py-2">Mes</th>
                    <th className="px-4 py-2">Ingresos</th>
                  </tr>
                </thead>
                <tbody>
                  {ingresos.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center py-4 text-gray-500">
                        Sin datos
                      </td>
                    </tr>
                  ) : (
                    ingresos.map((item, idx) => (
                      <tr key={idx} className="border-b last:border-none hover:bg-gray-50">
                        <td className="px-4 py-2">{item.anio}</td>
                        <td className="px-4 py-2">{meses[item.mes]}</td>
                        <td className="px-4 py-2 font-semibold text-green-700">
                          S/ {item.ingresos.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
