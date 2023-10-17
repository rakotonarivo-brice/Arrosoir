import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import { ColorPalette } from "../styles/colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState, useRef, useEffect } from "react";
import moment from "moment";
import React from "react";
import WeeklyCalendarComponent from "../components/weeklyCalendarComponent";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { SubmitButton, TextInSubmit } from "../styles/button";
import { db } from "../../firebase-config";
import { getAuth } from "firebase/auth";
import { doc, updateDoc, getDoc } from "firebase/firestore";

LocaleConfig.locales["fr"] = {
  monthNames: [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ],
  monthNames: [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ],
  monthNamesShort: [
    "Janv.",
    "Févr.",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juil.",
    "Août",
    "Sept.",
    "Oct.",
    "Nov.",
    "Déc.",
  ],
  dayNames: [
    "Dimanche",
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
  ],
  dayNamesShort: ["Dim.", "Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam."],
  today: "Aujourd'hui",
};

LocaleConfig.defaultLocale = "fr";

const CardDetailView = ({ route }) => {
  const {
    imageUrl,
    plantName,
    humidityLevel,
    localisation,
    id,
    nextPlannedWatering,
  } = route.params;
  const user = getAuth();
  const docRef = doc(db, "users/", user.currentUser.uid, "/plantInfo", id);
  const [selected, setSelected] = useState([]);
  const [wateredDays, setWateredDays] = useState([]);
  const [onSelectedDay, setOnSelectedDay] = useState([]);

  const iconPath = () => {
    if (localisation === "Extérieur") {
      return require("../icons/park.png");
    } else if (localisation === "Salle de bain") {
      return require("../icons/bath.png");
    } else if (localisation === "Chambre") {
      return require("../icons/double-bed.png");
    } else if (localisation === "Cuisine") {
      return require("../icons/kitchen-set.png");
    } else if (localisation === "Toilettes") {
      return require("../icons/toilet.png");
    } else if (localisation === "Salon") {
      return require("../icons/living-room.png");
    } else return require("../icons/living-room.png");
  };

  const today = moment();

  const bottomSheetModalRef = useRef(null);

  const handlePresentModal = () => {
    bottomSheetModalRef.current?.present();
  };

  const handleDatesStates = async () => {
    if (selected.includes(onSelectedDay)) {
      if (wateredDays.includes(onSelectedDay)) {
        setWateredDays((current) =>
          current.filter((currentDay) => currentDay !== onSelectedDay)
        );
      } else {
        if (wateredDays) {
          setWateredDays((wateredDay) => [...wateredDay, onSelectedDay]);
        } else setWateredDays(onSelectedDay);
      }
    } else {
      if (selected) {
        setSelected((selected) => [...selected, onSelectedDay]);
      } else setSelected(onSelectedDay);
    }
  };

  const deleteFromAllState = (date) => {
    setWateredDays((current) =>
      current?.filter((currentDay) => currentDay !== date)
    );
    setSelected((current) =>
      current?.filter((currentDay) => currentDay !== date)
    );
    setOnSelectedDay([]);
  };

  const snapPoint = ["90%"];

  const weekStart = today.startOf("isoweek").format("YYYY-MM-DD");
  const endOfWeek = today.endOf("isoweek").format("YYYY-MM-DD");

  const getDaysFromFirestore = async () => {
    const daysStatus = await getDoc(docRef);
    const daysStatusJson = daysStatus.data();
    console.log(daysStatusJson);
    if (daysStatusJson.selectedDays) {
      setSelected(daysStatusJson.selectedDays);
    } else setSelected([""]);
    if (daysStatusJson.wateredDays) {
      setWateredDays(daysStatusJson.wateredDays);
    } else setWateredDays([""]);
  };

  useEffect(() => {
    getDaysFromFirestore();
  }, []);

  const isMountedSelected = useRef(false);
  const isMountedWatered = useRef(false);

  function nextDate() {
    const notWateredSelected = selected?.filter(
      (currentDay) => !wateredDays?.includes(currentDay)
    );
    const today = moment().format("YYYY-MM-DD");
    const sortedNotWateredSelected = notWateredSelected?.sort();
    let i = 0;
    if (sortedNotWateredSelected) {
      while (
        today > sortedNotWateredSelected[i] &&
        i < sortedNotWateredSelected?.length
      ) {
        i++;
      }
      if (i < sortedNotWateredSelected?.length) {
        return sortedNotWateredSelected[i];
      } else return "undefined";
    }
  }

  useEffect(() => {
    if (isMountedSelected.current) {
      const nextPlannedDate = nextDate();
      if (selected && nextPlannedDate) {
        updateDoc(docRef, {
          selectedDays: selected,
          nextPlannedDate: nextPlannedDate,
        });
      }
    } else isMountedSelected.current = true;
  }, [selected]);

  useEffect(() => {
    if (isMountedWatered.current) {
      const nextPlannedDate = nextDate();
      if (wateredDays && nextPlannedDate) {
        updateDoc(docRef, {
          wateredDays: wateredDays,
          nextPlannedDate: nextPlannedDate,
        });
      }
    } else isMountedWatered.current = true;
  }, [wateredDays]);

  return (
    <View style={styles.container}>
      <BottomSheetModalProvider>
        <Image source={{ uri: imageUrl }} style={styles.cardImage} />
        <View style={styles.topCard}>
          <View style={styles.info}>
            <Text style={[styles.infoTitle, { textAlign: "center" }]}>
              {plantName}
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 20,
              }}
            >
              <Ionicons name={"water-outline"} size={35} />
              <Text
                style={{ fontSize: 20, marginLeft: 10 }}
              >
                {humidityLevel}
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 20,
                marginLeft: 5,
              }}
            >
              <Image source={iconPath()} style={{ width: 40, height: 40 }} />
              <Text style={{ fontSize: 20, marginLeft: 10 }}>
                {localisation}
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 20,
                marginLeft: 5,
              }}
            >
              <Ionicons name={"calendar-outline"} size={35} />
              <Text
                style={{ fontSize: 20, marginLeft: 10 }}
              >
                {nextPlannedWatering}
              </Text>
            </View>
          </View>
          <View style={styles.bottomCard}>
            <View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text style={styles.bottomCardTitle}>
                  Planning de la semaine{" "}
                </Text>
                <TouchableOpacity onPress={handlePresentModal}>
                  <Ionicons
                    name={"calendar-outline"}
                    size={23}
                    style={{ marginRight: 20 }}
                  />
                </TouchableOpacity>
              </View>
              <Text style={{ color: ColorPalette.textGrey, marginLeft: 20 }}>
                Nous sommes le {moment().format("DD.MM.YYYY")}
              </Text>
            </View>
            <WeeklyCalendarComponent
              firstDate={weekStart}
              lastDate={endOfWeek}
              id={id}
            />
          </View>
        </View>
        <BottomSheetModal
          ref={bottomSheetModalRef}
          index={0}
          snapPoints={snapPoint}
          style={styles.modalStyle}
          backgroundStyle={{
            backgroundColor: ColorPalette.dark,
          }}
        >
          <View>
            <Calendar
              theme={{
                calendarBackground: ColorPalette.dark,
                dayTextColor: "#fff",
                monthTextColor: "#fff",
              }}
              hideExtraDays={true}
              firstDay={1}
              dayComponent={({ date }) => {
                return (
                  <TouchableOpacity
                    onPress={async () => setOnSelectedDay(date.dateString)}
                    style={{
                      backgroundColor: selected?.includes(date.dateString)
                        ? wateredDays?.includes(date.dateString)
                          ? ColorPalette.greenify //color of the background of a watered day
                          : "#fff" //color of a selected day
                        : ColorPalette.dark, // color of a not selected && watered day
                      borderRadius:
                        selected?.includes(date.dateString) ||
                        onSelectedDay.includes(date.dateString)
                          ? 15
                          : 0,
                      borderWidth: onSelectedDay.includes(date.dateString)
                        ? 2
                        : 0,
                      borderColor: selected?.includes(date.dateString)
                        ? wateredDays?.includes(date.dateString)
                          ? "#fff" //color of the border of a watered day
                          : "#000000" // color of the border of a selected day
                        : "#fff", // color of a not selected && not watered day
                    }}
                  >
                    <Text
                      style={{
                        textAlign: "center",
                        color: selected?.includes(date.dateString)
                          ? wateredDays?.includes(date.dateString)
                            ? "#fff" //color of the text of a watered day
                            : "#000000" // color of the text of a selected day
                          : "#fff", //default color of the text of a day
                        fontSize: 18,
                        marginTop: 4,
                      }}
                    >
                      {date.day}
                    </Text>
                    {selected?.includes(date.dateString) ||
                    onSelectedDay.includes(date.dateString) ? (
                      <Ionicons
                        name={"water-outline"}
                        size={23}
                        color={
                          selected?.includes(date.dateString)
                            ? wateredDays?.includes(date.dateString)
                              ? "#fff" // color of the icon of watered day
                              : "#000000" // color of the icon of a selected day
                            : "#fff" // color of the icon of the clicked day
                        }
                        style={{ margin: 6 }}
                      />
                    ) : (
                      <Ionicons
                        name={"water-outline"}
                        size={23}
                        color={ColorPalette.dark}
                      />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
          <View
            style={{
              flexDirection: "column",
              position: "absolute",
              bottom: 20,
              right: 20,
            }}
          >
            <View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  textAlign: "center",
                  justifyContent: "flex-end",
                }}
              >
                <Text style={{ color: "#fff", fontSize: 18 }}>Arrosé</Text>

                <View
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 20,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: ColorPalette.greenify,
                    margin: 10,
                  }}
                >
                  <Ionicons name={"water-outline"} size={23} color="#fff" />
                </View>
              </View>
            </View>
            <View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  textAlign: "center",
                  justifyContent: "flex-end",
                }}
              >
                <Text style={{ color: "#fff", fontSize: 18 }}>
                  Arrosage planifié
                </Text>
                <View
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 20,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "#fff",
                    margin: 10,
                  }}
                >
                  <Ionicons name={"water-outline"} size={23} color="#000000" />
                </View>
              </View>
              <View
                style={{
                  alignItems: "center",
                  width: "100%",
                  right: 18,
                }}
              >
                {onSelectedDay.length !== 0 ? (
                  <TouchableOpacity
                    style={[
                      SubmitButton,
                      {
                        backgroundColor: wateredDays?.includes(onSelectedDay)
                          ? "#fff"
                          : ColorPalette.greenify,
                      },
                    ]}
                    onPress={async () => await handleDatesStates()}
                  >
                    <Text
                      style={{
                        color: wateredDays?.includes(onSelectedDay)
                          ? "#000000"
                          : "#fff",
                        fontSize: 18,
                      }}
                    >
                      {" "}
                      {selected?.includes(onSelectedDay)
                        ? wateredDays?.includes(onSelectedDay)
                          ? "Je n'ai pas arrosé ce jour-là"
                          : "J'ai arrosé ce jour-là"
                        : "Planifier un arrosage"}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  ""
                )}
                {selected?.includes(onSelectedDay) &&
                !wateredDays?.includes(onSelectedDay) ? (
                  <TouchableOpacity
                    onPress={() => deleteFromAllState(onSelectedDay)}
                    style={[
                      SubmitButton,
                      {
                        backgroundColor: ColorPalette.error,
                        justifyContent: "center",
                      },
                    ]}
                  >
                    <Text style={TextInSubmit}> Supprimer</Text>
                  </TouchableOpacity>
                ) : (
                  ""
                )}
              </View>
            </View>
          </View>
        </BottomSheetModal>
      </BottomSheetModalProvider>
    </View>
  );
};

