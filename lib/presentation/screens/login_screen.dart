import 'package:flutter/material.dart';
import 'package:sui/presentation/screens/register_screen.dart';
import 'home_screen.dart'; // Asegúrate de importar la pantalla principal

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  _LoginScreenState createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  bool _loading = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.blueGrey[900], // Fondo oscuro
      appBar: AppBar(
        title: const Text('Iniciar Sesión'),
        backgroundColor: Colors.blueGrey[700], // Color del AppBar
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Center(
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Título estilizado
                const Text(
                  'Bienvenido a Sui',
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 32),

                // Campo de correo electrónico
                TextFormField(
                  controller: _emailController,
                  decoration: InputDecoration(
                    labelText: 'Correo electrónico',
                    filled: true,
                    fillColor: Colors.white,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8.0),
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // Campo de contraseña
                TextFormField(
                  controller: _passwordController,
                  decoration: InputDecoration(
                    labelText: 'Contraseña',
                    filled: true,
                    fillColor: Colors.white,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8.0),
                    ),
                  ),
                  obscureText: true,
                ),
                const SizedBox(height: 32),

                // Botón de iniciar sesión con animación de carga
                _loading
                    ? const CircularProgressIndicator()
                    : ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 50.0,
                            vertical: 15.0,
                          ),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10.0),
                          ),
                          backgroundColor: Colors.teal[300],
                        ),
                        onPressed: () async {
                          setState(() => _loading = true);

                          // Simulamos la conexión al servidor con un tiempo de espera
                          await Future.delayed(const Duration(seconds: 2));

                          // Redirigimos a la pantalla de inicio
                          // ignore: use_build_context_synchronously
                          Navigator.of(context).pushReplacement(
                            MaterialPageRoute(builder: (context) => HomeScreen()),
                          );
                        },
                        child: const Text('Iniciar Sesión'),
                      ),

                // Botón de registro
                TextButton(
                  onPressed: () {
                    Navigator.of(context).push(
                        MaterialPageRoute(builder: (context) => RegisterScreen()));
                  },
                  child: const Text(
                    '¿No tienes una cuenta? Regístrate',
                    style: TextStyle(color: Colors.white),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }
}
