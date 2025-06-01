import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';  // Usamos Picker
import DateTimePicker from '@react-native-community/datetimepicker';  // Para seleccionar la fecha
import { Button, TextInput as PaperInput } from 'react-native-paper';  // Importamos PaperInput de react-native-paper
import { IconButton } from 'react-native-paper';  // IconButton de react-native-paper
import { agregarCliente } from '../services/clienteService'; // Importamos el servicio necesario
import { obtenerCarros } from '../services/carroService'; // Importamos el servicio para obtener los carros
import Icon from 'react-native-vector-icons/MaterialIcons'; 
import { useFocusEffect } from '@react-navigation/native';

const ClientesScreen = ({ navigation }: any) => {
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [codigoPostal, setCodigoPostal] = useState('');
  const [rfc, setRfc] = useState('');
  const [sexo, setSexo] = useState('Masculino');
  const [fechaNacimiento, setFechaNacimiento] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);  // Control para mostrar el DatePicker
  const [carrosDisponibles, setCarrosDisponibles] = useState<any[]>([]);  // Estado para los carros disponibles

  // Función para guardar el cliente
  const guardarCliente = async () => {
    if (!nombre || !telefono || !direccion || !codigoPostal || !rfc || !sexo || !fechaNacimiento) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }

    const cliente = {
      nombre,
      telefono,
      direccion,
      codigoPostal,
      rfc,
      sexo,
      fechaNacimiento,
    };

    try {
      await agregarCliente(cliente);
      Alert.alert('Éxito', 'Cliente registrado correctamente');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Hubo un error al guardar el cliente');
    }
  };

  // Manejador para el cambio de la fecha
  const handleDateChange = (event: any, selectedDate: Date | undefined) => {
    const currentDate = selectedDate || fechaNacimiento;
    setShowDatePicker(false);  // Cerrar el picker
    setFechaNacimiento(currentDate);
  };

  // Función para cargar los carros disponibles
  const cargarCarrosDisponibles = async () => {
    const carros = await obtenerCarros();
    setCarrosDisponibles(carros.filter((carro: any) => carro.estado === 'Disponible'));
  };

  // Usamos useFocusEffect para cargar los carros disponibles cada vez que la pantalla se enfoque
  useFocusEffect(
    useCallback(() => {
      cargarCarrosDisponibles();
    }, [])
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Alta Cliente</Text>

      <PaperInput
        style={styles.input}
        label="Nombre"
        value={nombre}
        onChangeText={setNombre}
      />
      <PaperInput
        style={styles.input}
        label="Teléfono"
        keyboardType="phone-pad"
        value={telefono}
        onChangeText={setTelefono}
      />
      <PaperInput
        style={styles.input}
        label="Dirección"
        value={direccion}
        onChangeText={setDireccion}
      />
      <PaperInput
        style={styles.input}
        label="Código Postal"
        keyboardType="numeric"
        value={codigoPostal}
        onChangeText={setCodigoPostal}
      />
      <PaperInput
        style={styles.input}
        label="RFC"
        value={rfc}
        onChangeText={setRfc}
      />
      <Text>Sexo:</Text>
      {/* Picker de sexo */}
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={sexo}
          style={styles.picker}
          onValueChange={(itemValue: string) => setSexo(itemValue)}
        >
          <Picker.Item label="Masculino" value="Masculino" />
          <Picker.Item label="Femenino" value="Femenino" />
        </Picker>
      </View>

      <Text>Fecha de Nacimiento:</Text>
      {/* Selector de fecha de nacimiento */}
      <View style={styles.dateContainer}>
        <Text style={styles.dateText}>{fechaNacimiento.toLocaleDateString()}</Text>

        {/* IconButton al lado del DateText con la imagen de calendario */}
        <IconButton
          icon={() => <Image source={require('../components/calendar.png')} style={styles.iconImage} />}  // Usamos la imagen personalizada
          size={30}
          onPress={() => setShowDatePicker(true)}
          style={styles.dateButton}  // Aseguramos que se vea pequeño y alineado
        />
      </View>

      {/* DateTimePicker para seleccionar la fecha */}
      {showDatePicker && (
        <DateTimePicker
          value={fechaNacimiento}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      {/* Botón para guardar cliente */}
      <Button mode="contained" onPress={guardarCliente} style={styles.button}>
        Guardar Cliente
      </Button>
    </ScrollView>
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
  input: {
    height: 60,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 8,
    backgroundColor: '#fff', // Fondo blanco para los inputs
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#fff', // Fondo blanco para los Pickers
  },
  picker: {
    height: 60,
  },
  dateContainer: {
    flexDirection: 'row',  // Poner el icono al lado del texto
    alignItems: 'center',  // Alinear verticalmente
    marginBottom: 15,
  },
  dateText: {
    padding: 8,
    backgroundColor: '#f1f1f1',
    marginBottom: 10,
    height: 40,
    flex: 1,  // Hacer que el texto ocupe el espacio restante
    justifyContent: 'center',
  },
  dateButton: {
    marginLeft: 10,  // Espacio entre el texto y el ícono
    backgroundColor: '#e0e0e0',  // Color de fondo para el botón
    borderRadius: 5,
  },
  button: {
    marginTop: 20,
    width: '100%',
  },
  iconImage: {
    width: 30,  // Ajustamos el tamaño de la imagen
    height: 30,  // Ajustamos el tamaño de la imagen
  },
});

export default ClientesScreen;
