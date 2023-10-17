import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  Dimensions,
  Image,
} from "react-native";
import { ColorPalette } from "../styles/colors";
import { CommercialTitleSize } from "../styles/fonts";
import {
  TextInputStyle,
  SubmitButton,
  InputField,
  InputContainer,
  TextInSubmit,
} from "../styles/button";
import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useState } from "react";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
} from "firebase/auth";
import { auth } from "../../firebase-config";
import { setDoc, doc } from "firebase/firestore";
import { db } from "../../firebase-config";

const { width, height } = Dimensions.get("screen");

const RegisterView = ({ navigation }) => {
  const [PasswordVisible, setPasswordVisible] = useState(true);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [checkPasswordVisible, setCheckPasswordVisible] = useState(true);
  const [checkEmail, setCheckEmail] = useState(false);
  const [password, setPassword] = useState("");
  const [checkPassword, setCheckPassword] = useState("");
  const [isDifferent, setIsDifferent] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [createUserButton, setCreateUserButton] = useState(true);

  const handleTyping = () => {
    setIsTyping((current) => !current);
  };

  const handleCheckMail = (text) => {
    const regex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    setEmail(text);
    regex.test(text) ? setCheckEmail(false) : setCheckEmail(true);
  };

  const handleSignUp = () => {
    if (username.length == 0) {
      alert("Entrez un nom d'utilisateur");
    } else
      createUserWithEmailAndPassword(auth, email, password)
        .then(async (userCredentials) => {
          const user = userCredentials.user;
          await updateProfile(auth.currentUser, { displayName: username });
          await sendEmailVerification(user);
          navigation.navigate("Email");
          try {
            await setDoc(doc(db, "users", user.uid), {
              username: username,
              email: email,
            });
          } catch (e) {
            console.error("Error adding document: ", e);
          }
        })
        .catch((error) => {
          if (error.code === "auth/missing-email") {
            alert("veuillez inscrire un email.");
          }
          if (error.code === "auth/email-already-in-use") {
            alert(
              "Cette adresse email est déjà utilisé pour un compte. Veuillez vous inscrire avec un email non associé."
            );
          }
        });
  };

  function checkPasswordFunc(text) {
    setCheckPassword(text);
    if (password === text) {
      setIsDifferent(false);
      setCreateUserButton(false);
    } else {
      setIsDifferent(true);
    }
  }

  return (
    <View style={styles.container}>
      <Image
        source={require("../images/register.png")}
        style={{ width: width, height: isTyping ? 0 : height / 4.5 }}
      />
      <Text style={CommercialTitleSize}>Créez votre compte</Text>
      <Text
        style={{
          margin: 20,
          fontSize: 24,
          textAlign: "center",
          display: isTyping ? "none" : "block",
        }}
      >
        Créez un compte pour gérer n'importe où vos préférences
      </Text>
      <TextInput
        style={TextInputStyle}
        placeholder="Email"
        value={email}
        onChangeText={(text) => handleCheckMail(text)}
        autoCapitalize="none"
        onFocus={handleTyping}
        onBlur={handleTyping}
      />
      <Text
        style={{
          color: ColorPalette.vividError,
          display: checkEmail && email ? "block" : "none",
        }}
      >
        Votre format d'email est incorrect
      </Text>
      <TextInput
        style={TextInputStyle}
        placeholder="Nom d'utilistateur"
        autoCapitalize="none"
        onFocus={handleTyping}
        onBlur={handleTyping}
        value={username}
        onChangeText={(text) => setUsername(text)}
      />
      <View style={InputContainer}>
        <TextInput
          style={InputField}
          fontSize="20"
          placeholder="Mot de passe"
          autoCapitalize="none"
          value={password}
          secureTextEntry={PasswordVisible}
          clearTextOnFocus={false}
          onChangeText={(text) => setPassword(text)}
          textContentType={"oneTimeCode"}
          onFocus={handleTyping}
          onBlur={handleTyping}
        />
        <Pressable onPress={() => setPasswordVisible(!PasswordVisible)}>
          <Ionicons
            name={PasswordVisible ? "eye" : "eye-off"}
            size={20}
            color="black"
          />
        </Pressable>
      </View>
      <View style={InputContainer}>
        <TextInput
          style={InputField}
          fontSize="20"
          placeholder="Verifiez votre mot de passe"
          autoCapitalize="none"
          secureTextEntry={checkPasswordVisible}
          value={checkPassword}
          clearTextOnFocus={false}
          onChangeText={(text) => checkPasswordFunc(text)}
          textContentType={"oneTimeCode"}
          onFocus={handleTyping}
          onBlur={handleTyping}
        />
        <Pressable
          onPress={() => setCheckPasswordVisible(!checkPasswordVisible)}
        >
          <Ionicons
            name={checkPasswordVisible ? "eye" : "eye-off"}
            size={20}
            color="black"
          />
        </Pressable>
      </View>
      <Text
        style={{
          color: ColorPalette.vividError,
          display: isDifferent && password && checkPassword ? "block" : "none",
        }}
      >
        Vos mot de passe ne correspondent pas{" "}
      </Text>

      <Pressable
        style={SubmitButton}
        onPress={handleSignUp}
        disabled={createUserButton}
      >
        <Text style={TextInSubmit}> Créer </Text>
      </Pressable>
    </View>
  );
};

export default RegisterView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ColorPalette.boldGreen,
    alignItems: "center",
    paddingTop: 50,
  },
});
