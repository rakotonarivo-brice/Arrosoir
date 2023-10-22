import {
  StyleSheet,
  TextInput,
  View,
  Dimensions,
  TouchableOpacity,
  Text,
  Image,
} from "react-native";
import React, { useState, useEffect } from "react";
import { ColorPalette } from "../styles/colors";
import { menuCardTitle } from "../styles/fonts";
import { SubmitButton, TextInSubmit } from "../styles/button";
import * as ImagePicker from "expo-image-picker";
import { addDoc, collection, updateDoc } from "firebase/firestore";
import { db } from "../../firebase-config";
import { getAuth } from "firebase/auth";
import { storage } from "../../firebase-config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Ionicons from "@expo/vector-icons/Ionicons";
import Slider from "@react-native-community/slider";

const { width, height } = Dimensions.get("screen");

const MenuComponent = (props) => {
  const [name, setName] = useState("");
  const [localisation, setLocalisation] = useState("");
  const [galleryPermission, setGalleryPermission] = useState(null);
  const [image, setImage] = useState(null);
  const [range, setRange] = useState("50%");

  useEffect(() => {
    (async () => {
      const galleryStatus =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      setGalleryPermission(galleryStatus.status === "granted");
    })();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }

    if (galleryPermission === false) {
      return <Text>no access to camera</Text>;
    }

    console.log("image doc :", image);
  };

  const user = getAuth();

  const addItem = async () => {
    try {
      const validImage = await fetch(image);
      const bytes = await validImage.blob();
      const imageRef = ref(
        storage,
        user.currentUser.uid + "/plantImages/" + name + ".jpeg"
      );
      const docRef = await addDoc(
        collection(db, "users/", user.currentUser.uid, "/plantInfo"),
        {
          plantInfo: {
            plantName: name,
            localisation: localisation,
            humidityLevel: range,
          },
        }
      );

      //I don't know why if I upload and get the ImageUrl befor addDoc the app crashes whithout any error
      const uploaded = await uploadBytes(imageRef, bytes);
      const imageUrl = await getDownloadURL(imageRef);
      ////////////////////////////////////////////////////////////////
      // so I upload and get the ImageUrl after addDoc and then I update de Doc like so :
      await updateDoc(docRef, {
        imageUrl: imageUrl,
      });
      ////////////////////////////////////////////////////////////////
      console.log("image url :", imageUrl);
      console.log("Document written with ID: ", docRef.id);
      console.log("uploaded :", uploaded);
      console.log(user);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
    setName("");
    setLocalisation("");
  };

  const handleTyping = () => {
    props.setIsTyping((current) => !current);
  };

  return (
    <View style={styles.container}>
      <Text style={menuCardTitle}>Ajouter une plante</Text>
      <View style={styles.imgAndInput}>
        <TouchableOpacity onPress={() => pickImage()}>
          {image ? (
            <Image source={{ uri: image }} style={styles.img} />
          ) : (
            <View style={styles.blankImg}>
              <Ionicons
                name={"image-outline"}
                size={35}
                color={ColorPalette.textGrey}
              />
            </View>
          )}
        </TouchableOpacity>
        <View style={styles.inputAndSlider}>
          <TextInput
            placeholder="Nom de votre plante"
            autoCapitalize="none"
            style={styles.input}
            onFocus={handleTyping}
            onBlur={handleTyping}
            value={name}
            onChangeText={(text) => setName(text)}
          />
          <Text
            style={{
              fontSize: 15,
              fontWeight: "bold",
            }}
          >
            {" "}
            Humidité idéale: {range}
          </Text>
          <Slider
            style={{ width: 150, height: 20 }}
            minimumValue={0}
            maximumValue={1}
            minimumTrackTintColor={ColorPalette.greenify}
            maximumTrackTintColor={ColorPalette.textGrey}
            thumbTintColor={ColorPalette.greenify}
            value={0.5}
            onValueChange={(value) => setRange(parseInt(value * 100) + "%")}
          />
        </View>
      </View>
      <Text
        style={{
          fontSize: 17,
          fontWeight: "bold",
          paddingTop: 10,
          textAlign: "center",
        }}
      >
        {" "}
        Localisation{" "}
      </Text>
      <View style={styles.localisation}>
        <TouchableOpacity
          style={[
            styles.localisationBtn,
            {
              backgroundColor:
                localisation === "Extérieur" ? ColorPalette.greenify : "#fff",
            },
          ]}
          onPress={() => {
            setLocalisation("Extérieur");
          }}
        >
          <Image
            source={require("../icons/park.png")}
            style={{
              width: height < 800 ? 30 : 45,
              height: height < 800 ? 30 : 45,
              tintColor: localisation === "Extérieur" ? "#fff" : "#000000",
            }}
          />
          <Text
            style={{ color: localisation === "Extérieur" ? "#fff" : "#000000" }}
          >
            Extérieur
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.localisationBtn,
            {
              backgroundColor:
                localisation === "Salle d'eau"
                  ? ColorPalette.greenify
                  : "#fff",
            },
          ]}
          onPress={() => {
            setLocalisation("Salle d'eau");
          }}
        >
          <Image
            source={require("../icons/bath.png")}
            style={{
              width: height < 800 ? 30 : 45,
              height: height < 800 ? 30 : 45,
              tintColor: localisation === "Salle d'eau" ? "#fff" : "#000000",
            }}
          />
          <Text
            style={{
              color: localisation === "Salle d'eau" ? "#fff" : "#000000",
            }}
          >
            Salle d'eau
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.localisationBtn,
            {
              backgroundColor:
                localisation === "Chambre" ? ColorPalette.greenify : "#fff",
            },
          ]}
          onPress={() => setLocalisation("Chambre")}
        >
          <Image
            source={require("../icons/double-bed.png")}
            style={{
              width: height < 800 ? 30 : 45,
              height: height < 800 ? 30 : 45,
              tintColor: localisation === "Chambre" ? "#fff" : "#000000",
            }}
          />
          <Text
            style={{ color: localisation === "Chambre" ? "#fff" : "#000000" }}
          >
            Chambre
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.localisationBtn,
            {
              backgroundColor:
                localisation === "Cuisine" ? ColorPalette.greenify : "#fff",
            },
          ]}
          onPress={() => setLocalisation("Cuisine")}
        >
          <Image
            source={require("../icons/kitchen-set.png")}
            style={{
              width: height < 800 ? 30 : 45,
              height: height < 800 ? 30 : 45,
              tintColor: localisation === "Cuisine" ? "#fff" : "#000000",
            }}
          />
          <Text
            style={{ color: localisation === "Cuisine" ? "#fff" : "#000000" }}
          >
            Cuisine
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.localisationBtn,
            {
              backgroundColor:
                localisation === "Toilettes" ? ColorPalette.greenify : "#fff",
            },
          ]}
          onPress={() => setLocalisation("Toilettes")}
        >
          <Image
            source={require("../icons/toilet.png")}
            style={{
              width: height < 800 ? 30 : 45,
              height: height < 800 ? 30 : 45,
              tintColor: localisation === "Toilettes" ? "#fff" : "#000000",
            }}
          />
          <Text
            style={{ color: localisation === "Toilettes" ? "#fff" : "#000000" }}
          >
            Toilettes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.localisationBtn,
            {
              backgroundColor:
                localisation === "Salon" ? ColorPalette.greenify : "#fff",
            },
          ]}
          onPress={() => setLocalisation("Salon")}
        >
          <Image
            source={require("../icons/living-room.png")}
            style={{
              width: height < 800 ? 30 : 45,
              height: height < 800 ? 30 : 45,
              tintColor: localisation === "Salon" ? "#fff" : "#000000",
            }}
          />
          <Text
            style={{ color: localisation === "Salon" ? "#fff" : "#000000" }}
          >
            Salon
          </Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={SubmitButton} onPress={() => addItem()}>
        <Text style={TextInSubmit}>Ajouter</Text>
      </TouchableOpacity>
    </View>
  );
};

export default MenuComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 20,
    alignItems: "center",
  },

  input: {
    backgroundColor: ColorPalette.lightGrey,
    borderRadius: 15,
    height: 35,
    paddingLeft: 10,
    width: 150,
  },

  localisation: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    width:"100%",
    justifyContent: "center",
    padding:5,
  },

  localisationBtn: {
    borderWidth: 2,
    width: height < 800 ? 75 : 80,
    height: height < 800 ? 75 : 80,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    margin:10
  },

  imgAndInput: {
    flexDirection: "row",
    justifyContent: "space-around",
  },

  img: {
    width: 155,
    height: 100,
    borderRadius: 10,
  },

  blankImg: {
    width: 155,
    height: 100,
    backgroundColor: ColorPalette.lightGrey,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  inputAndSlider: {
    flexDirection: "column",
    justifyContent: "space-between",
    marginLeft: 20,
  },
});
