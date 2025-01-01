import React from "react";
import { View } from "react-native";
import { Link, Stack } from "expo-router";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "404. Page Not Found." }} />
      <View>
        <Link href="/">Go back home</Link>
      </View>
    </>
  );
}
