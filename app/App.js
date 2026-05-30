import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useState } from 'react';
import { themeMap, themes } from '../assets/themes';
import Benjamin_Quiz from "../scenes/Benjamin_Quiz";
import Benjamin_Quiz_Settings from "../scenes/Benjamin_Quiz_Settings";
import Customize from "../scenes/Customize";
import EPC_Quiz from "../scenes/EPC_Quiz";
import EPC_Quiz_Results from "../scenes/EPC_Quiz_Results";
import EPC_Quiz_Settings from "../scenes/EPC_Quiz_Settings";
import Home from "../scenes/Home";
import Learn from "../scenes/Learn";
import One_Player from "../scenes/One_Player";
import Quiz from "../scenes/Quiz";
import SetupPosition from "../scenes/SetupPosition";
import Two_Players from "../scenes/Two_Players";
import { GameContext } from './GameContext';


const Stack = createNativeStackNavigator();

export default function App() {
  const [soloCheckersCopy, setSoloCheckersCopy] = useState(
        [0, 0, 0, 0, 0, 0,
         0, 0, 0, 0, 0, 0,
         0, 0, 0, 0, 0, 0,
         0, 0, 0, 0, 0, 0
        ]
      );

  const [pairCheckersCopy, setPairCheckersCopy] = useState([
        [0, 0, 0, 0, 0, 0,
         0, 0, 0, 0, 0, 0,
         0, 0, 0, 0, 0, 0,
         0, 0, 0, 0, 0, 0
        ],
        [0, 0, 0, 0, 0, 0,
         0, 0, 0, 0, 0, 0,
         0, 0, 0, 0, 0, 0,
         0, 0, 0, 0, 0, 0
        ]
      ]);

  const [selectedTheme, setSelectedTheme] = useState(themes[1]);

  return (
    //<NavigationContainer>
    <GameContext.Provider value={{ soloCheckersCopy, setSoloCheckersCopy, pairCheckersCopy, setPairCheckersCopy, themes, selectedTheme, setSelectedTheme, themeMap }}>
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
          name="One_Player"
          component={One_Player}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Two_Players"
          component={Two_Players}
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
          name="Benjamin_Quiz"
          component={Benjamin_Quiz}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="EPC_Quiz_Settings"
          component={EPC_Quiz_Settings}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Benjamin_Quiz_Settings"
          component={Benjamin_Quiz_Settings}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="EPC_Quiz_Results"
          component={EPC_Quiz_Results}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </GameContext.Provider>
  );
}
