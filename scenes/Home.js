// Component for the Home screen of the app. Takes navigation as a prop.

import { useContext } from 'react';
import { StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { GameContext } from '../app/GameContext';
import { carnivalTheme, themeMap } from '../assets/themes';

export default function Home({ navigation }) {
  const { height } = useWindowDimensions();
  const { selectedTheme } = useContext(GameContext);
  const activeTheme = themeMap && themeMap.has(selectedTheme) 
        ? themeMap.get(selectedTheme) 
        : carnivalTheme;
  const styles = stylesFunc(height, activeTheme);
  console.log(useWindowDimensions());
  return (
    <View style={styles.container}>
      <Text style={styles.customText}>
        { "EPC Practice App" }
      </Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('SetupPosition')}>
        <Text style={styles.buttonText}>
          { "Setup Position" }
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Quiz')}>
        <Text style={styles.buttonText}>
          { "Quiz" }
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Learn')}>
        <Text style={styles.buttonText}>
          { "Learn" }
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Customize')}>
        <Text style={styles.buttonText}>
          { "Customize" }
        </Text>
      </TouchableOpacity>
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
  buttonText: {
    color: theme?.buttonTextCol,
    fontSize: 18,
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
});