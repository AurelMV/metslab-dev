<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DetallePedido extends Model
{
    protected $fillable = [
        'cantidad',
        'nombre',
        'precio',
        'precioTotal',
        'idModelo',
        'idPedido'
    ];
}
