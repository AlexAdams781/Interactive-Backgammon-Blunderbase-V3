// Component file for the Backgammon board view. Takes numCheckers and liftToTop as props.

import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React, { useRef, useState, useEffect } from 'react';
import Triangle from '@react-native-toolkit/triangle';
import { useWindowDimensions } from 'react-native';
import { TouchableWithoutFeedback } from 'react-native';

const checkerACol = '#1e63c9';
const checkerBCol = '#ffffff';
const pointACol = '#ffc919';
const pointBCol = '#f57231';
const surfaceCol = '#2a91e0';
const trayCol = '#1f6ba6';
const frameCol = '#30a5ff';


function boardIDTranslate(x) {
    switch (x) {
        case 'z':
            return 0;
        default:
            return x.charCodeAt(0) - 96; // 'a' is 97 in ASCII
    }
}

const Point = ({ liftValue, numCheckers, inputStyle, isTop }) => {
  const { height } = useWindowDimensions();
  const heightChecker = height * 0.08;
  const heightPoint = height * 0.384;
  const styles = stylesFunc(height);
  const count = numCheckers;

  const handlePress = (event) => {
      const { pageX, pageY, locationX, locationY } = event.nativeEvent;
      console.log(`Press coordinates relative to View: X=${locationX}, Y=${locationY}, target=${event.target}`);
      const preLevel = Math.ceil((heightPoint - locationY) / heightChecker);
      const level = isTop ? (6 - preLevel) : preLevel;
      console.log(typeof locationY, typeof heightChecker, locationY, heightChecker);
      console.log(`Level: ${(heightPoint - locationY) / heightChecker}`);
      console.log(liftValue === null ? 'No liftValue function provided' : 'LiftValue function is provided');
      liftValue(level);
  };

  const handleLongPress = (event) => {
    liftValue(0);
  }

  return (
    // Create a touchable point with a function to either add or remove components
    // Create a list of n checkers where n is the number of components added
    <TouchableOpacity style={inputStyle} activeOpacity={1}
                      onPress={handlePress} onLongPress={handleLongPress}>
        <View style={isTop ? styles.myContainerTop : styles.myContainerBottom}>
            {Array.from({ length: Math.min(5, count) }).map((_, index) => (
            <View key={index} style={styles.circle} pointerEvents="none">
              <Text style={styles.checkerText}>
                {((index === 0 && isTop) || (index == 4 && !isTop)) && count > 5 ? count.toString() : ""}
              </Text>
            </View>
            ))}
        </View>
    </TouchableOpacity>
  );
};

function getNumHomeCheckers(numCheckers) {
    return 15 - numCheckers.reduce((acc, item) => acc + item, 0);
}

function getPipCount(numCheckers) {
  return numCheckers.reduce((acc, item, index) => acc + item * (index + 1), 0);
}

