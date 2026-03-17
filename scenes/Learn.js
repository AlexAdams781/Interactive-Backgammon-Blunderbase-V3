// Component for the Learn screen of the app. Takes navigation as a prop. Still in development.

import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useWindowDimensions } from 'react-native';

export default function Home({ navigation }) {
  const { height } = useWindowDimensions();
  const styles = stylesFunc(height);
  console.log(useWindowDimensions());
  return (
    <View style={styles.container}>
      <Text style={styles.customText}>
        { "Learn" }
      </Text>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Home')}>
        <Text style={styles.homeText}>
            { "Home" }
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
  homeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'Arial',
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: 'red',
    borderRadius: 0.01 * height,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0.08 * height,
    left: 0.12 * height,
    height: 0.07 * height,
    width: 0.09 * height
  }
});