import 'package:flutter/material.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Pantalla de Inicio'),
        backgroundColor: Colors.blueGrey[700], // Color del AppBar
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Título de bienvenida
            const Text(
              '¡Bienvenido a Sui!',
              style: TextStyle(
                fontSize: 30,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 20),

            // Imagen de bienvenida o logo
            Image.network(
              'https://via.placeholder.com/150',
              width: 150,
              height: 150,
            ),
            const SizedBox(height: 30),

            // Botón de salir
            ElevatedButton(
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
              onPressed: () {
                // Lógica para cerrar sesión o navegar
                Navigator.of(context).pop();
              },
              child: const Text('Cerrar Sesión'),
            ),
          ],
        ),
      ),
    );
  }
}
