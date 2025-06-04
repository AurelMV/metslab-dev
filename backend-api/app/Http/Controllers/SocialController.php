<?php

namespace App\Http\Controllers;
use Laravel\Socialite\Facades\Socialite;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Exception;

class SocialController extends Controller
{
    protected $frontendUrl = 'http://localhost:5173';

    public function redirectToProvider($provider)
    {
        try {
            return Socialite::driver($provider)->redirect();
        } catch (Exception $e) {
            Log::error("Error en redirección social: " . $e->getMessage());
            return redirect($this->frontendUrl . '/login?' . http_build_query([
                'error' => 'Error al iniciar autenticación con ' . $provider
            ]));
        }
    }

    public function handleProviderCallback($provider)
    {
        try {
            $socialUser = Socialite::driver($provider)->user();
            Log::info('Información del usuario de ' . $provider . ': ' . json_encode($socialUser));
            
            if (!$socialUser->getEmail()) {
                throw new Exception('El proveedor no proporcionó un correo electrónico');
            }

            $user = User::where('email', $socialUser->getEmail())->first();

            if (!$user) {
                $user = User::create([
                    'name' => $socialUser->getName() ?? explode('@', $socialUser->getEmail())[0],
                    'email' => $socialUser->getEmail(),
                    'provider_id' => $socialUser->getId(),
                    'provider' => $provider,
                    'password' => bcrypt(uniqid()),
                    'email_verified_at' => now()
                ]);
                Log::info('Nuevo usuario creado con ID: ' . $user->id);
            } else {
                $user->provider_id = $socialUser->getId();
                $user->provider = $provider;
                $user->email_verified_at = $user->email_verified_at ?? now();
                $user->save();
                Log::info('Usuario existente actualizado con ID: ' . $user->id);
            }

            // Crear token sin expiración
            $token = $user->createToken('auth_token')->plainTextToken;
            
            // Preparar datos del usuario
            $userData = [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'email_verified_at' => $user->email_verified_at,
                'provider' => $provider
            ];

            Log::info('Datos del usuario a enviar: ' . json_encode($userData));
            
            // Simplificar la codificación
            $encodedUserData = base64_encode(json_encode($userData));
            Log::info('Datos codificados (base64): ' . $encodedUserData);
            
            // Construir URL de redirección
            $queryParams = http_build_query([
                'token' => $token,
                'user' => $encodedUserData,
                'status' => 'success'
            ]);
            
            $redirectUrl = $this->frontendUrl . '/auth/callback?' . $queryParams;
            Log::info('URL de redirección: ' . $redirectUrl);
            
            return redirect($redirectUrl);

        } catch (Exception $e) {
            Log::error("Error en autenticación social: " . $e->getMessage());
            Log::error("Stack trace: " . $e->getTraceAsString());
            
            $errorMessage = 'Error al procesar la autenticación social';
            if ($e->getMessage() === 'El proveedor no proporcionó un correo electrónico') {
                $errorMessage = 'No se pudo obtener el correo electrónico de su cuenta de ' . $provider;
            }
            
            return redirect($this->frontendUrl . '/login?' . http_build_query([
                'error' => $errorMessage,
                'provider' => $provider
            ]));
        }
    }
}
