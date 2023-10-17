import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import moment from "moment";
import { ColorPalette } from "../styles/colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import { db } from "../../firebase-config";
import { getAuth } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";

const WeeklyCalendarComponent = (props) => {
  const user = getAuth();
  const docRef = doc(
    db,
    "users/",
    user.currentUser.uid,
    "/plantInfo",
    props.id
  );
  const firstDayId = parseInt(props.firstDate.slice(-2));
  const lastDayId = parseInt(props.lastDate.slice(-2));
  const [days, setDays] = useState([]);
  const [selected, setSelected] = useState([]);
  const [wateredDays, setWateredDays] = useState([]);

  const todayMoment = moment();
  const today = parseInt(moment().format("DD"));
  const monthAndYearId = moment().format("YYYY-MM");
  const endOfMonth = parseInt(todayMoment.endOf("month").format("DD"));

  useEffect(() => {
    let i = firstDayId;
    let month = parseInt(moment().format("MM"));
    let year = parseInt(moment().format("YYYY"));
    let dayDigit;
    const daysCache = [];
    const daysInitial = ["L", "M", "M", "J", "V", "S", "D"];
    if (lastDayId > firstDayId) {
      while (i <= lastDayId) {
        if (i < 10) {
          dayDigit = "0" + i;
        } else dayDigit = i;
        daysCache.push({
          dayDigit: i,
          monthAndYear: monthAndYearId,
          dayInitial: daysInitial[i - firstDayId],
          today: i === today ? true : false,
          dateFormat: monthAndYearId + "-" + dayDigit.toString(),
        });
        i++;
      }
    }
    if (lastDayId < firstDayId) {
      while (i <= endOfMonth) {
        if (i < 10) {
          dayDigit = "0" + i;
        } else dayDigit = i;
        daysCache.push({
          dayDigit: i,
          dayInitial: daysInitial[i - firstDayId],
          today: i === today ? true : false,
          dateFormat: monthAndYearId + "-" + dayDigit.toString(),
        });
        i++;
      }
      if (i >= endOfMonth) {
        i = 1;
        if (month === 12) {
          month = 1;
          year += 1;
        }
        month += 1;
        if (month < 10) {
          month = "0" + month;
        }
        while (i <= lastDayId) {
          if (i < 10) {
            dayDigit = "0" + i;
          } else dayDigit = i;
          daysCache.push({
            dayDigit: i,
            dayInitial: daysInitial[endOfMonth - firstDayId + i],
            today: i === today ? true : false,
            dateFormat:
              year.toString() + "-" + month + "-" + dayDigit.toString(),
          });
          i++;
        }
      }
      console.log("selected", selected);
      console.log("watered ", wateredDays);
    }
    setDays(daysCache);
    const subscriber = onSnapshot(docRef, (doc) => {
      const daysStatus = doc.data();
      if (daysStatus.selectedDays != "undefined") {
        setSelected(daysStatus.selectedDays);
      } else setSelected([""]);
      if (daysStatus.wateredDays != "undefined") {
        setWateredDays(daysStatus.wateredDays);
      } else wateredDays([""]);
    });
    return () => subscriber();
  }, []);

  return (
    <View>
      <View style={styles.calendarDay}>
        {days.map((day) => {
          return (
            <View
              key={day.dayDigit}
              style={{ justifyContent: "center", alignItems: "center" }}
            >
              {day.today ? (
                <Ionicons name={"ellipse"} size={10} style={{ margin: 10 }} />
              ) : (
                ""
              )}
              <TouchableOpacity
                style={[
                  styles.day,
                  {
                    backgroundColor: selected?.includes(day.dateFormat)
                      ? wateredDays?.includes(day.dateFormat)
                        ? ColorPalette.greenify
                        : "#000000"
                      : ColorPalette.lightGrey,
                  },
                ]}
                onPress={() => console.log("day :", day.dateFormat)}
              >
                <Text
                  style={{
                    fontWeight: "bold",
                    fontSize: 16,
                    paddingTop: 10,
                    textAlign: "center",
                    color: selected?.includes(day.dateFormat)
                      ? "#fff"
                      : "#000000",
                  }}
                >
                  {day.dayDigit}
                </Text>
                <View style={styles.dayInitial}>
                  {selected?.includes(day.dateFormat) ||
                  wateredDays?.includes(day.dateFormat) ? (
                    <Ionicons
                      name={"water-outline"}
                      size={23}
                      color={
                        selected?.includes(day.dateFormat)
                          ? wateredDays?.includes(day.dateFormat)
                            ? ColorPalette.greenify
                            : "#000000"
                          : "#fff"
                      }
                    />
                  ) : (
                    <Text>{day.dayInitial}</Text>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default WeeklyCalendarComponent;

const styles = StyleSheet.create({
  calendarDay: {
    flexDirection: "row",
    justifyContent: "space-evenly",
  },

  day: {
    alignItems: "center",
    borderRadius: 16,
    height: 85,
    width: 42,
  },

  dayInitial: {
    width: 35,
    height: 35,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 13,
    marginTop: 16,
  },

  todayDot: {
    borderRadius: 50,
  },
});
