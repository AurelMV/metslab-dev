<?php

namespace Database\Factories;

use App\Models\Pedido;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class PedidoFactory extends Factory
{
    protected $model = Pedido::class;

    public function definition()
    {
        $fechaPedido = $this->faker->dateTimeBetween('-1 year', 'now');
        
        return [
            'iduser' => User::factory(),
            'estado' => $this->faker->randomElement(['pagado', 'pendiente', 'rechazado', 'cancelado']),
            'totalPago' => $this->faker->randomFloat(2, 100, 1000),
            'TipoPedido' => $this->faker->randomElement(['online', 'presencial']),
            'fentrega' => $this->faker->dateTimeBetween($fechaPedido, '+1 week'),
            'fecha_pedido' => $fechaPedido,
            'created_at' => $fechaPedido,
            'updated_at' => $fechaPedido
        ];
    }
}