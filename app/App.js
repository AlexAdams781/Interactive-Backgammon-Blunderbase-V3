import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Customize from "../scenes/Customize";
import EPC_Quiz from "../scenes/EPC_Quiz";
import EPC_Quiz_Results from "../scenes/EPC_Quiz_Results";
import EPC_Quiz_Settings from "../scenes/EPC_Quiz_Settings";
import Home from "../scenes/Home";
import Learn from "../scenes/Learn";
import Quiz from "../scenes/Quiz";
import SetupPosition from "../scenes/SetupPosition";


const Stack = createNativeStackNavigator();

export default function App() {
  return (
    //<NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={Home}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SetupPosition"
          component={SetupPosition}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Quiz"
          component={Quiz}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Learn"
          component={Learn}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Customize"
          component={Customize}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="EPC_Quiz"
          component={EPC_Quiz}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="EPC_Quiz_Settings"
          component={EPC_Quiz_Settings}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="EPC_Quiz_Results"
          component={EPC_Quiz_Results}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    //</NavigationContainer>
  );
}
