<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Carrito extends Model
{
    use HasFactory;
    protected $table = 'carritos'; 
    protected $fillable = ['iduser', 'idModelo', 'cantidad']; 

    public function user()
    {
        return $this->belongsTo(User::class, 'iduser');
    }

    public function modelo()
    {
        return $this->belongsTo(Modelo::class, 'idModelo', 'idModelo');
    }
}
