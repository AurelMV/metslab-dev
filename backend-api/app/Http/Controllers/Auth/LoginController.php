<?php


namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use App\Models\User;

class LoginController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Auth::attempt($request->only('email', 'password'))) {
            return back()->withErrors(['email' => 'Credenciales incorrectas']);
        }

        // Generar token de verificación
        $token = Str::random(6);
        $user->verification_token = $token;
        $user->save();

        // Enviar token por correo
        Mail::raw("Tu token de verificación es: $token", function ($message) use ($user) {
            $message->to($user->email)
                ->subject('Token de verificación');
        });

        // Redirigir a una vista para ingresar el token
        return redirect()->route('verify.token.form')->with('email', $user->email);
    }
    public function verifyToken(Request $request)
{
    $request->validate([
        'email' => 'required|email',
        'token' => 'required'
    ]);

    $user = \App\Models\User::where('email', $request->email)->first();

    if (!$user || $user->verification_token !== $request->token) {
        return redirect()->back()->with('error', 'Token incorrecto o usuario no encontrado.');
    }

    // Limpiar el token y autenticar al usuario
    $user->verification_token = null;
    $user->save();

    Auth::login($user);

    return redirect('/')->with('success', '¡Verificación exitosa! Ya has iniciado sesión.');
}
    public function apiLogin(Request $request)
{
    $request->validate([
        'email' => 'required|email',
        'password' => 'required'
    ]);

    if (!Auth::attempt($request->only('email', 'password'))) {
        return response()->json([
            'message' => 'Credenciales incorrectas',
            'errors' => ['email' => ['Las credenciales proporcionadas son incorrectas']]
        ], 401);
    }

    $user = User::where('email', $request->email)->first();

    // Verificar si el correo está verificado
    if (!$user->hasVerifiedEmail()) {
        // Generar nuevo código de verificación
        $verificationCode = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
        $user->verification_token = $verificationCode;
        $user->save();

        // Enviar el nuevo código
        Mail::send('emails.verification-code', ['code' => $verificationCode], function($message) use ($user) {
            $message->to($user->email)
                   ->subject('Verifica tu cuenta - Metslab');
        });

        return response()->json([
            'message' => 'Correo no verificado',
            'verification_required' => true,
            'user_id' => $user->id,
            'email' => $user->email
        ], 403);
    }

    $token = $user->createToken('auth_token')->plainTextToken;

    return response()->json([
        'access_token' => $token,
        'token_type' => 'Bearer',
        'user' => $user
    ]);
}
}