<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Pago extends Model
{
    protected $fillable = [
        'token_pago',
        'estado',
        'monto',
        'order_id',
        'Pagocol',
        'payment_method',
    ];

    protected $casts = [
        'monto' => 'decimal:2',
        'Pagocol' => 'array'
    ];

    /**
     * Relación con el pedido
     */
    public function pedido(): HasOne
    {
        return $this->hasOne(Pedido::class, 'idPago');
    }

    /**
     * Obtener el estado formateado
     */
    public function getEstadoFormateadoAttribute(): string
    {
        return match ($this->estado) {
            'approved' => 'Aprobado',
            'pending' => 'Pendiente',
            'rejected' => 'Rechazado',
            'cancelled' => 'Cancelado',
            default => ucfirst($this->estado)
        };
    }

    /**
     * Obtener información del método de pago
     */
    public function getMetodoPagoAttribute(): ?string
    {
        if (isset($this->Pagocol['payment_method_id'])) {
            return $this->Pagocol['payment_method_id'];
        }
        return null;
    }

    /**
     * Obtener información del pagador
     */
    public function getPagadorAttribute(): ?array
    {
        if (isset($this->Pagocol['payer'])) {
            return $this->Pagocol['payer'];
        }
        return null;
    }
}
