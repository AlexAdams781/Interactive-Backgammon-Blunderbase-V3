// Component for the EPC_Quiz screen of the app. Takes navigation as a prop. Still in development.

import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useContext, useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { GameContext } from '../app/GameContext';
import positions from '../assets/epc_positions.json';
import { carnivalTheme, themeMap } from '../assets/themes';
import BackgammonBoard from "../views/BackgammonBoard";

export default function Benjamin_Quiz({ route, navigation }) {
  const { soloCheckersCopy, setSoloCheckersCopy, pairCheckersCopy, setPairCheckersCopy, selectedTheme } = useContext(GameContext);
  const activeTheme = themeMap && themeMap.has(selectedTheme) 
    ? themeMap.get(selectedTheme) 
    : carnivalTheme;

  const [checkersA, setCheckersA] = useState(
      [0, 0, 0, 0, 0, 0,
       0, 0, 0, 0, 0, 0,
       0, 0, 0, 0, 0, 0,
       0, 0, 0, 0, 0, 0
      ]
    );
  const [checkersB, setCheckersB] = useState(
      [0, 0, 0, 0, 0, 0,
       0, 0, 0, 0, 0, 0,
       0, 0, 0, 0, 0, 0,
       0, 0, 0, 0, 0, 0
      ]
    );

  const [quizStats, setQuizStats] = useState([
  { value: "", color: "white" },
  { value: "", color: "green" },
  { value: "", color: "white" },
  { value: "", color: "green" },
  { value: "", color: "white" },
  { value: "", color: "green" },
  { value: "", color: "white" },
  { value: "", color: "green" },
  { value: "", color: "white" },
  { value: "", color: "green" },
  ]);

  // Quantify Variance
  const varianceScoreMap = new Map();
  varianceScoreMap.set("rollish", 0);
  varianceScoreMap.set("low", 1);
  varianceScoreMap.set("medium", 2);
  varianceScoreMap.set("high", 3);

  const copyPosition = () => {
    setPairCheckersCopy([checkersA, checkersB]);
  };

  const updateStatValue = (index, newValue, newColor) => {
  setQuizStats(prevStats => {
    // 1. Create a shallow copy of the array
    const newStats = [...prevStats];

    // 2. Replace the specific object with a updated version
    newStats[index] = { 
      ...newStats[index], 
      value: newValue, 
      color: newColor 
    };

    // 3. Return the new array to update state
    return newStats;
  });
};

  const { settings } = route.params;
  const numPositions = 10;
  const [quizArray, setQuizArray] = useState([new Array(numPositions).fill(0), new Array(numPositions).fill(0), new Array(numPositions).fill(0)]); // 2D array to store the quiz positions for top and bottom
  const [answerArray, setAnswerArray] = useState(new Array(numPositions).fill(""));

  const checkSettings = (descr) => {
    if (descr === "MCG") return settings.isMCG || settings.isFastimate || settings.isAll;
    if (descr === "Fastimate") return settings.isFastimate || settings.isMCG || settings.isAll;
    if (descr === "NNM") return settings.isNNM || settings.isAll;
    if (descr === "CYM") return settings.isCYM || settings.isAll;
    if (descr === "MM8") return settings.isMM8 || settings.isAll;
    return false;
  };

  const { width, height } = useWindowDimensions();
  const styles = stylesFunc(height, width, activeTheme);

  const [isDouble, setIsDouble] = useState(false);
  const [myDecision, setMyDecision] = useState("");
  const [randomTopEntry, setRandomTopEntry] = useState(null);
  const [randomBottomEntry, setRandomBottomEntry] = useState(null);
  const [seconds, setSeconds] = useState(0);
  const [positionCount, setPositionCount] = useState(1);
  const [trueDecision, setTrueDecision] = useState("");

  const [inaccuracyCount, setInaccuracyCount] = useState(0.0);
  const [topMethod, setTopMethod] = useState("");
  const [bottomMethod, setBottomMethod] = useState("");
  const [estimate, setEstimate] = useState(0.0);

  const [isPaused, setIsPaused] = useState(false);
  const [isRewinding, setIsRewinding] = useState(false);
  const [rewindPosition, setRewindPosition] = useState(0);

  useEffect(() => {
    selectRandomEntry("");
  }, []);
/*
  useEffect(() => {
    console.log("Value changed to", value);
    const updatedAnswerArray = [...answerArray];
    updatedAnswerArray[positionCount - 1] = value;
    setAnswerArray(updatedAnswerArray);
    console.log("Updated answer array", updatedAnswerArray);
  }, [value]); */

  useEffect(() => {
    //console.log("tic");
    // 1. Create the interval when the component mounts
    const timer = setInterval(() => {
      //console.log("toc", isPaused, isRewinding, seconds);
      if (!isPaused && !isRewinding) {
        setSeconds(prevSeconds => prevSeconds + 1);
      }
    }, 1000);

    // 2. IMPORTANT: Clean up the interval when the user leaves the screen
    // This prevents memory leaks and the timer running in the background.
    return () => clearInterval(timer);
  }, [isPaused, isRewinding]);

  useFocusEffect(
    useCallback(() => {
      // 1. This code runs when the screen is focused
      console.log('Screen entered: Resetting variables...');
      setPositionCount(1);
      for (let i = 0; i < quizStats.length; i++) {
        updateStatValue(i, "", "orange");
      }

      // Return a cleanup function if needed when leaving
      return () => {
        console.log('Screen blurred/left');
      };
    }, []) // Dependency array for the callback
  );

  const getTakePoint = (EPC, varianceVal) => {
    if (EPC === "N/A" || varianceVal === "N/A") {
      return "N/A";
    }
    return EPC + 0.5 * varianceVal;
  };

  const isCloseRace = (entryBottom, entryTop) => {
    // Implementation for checking if two entries are close in race
    console.log("Comparing entries", entryBottom, entryTop);
    const estimateBottom = parseFloat(entryBottom.BESTIMATE);
    const estimateTop = parseFloat(entryTop.BESTIMATE);
    const varianceVal = varianceScoreMap.get(entryBottom.VARIANCE) + varianceScoreMap.get(entryTop.VARIANCE) - 3;
    const takePoint = getTakePoint(entryBottom.BESTIMATE, varianceVal);
    if (estimateBottom - 5 >= takePoint) {
      return "No";
    } else if (estimateTop >= takePoint) {
      return "D/P";
    } else if (estimateTop + 2.25 >= estimateBottom) {
      return "D/T";
    } else if (estimateTop + 3 >= estimateBottom) {
      return "D/T";
    } else if (estimateTop + 8 >= estimateBottom) {
      return "ND";
    } else {
      return "No";
    };
  };

  const handleButton1Press = () => {
    console.log("Button 1 pressed. isDouble:", isDouble);
    if (!isDouble) {
      setIsDouble(true);
    } else {
      setMyDecision("D/T");
      selectRandomEntry("D/T");
    }
  };

  const handleButton2Press = () => {
    console.log("Button 2 pressed. isDouble:", isDouble);
    if (isDouble) {
      setMyDecision("D/P");
      selectRandomEntry("D/P");
    } else {
      setMyDecision("ND");
      selectRandomEntry("ND");
    }
  };

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const positionsArray = Object.entries(positions); //

  const filteredArray = positionsArray.filter(([key, position]) => {
    if (position.METHOD == "NNM" || position.METHOD == "CYM") {
      return checkSettings(position.METHOD); // not enough data for these methods
    }
    return checkSettings(position.METHOD) && position.IS_COMMON_POSITION === "yes";
  });

  const filteredPositions = Object.fromEntries(filteredArray); //
  const keys = Object.keys(filteredPositions);


  const revisitPosition = (index) => {
    console.log("positions", index);
    console.log("answer array", answerArray, "position count", positionCount);
    setIsRewinding(true);
    setRewindPosition(index);
    const [nextKeyTop, nextKeyBottom] = quizArray[index];
    const answer = quizStats[index].value;

    // Update Board State
    const updatedCheckersA = [...checkersA];
    const updatedCheckersB = [...checkersB];
    for (let i = 0; i < 6; i++) {
      updatedCheckersA[5-i] = parseInt(nextKeyBottom[i], 16);
    }
    for (let i = 0; i < 6; i++) {
      updatedCheckersB[i+18] = parseInt(nextKeyTop[i], 16);
    }
    setCheckersA(updatedCheckersA);
    setCheckersB(updatedCheckersB);
  }

  const selectRandomEntry = (myDecision) => {
  // Use the current index (0-indexed) for all logic in this turn
  const currentIndex = positionCount - 1;
  console.log("ARRAYS", answerArray, quizArray, currentIndex, "my decision", myDecision, "true decision", trueDecision);

  // 1. EVALUATE PREVIOUS ANSWER (if not the very first move)
  if (randomBottomEntry) {
    const estimateValueBottom = parseFloat(randomBottomEntry.BESTIMATE);
    const estimateValueTop = parseFloat(randomTopEntry.BESTIMATE);
    
    updateStatValue(
      currentIndex, 
      (myDecision == trueDecision) ? "" : trueDecision,
      (myDecision == trueDecision || (myDecision == "D/T" && trueDecision == "ReD/T")) ? "green" : "red"
    );

    // Update answer array:
    const updatedAnswerArray = [...answerArray];
    updatedAnswerArray[currentIndex] = myDecision;
    setAnswerArray(updatedAnswerArray);
    console.log("Updated answer array", updatedAnswerArray, "with my decision", myDecision, "and true decision", trueDecision, "current index", currentIndex);
  }

  // 2. CHECK FINISH CONDITION
  if (positionCount >= numPositions) {
    navigation.navigate('EPC_Quiz_Results', { 
      settings,
      inaccuracy: inaccuracyCount,
      time: seconds,
      correct: quizStats.filter(stat => stat.color === "green").length,
      mistake: quizStats.filter(stat => stat.color === "yellow").length,
      count: numPositions,
      mode: "Benjamin Count",
    });
    return; // Stop execution
  }

  let nextKeyBottom, nextKeyTop, nextEntryBottom, nextEntryTop;

  // 3. GENERATE NEXT POSITION
  while (true) {
    const _nextKeyBottom = keys[Math.floor(Math.random() * keys.length)];
    const _nextKeyTop = keys[Math.floor(Math.random() * keys.length)];
    const _nextEntryBottom = filteredPositions[_nextKeyBottom];
    const _nextEntryTop = filteredPositions[_nextKeyTop];

    if (isCloseRace(_nextEntryBottom, _nextEntryTop) != "No") {
      nextKeyBottom = _nextKeyBottom;
      nextKeyTop = _nextKeyTop;
      nextEntryBottom = _nextEntryBottom;
      nextEntryTop = _nextEntryTop;
      break;
    }
  }
  
  setRandomTopEntry({ key: nextKeyTop, ...nextEntryTop });
  setRandomBottomEntry({ key: nextKeyBottom, ...nextEntryBottom });
  //setMyDecision(""); // Clear my decision for next round
  setTrueDecision(isCloseRace(nextEntryBottom, nextEntryTop)); // Set the true decision for this position
  setIsDouble(false); // Reset double state for next round
  const updatedQuizArray = [...quizArray];
  if (!randomTopEntry) {
    updatedQuizArray[0] = [nextKeyTop, nextKeyBottom, isCloseRace(nextEntryBottom, nextEntryTop)];
  } else {
    updatedQuizArray[currentIndex+1] = [nextKeyTop, nextKeyBottom, isCloseRace(nextEntryBottom, nextEntryTop)];
  }
  setQuizArray(updatedQuizArray);
  console.log("updated quiz array", updatedQuizArray);

  // Update Board State
  const updatedCheckersA = [...checkersA];
  const updatedCheckersB = [...checkersB];
  for (let i = 0; i < 6; i++) {
    updatedCheckersA[5-i] = parseInt(nextKeyBottom[i], 16);
  }
  for (let i = 0; i < 6; i++) {
    updatedCheckersB[i+18] = parseInt(nextKeyTop[i], 16);
  }
  setCheckersA(updatedCheckersA);
  setCheckersB(updatedCheckersB);

  // Finally, increment the counter for the UI
  setPositionCount(prev => prev + 1);
};

  return (
    <View style={styles.setupPositionStyle}>
      <View style={styles.backgammonBoardWrapper}>
        <BackgammonBoard
          liftToTop={(newValue, i) => {}}
          checkersA={checkersA}
          checkersB={checkersB}
          onCallParentFunction={() => {}}
          isInteractive={false}/>
      </View>
      <View style={styles.sidePanel}>
        <View style={[styles.decisionPanel, isRewinding ? { opacity : 0.0 } : { opacity : 1.0 }]}>
          <TouchableOpacity style={styles.decisionButton} onPress={() => handleButton1Press()}>
            <Text style={styles.decisionButtonText}>{ isDouble ? "Take" : "Double" }</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.decisionButton} onPress={() => handleButton2Press()}>
            <Text style={styles.decisionButtonText}>{ isDouble ? "Pass" : "Roll" }</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.resultsPanel}>
          {quizStats.map((item, index) => (
            <TouchableOpacity key={index} style={statsContainer(index >= positionCount ? 'orange' : item.color)} onPress={() => { revisitPosition(index); }}>
              <Text style={{color: 'black', fontSize: 12, fontWeight: 'bold', fontFamily: 'Arial', textAlign: 'center'}}>
                {index > positionCount ? "" : item.value}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <TouchableOpacity style={[styles.pauseButton, isRewinding ? { display: 'none' } : { display: 'flex' }]} onPress={() => setIsPaused(true)}>
        <Text style={styles.customText}>
            { "Pause" }
        </Text>
      </TouchableOpacity>
      <View style={[styles.infoScreen, isRewinding ? { display: 'none' } : { display: 'flex' }]}>
        <View style={styles.infoSubscreenTop}>
          <Text style={styles.infoText}> {positionCount} / {numPositions}
          </Text>
        </View>
        <View style={styles.infoSubscreenMiddle}>
          <Text style={styles.infoText}> {formatTime(seconds)}
          </Text>
        </View>
      </View>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Home')}>
        <Text style={styles.homeText}>
            { "Home" }
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.copyButton} onPress={() => copyPosition()}>
        <Text style={styles.homeText}>
            { "Copy" }
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.resume, isPaused ? { backgroundColor: 'rgba(240, 240, 240, 1.0)' } : { backgroundColor: 'transparent', pointerEvents: 'none' }]} 
      activeOpacity={1} onPress={() => setIsPaused(false)}>
        <Text style={styles.resumeText}>
            { isPaused ? "Paused" : ""}
        </Text>
        <Text style={styles.resumeSubText}>
            { isPaused ? "Tap to Resume" : ""}
        </Text>
      </TouchableOpacity>
      <View style={[styles.reviewPanel, isRewinding ? { display : 'flex' } : { display: 'none' }]}>
        <View style={styles.upperReviewPanel}>
          <Text style={styles.infoText}>
            { isRewinding ? `Method: ${positions[quizArray[rewindPosition][0]]?.METHOD} / ${positions[quizArray[rewindPosition][1]]?.METHOD}` : ""}
          </Text>
        </View>
        <View style={styles.middleReviewPanel1}>
          <Text style={styles.infoText}>
            { isRewinding ? `Variance Score: ${varianceScoreMap.get(positions[quizArray[rewindPosition][0]]?.VARIANCE) + varianceScoreMap.get(positions[quizArray[rewindPosition][1]]?.VARIANCE)}` : ""}
          </Text>
        </View>
        <View style={styles.middleReviewPanel2}>
          <Text style={styles.infoText}>
            { isRewinding ? "My guess: " + answerArray[rewindPosition] : ""}
          </Text>
        </View>
        <View style={styles.lowerReviewPanel}>
          <Text style={styles.infoText}>
            { isRewinding ? "Correct: " + quizArray[rewindPosition][2] : ""}
          </Text>
        </View>
      </View>
      <TouchableOpacity style={[styles.resumeButton, isRewinding ? { display: 'flex' } : { display: 'none' }]} 
          onPress={() => {
            setIsRewinding(false);
            if (randomBottomEntry) {
              const updatedCheckersA = [...checkersA];
              for (let i = 0; i < 6; i++) {
                updatedCheckersA[5-i] = parseInt(randomBottomEntry.key[i], 16);
              }
              setCheckersA(updatedCheckersA);
              const updatedCheckersB = [...checkersB];
              for (let i = 0; i < 6; i++) {
                updatedCheckersB[i+18] = parseInt(randomTopEntry.key[i], 16);
              }
              setCheckersB(updatedCheckersB);
            }
          }}>
        <Text style={styles.resumeButtonText}>
            { "Resume" }
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const statsContainer = (bgColor) => ({
  backgroundColor: bgColor,
  padding: 5,
  borderRadius: 5,
  margin: 1,
  minWidth: 30,
  alignItems: 'center',
});

