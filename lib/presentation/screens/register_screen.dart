import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../auth_service.dart';

class RegisterScreen extends StatefulWidget {
  @override
  _RegisterScreenState createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  bool _loading = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Registrarse'),
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
                          var user = await auth.registerWithEmailAndPassword(
                              _emailController.text, _passwordController.text);
                          if (user != null) {
                            // Redirige a la pantalla principal después de registrarse
                            Navigator.of(context).pushReplacementNamed('/home');
                          } else {
                            setState(() => _loading = false);
                            ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                              content: Text('Error al registrarse'),
                            ));
                          }
                        }
                      },
                      child: Text('Registrarse'),
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
