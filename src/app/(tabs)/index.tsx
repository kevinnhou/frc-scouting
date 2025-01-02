import { Text, View } from "react-native";

import { Button } from "@/components/ui/Button";

export default function Page() {
  return (
    <View>
      <Text>Welcome</Text>
      <Button asChild href="/match">
        <Text>Match Scouting</Text>
      </Button>
      <Button asChild href="/pit">
        <Text>Pit Scouting</Text>
      </Button>
    </View>
  );
}
