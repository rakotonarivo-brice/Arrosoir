import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Alert,
  Image,
  Animated,
  Dimensions,
} from "react-native";
import { ColorPalette } from "../styles/colors";
import { CommercialTitleSize } from "../styles/fonts";
import Caroussel from "../data/homeCarouselData";
import Ionicons from "@expo/vector-icons/Ionicons";

const { width, height } = Dimensions.get("screen");

export default function HomeView({navigation}) {
  const scrollX = React.useRef(new Animated.Value(0)).current;

  const Item = ({ title, description, image }) => (
    <View style={styles.sideCart}>
      <View>
        <Text style={CommercialTitleSize}>{title}</Text>
      </View>
      <Text
        style={{
          margin: 20,
          fontSize: 24,
          textAlign: "center",
          color: ColorPalette.textGrey,
        }}
      >
        {description}
      </Text>
      <Image
        source={image}
        style={{
          width: 350,
          height: 235,
          resizeMode: "contain",
        }}
      />
    </View>
  );

  const renderItem = ({ item }) => (
    <Item
      title={item.title}
      description={item.description}
      image={item.image}
    />
  );

  const Indicator = ({ scrollX }) => {
    return (
      <View style={{ flexDirection: "row", height: 64 }}>
        {Caroussel.map((_, i) => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.8, 1.4, 0.8],
            extrapolate: "clamp",
          });
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.6, 0.9, 0.6],
            extrapolate: "clamp",
          });
          return (
            <Animated.View
              style={[
                styles.dot,
                { width: 10, opacity, transform: [{ scale }] },
              ]}
              key={i.toString()}
            />
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Pressable>
        <View style={styles.lang}>
          <Ionicons
            name="language-outline"
            size={25}
            color="black"
            style={{ textAlign: "center" }}
          />
        </View>
      </Pressable>
      <Animated.FlatList
        data={Caroussel}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        scrollEventThrottle={32}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        showsHorizontalScrollIndicator={false}
        pagingEnabled
      />
      <Indicator scrollX={scrollX} />
      <Pressable style={styles.button} onPress={() => navigation.navigate('Log')}>
        <Text
          style={{
            color: "#fff",
            textAlign: "center",
            fontSize: "20",
            fontWeight: "bold",
            marginLeft: 20,
          }}
        >
          Commencez
        </Text>
        <View style={styles.arrow}>
          <Ionicons
            name="arrow-forward-outline"
            size={25}
            color="black"
            style={{ textAlign: "center" }}
          />
        </View>
      </Pressable>
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

  button: {
    backgroundColor: ColorPalette.darkGreen,
    borderRadius: 50,
    width: 200,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 20
  },

  sideCart: {
    backgroundColor: ColorPalette.plant1Bc,
    height: 560,
    width: 355,
    textAlign: "justify",
    borderRadius: 50,
    alignItems: "center",
    margin: 10,
  },

  arrow: {
    justifyContent: "center",
    height: 45,
    width: 45,
    borderRadius: 50,
    marginLeft: 20,
    backgroundColor: ColorPalette.plant1Bc,
  },

  lang: {
    display: "none",
    justifyContent: "center",
    height: 45,
    width: 45,
    borderRadius: 50,
    marginLeft: 270,
    backgroundColor: ColorPalette.plant1Bc,
  },
  dot: {
    height: 10,
    borderRadius: 5,
    backgroundColor: ColorPalette.plant1Bc,
    marginHorizontal: 8,
    marginTop: 20,
  },
});
