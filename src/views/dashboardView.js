import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Animated,
  Keyboard,
} from "react-native";
import React, { useRef, useState } from "react";
import { getAuth } from "firebase/auth";
import { ColorPalette } from "../styles/colors";
import { CommercialTitleSize } from "../styles/fonts";
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

const auth = getAuth();

const DashboardView = () => {
  const bottomSheetModalRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);
  const [items, setItems] = useState([]);
  const snapPoint = isTyping ? ["70%"] : ["70%"];
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

  return (
    <BottomSheetModalProvider>
      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: ColorPalette.background,
          },
        ]}
      > 
      <Text style = {[CommercialTitleSize]}>Mes plantes</Text>
        <ScrollView /*horizontal={true} pagingEnabled={true}*/>
          <View style={styles.cardContainer}>
            {items.map((item) => {
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
          <Ionicons name={"add-outline"} size={40} color="#fff" style={{marginLeft:2}} />
        </TouchableOpacity>
        <BottomSheetModal
          ref={bottomSheetModalRef}
          index={0}
          snapPoints={snapPoint}
          onDismiss={() => setIsTyping(false)}
        >
          <MenuComponent style={styles.menu} setIsTyping={setIsTyping} />
        </BottomSheetModal>
      </Animated.View>
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
});
