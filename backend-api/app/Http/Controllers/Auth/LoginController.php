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
}