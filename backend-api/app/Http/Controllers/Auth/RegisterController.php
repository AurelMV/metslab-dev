<?php


namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class RegisterController extends Controller
{
    // Registro API
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:6|confirmed',
        ]);

        $verificationCode = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'verification_token' => $verificationCode,
        ]);

        // Asignar rol usando laravel-permission
        $user->assignRole('cliente');

        // Enviar código por correo
        Mail::send('emails.verification-code', [
            'code' => $verificationCode,
            'name' => $user->name
        ], function ($message) use ($user) {
            $message->to($user->email)
                ->subject('Tu código de verificación - Metslab');
        });

        return response()->json([
            'success' => true,
            'message' => 'Por favor, verifica tu correo electrónico.',
            'user_id' => $user->id,
            'email' => $user->email
        ]);
    }

    // Verificar código
    public function verifyCode(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|string|size:6'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || $user->verification_token !== $request->code) {
            return response()->json([
                'success' => false,
                'message' => 'Código de verificación inválido'
            ], 400);
        }

        $user->verification_token = null;
        $user->email_verified_at = now();
        $user->save();

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Correo verificado exitosamente',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role
            ]
        ]);
    }

    // Reenviar código de verificación
    public function resendCode(Request $request)
    {
        $request->validate([
            'email' => 'required|email'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Usuario no encontrado'
            ], 404);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'success' => false,
                'message' => 'El correo ya está verificado'
            ], 400);
        }

        $verificationCode = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $user->verification_token = $verificationCode;
        $user->save();

        Mail::send('emails.verification-code', [
            'code' => $verificationCode,
            'name' => $user->name
        ], function ($message) use ($user) {
            $message->to($user->email)
                ->subject('Tu código de verificación - Metslab');
        });

        return response()->json([
            'success' => true,
            'message' => 'Código reenviado correctamente'
        ]);
    }
}
