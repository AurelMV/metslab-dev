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
        Schema::create('modelos', function (Blueprint $table) {
            $table->bigIncrements('idModelo');
            $table->string('nombre', 45);
            $table->string('ruta_modelo')->nullable();  // Ej: 'modelos/archivo.obj'
            $table->string('ruta_imagen')->nullable();  // Ej: 'imagenes/preview.jpg'
            $table->integer('precio');
            $table->string('descripcion')->nullable();
            $table->string('dimensiones', 45)->nullable();
            $table->unsignedBigInteger('idCategoria')->nullable();
            $table->timestamps();

            $table->foreign('idCategoria')->references('idCategoria')->on('categorias')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('modelos');
    }
};
