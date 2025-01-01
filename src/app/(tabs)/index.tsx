import { Text, View } from "react-native";
import { Link } from "expo-router";

export default function Page() {
  return (
    <View>
      <Text>Welcome</Text>
      <Link href="/match">Match Scouting</Link>
      <Link href="/pit">Pit Scouting</Link>
    </View>
  );
}
