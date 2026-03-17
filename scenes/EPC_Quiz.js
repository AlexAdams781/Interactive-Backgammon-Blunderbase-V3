// Component for the EPC_Quiz screen of the app. Takes navigation as a prop. Still in development.

import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import positions from '../assets/epc_positions.json';
import BackgammonBoard from "../views/BackgammonBoard";
import Keypad from "../views/Keypad";

export default function EPC_Quiz({ route, navigation }) {
  const [numCheckers, setNumCheckers] = useState(
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
  const [quizArray, setQuizArray] = useState(new Array(numPositions).fill(0));
  const [answerArray, setAnswerArray] = useState(new Array(numPositions).fill(0));

  const checkSettings = (descr) => {
    if (descr === "MCG") return settings.isMCG || settings.isFastimate || settings.isAll;
    if (descr === "Fastimate") return settings.isFastimate || settings.isMCG || settings.isAll;
    if (descr === "NNM") return settings.isNNM || settings.isAll;
    if (descr === "CYM") return settings.isCYM || settings.isAll;
    if (descr === "MM8") return settings.isMM8 || settings.isAll;
    return false;
  };

  const { width, height } = useWindowDimensions();
  const styles = stylesFunc(height, width);

  const [value, setValue] = useState("");
  const [randomEntry, setRandomEntry] = useState(null);
  const [seconds, setSeconds] = useState(0);
  const [positionCount, setPositionCount] = useState(1);

  const [inaccuracyCount, setInaccuracyCount] = useState(0.0);
  const [method, setMethod] = useState("");
  const [estimate, setEstimate] = useState(0.0);

  const [isPaused, setIsPaused] = useState(false);
  const [isRewinding, setIsRewinding] = useState(false);
  const [rewindPosition, setRewindPosition] = useState(0);

  useEffect(() => {
    selectRandomEntry();
  }, []);

  useEffect(() => {
    console.log("Value changed to", value);
    const updatedAnswerArray = [...answerArray];
    updatedAnswerArray[positionCount - 1] = value;
    setAnswerArray(updatedAnswerArray);
  }, [value]);

  useEffect(() => {
    console.log("tic");
    // 1. Create the interval when the component mounts
    const timer = setInterval(() => {
      console.log("toc", isPaused, isRewinding, seconds);
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

      // 2. Optional: Return a cleanup function if needed when leaving
      return () => {
        console.log('Screen blurred/left');
      };
    }, []) // Dependency array for the callback
  );

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

  function getNumHomeCheckers() {
    return 15 - numCheckers.reduce((acc, item) => acc + item, 0);
  }

  const revisitPosition = (index) => {
    console.log("psotions", index);
    console.log("amswer array", answerArray)
    setIsRewinding(true);
    setRewindPosition(index);
    const boardStr = quizArray[index];
    const answer = quizStats[index].value;
    const updatedNumCheckers = [...numCheckers];
    for (let i = 0; i < 6; i++) {
        updatedNumCheckers[5-i] = parseInt(boardStr[i], 16);
    }
    setNumCheckers(updatedNumCheckers);
  }

  const selectRandomEntry = () => {
  // Use the current index (0-indexed) for all logic in this turn
  const currentIndex = positionCount - 1;
  console.log("ARRAYS", answerArray, quizArray, currentIndex);

  // 1. EVALUATE PREVIOUS ANSWER (if not the very first move)
  if (randomEntry) {
    const estimateValue = (method === "Fastimate") 
      ? parseFloat(randomEntry.FASTIMATE) 
      : parseFloat(randomEntry.BESTIMATE);
      
    const EPCDiff = Math.abs(parseFloat(value) - estimateValue);
    
    updateStatValue(
      currentIndex, 
      EPCDiff > 0.01 || Number.isNaN(EPCDiff) ? estimateValue.toFixed(1) : "", 
      EPCDiff <= 0.01 ? "green" : EPCDiff <= 1.0 ? "yellow" : "red"
    );

    setInaccuracyCount(prev => prev + (Number.isNaN(EPCDiff) ? 0 : EPCDiff));
  }

  // 2. CHECK FINISH CONDITION
  if (positionCount >= numPositions) {
    navigation.navigate('EPC_Quiz_Results', { 
      settings,
      inaccuracy: inaccuracyCount,
      time: seconds,
      correct: quizStats.filter(stat => stat.color === "green").length,
      mistake: quizStats.filter(stat => stat.color === "yellow").length,
      count: numPositions
    });
    return; // Stop execution
  }

  // 3. GENERATE NEXT POSITION
  const keys = Object.keys(filteredPositions);
  const nextKey = keys[Math.floor(Math.random() * keys.length)];
  const nextEntry = filteredPositions[nextKey];

  // Update Method and Board for the NEW position
  const nextMethod = (settings.isFastimate && !settings.isMCG) ? "Fastimate" :
                     (settings.isFastimate && settings.isMCG) ? (Math.random() < 0.5 ? "Fastimate" : "MCG") :
                     nextEntry?.METHOD;
  
  setMethod(nextMethod);
  setRandomEntry({ key: nextKey, ...nextEntry });
  setValue(""); // Clear keypad for next round
  const updatedQuizArray = [...quizArray];
  if (!randomEntry) {
    updatedQuizArray[0] = nextKey;
  } else {
    updatedQuizArray[currentIndex+1] = nextKey;
  }
  setQuizArray(updatedQuizArray);
  console.log("updated quiz array", updatedQuizArray);

  // Update Board State
  const updatedNumCheckers = [...numCheckers];
  for (let i = 0; i < 6; i++) {
    updatedNumCheckers[5-i] = parseInt(nextKey[i], 16);
  }
  setNumCheckers(updatedNumCheckers);

  // Finally, increment the counter for the UI
  setPositionCount(prev => prev + 1);
};

  return (
    <View style={styles.setupPositionStyle}>
      <View style={styles.backgammonBoardWrapper}>
        <BackgammonBoard
          liftToTop={(newValue, i) => {}}
          numCheckers={numCheckers}
          onCallParentFunction={() => {}}/>
      </View>
      <View style={styles.sidePanel}>
        <View style={[styles.keypadWrapper, isRewinding ? { opacity : 0.0 } : { opacity : 1.0 }]}>
          <Keypad value={value} setValue={setValue} isDisabled={isRewinding} onEnter={selectRandomEntry}/>
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
        <View style={styles.infoSubscreenBottom}>
          <Text style={styles.infoText}> {method ?? ""}
          </Text>
        </View>
      </View>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Home')}>
        <Text style={styles.homeText}>
            { "Home" }
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
            { isRewinding ? `Method: ${positions[quizArray[rewindPosition]]?.METHOD}` : ""}
          </Text>
        </View>
        <View style={styles.middleReviewPanel1}>
          <Text style={styles.infoText}>
            { isRewinding ? `My guess: ${answerArray[rewindPosition] ?? ""}` : ""}
          </Text>
        </View>
        <View style={styles.middleReviewPanel2}>
          <Text style={styles.infoText}>
            { isRewinding ? "Estimate EPC: " + positions[quizArray[rewindPosition]]?.BESTIMATE : ""}
          </Text>
        </View>
        <View style={styles.lowerReviewPanel}>
          <Text style={styles.infoText}>
            { isRewinding ? "Actual EPC: " + positions[quizArray[rewindPosition]]?.EPC : ""}
          </Text>
        </View>
      </View>
      <TouchableOpacity style={[styles.resumeButton, isRewinding ? { display: 'flex' } : { display: 'none' }]} 
          onPress={() => {
            setIsRewinding(false);
            if (randomEntry) {
              const updatedNumCheckers = [...numCheckers];
              for (let i = 0; i < 6; i++) {
                updatedNumCheckers[5-i] = parseInt(randomEntry.key[i], 16);
              }
              setNumCheckers(updatedNumCheckers);
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

const stylesFunc = (height, width) => StyleSheet.create({
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
  },
  pauseButton: {
    backgroundColor: 'red',
    borderRadius: 0.01 * height,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0.12 * height,
    left: 0.66 * width,
    height: '8%',
    width: '12%',
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
    backgroundColor : "dodgerblue",
    paddingLeft : 0.075 * height,
  },
  sidePanel : {
    height : '90%',
    width : 0.7 * height,
    marginRight : 0.08 * height,
    marginTop : 0.05 * height,
    flexDirection : "column",
    justifyContent : "space-evenly",
    alignItems : "center",
    backgroundColor : "dodgerblue",
},
  resultsPanel: {
    height: '27%',
    width: '80%',
    backgroundColor: 'orange',
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
    left: '71%',
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
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 5,
    position: 'absolute',
    height: '8%',
    width: '12%',
    top: '58%',
    left: '77%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resumeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Arial',
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
});