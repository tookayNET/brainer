import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useRef, useState,  } from 'react';
import { Animated, PanResponder, StyleSheet, Text, TouchableOpacity, View, } from 'react-native';
import Header from './Components/Header';
import Footer from './Components/Footer';
import data from './data.js';
import Card from './Components/Card';
import { CARD } from './Constants/constants';
import CardFlip from 'react-native-card-flip';

export default function App () {

  const [cards, setCards] = useState(data);
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const swipe = useRef(new Animated.ValueXY()).current;
  const tiltSign = useRef(new Animated.Value(1)).current

  //  TODO: REMOVE
  console.table(cards);

  useEffect(() => {
    if (!cards.length) {
      setCards(data)
    }
  }, [cards.length]);

  // CARD PANNING ANIMATION
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, { dx, dy, y0 }) => {
      swipe.setValue({ x: dx, y: dy });
      tiltSign.setValue(y0 > CARD.HEIGHT /2 ? 1 : -1 )
    },
    onPanResponderRelease: (_, { dx, dy }) => {
      
    const direction = Math.sign(dx);
    const isActionActive = Math.abs(dx) > 100;

    if (isActionActive) {
      Animated.timing(swipe, {
        duration: 200,
        toValue: {
          x: direction * 500,
          y: dy, 
        },
        useNativeDriver: true,
        friction: 5,
      }).start(removeTopCard)
    } else {
      Animated.spring(swipe, {
        toValue: {
          x: 0,
          y: 0,
        },
        useNativeDriver: true,
        friction: 5,
      }).start();
    } 
    },
  });

  // RMOVES CARD ON COMPLETE SWIPE
  const removeTopCard = useCallback(() => { 
    setCards((prevState) => prevState.slice(1))
    swipe.setValue({x: 0, y: 0})
  },[swipe])
  
  const handleChoice = useCallback((direction) => {
    Animated.timing(swipe.x, {
      toValue: direction * 500,
      duration: 400,
      useNativeDriver: true,
    }).start(removeTopCard)
  }, [removeTopCard, swipe.x])


  return (
    <View style={styles.wrapper}>
      <Header />
      <View style={styles.container}>
        {
          cards.map((card, index) => {
            const isFirst = index === 0;
            const dragHanders = isFirst ? panResponder.panHandlers : {};
          return (
            <Card
              key={card._id}
              card={card}
              index={index}
              isFirst={isFirst}
              swipe={swipe}
              tiltSign={tiltSign}
              {...dragHanders}
            >
            </Card>
          )
        }).reverse()}
      </View>
      <View style={styles.footer}>

      <Footer handleChoice={handleChoice}/>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'column',
    justifyContent: 'space-evenly',
  },
  container: {
    alignItems: 'center',
    backgroundColor: '#fff',
    flex: 1,

  },
  cards: {
    flex: 1,
    padding: 10,
    // TODO: FIX: SHADOW NOT VISIBLE
    shadowColor: 'grey',
    shadowOffset: {
      height: 5,
      width: 5,
    },
    elevation: 6,
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  footer: {
    // TODO: RESOLVE FOOTER NOT STAYING AT BOTTOM AND REMOVE THIS
    top: '500%',
  }
});
