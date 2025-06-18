<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('pedidos', function (Blueprint $table) {
            $table->id();
            $table->string('estado', 45);
            $table->decimal('totalPago', 10, 2);
            $table->string('TipoPedido', 45);
            $table->timestamp('fentrega')->nullable();
            $table->foreignId('idPago')->constrained('pagos');
            $table->foreignId('iduser')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pedidos');
    }
};
