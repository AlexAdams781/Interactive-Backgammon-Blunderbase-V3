// Component for the Home screen of the app. Takes navigation as a prop.

import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useWindowDimensions } from 'react-native';

export default function Home({ navigation }) {
  const { height } = useWindowDimensions();
  const styles = stylesFunc(height);
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

const stylesFunc = (height) => StyleSheet.create({
  container: {
    flex: 1,
    gap: 20,
    backgroundColor: 'dodgerblue',
    alignItems: 'center',
    justifyContent: 'center',
  },
  customText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Arial',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Arial',
    textAlign: 'center',
  },
  button: {
    backgroundColor: 'red',
    padding: 0.03 * height,
    borderRadius: 0.03 * height,
    width: 0.4 * height,
    height: 0.12 * height,
    justifyContent: 'center',
    alignItems: 'center',
  },
});