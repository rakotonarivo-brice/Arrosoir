import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Image,
  Dimensions,
} from "react-native";
import React, { useState } from "react";
import { ColorPalette } from "../styles/colors";
import {
  TextInputStyle,
  SubmitButton,
  InputField,
  InputContainer,
  TextInSubmit,
} from "../styles/button";
import { CommercialTitleSize } from "../styles/fonts";
import Ionicons from "@expo/vector-icons/Ionicons";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase-config";

//const auth = getAuth();
const { width, height } = Dimensions.get("screen");

export default function LogView({ navigation }) {
  const [PasswordVisible, setPasswordVisible] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleTyping = () => {
    console.log("typingtriggered");
    setIsTyping((current) => !current);
  };

  const handleSignIn = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;

        if (user.emailVerified === true) {
          onAuthStateChanged(auth, (user) => {
            console.log(user);
            navigation.navigate("Tabs");
          });
        } else
          alert(
            "Veuillez activer votre compte dans votre boite mail. Vérifiez vos spams."
          );
      })
      .catch((error) => {
        if (error.code === "auth/wrong-password") {
          alert("Mot de passe éronné.");
        }
        if (error.code === "auth/invalid-email") {
          alert("Email non reconnu.");
        }
      });
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/login.png")}
        style={{ width: width, height: isTyping ? 0 : height / 3 }}
      />
      <View>
        <Text style={CommercialTitleSize}>Connectez-vous !</Text>
        <Text
          style={{
            margin: 20,
            fontSize: 24,
            textAlign: "center",
          }}
        >
          Veuillez saisir votre email et votre mots de passe pour vous connecter
        </Text>
      </View>
      <View>
        <TextInput
          style={TextInputStyle}
          placeholder="Email"
          autoCapitalize="none"
          onFocus={handleTyping}
          onBlur={handleTyping}
          value={email}
          onChangeText={(text) => setEmail(text)}
        />
        <View style={InputContainer}>
          <TextInput
            style={InputField}
            fontSize="20"
            placeholder="Password"
            autoCapitalize="none"
            secureTextEntry={PasswordVisible}
            value={password}
            onChangeText={(text) => setPassword(text)}
            onFocus={handleTyping}
            onBlur={handleTyping}
          />
          <TouchableOpacity
            onPress={() => setPasswordVisible(!PasswordVisible)}
          >
            <Ionicons
              name={PasswordVisible ? "eye" : "eye-off"}
              size={20}
              color="black"
            />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity>
        <Text style={styles.forgot}>Mot de passe oublié?</Text>
      </TouchableOpacity>
      <TouchableOpacity style={SubmitButton} onPress={handleSignIn}>
        <Text style={TextInSubmit}>Se connecter</Text>
      </TouchableOpacity>
      <View style={styles.createAccount}>
        <Text>Pas encore de compte?</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Reg")}>
          <Text
            style={{
              color: ColorPalette.thinGreen,
            }}
          >
            Créer un compte
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ColorPalette.boldGreen,
    alignItems: "center",
    paddingTop: 50,
  },

  forgot: {
    marginLeft: 170,
    padding: 3,
  },

  connect: {
    backgroundColor: ColorPalette.darkGreen,
    height: 60,
    width: 300,
    marginLeft: 10,
    marginTop: 17,
    padding: 10,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  createAccount: {
    paddingTop: 10,
    alignItems: "center",
  },
});
