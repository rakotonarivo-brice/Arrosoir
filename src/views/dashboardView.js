import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Animated,
  Keyboard,
  Dimensions,
  Image,
  StatusBar,
  TextInput,
} from "react-native";
import React, { useRef, useState } from "react";
import { getAuth } from "firebase/auth";
import { ColorPalette } from "../styles/colors";
import { fontCardTitle } from "../styles/fonts";
import CardComponent from "../components/cardComponent";
import MenuComponent from "../components/menuComponent";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import Ionicons from "@expo/vector-icons/Ionicons";
import { db } from "../../firebase-config";
import { collection, onSnapshot } from "firebase/firestore";
import { useEffect } from "react";
import { MotiView } from "moti";

const auth = getAuth();
const { width, height } = Dimensions.get("screen");

const DashboardView = () => {
  const bottomSheetModalRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);
  const [items, setItems] = useState([]);
  const [currentLocalisation, setCurrentLocalisation] = useState("");

  const snapPoint = height<800?["79%"]:["70%"];
  const handlePresentModal = () => {
    bottomSheetModalRef.current?.present();
  };

  useEffect(() => {
    const itemsRef = collection(
      db,
      "users/",
      auth.currentUser?.uid,
      "/plantInfo"
    );
    const subscriber = onSnapshot(itemsRef, {
      next: (snapshot) => {
        console.log("updated");
        const items = [];
        snapshot.docs.forEach((doc) => {
          items.push({
            id: doc.id,
            ...doc.data(),
          });
        });
        setItems(items);
        bottomSheetModalRef.current?.dismiss();
        Keyboard.dismiss();
      },
    });

    return () => subscriber();
  }, []);

  const filteredItems = items.filter(
    (item) => item.plantInfo.localisation === currentLocalisation
  );

  return (
    <BottomSheetModalProvider>
      <StatusBar barStyle="dark-content" />

      <View
        style={[
          styles.container,
          {
            backgroundColor: ColorPalette.background,
          },
        ]}
      >
        <MotiView
          from={{backgroundColor: ColorPalette.greenify}}
          animate={{ backgroundColor: ColorPalette.error }}
          transition={{ type: "timing", duration:"1000", loop:true }}
          style={styles.TopDashboardContainer}
        >
          <TouchableOpacity style={styles.dashboardCard}>
            <Text
              style={[fontCardTitle, { paddingTop: 0, textAlign: "center" }]}
            >
              Arrosage restant cette semaine :
            </Text>
            <Text style={{ textAlign: "center", margin: 20, fontSize: 30 }}>
              6
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dashboardCard}>
            <Text
              style={[fontCardTitle, { paddingTop: 0, textAlign: "center" }]}
            >
              {" "}
              Nombre d'arrosage planifié cette semaine :
            </Text>
          </TouchableOpacity>
        </MotiView>

        <ScrollView /*horizontal={true} pagingEnabled={true}*/>
          <View style={styles.cardContainer}>
            {currentLocalisation
              ? filteredItems.map((item) => {
                  return (
                    <CardComponent
                      key={item.id}
                      id={item.id}
                      plantName={item.plantInfo.plantName}
                      localisation={item.plantInfo.localisation}
                      humidityLevel={item.plantInfo.humidityLevel}
                      image={item.imageUrl}
                      nextPlannedWatering={item.nextPlannedDate}
                    />
                  );
                })
              : items.map((item) => {
                  return (
                    <CardComponent
                      key={item.id}
                      id={item.id}
                      plantName={item.plantInfo.plantName}
                      localisation={item.plantInfo.localisation}
                      humidityLevel={item.plantInfo.humidityLevel}
                      image={item.imageUrl}
                      nextPlannedWatering={item.nextPlannedDate}
                    />
                  );
                })}
          </View>
        </ScrollView>

        <TouchableOpacity
          style={[
            styles.circle,
            {
              backgroundColor: ColorPalette.greenify,
            },
          ]}
          onPress={handlePresentModal}
        >
          <Ionicons
            name={"add-outline"}
            size={40}
            color="#fff"
            style={{ marginLeft: 2 }}
          />
        </TouchableOpacity>

        <BottomSheetModal
          ref={bottomSheetModalRef}
          index={0}
          snapPoints={snapPoint}
          onDismiss={() => setIsTyping(false)}
        >
          <MenuComponent style={styles.menu} setIsTyping={setIsTyping} />
        </BottomSheetModal>
      </View>

      <View style={styles.localisationFilter}>
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setCurrentLocalisation("")}
          >
            <Ionicons
              name={"infinite-outline"}
              size={25}
              color={
                currentLocalisation === ""
                  ? ColorPalette.greenify
                  : ColorPalette.textGrey
              }
              style={styles.cardImage}
            />
            <Text
              style={[
                styles.textLocalisation,
                {
                  color:
                    currentLocalisation === ""
                      ? ColorPalette.greenify
                      : ColorPalette.textGrey,
                },
              ]}
            >
              Tout
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setCurrentLocalisation("Extérieur")}
          >
            <Image
              source={require("../icons/park.png")}
              style={[
                styles.cardImage,
                {
                  tintColor:
                    currentLocalisation === "Extérieur"
                      ? ColorPalette.greenify
                      : ColorPalette.textGrey,
                },
              ]}
            />
            <Text
              style={[
                styles.textLocalisation,
                {
                  color:
                    currentLocalisation === "Extérieur"
                      ? ColorPalette.greenify
                      : ColorPalette.textGrey,
                },
              ]}
            >
              Exterieur
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setCurrentLocalisation("Salle de bain")}
          >
            <Image
              source={require("../icons/bath.png")}
              style={[
                styles.cardImage,
                {
                  tintColor:
                    currentLocalisation === "Salle de bain"
                      ? ColorPalette.greenify
                      : ColorPalette.textGrey,
                },
              ]}
            />
            <Text
              style={[
                styles.textLocalisation,
                {
                  color:
                    currentLocalisation === "Salle de bain"
                      ? ColorPalette.greenify
                      : ColorPalette.textGrey,
                },
              ]}
            >
              Salle de bain
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setCurrentLocalisation("Chambre")}
          >
            <Image
              source={require("../icons/double-bed.png")}
              style={[
                styles.cardImage,
                {
                  tintColor:
                    currentLocalisation === "Chambre"
                      ? ColorPalette.greenify
                      : ColorPalette.textGrey,
                },
              ]}
            />
            <Text
              style={[
                styles.textLocalisation,
                {
                  color:
                    currentLocalisation === "Chambre"
                      ? ColorPalette.greenify
                      : ColorPalette.textGrey,
                },
              ]}
            >
              Chambre
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setCurrentLocalisation("Cuisine")}
          >
            <Image
              source={require("../icons/kitchen-set.png")}
              style={[
                styles.cardImage,
                {
                  tintColor:
                    currentLocalisation === "Cuisine"
                      ? ColorPalette.greenify
                      : ColorPalette.textGrey,
                },
              ]}
            />
            <Text
              style={[
                styles.textLocalisation,
                {
                  color:
                    currentLocalisation === "Cuisine"
                      ? ColorPalette.greenify
                      : ColorPalette.textGrey,
                },
              ]}
            >
              Cuisine
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setCurrentLocalisation("Toilettes")}
          >
            <Image
              source={require("../icons/toilet.png")}
              style={[
                styles.cardImage,
                {
                  tintColor:
                    currentLocalisation === "Toilettes"
                      ? ColorPalette.greenify
                      : ColorPalette.textGrey,
                },
              ]}
            />
            <Text
              style={[
                styles.textLocalisation,
                {
                  color:
                    currentLocalisation === "Toilettes"
                      ? ColorPalette.greenify
                      : ColorPalette.textGrey,
                },
              ]}
            >
              Toilettes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setCurrentLocalisation("Salon")}
          >
            <Image
              source={require("../icons/living-room.png")}
              style={[
                styles.cardImage,
                {
                  tintColor:
                    currentLocalisation === "Salon"
                      ? ColorPalette.greenify
                      : ColorPalette.textGrey,
                },
              ]}
            />
            <Text
              style={[
                styles.textLocalisation,
                {
                  color:
                    currentLocalisation === "Salon"
                      ? ColorPalette.greenify
                      : ColorPalette.textGrey,
                },
              ]}
            >
              Salon
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </BottomSheetModalProvider>
  );
};

export default DashboardView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 50,
  },
  cardContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    paddingTop: 60,
  },
  circle: {
    width: 58,
    height: 58,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 30,
    right: 18,
    zIndex: 1,
  },
  menu: {
    position: "absolute",
    bottom: 0,
    right: 30,
  },

  dashboardCard: {
    backgroundColor: "#fff",
    marginTop: 80,
    width: width / 2.5,
    height: height / 7,
    padding: 10,
    borderRadius: 15,
    margin: 10,
  },

  TopDashboardContainer: {
    flexDirection: "row",
    display: "none",
  },

  cardImage: {
    width: 25,
    height: 25,
    tintColor: ColorPalette.textGrey,
  },

  localisationFilter: {
    height: 115,
    flexDirection: "row",
    position: "absolute",
    top: 0,
    width: "100%",
    paddingTop: 40,
    backgroundColor: "#fff",
  },

  filterButton: {
    alignItems: "center",
    margin: 17,
  },

  textLocalisation: {
    paddingTop: 7,
    color: ColorPalette.textGrey,
  },

  localisationAndSearch: {
    flexDirection: "column",
  },
});
