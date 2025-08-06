import React, { useState, useEffect, useRef } from 'react';
import { Animated, Text, View } from 'react-native';


/**
 * ScorePopup Component, displays a popup with the score value.
 * @param {Object} props
 * @param {number} props.x - The x position of the popup
 * @param {number} props.y - The y position of the popup
 * @param {number} props.value - The score value to display
 * @param {function} props.onComplete - Callback when animation completes
 * @returns {React.Component} Rendered score popup
 */
export default function ScorePopup({ x, y, value, onComplete }) {
  const opacity = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -30,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onComplete) onComplete();
    });
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: x - 15, // Center the text horizontally
        top: y - 10,  // Adjust as needed to center vertically
        zIndex: 300,
        opacity,
        transform: [{ translateY }],
      }}
    >
      <Text style={{
        color: 'cyan',
        fontWeight: 'bold',
        fontSize: 22,
        textShadowColor: '#000',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
      }}>
        +{value}
      </Text>
    </Animated.View>
  );
}