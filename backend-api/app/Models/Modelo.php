<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Modelo extends Model
{
    protected $table = 'modelos'; // Nombre de la tabla en la BD
    protected $primaryKey = 'idModelo'; // Clave primaria personalizada

    // Campos asignables masivamente
    protected $fillable = [
        'nombre',
        'ruta_modelo',
        'ruta_imagen',
        'precio',
        'descripcion',
        'dimensiones',
        'estado',
        'idCategoria'
    ];

    // Relación con Categoría (opcional)
    public function categoria(): BelongsTo
    {
        return $this->belongsTo(Categoria::class, 'idCategoria');
    }

    // Accesores para URLs completas
    public function getUrlModeloAttribute(): string
    {
        return asset($this->ruta_modelo); //"http://tudominio.com/storage/modelos/mitorre.obj"
    }

    public function getUrlImagenAttribute(): string
    {
        return $this->ruta_imagen ? asset($this->ruta_imagen) : '';
    }
}
