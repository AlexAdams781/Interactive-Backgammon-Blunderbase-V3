// Component for the Setup Position screen of the app. Takes navigation as a prop.

import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import positions from '../assets/epc_positions.json';
import BackgammonBoard from "../views/BackgammonBoard";

export default function Two_Players({ navigation }) {
  console.log("Hello");
  const [checkersA, setcheckersA] = useState(
      [0, 0, 0, 0, 0, 0,
       0, 0, 0, 0, 0, 0,
       0, 0, 0, 0, 0, 0,
       0, 0, 0, 0, 0, 0
      ]
    );
  const [checkersB, setcheckersB] = useState(
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

  function getNumHomeCheckers(arr) {
    return 15 - arr.reduce((acc, item) => acc + item, 0);
  }

  const updateArray = (newValue, index, player) => {
    const isPlayerA = player === 'A';
    const currentArray = isPlayerA ? checkersA : checkersB;
    const otherArray = isPlayerA ? checkersB : checkersA;
    const setArray = isPlayerA ? setcheckersA : setcheckersB;
    const setOtherArray = isPlayerA ? setcheckersB : setcheckersA;

    const homeCheckers = getNumHomeCheckers(currentArray);
    const checkers = currentArray[index-1];
    console.log("home checkers", homeCheckers, "checkers", checkers, player, "player");
    const setVal = (newValue === 5 && checkers >= 5)
      ? Math.min(checkers + 1, checkers + homeCheckers)
      : Math.min(newValue, checkers + homeCheckers)
    console.log("setval", setVal, newValue);
    const newArray = currentArray.map((value, i) => index === i+1 ? setVal : value)
    const otherNewArray = otherArray.map((value, i) => index === i+1 ? 0 : value)
    setArray(newArray);
    setOtherArray(otherNewArray);
    console.log('Updated numCheckers:', currentArray, newArray);
  };

  const resetBoard = () => {
        setcheckersA(new Array(24).fill(0));
        setcheckersB(new Array(24).fill(0));
    }

  const { height } = useWindowDimensions();
  const styles = stylesFunc(height);

  const GridItem = ({ label, isVariable, isVariance, value, thin, style }) => (
  <View style={[styles.cell, thin ? styles.thinBorder : styles.defaultBorder, style]}>
    {isVariable ? (
      /* Apply the small style here if it's the Variance value */
      <Text style={[styles.input, isVariance && styles.labelTextSmall]}>
        {value}
      </Text>
    ) : (
      <Text style={isVariance ? styles.labelTextSmall : styles.labelText}>
        {label}
      </Text>
    )}
  </View>
);

  const [topEPC, setTopEPC] = useState("");
  const [topActEPC, setTopActEPC] = useState("");
  const [topVar, setTopVar] = useState("");
  const [botEPC, setBotEPC] = useState("");
  const [botActEPC, setBotActEPC] = useState("");
  const [botVar, setBotVar] = useState("");
  const [cubeDec, setCubeDec] = useState("");

  const modifyTexts = (topBoardStr, bottomBoardStr) => {
    console.log("BOARD", positions[topBoardStr], topBoardStr, bottomBoardStr);
    try {
      setTopActEPC(positions[topBoardStr].EPC);
      setTopEPC(positions[topBoardStr].BESTIMATE);
      setTopVar(positions[topBoardStr].VARIANCE);
    } catch (error) {
      setTopActEPC("N/A");
      setTopEPC("N/A");
      setTopVar("N/A");
      console.log("Error fetching top position data:", error, topBoardStr);
    }
    try {
      setBotActEPC(positions[bottomBoardStr].EPC);
      setBotEPC(positions[bottomBoardStr].BESTIMATE);
      setBotVar(positions[bottomBoardStr].VARIANCE);
    } catch (error) {
      setBotActEPC("N/A");
      setBotEPC("N/A");
      setBotVar("N/A");
      console.log("Error fetching bottom position data:", error, bottomBoardStr);
    }
  };

  // Quantify Variance
  const varianceScoreMap = new Map();
  varianceScoreMap.set("rollish", 0);
  varianceScoreMap.set("low", 1);
  varianceScoreMap.set("medium", 2);
  varianceScoreMap.set("high", 3);

  

  const getTakePoint = (EPC, varianceVal) => {
    if (EPC === "N/A" || varianceVal === "N/A") {
      return "N/A";
    }
    return EPC + 0.5 * varianceVal;
  };

  const calculateDecision = (bottomBoardStr, topBoardStr) => {
    const topPosition = positions[topBoardStr];
    const bottomPosition = positions[bottomBoardStr];

    if (!topPosition || !bottomPosition) {
      return "N/A";
    }

    const varianceScore = varianceScoreMap.get(positions[topBoardStr].VARIANCE) + varianceScoreMap.get(positions[bottomBoardStr].VARIANCE) - 3;

    const topEPC = topPosition.BESTIMATE;
    const bottomEPC = bottomPosition.BESTIMATE;
    const takePoint = getTakePoint(bottomEPC, varianceScore);

    console.log("Top EPC:", topEPC, "Bottom EPC:", bottomEPC, "Variance Score:", varianceScore, "Take Point:", takePoint);

    if (parseInt(topEPC) === -1 || parseInt(bottomEPC) === -1) {
      return "N/A";
    }

    if (topEPC > takePoint) {
      return "D/P";
    } else if (topEPC + 2.25 >= bottomEPC) {
      return "ReD/T";
    } else if (topEPC + 3 >= bottomEPC) {
      return "D/T";
    } else {
      return "ND";
    }
  };

  // runs when the user taps on the board
  const handleBoardTap = () => {
      const homeCheckersA = getNumHomeCheckers(checkersA);
      const hexNumCheckersA = checkersA.map(value => value.toString(16)).reverse();
      const fullBoardStrA = (hexNumCheckersA.join('') + homeCheckersA.toString(16)).toUpperCase();
      const boardStrA = fullBoardStrA.slice(-7);

      const homeCheckersB = getNumHomeCheckers(checkersB);
      const hexNumCheckersB = checkersB.map(value => value.toString(16));
      const fullBoardStrB = (hexNumCheckersB.join('') + homeCheckersB.toString(16)).toUpperCase();
      const boardStrB = fullBoardStrB.slice(-7);

      console.log("Looking up Player A Key:", boardStrA, "EPC", positions[boardStrA] ? positions[boardStrA].EPC : "N/A");
      console.log("Looking up Player B Key:", boardStrB, "EPC", positions[boardStrB] ? positions[boardStrB].EPC : "N/A");

      // Check if these keys actually exist in your JSON
      console.log("Does A exist?", !!positions[boardStrA]);
      console.log("Does B exist?", !!positions[boardStrB]);

      modifyTexts(boardStrA, boardStrB, true);
      modifyTexts(boardStrB, boardStrA, false);
      setCubeDec(calculateDecision(boardStrA, boardStrB));
    };

    return (
        <View style={styles.setupPositionStyle}>
          <BackgammonBoard 
            liftToTop={(newValue, i, player) => updateArray(newValue, i, player)}
            checkersA={checkersA}
            checkersB={checkersB}
            onCallParentFunction={handleBoardTap}
            isInteractive={true}/>

          <View style={styles.container}>
            {/* 2x3 Grid One - Thick Blue Border */}
            <Text style={[styles.header, { color: 'green' }]}></Text>
            <View style={[styles.grid, styles.thickBorderTop]}>
              {['Estimated EPC', topEPC, 'Actual EPC', topActEPC, 'Variance', topVar].map((item, i) => (
                <GridItem 
                  key={`grid1-${i}`} 
                  label={item} 
                  isVariable={i % 2 !== 0} 
                  isVariance={i === 5 ? true : false}
                  value={item == "-1.0" ? "N/A" : item}
                  style={{ 
                    width: i % 2 === 0 ? '60%' : '40%',
                    backgroundColor: Math.floor((i + 1) / 2) % 2 === 0 ? 'lightgray' : 'pink',
                    borderTopLeftRadius: i === 0 ? 0.01 * height : 0,
                    borderTopRightRadius: i === 1 ? 0.01 * height : 0,
                    borderBottomLeftRadius: i === 4 ? 0.01 * height : 0,
                    borderBottomRightRadius: i === 5 ? 0.01 * height : 0,
                  }}
                />
              ))}
            </View>

            {/* 2x3 Grid Two - Thick Red Border */}
            <Text style={[styles.header, { color: 'crimson' }]}></Text>
            <View style={[styles.grid, styles.thickBorderBottom]}>
              {['Estimated EPC', botEPC, 'Actual EPC', botActEPC, 'Variance', botVar].map((item, i) => (
                <GridItem 
                  key={`grid2-${i}`} 
                  label={item} 
                  isVariable={i % 2 !== 0}
                  isVariance={i === 5 ? true : false}
                  value={item == "-1.0" ? "N/A" : item}
                  style={{ 
                    width: i % 2 === 0 ? '60%' : '40%',
                    backgroundColor: Math.floor((i + 1) / 2) % 2 === 0 ? 'lightgray' : 'pink',
                    borderTopLeftRadius: i === 0 ? 0.01 * height : 0,
                    borderTopRightRadius: i === 1 ? 0.01 * height : 0,
                    borderBottomLeftRadius: i === 4 ? 0.01 * height : 0,
                    borderBottomRightRadius: i === 5 ? 0.01 * height : 0,
                  }}
                />
              ))}
            </View>

            {/* 1x2 Grid - Thin Black Border */}
            <Text style={styles.header}></Text>
            <View style={[styles.grid, styles.thickBlackBorder, { height: 'auto' }]}>
              {['Money Decision', cubeDec].map((item, i) => (
                <GridItem 
                  key={`grid3-${i}`}
                  label={item}
                  isVariable={i % 2 !== 0}
                  isVariance={i === 5 ? true : false}
                  value={item === "N/A" ? "N/A" : item}
                  style={{ 
                    width: i % 2 === 0 ? '60%' : '40%',
                    // Manually set this height to match whatever height GridItem uses in the 2x3 grids
                    height: 40,
                    backgroundColor: i % 2 === 0 ? 'lightgray' : 'pink',
                    borderBottomLeftRadius: i % 2 === 0 ? 0.01 * height : 0,
                    borderTopLeftRadius: i % 2 === 0 ? 0.01 * height : 0,
                    borderBottomRightRadius: i % 2 !== 0 ? 0.01 * height : 0,
                    borderTopRightRadius: i % 2 !== 0 ? 0.01 * height : 0,
                  }}
                />
              ))}
            </View>
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
      container: { 
        width: '30%',
        height: '85%',
        paddingRight: 30, // Added padding for status bar area
        paddingTop: 10,
        paddingHorizontal: 20,
        paddingVertical: 20,
        backgroundColor: 'dodgerblue',
        alignItems: 'center',
        justifyContent: 'center',
      },
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
        paddingRight : 0.075 * height,
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
      },
      header: { 
        fontSize: 12, 
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 5,
      },
      grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        },
      cell: {
        width: '50%',
        height: '33.33%',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 5,
        overflow: 'hidden',
      },
      defaultBorder: { 
        borderBottomWidth: 1, 
        borderRightWidth: 1, 
        borderColor: '#ccc' 
      },
      thinBorder: { 
        borderBottomWidth: 1, 
        borderRightWidth: 1, 
        borderColor: 
        '#000',
        borderRadius: 0.02 * height,
      },
      thickBorderTop: { 
        borderWidth: 4, 
        borderColor: 'green',
        height: 100,
        borderRadius: 0.02 * height,
      },
      thickBorderBottom: { 
        borderWidth: 4, 
        borderColor: 'crimson',
        height: 100,
        borderRadius: 0.02 * height,
      },
      thickBlackBorder: { 
        borderWidth: 4, 
        borderColor: '#000' ,
        height: 40,
        borderRadius: 0.02 * height,
      },
      labelText: { 
        fontSize: 12,
        fontWeight: 'bold',
        color: '#333' 
      },
      labelTextSmall: { 
        fontSize: 10,
        color: '#333' 
      },
      width: '100%',
      textAlign: 'center',
      color: 'black',
      fontSize: 12,
      fontWeight: 'bold',
      paddingVertical: 0,
      textAlignVertical: 'center',
      });