function BackgammonBoard({ numCheckers, liftToTop, onCallParentFunction }) {
  const { height } = useWindowDimensions();
  const styles = stylesFunc(height);
  const [bottomPipCount, setBottomPipCount] = useState(0);

  useEffect(() => {
    console.log("numCHeckers has changed", getPipCount(numCheckers));
    setBottomPipCount(getPipCount(numCheckers));
    onCallParentFunction();
  }, [numCheckers]);

    return (
        <View style={styles.container}>
            <View style={styles.board}>
                <View style={styles.NWtray}/>
                <View style={styles.NEtray}/>
                <View style={styles.SWtray}/>
                <View style={styles.SEtray}>
                  {Array.from({ length: getNumHomeCheckers(numCheckers) }).map((_, index) => (
                        <View key={index} style={styles.stackedChecker} />
                    ))}
                    <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
                        {getNumHomeCheckers(numCheckers)}
                    </Text>
                </View>

                <View style={styles.surface}>
                        <Point 
                          liftValue={(newValue) => liftToTop(newValue, 13)}
                          numCheckers={numCheckers[12]}
                          inputStyle={styles.pointADown}
                          isTop={true}/>
                        <Point 
                          liftValue={(newValue) => liftToTop(newValue, 14)}
                          numCheckers={numCheckers[13]}
                          inputStyle={styles.pointBDown}
                          isTop={true}/>
                        <Point 
                          liftValue={(newValue) => liftToTop(newValue, 15)}
                          numCheckers={numCheckers[14]}
                          inputStyle={styles.pointADown}
                          isTop={true}/>
                        <Point 
                          liftValue={(newValue) => liftToTop(newValue, 16)}
                          numCheckers={numCheckers[15]}
                          inputStyle={styles.pointBDown}
                          isTop={true}/>
                        <Point 
                          liftValue={(newValue) => liftToTop(newValue, 17)}
                          numCheckers={numCheckers[16]}
                          inputStyle={styles.pointADown}
                          isTop={true}/>
                        <Point 
                          liftValue={(newValue) => liftToTop(newValue, 18)}
                          numCheckers={numCheckers[17]}
                          inputStyle={styles.pointBDown}
                          isTop={true}/>
                        <Point 
                          liftValue={(newValue) => liftToTop(newValue, 12)}
                          numCheckers={numCheckers[11]}
                          inputStyle={styles.pointBUp}
                          isTop={false}/>
                        <Point 
                          liftValue={(newValue) => liftToTop(newValue, 11)}
                          numCheckers={numCheckers[10]}
                          inputStyle={styles.pointAUp}
                          isTop={false}/>
                        <Point 
                          liftValue={(newValue) => liftToTop(newValue, 10)}
                          numCheckers={numCheckers[9]}
                          inputStyle={styles.pointBUp}
                          isTop={false}/>
                        <Point 
                          liftValue={(newValue) => liftToTop(newValue, 9)}
                          numCheckers={numCheckers[8]}
                          inputStyle={styles.pointAUp}
                          isTop={false}/>
                        <Point 
                          liftValue={(newValue) => liftToTop(newValue, 8)}
                          numCheckers={numCheckers[7]}
                          inputStyle={styles.pointBUp}
                          isTop={false}/>
                        <Point 
                          liftValue={(newValue) => liftToTop(newValue, 7)}
                          numCheckers={numCheckers[6]}
                          inputStyle={styles.pointAUp}
                          isTop={false}/>
                </View>
                <View style={styles.bar}>
                  <Text style={styles.pipCount}>
                    {""}
                  </Text>
                  <Text style={styles.pipCount}>
                    {bottomPipCount}
                  </Text>
                </View>
                <View style={styles.surface}>
                        <Point 
                          liftValue={(newValue) => liftToTop(newValue, 19)}
                          numCheckers={numCheckers[18]}
                          inputStyle={styles.pointADown}
                          isTop={true}/>
                        <Point 
                          liftValue={(newValue) => liftToTop(newValue, 20)}
                          numCheckers={numCheckers[19]}
                          inputStyle={styles.pointBDown}
                          isTop={true}/>
                        <Point 
                          liftValue={(newValue) => liftToTop(newValue, 21)}
                          numCheckers={numCheckers[20]}
                          inputStyle={styles.pointADown}
                          isTop={true}/>
                        <Point 
                          liftValue={(newValue) => liftToTop(newValue, 22)}
                          numCheckers={numCheckers[21]}
                          inputStyle={styles.pointBDown}
                          isTop={true}/>
                        <Point 
                          liftValue={(newValue) => liftToTop(newValue, 23)}
                          numCheckers={numCheckers[22]}
                          inputStyle={styles.pointADown}
                          isTop={true}/>
                        <Point 
                          liftValue={(newValue) => liftToTop(newValue, 24)}
                          numCheckers={numCheckers[23]}
                          inputStyle={styles.pointBDown}
                          isTop={true}/>
                        <Point 
                          liftValue={(newValue) => liftToTop(newValue, 6)}
                          numCheckers={numCheckers[5]}
                          inputStyle={styles.pointBUp}
                          isTop={false}/>
                        <Point 
                          liftValue={(newValue) => liftToTop(newValue, 5)}
                          numCheckers={numCheckers[4]}
                          inputStyle={styles.pointAUp}
                          isTop={false}/>
                        <Point 
                          liftValue={(newValue) => liftToTop(newValue, 4)}
                          numCheckers={numCheckers[3]}
                          inputStyle={styles.pointBUp}
                          isTop={false}/>
                        <Point 
                          liftValue={(newValue) => liftToTop(newValue, 3)}
                          numCheckers={numCheckers[2]}
                          inputStyle={styles.pointAUp}
                          isTop={false}/>
                        <Point 
                          liftValue={(newValue) => liftToTop(newValue, 2)}
                          numCheckers={numCheckers[1]}
                          inputStyle={styles.pointBUp}
                          isTop={false}/>
                        <Point 
                          liftValue={(newValue) => liftToTop(newValue, 1)}
                          numCheckers={numCheckers[0]}
                          inputStyle={styles.pointAUp}
                          isTop={false}/>
                </View>
            </View>
        </View>
    )
}


