<!DOCTYPE html>
<html>
<head>
    <title>Verifica tu cuenta</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #5A67D8;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 12px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>¡Bienvenido a Metslab!</h2>
        
        <p>Gracias por registrarte. Para completar tu registro y comenzar a usar tu cuenta, por favor verifica tu dirección de correo electrónico haciendo clic en el botón de abajo:</p>

        <p>
            <a href="{{ url('api/verify-email/' . $token) }}" class="button">
                Verificar mi correo electrónico
            </a>
        </p>

        <p>O copia y pega el siguiente enlace en tu navegador:</p>
        <p>{{ url('api/verify-email/' . $token) }}</p>

        <p>Si no creaste una cuenta en Metslab, puedes ignorar este correo.</p>

        <div class="footer">
            <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
            <p>&copy; {{ date('Y') }} Metslab. Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>