export default CardDetailView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ColorPalette.boldGreen,
    alignItems: "center",
    justifyContent: "space-evenly",
  },

  info: {
    position: "absolute",
    top: 10,
    left: 10,
    padding: 10,
    width: "50%",
    backgroundColor: "#fff",
    borderRadius: 25,
  },

  infoTitle: {
    fontWeight: "bold",
    fontSize: 22,
  },

  topCard: {
    width: "100%",
    height: "65%",
    backgroundColor: ColorPalette.background,
    borderRadius: 25,
    alignItems: "center",
    position: "absolute",
    bottom: 0,
  },

  bottomCardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 20,
  },

  bottomCard: {
    width: "95%",
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 25,
    position: "absolute",
    bottom: 20,
  },

  topCardTitle: {
    fontSize: 36,
    fontWeight: "bold",
  },

  cardImage: {
    width: "100%",
    height: "50%",
    position: "absolute",
    top: 0,
  },

  topCardContainer: {
    flexDirection: "row-reverse",
    flex: 1,
    justifyContent: "space-between",
  },

  topCardContainerInfo: {
    flexDirection: "column",
    marginTop: 90,
    marginLeft: 15,
  },
  subCategory: {
    flexDirection: "column",
    justifyContent: "flex-end",
    alignItems: "center",
    height: 70,
    marginRight: 15,
    marginLeft: 15,
    marginBottom: 25,
  },
  subNames: {
    color: ColorPalette.textGrey,
    fontSize: 18,
    paddingTop: 10,
  },

  modalStyle: {
    flex: 1,
    Color: ColorPalette.thinGreen,
  },
});
