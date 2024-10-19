import 'dart:async';
import 'package:flutter/material.dart';
import 'login_screen.dart'; // Importar tu pantalla de inicio de sesión

class SplashScreen extends StatefulWidget {
  @override
  _SplashScreenState createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    // Temporizador para cambiar a la pantalla de inicio de sesión después de 3 segundos
    Timer(Duration(seconds: 3), () {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (context) => LoginScreen())
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white, // Puedes cambiar el color de fondo según tu preferencia
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Image.asset(
              'assets/images/logo_sui.png', // Asegúrate de que la imagen del logo esté en esta ruta
              width: 200, // Tamaño de la imagen
              height: 200,
            ),
            SizedBox(height: 20), // Espacio entre el logo y el texto
            Text(
              'Bienvenido a Sui', // Texto debajo del logo
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Colors.blueAccent, // Personaliza los colores
              ),
            ),
          ],
        ),
      ),
    );
  }
}
