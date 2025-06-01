import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Image } from 'react-native';
import CarrosScreen from './src/screens/CarrosScreen';
import ClientesScreen from './src/screens/ClientesScreen';
import RentasScreen from './src/screens/RentasScreen';
import DetalleCarroScreen from './src/screens/DetallecarroScreen'; 

const Tab = createMaterialTopTabNavigator();
const Stack = createStackNavigator();

// Define the Carros Stack Navigator
function CarrosStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="CarrosScreen" component={CarrosScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DetalleCarro" component={DetalleCarroScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: 'tomato',
          tabBarInactiveTintColor: 'gray',
          tabBarIndicatorStyle: {
            backgroundColor: 'tomato',
          },
        }}
        tabBarPosition="bottom"
      >
        {/* Agrega iconos personalizados a las pestañas */}
        <Tab.Screen 
          name="Carros" 
          component={CarrosStack} 
          options={{
            tabBarIcon: ({ color }) => (
              <Image 
                source={require('./src/components/car.png')} 
                style={{ tintColor: color, width: 24, height: 24 }} 
              />
            )
          }}
        />
        <Tab.Screen 
          name="Clientes" 
          component={ClientesScreen} 
          options={{
            tabBarIcon: ({ color }) => (
              <Image 
                source={require('./src/components/user.png')} 
                style={{ tintColor: color, width: 24, height: 24 }} 
              />
            )
          }}
        />
        <Tab.Screen 
          name="Rentas" 
          component={RentasScreen} 
          options={{
            tabBarIcon: ({ color }) => (
              <Image 
                source={require('./src/components/rent.png')} 
                style={{ tintColor: color, width: 24, height: 24 }} 
              />
            )
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}