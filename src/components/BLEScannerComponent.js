import React, { useEffect, useState } from 'react';
import { View, Text, Button, PermissionsAndroid, Platform, Alert, ActivityIndicator } from 'react-native';
import { BleManager } from 'react-native-ble-plx';
import { Buffer } from 'buffer';

const BLEScanner = () => {
  const [bleManager] = useState(new BleManager());
  const [connectedDevice, setConnectedDevice] = useState(null);
  const [deviceName, setDeviceName] = useState(null);
  const [characteristicValue, setCharacteristicValue] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState('En recherche...');
  
  useEffect(() => {
    if (Platform.OS === 'android') {
      PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)
        .then(granted => {
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            Alert.alert('Permission refusée', 'L\'accès à la localisation est nécessaire pour scanner les périphériques BLE.');
          }
        });
    }

    // Démarrer le scan BLE
    setIsScanning(true);
    setScanMessage('Recherche du périphérique Arrosoir...');
    
    const subscription = bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error(error);
        setScanMessage('Erreur lors du scan');
        setIsScanning(false);
        return;
      }

      if (device.name === 'Arrosoir') {
        console.log('Périphérique Arrosoir trouvé');
        setDeviceName(device.name);
        setScanMessage('Périphérique trouvé ! Connexion en cours...');
        setIsScanning(false);

        // Arrêter le scan et se connecter
        bleManager.stopDeviceScan();
        bleManager.connectToDevice(device.id)
          .then((device) => {
            console.log('Connecté à ', device.name);
            setConnectedDevice(device);

            return device.discoverAllServicesAndCharacteristics();
          })
          .then((device) => {
            return device.readCharacteristicForService('12345678-1234-1234-1234-123456789abc', '87654321-4321-4321-4321-cba987654321');
          })
          .then((characteristic) => {
            const decodedValue = Buffer.from(characteristic.value, 'base64').toString('utf-8');
            console.log('Valeur lue : ', decodedValue);
            setCharacteristicValue(decodedValue);
          })
          .catch((error) => {
            console.error('Erreur lors de la connexion ou de la lecture des caractéristiques : ', error);
          });
      }
    });

    // Timeout pour arrêter la recherche si le périphérique n'est pas trouvé
    const scanTimeout = setTimeout(() => {
      if (isScanning) {
        bleManager.stopDeviceScan();
        setIsScanning(false);
        setScanMessage('Périphérique non trouvé.');
      }
    }, 10000); // 10 secondes pour arrêter la recherche

    return () => {
      bleManager.stopDeviceScan();
      subscription.remove();
      clearTimeout(scanTimeout);
    };
  }, [bleManager]);

  return (
    <View style={{ padding: 20, justifyContent: 'center', alignItems: 'center' }}>
      {isScanning ? <ActivityIndicator size="large" color="#0000ff" /> : null}
      <Text>Statut : {scanMessage}</Text>
      <Text>Nom du périphérique : {deviceName || 'En recherche...'}</Text>
      <Text>Valeur caractéristique : {characteristicValue || 'Pas de valeur lue'}</Text>
      {connectedDevice && (
        <Button
          title="Déconnecter"
          onPress={() => {
            connectedDevice.cancelConnection()
              .then(() => {
                setConnectedDevice(null);
                setDeviceName(null);
                setCharacteristicValue(null);
                setScanMessage('Déconnecté.');
                console.log('Déconnecté');
              })
              .catch((error) => console.error('Erreur lors de la déconnexion : ', error));
          }}
        />
      )}
    </View>
  );
};

export default BLEScanner;
