<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Pedido extends Model
{
     use HasFactory;
    //
    protected $fillable = [
        'iduser',
        'idPago',
        'estado',
        'totalPago',
        'TipoPedido',
        'fentrega',
        'fecha_pedido',
        'external_reference',
        'address_id',
        'delivery_fee'
    ];

    protected $casts = [
        'fentrega' => 'datetime',
        'fecha_pedido' => 'datetime',
        'delivery_fee' => 'decimal:2'
    ];

    /**
     * Relación con el usuario
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'iduser');
    }

    /**
     * Relación con el pago
     */
    public function pago(): BelongsTo
    {
        return $this->belongsTo(Pago::class, 'idPago');
    }

    /**
     * Relación con la dirección
     */
    public function address(): BelongsTo
    {
        return $this->belongsTo(Address::class, 'address_id');
    }

    /**
     * Relación con los detalles del pedido
     */
    public function detalles(): HasMany
    {
        return $this->hasMany(DetallePedido::class, 'idPedido');
    }

    /**
     * Obtener el estado formateado
     */
    public function getEstadoFormateadoAttribute(): string
    {
        return match ($this->estado) {
            'pagado' => 'Pagado',
            'pendiente' => 'Pendiente',
            'rechazado' => 'Rechazado',
            'cancelado' => 'Cancelado',
            default => ucfirst($this->estado)
        };
    }
}
