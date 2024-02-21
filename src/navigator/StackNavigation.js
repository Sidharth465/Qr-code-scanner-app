import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import QRCodeScannerScreen from '../screens/QRCodeScannerScreen '

const StackNavigation = () => {
    const Stack = createNativeStackNavigator();
  return (
  <NavigationContainer>
    <Stack.Navigator initialRouteName="barcodeScanner">
       
        <Stack.Screen name='barcodeScanner'component={QRCodeScannerScreen} options={{title:"QR-code Scanner",headerTitleAlign:"center"}} />
    </Stack.Navigator>
  </NavigationContainer>
  )
}

export default StackNavigation

const styles = StyleSheet.create({})