// Component for the Setup Position screen of the app. Takes navigation as a prop.

import BackgammonBoard from "../views/BackgammonBoard";
import { StyleSheet, Text, View, TouchableOpacity, PboardStrsable } from 'react-native';
import React, { useState, useEffect, useSuspense } from 'react';
import Triangle from '@react-native-toolkit/triangle';
import { useWindowDimensions } from 'react-native';
import positions from '../assets/epc_positions.json'


export default function SetupPosition({ navigation }) {
  console.log("Hello");
  const [numCheckers, setNumCheckers] = useState(
      [0, 0, 0, 0, 0, 0,
       0, 0, 0, 0, 0, 0,
       0, 0, 0, 0, 0, 0,
       0, 0, 0, 0, 0, 0
      ]
    );
  const [EPCText, setEPCText] = useState("");
  const [VarianceText, setVarianceText] = useState("");
  const [MethodText, setMethodText] = useState("");
  const [BestimateText, setBestimateText] = useState("");
  const [DistributionText, setDistributionText] = useState("");
  const [FastimateText, setFastimateText] = useState("");

  function getNumHomeCheckers() {
    return 15 - numCheckers.reduce((acc, item) => acc + item, 0);
  }

  const updateArray = (newValue, index) => {
    const homeCheckers = getNumHomeCheckers();
    const checkers = numCheckers[index-1]
    console.log("home checkers", homeCheckers, "checkers", checkers);
    const setVal = (newValue === 5 && numCheckers[index-1] >= 5)
      ? Math.min(checkers + 1, checkers + homeCheckers)
      : Math.min(newValue, checkers + homeCheckers)
    console.log("setval", setVal, newValue);
    const newNumCheckers = numCheckers.map((value, i) => index === i+1 ? setVal : value)
    setNumCheckers(newNumCheckers);
    console.log('Updated numCheckers:', numCheckers, newNumCheckers);
  };

  const resetBoard = () => {
        setNumCheckers(new Array(24).fill(0));
    }

  const { height } = useWindowDimensions();
  const styles = stylesFunc(height);

  const modifyTexts = (boardStr, isValid) => {
    console.log("BOARD", positions[boardStr], boardStr, isValid);
    try {
      setEPCText(positions[boardStr].EPC);
      setVarianceText(positions[boardStr].VARIANCE);
      setMethodText(positions[boardStr].METHOD);
      setBestimateText(positions[boardStr].BESTIMATE >= 0 ? positions[boardStr].BESTIMATE : "N/A");
      setDistributionText(positions[boardStr].DESCRIPTION);
      setFastimateText(positions[boardStr].FASTIMATE >= 0 ? positions[boardStr].FASTIMATE : "N/A");
    } catch (error) {
      setEPCText("N/A");
      setVarianceText("N/A");
      setMethodText("N/A");
      setBestimateText("N/A");
      setDistributionText("N/A");
      setFastimateText("N/A");
    }
  }

  // runs when the user taps on the board
  const handleBoardTap = () => {
      console.log("Start checkers changed", numCheckers);
      const homeCheckers = getNumHomeCheckers();
      const hexNumCheckers = numCheckers.map(value => value.toString(16)).reverse();
      const fullBoardStr = (hexNumCheckers.join('') + homeCheckers.toString(16)).toUpperCase();
      console.log(fullBoardStr);
      const boardStr = fullBoardStr.slice(-7);

      for (let i = 0; i < 18; i++) {
        if (fullBoardStr[i] !== '0') {
          modifyTexts(boardStr, false);
          break;
        }
        if (i == 17) modifyTexts(boardStr, true);
      }
    };

    return (
        <View style={styles.setupPositionStyle}>
          <BackgammonBoard 
            liftToTop={(newValue, i) => updateArray(newValue, i)}
            numCheckers={numCheckers}
            onCallParentFunction={handleBoardTap}/>

          <View style={styles.sidePanel}>

            {[
              { label: "Actual EPC", value: EPCText },
              { label: "Variance", value: VarianceText },
              { label: "Method", value: MethodText },
              { label: "Bestimate", value: BestimateText },
              { label: "Fastimate", value: FastimateText },
            ].map((item, index) => (
              <View key={index} style={styles.statsContainer}>
                <View style={styles.leftStatsContainer}>
                  <Text style={styles.leftStatsText}>{item.label}</Text>
                </View>
                <View style={styles.rightStatsContainer}>
                  <Text style={styles.rightStatsText}>{item.value}</Text>
                </View>
              </View>
            ))}
            <TouchableOpacity style={styles.resetButton} onPress={() => resetBoard()}>
                <Text style={styles.resetText}>
                    { "Reset" }
                </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.homeText}>
                { "Home" }
            </Text>
          </TouchableOpacity>
        </View>
    )
}

const stylesFunc = (height) => StyleSheet.create({
      circle: {
        width: '%100',
        aspectRatio: 1,
        borderRadius: '%50', // Half of the width/height
        backgroundColor: 'blue',
      },
      myContainer: {
        width: '50%',
        height: '50%', 
        backgroundColor: 'red',
        alignSelf : "center"
      },
      statsContainer: {
        height : 0.075 * height,
        width : 0.6 * height,
        backgroundColor : 'dodgerblue',
        flexDirection : 'row',
      },
      insideStatsContainer : {
        backgroundColor : "white",
        flex : 1,
      },
      customText: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
        fontFamily: 'Arial',
        textAlign : 'center',

      },
      leftStatsContainer: {
        flex : 1,
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
        flex : 1,
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
      setupPositionStyle : {
        flex : 1,
        flexDirection : "row",
        justifyContent : "space-between",
        alignItems : "center", 
        backgroundColor : "dodgerblue",
        paddingLeft : 0.075 * height,
      },
      sidePanel : {
        height : height,
        width : 0.7 * height,
        marginRight : 0.08 * height,
        flexDirection : "column",
        justifyContent : "space-evenly",
        alignItems : "center",
        backgroundColor : "dodgerblue",
    },
      evalButton : {
        height : 0.1 * height,
        width : 0.3 * height,
        backgroundColor : 'blue',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius : 0.03 * height
      },
      homeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
        fontFamily: 'Arial',
        textAlign: 'center',
      },
      resetText: {
          color: 'white',
          fontSize: 18,
          fontWeight: 'bold',
          fontFamily: 'Arial',
          borderRadius : 0.08 * height,
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
      resetButton: {
          height : 0.075 * height,
          width : 0.6 * height,
          backgroundColor : 'red',
          flexDirection : 'row',
          justifyContent: 'center',
          textAlign: 'center',
          borderRadius: 0.02 * height,
      }
    });