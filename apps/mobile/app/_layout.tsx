import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="splash" />
      <Stack.Screen name="login" />
      <Stack.Screen name="otp" />
      <Stack.Screen name="register" />
      <Stack.Screen name="home" />
      <Stack.Screen name="saathi" />
      <Stack.Screen name="rozgar" />
      <Stack.Screen name="problems" />
    </Stack>
  );
}