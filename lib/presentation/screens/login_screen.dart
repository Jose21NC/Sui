import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../auth_service.dart'; // Para subir dos niveles
import 'register_screen.dart'; // Redirigiremos al registro si el usuario no tiene cuenta

class LoginScreen extends StatefulWidget {
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
      appBar: AppBar(
        title: Text('Iniciar Sesión'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              TextFormField(
                controller: _emailController,
                decoration: InputDecoration(labelText: 'Correo electrónico'),
                validator: (value) =>
                    value!.isEmpty ? 'Ingresa un correo válido' : null,
              ),
              SizedBox(height: 16),
              TextFormField(
                controller: _passwordController,
                decoration: InputDecoration(labelText: 'Contraseña'),
                obscureText: true,
                validator: (value) =>
                    value!.length < 6 ? 'La contraseña debe tener al menos 6 caracteres' : null,
              ),
              SizedBox(height: 32),
              _loading
                  ? CircularProgressIndicator()
                  : ElevatedButton(
                      onPressed: () async {
                        if (_formKey.currentState!.validate()) {
                          setState(() => _loading = true);
                          AuthService auth = Provider.of<AuthService>(context, listen: false);
                          var user = await auth.signInWithEmailAndPassword(
                              _emailController.text, _passwordController.text);
                          if (user != null) {
                            // Redirige a la pantalla principal si el inicio de sesión es exitoso
                            Navigator.of(context).pushReplacementNamed('/home');
                          } else {
                            setState(() => _loading = false);
                            ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                              content: Text('Error al iniciar sesión. Verifica tus credenciales.'),
                            ));
                          }
                        }
                      },
                      child: Text('Iniciar Sesión'),
                    ),
              TextButton(
                onPressed: () {
                  Navigator.of(context).push(
                      MaterialPageRoute(builder: (context) => RegisterScreen()));
                },
                child: Text('¿No tienes una cuenta? Regístrate'),
              ),
            ],
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
