import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'auth_service.dart'; 
import 'presentation/screens/login_screen.dart'; 
import 'presentation/screens/register_screen.dart'; 

void main() {
  runApp(MainApp());
}

class MainApp extends StatelessWidget { // MainApp
  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        Provider<AuthService>(create: (_) => AuthService()), // Servicio de autenticación
      ],
      child: MaterialApp(
        title: 'Sui App',
        theme: ThemeData(
          primarySwatch: Colors.blue,
        ),
        initialRoute: '/login', // La ruta inicial será la pantalla de login
        routes: {
          '/login': (context) => LoginScreen(), // Pantalla de login
          '/register': (context) => RegisterScreen(), // Pantalla de registro
          '/home': (context) => Scaffold(body: Center(child: Text('Pantalla Principal'))), // Placeholder para la pantalla principal
        },
      ),
    );
  }
}
