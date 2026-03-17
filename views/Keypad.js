import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Keypad = ({ value, setValue, isDisabled, onEnter }) => {
  const insets = useSafeAreaInsets();

  const handlePress = (key) => {
    if (isDisabled) return; // Ignore presses when disabled
    if (key === 'backspace') {
      setValue(prev => prev.slice(0, -1));
    } else if (key === 'enter') {
      if (onEnter) {
        onEnter(value);
        setValue("");
      }
    } else if (key === '.') {
      if (!value.includes('.')) setValue(prev => prev + key);
    } else {
      if (value.length < 10) setValue(prev => prev + key); // Character limit
    }
  };

  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['.', '0', 'backspace'],
    ['enter']
  ];

  return (
    <View style={[styles.wrapper, { paddingBottom: insets.bottom }]}>
      {/* 1. The Display Area (Now with explicit height and background) */}
      <View style={styles.displayArea}>
        <Text style={styles.displayText} numberOfLines={1}>
          {value || ""}
        </Text>
      </View>

      {/* 2. The Keypad Area */}
      <View style={styles.grid}>
        {keys.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((key) => (
              <TouchableOpacity
                key={key}
                activeOpacity={0.6}
                style={[styles.key, key === 'enter' && styles.enterKey]}
                onPress={() => handlePress(key)}
              >
                <Text style={[styles.keyText, key === 'enter' && styles.enterText]}>
                  {key === 'backspace' ? '⌫' : key === 'enter' ? 'ENTER' : key}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#1C1C1E', // Dark background ensures visibility
    borderRadius: 20,
    padding: 15,
    width: '100%',
    maxWidth: 400, // Keeps it from getting too wide on tablets
    alignSelf: 'center',
  },
  displayArea: {
    height: 30, 
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    marginBottom: 15,
  },
  displayLabel: {
    color: '#0A84FF',
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  displayText: {
    color: '#FFFFFF', // High contrast white text
    fontSize: 16,
    fontWeight: '600',
  },
  grid: {
    gap: 5, // Modern way to handle spacing
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  key: {
    flex: 1,
    height: 25, // Fixed height so it doesn't expand
    backgroundColor: '#3A3A3C',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  enterKey: {
    backgroundColor: 'green',
    marginTop: 5,
  },
  keyText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '500',
  },
  enterText: {
    fontWeight: 'bold',
    letterSpacing: 1,
  }
});

export default Keypad;