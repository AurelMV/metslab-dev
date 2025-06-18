<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Address extends Model
{
        use HasFactory;

    protected $fillable = [
    'first_name',
    'last_name',
    'street_name',
    'department',
    'province',
    'district',
    'postal_code',
    'phone_number',
    'latitude',
    'longitude',
    'user_id',
];
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
