import Checkbox from 'expo-checkbox'; // Note the lowercase 'b'
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';

export default function EPC_Quiz_Settings({ navigation }) {
  const { height } = useWindowDimensions();
  const styles = stylesFunc(height);
  console.log(useWindowDimensions());

  const [isMCG, setIsMCG] = useState(false);
  const [isFastimate, setIsFastimate] = useState(false);
  const [isNNM, setIsNNM] = useState(false);
  const [isCYM, setIsCYM] = useState(false);
  const [isMM8, setIsMM8] = useState(false);
  const [isAll, setIsAll] = useState(true);

  const handleChange = (setter, newValue) => {
    if (setter === setIsAll && newValue) {
      // If "All" is being set to true, set all others to false
      setIsMCG(false);
      setIsFastimate(false);
      setIsNNM(false);
      setIsCYM(false);
      setIsMM8(false);
    } else if (setter !== setIsAll && newValue) {
      // If any other option is being set to true, set "All" to false
      setIsAll(false);
    }
    setter(newValue);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.customText}>
        { "EPC Quiz Settings" }
      </Text>
      <View style={styles.settingsContainer}>
        <View style={styles.leftSettingsContainer}>
            <Text style={styles.leftSettingsText}>{"MCG"}</Text>
        </View>
        <View style={styles.checkboxContainer}>
        <Checkbox
          disabled={false} // Checkbox is enabled
          value={isMCG} // The current boolean value of the checkbox
          onValueChange={(newValue) => handleChange(setIsMCG, newValue)} // Callback to update the state
          style={styles.checkboxBorder}
        />
      </View>
      </View>
      <View style={styles.settingsContainer}>
        <View style={styles.leftSettingsContainer}>
            <Text style={styles.leftSettingsText}>{"Fastimate"}</Text>
        </View>
        <View style={styles.checkboxContainer}>
        <Checkbox
          disabled={false} // Checkbox is enabled
          value={isFastimate} // The current boolean value of the checkbox
          onValueChange={(newValue) => handleChange(setIsFastimate, newValue)} // Callback to update the state
          style={styles.checkboxBorder}
        />
      </View>
      </View>
      <View style={styles.settingsContainer}>
        <View style={styles.leftSettingsContainer}>
            <Text style={styles.leftSettingsText}>{"NNM"}</Text>
        </View>
        <View style={styles.checkboxContainer}>
        <Checkbox
          disabled={false} // Checkbox is enabled
          value={isNNM} // The current boolean value of the checkbox
          onValueChange={(newValue) => handleChange(setIsNNM, newValue)} // Callback to update the state
          style={styles.checkboxBorder}
        />
      </View>
      </View>
      <View style={styles.settingsContainer}>
        <View style={styles.leftSettingsContainer}>
            <Text style={styles.leftSettingsText}>{"CYM"}</Text>
        </View>
        <View style={styles.checkboxContainer}>
        <Checkbox
          disabled={false} // Checkbox is enabled
          value={isCYM} // The current boolean value of the checkbox
          onValueChange={(newValue) => handleChange(setIsCYM, newValue)} // Callback to update the state
          style={styles.checkboxBorder}
        />
      </View>
      </View>
      <View style={styles.settingsContainer}>
        <View style={styles.leftSettingsContainer}>
            <Text style={styles.leftSettingsText}>{"MM8"}</Text>
        </View>
        <View style={styles.checkboxContainer}>
        <Checkbox
          disabled={false} // Checkbox is enabled
          value={isMM8} // The current boolean value of the checkbox
          onValueChange={(newValue) => handleChange(setIsMM8, newValue)} // Callback to update the state
          style={styles.checkboxBorder}
        />
      </View>
      </View>
      <View style={styles.settingsContainer}>
        <View style={styles.leftSettingsContainer}>
            <Text style={styles.leftSettingsText}>{"All"}</Text>
        </View>
        <View style={styles.checkboxContainer}>
        <Checkbox
          disabled={false} // Checkbox is enabled
          value={isAll} // The current boolean value of the checkbox
          onValueChange={(newValue) => handleChange(setIsAll, newValue)} // Callback to update the state
          style={styles.checkboxBorder}
        />
      </View>
      </View>
      <TouchableOpacity style={styles.button} onPress={() => 
          navigation.navigate('EPC_Quiz', {
                  settings: {
                    isMCG,
                    isFastimate,
                    isNNM,
                    isCYM,
                    isMM8,
                    isAll }
                  })}>
        <Text style={styles.buttonText}>
          { "Start" }
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

const stylesFunc = (height) => StyleSheet.create({
  container: {
    flex: 1,
    gap: 12,
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
  settingsContainer: {
    height : 0.075 * height,
    width : 0.6 * height,
    backgroundColor : 'dodgerblue',
    flexDirection : 'row',
    justifyContent: 'space-between',
    },
  leftSettingsContainer: {
    flex : 1,
    backgroundColor : "dodgerblue", 
    justifyContent : 'center',
    alignItems : 'left',
    borderTopLeftRadius : 0.03 * height,
    borderBottomLeftRadius : 0.03 * height,
  },
  leftSettingsText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Arial',
    paddingHorizontal : 0.02 * height,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxBorder: {
    borderWidth: 2,
    borderColor: 'black',
  },
});