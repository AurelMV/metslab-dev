<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pedido extends Model
{
    //
    protected $fillable = [
        'iduser',
        'idPago',
        'estado',
        'totalPago',
        'TipoPedido',
        'fentrega',
        'fecha_pedido'
    ];
}
