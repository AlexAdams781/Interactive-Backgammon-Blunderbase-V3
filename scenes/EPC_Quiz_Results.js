import { StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';

export default function EPC_Quiz_Results({ route, navigation }) {
  const { height } = useWindowDimensions();
  const styles = stylesFunc(height);
  const { settings, inaccuracy, time, correct, mistake, count, mode } = route.params;
  console.log(useWindowDimensions());
  return (
    <View style={styles.container}>
      <Text style={styles.customText}>
        { "Results" }
      </Text>
      <View style={styles.statsContainer}>
            <View style={styles.leftStatsContainer}>
            <Text style={styles.leftStatsText}> Correct/Mistake/Blunder </Text>
            </View>
            <View style={styles.rightStatsContainer}>
            <Text style={styles.rightStatsText}>{correct}/{mistake}/{count - correct - mistake}</Text>
            </View>
      </View>
      <View style={styles.statsContainer}>
            <View style={styles.leftStatsContainer}>
            <Text style={styles.leftStatsText}>Time: </Text>
            </View>
            <View style={styles.rightStatsContainer}>
            <Text style={styles.rightStatsText}>{time}</Text>
            </View>
      </View>
      <TouchableOpacity style={styles.button} onPress={() => mode === "EPC" ? navigation.navigate('EPC_Quiz', { settings }) : navigation.navigate('Benjamin_Quiz', { settings })}>
        <Text style={styles.buttonText}>
          { "Restart" }
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Home')}>
        <Text style={styles.buttonText}>
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
    left: 0.055 * height,
    height: 0.07 * height,
    width: 0.09 * height
  },
  leftStatsContainer: {
    flex : 7,
    backgroundColor : "lightgray", 
    justifyContent : 'center',
    alignItems : 'left',
    borderTopLeftRadius : 0.03 * height,
    borderBottomLeftRadius : 0.03 * height,
  },
    leftStatsText: {
    color: 'black',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Arial',
    paddingHorizontal : 0.02 * height,
  },
    rightStatsContainer: {
    flex : 3,
    backgroundColor : "pink",
    justifyContent : 'center',
    alignItems : 'center',
    paddingHorizontal : 0.02 * height,
    borderTopRightRadius : 0.03 * height,
    borderBottomRightRadius : 0.03 * height,
  },
    rightStatsText: {
    color: 'black',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Arial',
  },
  statsContainer: {
    height : 0.075 * height,
    width : 0.6 * height,
    backgroundColor : 'dodgerblue',
    flexDirection : 'row',
  },
});