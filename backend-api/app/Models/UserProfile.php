<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\User;

class UserProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'nombre_completo',
        'celular',
        'direccion',
        'referencia',
        'latitud',
        'longitud'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
