import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Modal,
  Dimensions,
} from "react-native";
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
import { fontCardTitle } from "../styles/fonts";
import { ScrollView } from "react-native-gesture-handler";

const { width, height } = Dimensions.get("screen");

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

const CardDetailView = ({ route, navigation: { goBack } }) => {
  const today = moment();
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
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const sortedNextPlannedDays = selected
    .filter(
      (day) => !wateredDays.includes(day) && day >= today.format("YYYY-MM-DD")
    )
    .sort();
  const sortedWateredDay = wateredDays.sort();
  const forgottenPlannedDays = selected
    .filter(
      (day) => !wateredDays.includes(day) && day < today.format("YYYY-MM-DD")
    )
    .sort();

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
        <TouchableOpacity
          onPress={() => goBack()}
          style={{ position: "absolute", top: 60, left: 10 }}
        >
          <Ionicons
            name={"arrow-back-circle"}
            size={60}
            style={{
              color: "#fff",
            }}
          />
        </TouchableOpacity>
        <Image source={{ uri: imageUrl }} style={styles.cardImage} />
        <View style={styles.topCard}>
          <Text
            style={[
              styles.infoTitle,
              { textAlign: "center", margin: 10, fontSize: 30 },
            ]}
          >
            {plantName}
          </Text>
          <View
            style={{
              width: "95%",
              backgroundColor: "#fff",
              borderRadius: 25,
              padding: 10,
            }}
          >
            <Text style={[styles.bottomCardTitle, { marginBottom: 5 }]}>
              Fiche de la plante
            </Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-evenly",
              }}
            >
              <TouchableOpacity>
                <Text>Luminosité</Text>
              </TouchableOpacity>

              <TouchableOpacity>
                <Text>Température</Text>
              </TouchableOpacity>

              <TouchableOpacity>
                <Text>trois</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View
            style={{
              width: "95%",
              backgroundColor: "#fff",
              borderRadius: 25,
              padding: 10,
            }}
          >
            <Text style={[styles.bottomCardTitle, { marginBottom: 5 }]}>
              Etat global du planning
            </Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-evenly",
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  [setShowModal(!showModal), setModalContent("WateredDays")];
                }}
                style={[
                  styles.cardInfo,
                  { backgroundColor: ColorPalette.greenify },
                ]}
              >
                <Text
                  style={[
                    fontCardTitle,
                    {
                      paddingTop: 0,
                      textAlign: "center",
                      margin: 10,
                      lineHeight: 26,
                      color: "#fff",
                    },
                  ]}
                >
                  Vous l'avez arrosé{"  "}
                  <Text style={{ fontSize: 18 }}>
                    {sortedWateredDay.length - 1}{" "}
                  </Text>
                  <Text> fois</Text>
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  [
                    setShowModal(!showModal),
                    setModalContent("NextPlannedDays"),
                  ];
                }}
                style={[styles.cardInfo, { backgroundColor: "#000000" }]}
              >
                <Text
                  style={[
                    fontCardTitle,
                    {
                      paddingTop: 0,
                      textAlign: "center",
                      margin: 10,
                      lineHeight: 26,
                      color: "#fff",
                    },
                  ]}
                >
                  Vous avez{"  "}
                  <Text style={{ fontSize: 18 }}>
                    {sortedNextPlannedDays.length}
                  </Text>
                  <Text> arrosages prévus</Text>
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  [
                    setShowModal(!showModal),
                    setModalContent("ForgottenPlannedDays"),
                  ];
                }}
                style={[
                  styles.cardInfo,
                  { backgroundColor: ColorPalette.error },
                ]}
              >
                <Text
                  style={[
                    fontCardTitle,
                    {
                      paddingTop: 0,
                      textAlign: "center",
                      margin: 10,
                      lineHeight: 26,
                      color: "#fff",
                    },
                  ]}
                >
                  Vous avez oublié{"  "}
                  <Text style={{ fontSize: 18 }}>
                    {forgottenPlannedDays.length}
                  </Text>
                  <Text> arrosages</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <Modal animationType={"slide"} transparent={true} visible={showModal}>
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <Text style={styles.infoTitle}>
                  {modalContent === "WateredDays"
                    ? "Arrosage effectué"
                    : modalContent === "NextPlannedDays"
                    ? "Arrosages en attente"
                    : modalContent === "ForgottenPlannedDays"
                    ? "Arrosages oubliés"
                    : ""}
                </Text>
                {modalContent === "WateredDays" ? (
                  <ScrollView>
                    {sortedWateredDay.map((item) => {
                      return (
                        <View
                          key={item}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            display: item ? "block" : "none",
                            marginTop: 15,
                          }}
                        >
                          <Ionicons
                            name={"ellipse"}
                            size={10}
                            style={{ marginRight: 10 }}
                          />

                          <Text>
                            {moment(item, "YYYY-MM-DD").format("DD MMM. YYYY")}
                          </Text>
                        </View>
                      );
                    })}
                  </ScrollView>
                ) : modalContent === "NextPlannedDays" ? (
                  <ScrollView>
                    {sortedNextPlannedDays.map((item) => {
                      return (
                        <View
                          key={item}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            display: item ? "block" : "none",
                            marginTop: 15,
                          }}
                        >
                          <Ionicons
                            name={"ellipse"}
                            size={10}
                            style={{ marginRight: 10 }}
                          />

                          <Text>
                            {moment(item, "YYYY-MM-DD").format("DD MMM. YYYY")}
                          </Text>
                        </View>
                      );
                    })}
                  </ScrollView>
                ) : modalContent === "ForgottenPlannedDays" ? (
                  <ScrollView>
                    {forgottenPlannedDays.map((item) => {
                      return (
                        <View
                          key={item}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            display: item ? "block" : "none",
                            marginTop: 15,
                          }}
                        >
                          <Ionicons
                            name={"ellipse"}
                            size={10}
                            style={{ marginRight: 10 }}
                          />

                          <Text>
                            {moment(item, "YYYY-MM-DD").format("DD MMM. YYYY")}
                          </Text>
                        </View>
                      );
                    })}
                  </ScrollView>
                ) : (
                  ""
                )}
                <TouchableOpacity
                  style={{ position: "absolute", top: 15, right: 15 }}
                  onPress={() => {
                    setShowModal(!showModal);
                  }}
                >
                  <View
                    style={{
                      backgroundColor: ColorPalette.error,
                      height: 28,
                      width: 28,
                      borderRadius: 24,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Ionicons name={"close"} size={18} color="#fff" />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

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
                    size={height < 800 ? 18 : 23}
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
                          : sortedNextPlannedDays?.includes(date.dateString)
                          ? "#fff" //color of a selected day
                          : ColorPalette.error //color of a deprecated selected day
                        : ColorPalette.dark, // color of a not selected && watered day
                      borderRadius:
                        selected?.includes(date.dateString) ||
                        onSelectedDay.includes(date.dateString)
                          ? 15
                          : 0,
                      borderWidth: onSelectedDay.includes(date.dateString)
                        ? height < 800
                          ? 1
                          : 2
                        : 0,
                      borderColor: selected?.includes(date.dateString)
                        ? wateredDays?.includes(date.dateString)
                          ? "#fff" //color of the border of a watered day
                          : sortedNextPlannedDays?.includes(date.dateString)
                          ? "#00000" //color of the border a deprecated selected day
                          : "#fff" // color of the border of a selected day
                        : "#fff", // color of a not selected && not watered day
                    }}
                  >
                    <Text
                      style={{
                        textAlign: "center",
                        color: selected?.includes(date.dateString)
                          ? wateredDays?.includes(date.dateString)
                            ? "#fff" //color of the text of a watered day
                            : sortedNextPlannedDays?.includes(date.dateString)
                            ? "#000000" //color of the text of a selected day
                            : "#fff" // color of the text of a deprecated selected day
                          : "#fff", //default color of the text of a day
                        fontSize: 18,
                        marginTop: height < 800 ? 2 : 4,
                      }}
                    >
                      {date.day}
                    </Text>
                    {selected?.includes(date.dateString) ||
                    onSelectedDay.includes(date.dateString) ? (
                      <Ionicons
                        name={"water-outline"}
                        size={height < 800 ? 18 : 23}
                        color={
                          selected?.includes(date.dateString)
                            ? wateredDays?.includes(date.dateString)
                              ? "#fff" // color of the icon of watered day
                              : sortedNextPlannedDays?.includes(date.dateString)
                              ? "#000000" //color of the icon of a selected day
                              : "#fff" //color of the icon of a deprecated selected day
                            : "#fff" // color of the icon of the clicked day
                        }
                        style={{ margin: 6 }}
                      />
                    ) : (
                      <Ionicons
                        name={"water-outline"}
                        size={height < 800 ? 18 : 23}
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
                    width: height < 800 ? 40 : 50,
                    height: height < 800 ? 40 : 50,
                    borderRadius: height < 800 ? 13 : 20,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: ColorPalette.greenify,
                    margin: height < 800 ? 5 : 10,
                  }}
                >
                  <Ionicons
                    name={"water-outline"}
                    size={height < 800 ? 18 : 23}
                    color="#fff"
                  />
                </View>
              </View>
            </View>
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
                  width: height < 800 ? 40 : 50,
                  height: height < 800 ? 40 : 50,
                  borderRadius: height < 800 ? 13 : 20,
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "#fff",
                  margin: height < 800 ? 5 : 10,
                }}
              >
                <Ionicons
                  name={"water-outline"}
                  size={height < 800 ? 18 : 23}
                  color="#000000"
                />
              </View>
            </View>
            <View
              style={{
                flexDirection: height < 800 ? "row" : "column",
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
                      height: height < 800 ? 50 : 60,
                      width: height < 800 ? 160 : 300,
                      margin: height < 800 ? 10 : 0,
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
                        ? height < 800
                          ? "Je n'ai pas arrosé"
                          : "Je n'ai pas arrosé ce jour-là"
                        : height < 800
                        ? "J'ai arrosé"
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
                      height: height < 800 ? 50 : 60,
                      width: height < 800 ? 160 : 300,
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
        </BottomSheetModal>
      </BottomSheetModalProvider>
    </View>
  );
};

export default CardDetailView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ColorPalette.lightGrey,
    alignItems: "center",
    justifyContent: "space-evenly",
  },

  cardInfo: {
    backgroundColor: "#fff",
    width: "30%",
    borderRadius: 15,
    justifyContent: "center",
    margin: 10,
  },

  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  modalView: {
    backgroundColor: "#fff",
    borderRadius: 25,
    padding: 18,
    height: "40%",
    width: "80%",
  },

  info: {
    position: "absolute",
    top: 50,
    left: 10,
    padding: 10,
    width: "40%",
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
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
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
    zIndex: -1,
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
