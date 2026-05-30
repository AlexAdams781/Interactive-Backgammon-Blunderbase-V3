import { useContext } from 'react';
import { StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { GameContext } from '../app/GameContext';
import { carnivalTheme, themeMap } from '../assets/themes';

export default function Quiz({ navigation }) {
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
        { "Quiz" }
      </Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('EPC_Quiz_Settings')}>
        <Text style={styles.buttonText}>
          { "EPC" }
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Benjamin_Quiz_Settings')}>
        <Text style={styles.buttonText}>
          { "Benjamin Count" }
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Home')}>
        <Text style={styles.homeText}>
            { "Home" }
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
  homeText: {
    color: theme?.buttonTextCol,
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'Arial',
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: theme?.buttonCol,
    borderRadius: 0.01 * height,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0.08 * height,
    left: 0.055 * height,
    height: 0.07 * height,
    width: 0.09 * height
  },
});