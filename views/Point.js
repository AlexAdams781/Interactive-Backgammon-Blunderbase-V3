import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';

// My Dynamic Component is a


const Point = () => {
  console.log("hello from Point");
  const [checkersData, setCheckersData] = useState([]);
  const [nextId, setNextId] = useState(1);

    const handlePress = (event) => {
        const { locationX, locationY } = event.nativeEvent;
        console.log(`Press coordinates relative to View: X=${locationX}, Y=${locationY}`);
        let level = 1;
        if (level < nextId - 1) {
            for (let i = nextId - 1; i > level; i--) {
                removeComponent(i);
            }
        } else if (level >= nextId) {
            for (let i = nextId; i <= level; i++) {
                addComponent();
            }
        }
    }
  
    // Function to add a new component with an incremented id
  const addComponent = () => {
    if (nextId > 5) {
        setCheckersData(checkersData.filter(item => item.id !== 5)); // Remove the 5th component if it exists
        setCheckersData([...checkersData, { id: nextId, text: `${nextId}` }]);
    }
    else {
        setCheckersData([...checkersData, { id: nextId, text: '' }]);
    }
    setNextId(nextId + 1);
  };

    // Function to remove a component by its id
    // Automatically removes the component and adds it back if the id is 5 or greater  const removeComponent = (idToRemove) => {
  const removeComponent = (idToRemove) => {
        setCheckersData(checkersData.filter(item => item.id !== idToRemove));
    if (idToRemove > 6) {
        setCheckersData([...checkersData, { id: nextId, text: `${idToRemove - 1}` }]);
    } else if (idToRemove === 6) {
        setCheckersData([...checkersData, { id: nextId, text: '' }]);
    }
    setNextId(idToRemove);
  };

  return (
    // Create a touchable point with a function to either add or remove components
    // Create a list of n checkers where n is the number of components added
    <TouchableOpacity onPress={handlePress}>
        <View style={styles.myContainer}>
            {checkersData.map(data => (
            <View key={data.id} style={styles.circle} text={data.text}/>
            ))}
        </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
      circle: {
        width: '%100',
        aspectRatio: 1,
        borderRadius: '%50', // Half of the width/height
        backgroundColor: 'blue',
      },
      myContainer: {
        flex: 1,
        backgroundColor: 'white',
      }
    });

export default Point;