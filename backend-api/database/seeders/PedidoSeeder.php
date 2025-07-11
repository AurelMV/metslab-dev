<?php


namespace Database\Seeders;

use App\Models\Pedido;
use Illuminate\Database\Seeder;

class PedidoSeeder extends Seeder
{
    public function run()
    {
        // Crear 50 pedidos de prueba
        Pedido::factory(50)->create();
    }
}