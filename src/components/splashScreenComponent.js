import React from 'react';
import LottieView from 'lottie-react-native';
import { StyleSheet } from 'react-native';
import SplashAnimation from '../assets/animations/splash-icon.json';

function SplashScreenAnimation() {

    return (
        <LottieView
        style={styles.container}
            source={SplashAnimation}
            autoPlay
            loop={false}
        />      
    );
}

const styles = StyleSheet.create({
    container: {
        height: 200,
        width:200
    }
})

export default SplashScreenAnimation;
