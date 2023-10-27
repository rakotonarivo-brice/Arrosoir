import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { ColorPalette } from "../styles/colors";
import SplashScreenAnimation from "../components/splashScreenComponent";


function SplashScreenView({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => {
        navigation.replace('Home');
      });
    }, 3000);
  }, [fadeAnim, navigation]);

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity: fadeAnim }}>
        <SplashScreenAnimation />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: ColorPalette.boldGreen,
  },
});

export default SplashScreenView;
