<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Spatie\Permission\Models\Role;

class SetupAdminAndRoles extends Command
{
    protected $signature = 'setup:admin-roles
                            {--email=admin@metslab.com : Email del admin}
                            {--password=12345678 : Contraseña del admin}
                            {--name=Administrador : Nombre del admin}';

    protected $description = 'Crea los roles admin y cliente y un usuario admin si no existen';

    public function handle()
    {
        $this->info('Creando roles...');
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $clienteRole = Role::firstOrCreate(['name' => 'cliente']);

        $email = $this->option('email');
        $password = $this->option('password');
        $name = $this->option('name');

        $this->info('Creando usuario admin...');
        $admin = User::firstOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'password' => bcrypt($password),
                'email_verified_at' => now(),
            ]
        );

        // Si el usuario ya existía y no tiene el email verificado, actualizarlo
        if (is_null($admin->email_verified_at)) {
            $admin->email_verified_at = now();
            $admin->save();
        }

        $admin->assignRole($adminRole);

        $this->info('Listo. Usuario admin: ' . $email . ' / Contraseña: ' . $password);
    }
}
