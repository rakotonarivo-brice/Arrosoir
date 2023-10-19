import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import { React } from "react";
import { ColorPalette } from "../styles/colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import { doc, deleteDoc } from "firebase/firestore";
import moment from "moment";
import { db } from "../../firebase-config";
import { getAuth } from "firebase/auth";
import { deleteObject, ref } from "firebase/storage";
import { storage } from "../../firebase-config";
import { useNavigation } from "@react-navigation/native";

const { width, height } = Dimensions.get("screen");

const user = getAuth();

const CardComponent = (props) => {
  const navigation = useNavigation();
  const deleteCard = async () => {
    await deleteDoc(
      doc(db, "users/", user.currentUser.uid, "/plantInfo", props.id)
    );
    await deleteObject(
      ref(
        storage,
        user.currentUser.uid + "/plantImages/" + props.plantName + ".jpeg"
      )
    )
      .then(() => {
        console.log("supressed");
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const iconPath = () => {
    if (props.localisation === "Extérieur") {
      return require("../assets/icons/park.png");
    } else if (props.localisation === "Salle de bain") {
      return require("../assets/icons/bath.png");
    } else if (props.localisation === "Chambre") {
      return require("../assets/icons/double-bed.png");
    } else if (props.localisation === "Cuisine") {
      return require("../assets/icons/kitchen-set.png");
    } else if (props.localisation === "Toilettes") {
      return require("../assets/icons/toilet.png");
    } else if (props.localisation === "Salon") {
      return require("../assets/icons/living-room.png");
    } else return require("../assets/icons/living-room.png");
  };

  function displaynextWatering() {
    const prop = props.nextPlannedWatering;
    if (!prop || prop === "undefined") {
      return "-";
    }
    const todayDay = parseInt(moment().format("DD"));
    const todayMonth = parseInt(moment().format("MM"));
    const todayYear = parseInt(moment().format("YYYY"));
    const nextDay = parseInt(prop?.slice(8, 10));
    const nextMonth = parseInt(prop?.slice(5, 7));
    const nextYear = parseInt(prop?.slice(0, 4));

    if (todayMonth === nextMonth && todayYear === nextYear) {
      const jours = nextDay - todayDay;
      if (jours === 0) {
        return "Auj.";
      } else if (jours === 1) {
        return "demain";
      } else return jours + " jours";
    }

    if (
      todayMonth === nextMonth &&
      todayYear === nextYear &&
      todayDay === nextDay
    ) {
      return "Auj.";
    }

    if (todayMonth != nextMonth && todayYear === nextYear) {
      const month = nextMonth - todayMonth;
      if (month > 1) {
        return month + " mois";
      } else {
        today = moment();
        endOfMonth = parseInt(today.endOf("month").format("DD"));
        return endOfMonth - todayDay + nextDay + " jours";
      }
    }

    if (todayYear != nextYear) {
      const year = nextYear - todayYear;
      return year * 12 - todayMonth + nextMonth + " mois";
    }
  }

  return (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("CardDetail", {
          imageUrl: props.image,
          plantName: props.plantName,
          localisation: props.localisation,
          humidityLevel: props.humidityLevel,
          id: props.id,
          nextPlannedWatering : props.nextPlannedWatering
        })
      }
    >
      <View style={styles.card}>
        <Image
          source={props.image ? { uri: props.image } : null}
          style={styles.cardImage}
        />
        <View style={styles.settings}>
          <TouchableOpacity>
            <Ionicons
              name={"trash"}
              size={22}
              color={ColorPalette.error}
              onPress={() =>
                Alert.alert(
                  "Suppression",
                  "voulez vous vraiment supprimer " +
                    props.plantName +
                    " de votre liste?",
                  [{ text: "oui", onPress: deleteCard }, { text: "non" }]
                )
              }
            />
          </TouchableOpacity>
        </View>
        <View style={styles.image}>
          <Text style={styles.cardName}>{props.plantName}</Text>
          <View style={styles.category}>
            <View style={styles.subCategory}>
              <Image source={iconPath()} style={{ width: "45%", height: "50%" }} />
              <Text style={styles.subNames}>Localisation</Text>
            </View>
            <View style={styles.subCategory}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons name={"water-outline"} size={23} />
                <Text style={{ fontWeight: "bold", fontSize: 20 }}>
                  {props.humidityLevel}
                </Text>
              </View>
              <Text style={styles.subNames}>humidité idéale</Text>
            </View>
            <View style={styles.subCategory}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons name={"calendar-outline"} size={20} />
                <Text style={{ fontWeight: "bold", fontSize: 15, margin: 4 }}>
                  {displaynextWatering()}{" "}
                </Text>
              </View>
              <Text style={styles.subNames}>Prochain arrosage</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default CardComponent;

const styles = StyleSheet.create({
  card: {
    width: width-40,
    height: height / 2.4,
    borderRadius: 25,
    margin:20,
    backgroundColor: "#fff",
    flexWrap: "wrap",
  },

  image: {
    flex: 1,
  },
  cardName: {
    fontSize: width/15,
    fontWeight: "bold",
    position: "absolute",
    bottom: "75%",
    left: 20,
  },
  settings: {
    flexDirection: "row",
    justifyContent: "flex-end",
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1,
  },
  subNames: {
    color: ColorPalette.textGrey,
    paddingTop: 10,
  },

  category: {
    flexDirection: "row",
    alignItems: "center",
    justifySelf: "center",
    textAlign: "center",
    position: "absolute",
    bottom: -5,
  },
  subCategory: {
    flexDirection: "column",
    justifyContent: "flex-end",
    alignItems: "center",
    height: 70,
    marginRight: 15,
    marginLeft: 15,
    marginBottom: 25,
    width: 80,
  },

  cardImage: {
    width: "100%",
    height: height/4.5,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
});
