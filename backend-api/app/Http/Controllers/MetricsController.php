<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Pedido;
use App\Models\Modelo;
use App\Models\DetallePedido;
use Illuminate\Support\Facades\DB;

class MetricsController extends Controller
{
    // Cantidad de pedidos por mes
    public function pedidosPorMes()
    {
        $data = Pedido::select(
                DB::raw('YEAR(created_at) as anio'),
                DB::raw('MONTH(created_at) as mes'),
                DB::raw('COUNT(*) as cantidad')
            )
            ->groupBy('anio', 'mes')
            ->orderBy('anio', 'desc')
            ->orderBy('mes', 'desc')
            ->get();

        return response()->json($data);
    }
    // Ingresos por mes
    public function ingresosPorMes()
    {
        $data = Pedido::select(
                DB::raw('YEAR(created_at) as anio'),
                DB::raw('MONTH(created_at) as mes'),
                DB::raw('SUM(totalPago) as ingresos')
            )
            ->groupBy('anio', 'mes')
            ->orderBy('anio', 'desc')
            ->orderBy('mes', 'desc')
            ->get();

        return response()->json($data);
    }
}