const stylesFunc = (height) => StyleSheet.create({
  point : {
    width: '100%',
    aspectRatio: 1,
  },
  container: {
    flex: 1,
    gap: 100,
    backgroundColor: 'dodgerblue',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingLeft: 50,
  },
  customText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Arial',
  },
  checkerText: {
    color: 'black',
    fontSize: 12,
    fontFamily: 'Arial',
  },
  pipCount: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Arial',
    fontWeight: 'bold'
  },
  board : {
    height: '90%',
    aspectRatio: 1.376,
    backgroundColor: 'red',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: height * 0.003,
    alignItems: 'center',
  },
  surface: {
    height: '99%',
    width: '40%',
    backgroundColor: '#2a91e0', // Example color for the surface
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    alignContent: 'space-between',
  },
  bar: {
    height: '100%',
    width: '6%',
    backgroundColor: '#cc0000',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 0.01 * height
  },
  pointADown: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: height * 0.041, // Adjust size as needed
    borderRightWidth: height * 0.041, // Adjust size as needed
    borderTopWidth: height * 0.384, // Adjust size as needed
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#ffc919', // Color of the triangle
  },
  pointBDown: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: height * 0.041, // Adjust size as needed
    borderRightWidth: height * 0.041, // Adjust size as needed
    borderTopWidth: height * 0.384, // Adjust size as needed
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#f57231', // Color of the triangle
  },
  pointAUp: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: height * 0.041, // Adjust size as needed
    borderRightWidth: height * 0.041, // Adjust size as needed
    borderBottomWidth: height * 0.384, // Adjust size as needed
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#ffc919', // Color of the triangle
  },
  pointBUp: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: height * 0.041, // Adjust size as needed
    borderRightWidth: height * 0.041, // Adjust size as needed
    borderBottomWidth: height * 0.384, // Adjust size as needed
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#f57231', // Color of the triangle
  },
  NWtray: {
    position: 'absolute',
    width: 0.074 * height,
    height: 0.384 * height,
    backgroundColor: trayCol,
    top: 0.0045 * height,
    left: 0.0045 * height,
  },
  SWtray: {
    position: 'absolute',
    width: 0.074 * height,
    height: 0.384 * height,
    backgroundColor: trayCol,
    bottom: 0.0045 * height,
    left: 0.0045 * height,
    },
  NEtray: {
    position: 'absolute',
    width: 0.074 * height,
    height: 0.384 * height,
    backgroundColor: trayCol,
    top: 0.0045 * height,
    right: 0.0045 * height,
  },
  SEtray: {
    position: 'absolute',
    width: 0.074 * height,
    height: 0.384 * height,
    backgroundColor: trayCol,
    bottom: 0.0045 * height,
    right: 0.0045 * height,
    flexDirection: 'column-reverse',
    alignItems: 'center',
    paddingBottom: 0.005 * height,
  },
  stackedChecker: {
    width: '90%',
    height: '5%',
    backgroundColor: "crimson",
    borderWidth: 1,
  }, // Example color for the stacked checker}
  circle: {
        width: height * 0.08, // Adjust size as needed
        aspectRatio: 1,
        borderRadius: height * 0.04, // Half of the width/height
        backgroundColor: 'crimson', // Example color for the circle
        borderColor: 'black',
        borderWidth: 1,
        justifyContent: "center",
        alignItems: "center",
  },
  myContainerBottom: {
    flex: 1,
    top: height * 0.384,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexDirection: 'column-reverse',
  },
  myContainerTop: {
    flex: 1,
    bottom: height * 0.384,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexDirection: 'column-reverse',
  },
});

const styles = StyleSheet.create({
      circle: {
        width: 10,
        aspectRatio: 1,
        borderRadius: '%50', // Half of the width/height
        backgroundColor: 'blue',
      },
      myContainer: {
        flex: 1,
        backgroundColor: 'white',
      }
    });

export default BackgammonBoard;