import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Image, Alert } from 'react-native';
import { Button } from 'react-native-paper'; // Usamos el botón de react-native-paper
import { useFocusEffect } from '@react-navigation/native'; // Importa useFocusEffect
import { obtenerCarros } from '../services/carroService'; // Asegúrate de tener el servicio de carros
import { Carro } from '../models/Carro'; // Asegúrate de tener el modelo de Carro

const CarrosScreen = ({ navigation }: any) => {
  const [carros, setCarros] = useState<Carro[]>([]);

  const cargarCarros = async () => {
    try {
      const carrosObtenidos = await obtenerCarros(); // Llama a la API para obtener los carros
      console.log(carrosObtenidos); // Verifica la respuesta del backend

      // Ordena los carros para que los disponibles estén al principio
      const carrosOrdenados = carrosObtenidos.sort((a: any, b: any) => {
        if (a.estado === 'Disponible' && b.estado !== 'Disponible') {
          return -1; // 'Disponible' va primero
        } else if (a.estado !== 'Disponible' && b.estado === 'Disponible') {
          return 1; // 'No Disponible' va después
        }
        return 0; // Si ambos tienen el mismo estado, no cambia el orden
      });

      setCarros(carrosOrdenados); // Actualiza el estado con los carros ordenados
    } catch (error) {
      console.error('Error cargando carros:', error);
      Alert.alert('Error', 'Hubo un error al cargar los carros');
    }
  };

  useEffect(() => {
    cargarCarros(); // Carga los carros cuando el componente se monta
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargarCarros(); // Carga los carros cada vez que la pantalla gana el foco
    }, [])
  );

  const handleAgregarCarro = () => {
    navigation.navigate('DetalleCarro'); // Navega a DetalleCarroScreen
  };

  const getCarroColor = (estado: string) => {
    return estado === 'Disponible' ? '#45d55b' : '#fc4302'; // Asigna el color basado en el estado
  };

  const renderItem = ({ item }: any) => (
    <View style={[styles.card, { backgroundColor: getCarroColor(item.estado) }]}>
      {/* Renderizamos la imagen desde la URL que el servidor nos devuelve */}
      {item.imagen ? (
        <Image
          source={{ uri: `http://192.168.1.196:3000${item.imagen}` }} // Usamos la URL del servidor para la imagen
          style={styles.image}
          resizeMode="contain" // Ajusta la imagen para que no se deforme
        />
      ) : (
        <Text>No Image</Text> // En caso de que no haya imagen
      )}

      <View style={styles.details}>
        <Text style={styles.matricula}>Marca: {item.marca}</Text>
        <Text style={styles.matricula}>Modelo: {item.modelo}</Text>
        <Text style={styles.matricula}>Color: {item.color}</Text>
        <Text style={styles.matricula}>Precio: ${item.precio}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lista de Carros</Text>

      {/* Botón de agregar carro usando react-native-paper */}
      <Button
        mode="contained"
        onPress={handleAgregarCarro}
        style={styles.button}
      >
        Agregar Carro
      </Button>

      <FlatList
        data={carros}
        keyExtractor={(item) => item._id || Math.random().toString()}
        renderItem={renderItem} // Usar la función renderizada
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff', // Fondo gris claro para toda la página
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    marginBottom: 10,
    padding: 10,
    borderRadius: 8,
    flexDirection: 'row',
    backgroundColor: '#fff', // Fondo blanco para cada card
    shadowColor: '#000', // Sombra para cada card
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5, // Sombra para Android
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 15,
  },
  details: {
    flex: 1,
  },
  matricula: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  button: {
    marginBottom: 20,
    marginTop: 10,
    backgroundColor: 'rgb(133, 1, 249)', // Color personalizado del botón
  },
});

export default CarrosScreen;
