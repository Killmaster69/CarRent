import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, Image } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { Button, TextInput as PaperInput } from 'react-native-paper';
import { agregarCarro, verificarMatricula } from '../services/carroService';

const DetalleCarroScreen = ({ navigation }: any) => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [matricula, setMatricula] = useState('');
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [color, setColor] = useState('');
  const [precio, setPrecio] = useState('');
  const [descripcion, setDescripcion] = useState('');

  const pickImage = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 1,
      },
      (response) => {
        if (response.didCancel) {
          Alert.alert('Error', 'No se seleccionó ninguna imagen');
        } else if (response.errorCode) {
          Alert.alert('Error', 'Error al cargar la imagen');
        } else {
          const uri = response.assets && response.assets[0] ? response.assets[0].uri : null;
          if (uri) {
            setImageUri(uri);
          }
        }
      }
    );
  };

  const handleGuardarCarro = async () => {
    if (!matricula || !marca || !modelo || !color || !precio || !descripcion || !imageUri) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }

    // Verificamos si la matrícula ya está registrada
    const matriculaExistente = await verificarMatricula(matricula);
    if (matriculaExistente) {
      Alert.alert('Error', 'La matrícula ya está registrada');
      return;
    }

    // Usamos FormData para enviar los datos
    const formData = new FormData();
    formData.append('matricula', matricula);
    formData.append('marca', marca);
    formData.append('modelo', modelo);
    formData.append('color', color);
    formData.append('precio', precio);
    formData.append('descripcion', descripcion);
    formData.append('estado', 'Disponible'); // Estado por defecto
    // Agregamos la imagen al FormData
    formData.append('imagen', {
      uri: imageUri, // La URI de la imagen seleccionada
      type: 'image/jpeg', // Tipo de la imagen, asumiendo que es JPEG
      name: 'car-image.jpg', // El nombre del archivo
    });

    try {
      await agregarCarro(formData); // Enviamos los datos al backend
      Alert.alert('Éxito', 'Carro registrado correctamente');
      navigation.goBack();
    } catch (error) {
      console.error('Error al guardar el carro:', error);
      Alert.alert('Error', 'Hubo un error al guardar el carro');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Agregar Carro</Text>

      <View style={styles.imageContainer}>
        {imageUri && (
          <Image source={{ uri: imageUri }} style={styles.image} />
        )}
      </View>

      <Button mode="contained" onPress={pickImage} style={styles.button}>
        Cargar Foto
      </Button>

      <PaperInput
        label="Matrícula"
        value={matricula}
        onChangeText={setMatricula}
        style={styles.input}
      />

      <PaperInput
        label="Marca"
        value={marca}
        onChangeText={setMarca}
        style={styles.input}
      />

      <PaperInput
        label="Modelo"
        value={modelo}
        onChangeText={setModelo}
        style={styles.input}
      />

      <PaperInput
        label="Color"
        value={color}
        onChangeText={setColor}
        style={styles.input}
      />

      <PaperInput
        label="Precio"
        value={precio}
        onChangeText={setPrecio}
        keyboardType="numeric"
        style={styles.input}
      />

      <PaperInput
        label="Descripción"
        value={descripcion}
        onChangeText={setDescripcion}
        style={styles.input}
      />

      <Button mode="contained" onPress={handleGuardarCarro} style={styles.button}>
        Guardar Carro
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#ffffff',
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  imageContainer: {
    width: 200,
    height: 200,
    backgroundColor: '#f1f1f1',
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  button: {
    width: '100%',
    marginVertical: 10,
  },
  input: {
    marginBottom: 10,
  },
});

export default DetalleCarroScreen;
