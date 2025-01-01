import React from "react";
import { View, Text } from "react-native";
import { Link, Stack } from "expo-router";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen />
      <View>
        <Text>404. Page Not Found.</Text>
        <Link href="/">Go back home</Link>
      </View>
    </>
  );
}
