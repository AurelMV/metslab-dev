<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Registro</title>
    <style>
        body { font-family: 'Segoe UI', sans-serif; background: #f3f3f3; display: flex; justify-content: center; align-items: center; height: 100vh; }
        .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); width: 350px; }
        h2 { text-align: center; margin-bottom: 20px; }
        label { font-weight: bold; }
        input[type="text"], input[type="email"], input[type="password"] { width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid #ccc; border-radius: 6px; }
        button { width: 100%; padding: 10px; background: #5A67D8; color: white; border: none; border-radius: 6px; font-size: 16px; cursor: pointer; }
        .error { color: red; font-size: 13px; margin-bottom: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <h2>Registro</h2>
        <form method="POST" action="{{ url('/register') }}">
            @csrf
            <label for="name">Nombre</label>
            <input type="text" id="name" name="name" value="{{ old('name') }}" required>
            @error('name')
                <div class="error">{{ $message }}</div>
            @enderror

            <label for="email">Correo Electrónico</label>
            <input type="email" id="email" name="email" value="{{ old('email') }}" required>
            @error('email')
                <div class="error">{{ $message }}</div>
            @enderror

            <label for="password">Contraseña</label>
            <input type="password" id="password" name="password" required>
            @error('password')
                <div class="error">{{ $message }}</div>
            @enderror

            <label for="password_confirmation">Confirmar Contraseña</label>
            <input type="password" id="password_confirmation" name="password_confirmation" required>

            <button type="submit">Registrarse</button>
        </form>
        <div style="text-align:center; margin-top:15px;">
            ¿Ya tienes cuenta?
            <a href="{{ url('/login') }}">Inicia sesión aquí</a>
        </div>
    </div>
</body>
</html>