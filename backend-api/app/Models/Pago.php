<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pago extends Model
{
    protected $fillable = [
        'token_pago',
        'estado',
        'monto',
        'order_id',
        'Pagocol'
    ];
}
