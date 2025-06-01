import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Button, TextInput as PaperInput } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { obtenerClientes } from '../services/clienteService';
import { obtenerCarros } from '../services/carroService';
import { agregarRenta } from '../services/rentaService';

const RentasScreen = ({ navigation }: any) => {
  const [clientes, setClientes] = useState<any[]>([]);
  const [carrosDisponibles, setCarrosDisponibles] = useState<any[]>([]);
  const [carroSeleccionado, setCarroSeleccionado] = useState<any>(null);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<any>(""); // Iniciado como ""
  const [precio, setPrecio] = useState('0');
  const [fechaInicio, setFechaInicio] = useState(new Date());
  const [fechaFin, setFechaFin] = useState(new Date());
  const [dias, setDias] = useState<number>(0);
  const [total, setTotal] = useState('0');
  const [showDatePicker, setShowDatePicker] = useState(false); // Estado para mostrar el DatePicker
  const [isEndDate, setIsEndDate] = useState(false); // Control para saber si se está cambiando la fecha de inicio o fin

  // Función para cargar los clientes y carros disponibles
  const cargarClientesYCarros = async () => {
    const clientes = await obtenerClientes();
    setClientes(clientes);

    const carros = await obtenerCarros();
    setCarrosDisponibles(carros.filter((carro: any) => carro.estado === 'Disponible'));
  };

  // Usamos useFocusEffect para cargar los clientes y carros cada vez que la pantalla gana el foco
  useFocusEffect(
    useCallback(() => {
      cargarClientesYCarros(); // Carga los clientes y carros cada vez que la pantalla gana el foco
    }, [])
  );

  useEffect(() => {
    calcularDiasYTotal(fechaInicio, fechaFin, precio);
  }, [fechaInicio, fechaFin, precio]);

  const handleCarroSelected = (carro: any) => {
    setCarroSeleccionado(carro);
    setPrecio(carro.precio); // Asigna el precio del carro seleccionado
  };

  const calcularDiasYTotal = (inicio: Date, fin: Date, precioPorDia: string) => {
    const diffTime = Math.abs(fin.getTime() - inicio.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Obtener la diferencia en días
    setDias(diffDays);

    const totalCalculado = (diffDays * parseFloat(precioPorDia)).toFixed(2);
    setTotal(totalCalculado);
  };

  const handleFechaChange = (event: any, selectedDate: Date | undefined) => {
    const currentDate = selectedDate || (isEndDate ? fechaFin : fechaInicio);
    if (isEndDate) {
      setFechaFin(currentDate);
    } else {
      setFechaInicio(currentDate);
    }
    setShowDatePicker(false); // Cerrar el DatePicker después de la selección
  };

  const handleGuardarRenta = async () => {
    if (!clienteSeleccionado || !carroSeleccionado) {
      Alert.alert('Error', 'Debe seleccionar un cliente y un carro');
      return;
    }

    const renta = {
      clienteId: clienteSeleccionado,
      carroId: carroSeleccionado._id,
      precio,
      fechaInicio,
      fechaFin,
      total,
    };

    try {
      await agregarRenta(renta);
      Alert.alert('Éxito', 'Renta registrada correctamente');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Hubo un error al registrar la renta');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Registrar Renta</Text>

      <Text>Cliente:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={clienteSeleccionado}
          onValueChange={(itemValue) => setClienteSeleccionado(itemValue || "")} // Evitar undefined
          style={styles.input}>
          <Picker.Item label="Seleccione un cliente" value="" />
          {clientes.map((cliente: any) => (
            <Picker.Item key={cliente._id} label={cliente.nombre} value={cliente._id} />
          ))}
        </Picker>
      </View>

      <Text>Carro:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={carroSeleccionado ? carroSeleccionado._id : ""}
          onValueChange={(itemValue) => {
            const carroSeleccionado = carrosDisponibles.find((carro: any) => carro._id === itemValue);
            if (carroSeleccionado) {
              handleCarroSelected(carroSeleccionado);
            } else {
              setCarroSeleccionado(null); // Asegúrate de manejar el caso en que no se selecciona un carro válido
            }
          }}
          style={styles.input}>
          <Picker.Item label="Seleccione un carro" value="" /> 
          {carrosDisponibles.map((carro: any) => (
            <Picker.Item key={carro._id} label={`${carro.marca} ${carro.modelo}`} value={carro._id} />
          ))}
        </Picker>
      </View>

      {carroSeleccionado && (
        <View style={styles.detailsContainer}>
          <View style={styles.imageContainer}>
            {carroSeleccionado.imagen ? (
              <Image 
                source={{ uri: `http://192.168.1.196:3000${carroSeleccionado.imagen}` }} 
                style={styles.image}
                resizeMode="contain"
              />
            ) : (
              <Text>No Image</Text>
            )}
          </View>

          <View style={styles.details}>
            <Text style={styles.matricula}>Marca: {carroSeleccionado.marca}</Text>
            <Text style={styles.matricula}>Modelo: {carroSeleccionado.modelo}</Text>
            <Text style={styles.matricula}>Color: {carroSeleccionado.color}</Text>
          </View>
        </View>
      )}

      <Text>Fecha de inicio:</Text>
      <View style={styles.dateContainer}>
        <Text style={styles.dateText}>{fechaInicio.toLocaleDateString()}</Text>
        <TouchableOpacity onPress={() => { setShowDatePicker(true); setIsEndDate(false); }} style={styles.dateButton}>
          <Image 
            source={require('../components/calendar.png')} // Ruta al icono de calendario
            style={{ width: 30, height: 30 }}
          />
        </TouchableOpacity>
      </View>
      {showDatePicker && !isEndDate && (
        <DateTimePicker value={fechaInicio} mode="date" onChange={(e, date) => handleFechaChange(e, date)} />
      )}

      <Text>Fecha de fin:</Text>
      <View style={styles.dateContainer}>
        <Text style={styles.dateText}>{fechaFin.toLocaleDateString()}</Text>
        <TouchableOpacity onPress={() => { setShowDatePicker(true); setIsEndDate(true); }} style={styles.dateButton}>
          <Image 
            source={require('../components/calendar.png')} // Ruta al icono de calendario
            style={{ width: 30, height: 30 }}
          />
        </TouchableOpacity>
      </View>
      {showDatePicker && isEndDate && (
        <DateTimePicker value={fechaFin} mode="date" onChange={(e, date) => handleFechaChange(e, date)} />
      )}

      <PaperInput
        label="Días"
        value={dias.toString()}
        style={styles.input}
        editable={false}
      />

      <PaperInput
        label="Precio"
        value={precio}
        style={styles.input}
        editable={false}
      />

      <PaperInput
        label="Total"
        value={total}
        style={styles.input}
        editable={false}
      />

      <Text>Forma de pago:</Text>
      <View style={styles.pickerContainer}>
        <Picker selectedValue="" onValueChange={(itemValue) => console.log(itemValue)} style={styles.input}>
          <Picker.Item label="Efectivo" value="Efectivo" />
          <Picker.Item label="Tarjeta" value="Tarjeta" />
          <Picker.Item label="Transferencia" value="Transferencia" />
        </Picker>
      </View>

      <Button mode="contained" onPress={handleGuardarRenta} style={styles.button}>
        Guardar Renta
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: '#ffffff', // Fondo gris claro para todo el formulario
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#fff', // Fondo blanco para los Pickers
  },
  detailsContainer: {
    flexDirection: 'row', // La imagen y los detalles están uno al lado del otro
    marginTop: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#e9ecef', // Fondo gris claro para el contenedor de los detalles
    padding: 10,
  },
  imageContainer: {
    width: 100,
    height: 100,
    marginRight: 15, // Espacio entre la imagen y los detalles
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  details: {
    flex: 1,
  },
  matricula: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  dateText: {
    flex: 1,
    padding: 8,
    backgroundColor: '#f1f1f1',
  },
  dateButton: {
    marginLeft: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
  },
  button: {
    marginTop: 20,
    width: '100%',
  },
});

export default RentasScreen;