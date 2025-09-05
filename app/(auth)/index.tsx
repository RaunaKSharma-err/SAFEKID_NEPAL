import { router } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

const Index = () => {
  const [first, setfirst] = useState(false);
  if (!first) {
    router.replace("/(auth)/signin");
  }
  return (
    <View style={styles.container}>
      <Text>Aaradhya</Text>
    </View>
  );
};

export default Index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
