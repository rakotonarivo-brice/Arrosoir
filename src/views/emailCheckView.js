import { StyleSheet, Text, View, Image, Dimensions } from "react-native";
import React from "react";
import { ColorPalette } from "../styles/colors";
import { CommercialTitleSize } from "../styles/fonts";

const { width, height } = Dimensions.get("screen");

const EmailCheckView = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Image
        source={require("../images/mailCheck.png")}
        style={{ width: width, height: height / 3 }}
      />
      <Text style={CommercialTitleSize}>Vérifiez votre boite mail</Text>
      <View style={styles.paragraphe}>
        <Text style={styles.text}>
          Un email de vérification a été envoyé a l'adresse mail utilisée pour
          créer un compte. Cliquez sur le lien contenu dans l'email pour
          vérifier votre compte puis. Vérifiez les spams si vous n'avez rien
          reçu dans votre boîte principal ! {""}
          <Text
            style={{ color: ColorPalette.thinGreen }}
            onPress={() => navigation.navigate("Log")}
          >
            cliquez ici
          </Text>
          <Text> pour vous connecter.</Text>
        </Text>
      </View>
    </View>
  );
};

export default EmailCheckView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ColorPalette.boldGreen,
    alignItems: "center",
    paddingTop: 50,
  },
  text: {
    margin: 20,
    fontSize: 24,
    textAlign: "center",
    lineHeight: 40,
  },
});
