<?php


namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class RegisterController extends Controller
{
    public function apiRegister(Request $request)
    {
        try {
            Log::info('Iniciando registro de usuario');
            
            $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users',
                'password' => 'required|string|min:6|confirmed',
            ]);

            // Generar código de verificación de 6 dígitos
            $verificationCode = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
            Log::info('Código de verificación generado: ' . $verificationCode);

            DB::beginTransaction();
            try {
                $user = User::create([
                    'name' => $request->name,
                    'email' => $request->email,
                    'password' => Hash::make($request->password),
                    'verification_token' => $verificationCode,
                    'email_verified_at' => null
                ]);

                Log::info('Usuario creado con ID: ' . $user->id);
                Log::info('Token guardado: ' . $user->verification_token);

                // Intentar enviar el correo
                Mail::send('emails.verification-code', [
                    'code' => $verificationCode,
                    'name' => $user->name
                ], function($message) use ($user) {
                    $message->to($user->email)
                           ->subject('Tu código de verificación - Metslab');
                });

                DB::commit();
                Log::info('Registro completado exitosamente');

                return response()->json([
                    'message' => 'Por favor, verifica tu correo electrónico.',
                    'user_id' => $user->id,
                    'email' => $user->email
                ]);

            } catch (\Exception $e) {
                DB::rollBack();
                Log::error('Error en el registro: ' . $e->getMessage());
                Log::error('Stack trace: ' . $e->getTraceAsString());
                throw $e;
            }

        } catch (\Exception $e) {
            Log::error('Error en la validación o proceso de registro: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error al registrar usuario',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function verifyCode(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|string|size:6'
        ]);

        Log::info('Iniciando verificación de código');
        Log::info('Email: ' . $request->email);
        Log::info('Código: ' . $request->code);

        DB::beginTransaction();
        try {
            // Buscar el usuario sin verificar el código primero
            $user = User::where('email', $request->email)->first();
            
            if (!$user) {
                Log::error('Usuario no encontrado');
                return response()->json([
                    'message' => 'Usuario no encontrado',
                    'errors' => ['email' => ['El usuario no existe']]
                ], 404);
            }
            
            Log::info('Usuario encontrado. Token almacenado: ' . $user->verification_token);
            
            if ($user->verification_token !== $request->code) {
                Log::error('Código de verificación no coincide');
                DB::rollBack();
                return response()->json([
                    'message' => 'Código de verificación inválido',
                    'errors' => ['code' => ['El código ingresado no es válido']]
                ], 400);
            }

            // El código coincide, actualizar el usuario
            $user->verification_token = null;
            $user->email_verified_at = now();
            $user->save();
            
            // Crear token de autenticación
            $token = $user->createToken('auth_token')->plainTextToken;
            
            DB::commit();
            Log::info('Usuario verificado exitosamente');

            return response()->json([
                'message' => 'Correo verificado exitosamente',
                'token' => $token,
                'user' => $user
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error en la verificación: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'message' => 'Error al verificar el código',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function resendCode(Request $request)
    {
        $request->validate([
            'email' => 'required|email'
        ]);

        $user = User::where('email', $request->email)
                    ->whereNull('email_verified_at')
                    ->first();

        if (!$user) {
            return response()->json([
                'message' => 'Usuario no encontrado o ya verificado'
            ], 404);
        }

        // Generar nuevo código de verificación
        $newCode = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
        $user->verification_token = $newCode;
        $user->save();

        // Enviar nuevo código por correo
        Mail::send('emails.verification-code', ['code' => $newCode], function($message) use ($user) {
            $message->to($user->email)
                   ->subject('Nuevo código de verificación - Metslab');
        });

        return response()->json([
            'message' => 'Se ha enviado un nuevo código de verificación'
        ]);
    }
}