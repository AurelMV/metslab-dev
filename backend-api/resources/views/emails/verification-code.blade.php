<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .container {
            background-color: #f9f9f9;
            border-radius: 5px;
            padding: 20px;
            margin-top: 20px;
        }
        .code {
            background-color: #eee;
            padding: 10px;
            font-size: 24px;
            text-align: center;
            letter-spacing: 5px;
            margin: 20px 0;
            font-weight: bold;
        }
        .footer {
            font-size: 12px;
            color: #666;
            margin-top: 30px;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">        <h2>Verificación de Cuenta - Metslab</h2>
        
        <p>Hola {{ $name }},</p>
        
        <p>Gracias por registrarte en Metslab. Para completar la verificación de tu cuenta, por favor utiliza el siguiente código:</p>
        
        <div class="code">
            {{ $code }}
        </div>
        
        <p>Este código es válido por un tiempo limitado. Por favor, no compartas este código con nadie.</p>
        
        <p>Si no has solicitado este código, puedes ignorar este correo.</p>

        <div class="footer">
            <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
            <p>&copy; {{ date('Y') }} Metslab. Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>