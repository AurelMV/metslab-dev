<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        // Crear roles si no existen
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $clienteRole = Role::firstOrCreate(['name' => 'cliente']);

        // Crear usuario admin si no existe
        $admin = User::firstOrCreate(
            ['email' => 'admin@metslab.com'],
            [
                'name' => 'Administrador',
                'password' => bcrypt('12345678'),
                'email_verified_at' => now(),
            ]
        );
        $admin->assignRole($adminRole);

        // Crear usuario cliente si no existe
        $cliente = User::firstOrCreate(
            ['email' => 'cliente@demo.com'],
            [
                'name' => 'Cliente Demo',
                'password' => bcrypt('12345678'),
                'email_verified_at' => now(),
            ]
        );
        $cliente->assignRole($clienteRole);

        $this->call([
            PedidoSeeder::class
        ]);
    }
}
