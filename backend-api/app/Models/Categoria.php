<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Categoria extends Model
{
      protected $table = 'categorias';
    protected $primaryKey = 'idCategoria';

    protected $fillable = ['nombre'];

    public function modelos()
    {
        return $this->hasMany(Modelo::class, 'idCategoria');
    }
}
