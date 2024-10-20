import React from 'react';
import { View, Alert } from 'react-native';
import ConnectWifiButton from '../components/connectModuleToWifiComponent'; // Chemin relatif à components
import BLEScanner from '../components/BLEScannerComponent';  // Adapte le chemin selon la structure de ton projet

const ConnectToModuleView = () => {
  const handleWifiConnect = () => {
    // Logique pour connecter ton ESP au Wi-Fi
    Alert.alert("Connexion", "Tentative de connexion au Wi-Fi en cours...");
    
    // Ici tu mets ta logique pour la connexion au Wi-Fi via ESP
  };

  return (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <BLEScanner />
    </View>
  )
};

export default ConnectToModuleView;
