// Component for the Customize screen of the app. Takes navigation as a prop. Still in development.

import { useContext } from 'react';
import { StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { GameContext } from '../app/GameContext';
import { carnivalTheme, themeMap, themes } from '../assets/themes';

export default function Home({ navigation }) {
  const { height } = useWindowDimensions();
  const { setSelectedTheme, selectedTheme } = useContext(GameContext);
  const activeTheme = themeMap && themeMap.has(selectedTheme) 
        ? themeMap.get(selectedTheme) 
        : carnivalTheme;
  const styles = stylesFunc(height, activeTheme);
  console.log(useWindowDimensions());

  

  return (
    <View style={styles.container}>
      <Text style={styles.customText}>
        { "Customize" }
      </Text>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Home')}>
        <Text style={styles.homeText}>
            { "Home" }
        </Text>
      </TouchableOpacity>
      <View style={{ gap: 20, alignItems: 'center', justifyContent: 'center' }}>
        {themes.map((theme) => (
          <TouchableOpacity key={theme} style={styles.button} onPress={() => setSelectedTheme(theme)}>
            <Text style={styles.buttonText}>
              {theme}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const stylesFunc = (height, theme) => StyleSheet.create({
  container: {
    flex: 1,
    gap: 20,
    backgroundColor: theme?.backgroundColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customText: {
    color: theme?.textCol,
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Arial',
  },
  homeText: {
    color: theme?.buttonTextCol,
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'Arial',
    textAlign: 'center',
  },
  button: {
    backgroundColor: theme?.buttonCol,
    padding: 0.03 * height,
    borderRadius: 0.03 * height,
    width: 0.4 * height,
    height: 0.12 * height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: theme?.buttonCol,
    borderRadius: 0.01 * height,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0.08 * height,
    left: 0.12 * height,
    height: 0.07 * height,
    width: 0.09 * height
  },
  sidePanel : {
    flexDirection : "column",
    justifyContent : "space-evenly",
    alignItems : "center",
    backgroundColor : theme?.backgroundColor,
  },
  buttonText: {
    color: theme?.buttonTextCol,
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Arial',
    textAlign: 'center',
  },
});