const stylesFunc = (height, width, theme) => StyleSheet.create({
  container: {
    flex: 1,
    gap: 20,
    backgroundColor: theme?.backgroundColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customText: {
    color: theme?.buttonTextCol,
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Arial',
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
  pauseButton: {
    backgroundColor: theme?.buttonCol,
    borderRadius: 0.01 * height,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0.12 * height,
    left: 0.66 * width,
    height: '8%',
    width: '12%',
  },
  copyButton: {
    backgroundColor: theme?.buttonCol,
    borderRadius: 0.01 * height,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0.20 * height,
    left: 0.055 * height,
    height: 0.07 * height,
    width: 0.09 * height
  },
  resume: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: height,
    width: width,
    justifyContent: 'center',
    alignContent: 'center',
  },
  resumeText: {
    color: 'black',
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Arial',
    textAlign: 'center',
  },
  resumeSubText: {
    color: 'black',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Arial',
    textAlign: 'center',
  },
  decisionButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Arial',
    textAlign: 'center',
  },
  keypadWrapper: {
    height: '30%',  // Give it a fixed height
    width: '50%',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 0.1 * height,
    marginLeft: 0.25 * height,
  },
  infoScreen: {
    height: '40%',
    width: '12%',
    position: 'absolute',
    top: 0.22 * height,
    left: 0.66 * width,
    backgroundColor: 'lightgray',
    flexDirection: 'column',
    borderColor: 'black',
    borderWidth: 2,
  },
  infoSubscreenTop: {
    flex: 1,
    backgroundColor: 'lightgray',
    alignContent: 'center',
    justifyContent: 'center',
  },
  infoSubscreenMiddle: {
    flex: 1,
    backgroundColor: 'pink',
    alignContent: 'center',
    justifyContent: 'center',
  },
  infoSubscreenBottom: {
    flex: 1,
    backgroundColor: 'lightgray',
    alignContent: 'center',
    justifyContent: 'center',
  },
  backgammonBoardWrapper: {
    height: height,  // Give it a fixed height
    width: height * 0.9, 
    alignSelf: 'center',
  },
  setupPositionStyle : {
    flex : 1,
    flexDirection : "row",
    justifyContent : "space-between",
    alignItems : "center", 
    backgroundColor : theme?.backgroundColor,
    paddingLeft : 0.075 * height,
  },
  sidePanel : {
    height : '90%',
    width : 0.7 * height,
    marginRight : 0.08 * height,
    marginTop : 0.05 * height,
    flexDirection : "column",
    justifyContent : "space-evenly",
    alignItems : "flex-end",
    backgroundColor : theme?.backgroundColor,
},
  decisionPanel: {
    height: '40%',
    width: '60%',
    marginTop: 0.05 * height,
    backgroundColor: theme?.backgroundColor,
    justifyContent: 'flex-end',
    alignItems: 'center',
    flexDirection: 'column',
  },
  decisionButton: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    borderWidth: 3,
    borderColor: 'black',
    margin: 5,
    width: '60%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultsPanel: {
    height: '27%',
    width: '80%',
    backgroundColor: theme?.resultsBorderCol,
    marginRight: 0.03 * height,
    marginTop: height * 0.15,
    flexDirection: 'row',
    flexWrap: 'wrap', // Allows items to drop to the next line
    gap: 10, // Adds consistent spacing between rows and columns
    justifyContent: 'center',
    alignContent: 'center',
    borderRadius: 10,
  },
  infoText: {
    color: 'black',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Arial',
    textAlign: 'center',
  },
  reviewPanel: {
    height: '36%',
    width: '24%',
    position: 'absolute',
    top: '10%',
    left: '73.5%',
    flexDirection: 'column',
    borderWidth: 3,
    borderRadius: 10,
  },
  upperReviewPanel: {
    flex: 1,
    backgroundColor: 'lightgray',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  middleReviewPanel1: {
    flex: 1,
    backgroundColor: 'pink',
    justifyContent: 'center',
    alignItems: 'center',
  },
  middleReviewPanel2: {
    flex: 1,
    backgroundColor: 'lightgray',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lowerReviewPanel: {
    flex: 1,
    backgroundColor: 'pink',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  resumeButton: {
    backgroundColor: theme?.buttonCol,
    padding: 10,
    borderRadius: 5,
    position: 'absolute',
    height: '8%',
    width: '12%',
    top: '58%',
    left: '79%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resumeButtonText: {
    color: theme?.buttonTextCol,
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Arial',
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
});