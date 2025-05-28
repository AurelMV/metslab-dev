<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Verificar Token</title>
    <style>
        body { font-family: 'Segoe UI', sans-serif; background: #f3f3f3; display: flex; justify-content: center; align-items: center; height: 100vh; }
        .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); width: 350px; }
        h2 { text-align: center; margin-bottom: 20px; }
        label { font-weight: bold; }
        input[type="text"] { width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid #ccc; border-radius: 6px; }
        button { width: 100%; padding: 10px; background: #5A67D8; color: white; border: none; border-radius: 6px; font-size: 16px; cursor: pointer; }
        .error { color: red; font-size: 13px; margin-bottom: 10px; }
        .success { color: green; font-size: 13px; margin-bottom: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <h2>Verificar Token</h2>
        @if(session('error'))
            <div class="error">{{ session('error') }}</div>
        @endif
        @if(session('success'))
            <div class="success">{{ session('success') }}</div>
        @endif
        <form method="POST" action="{{ route('verify.token') }}">
            @csrf
            <input type="hidden" name="email" value="{{ session('email') }}">
            <label for="token">Token de verificación</label>
            <input type="text" id="token" name="token" required>
            <button type="submit">Verificar</button>
        </form>
    </div>
</body>
</html>