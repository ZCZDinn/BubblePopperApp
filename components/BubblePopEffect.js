import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

export default function BubblePopEffect({ x, y, radius, onComplete }) {
  const scale = useRef(new Animated.Value(0.5)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 1.5,
        duration: 250,
        useNativeDriver: false,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: false,
      }),
    ]).start();
    // Remove after animation duration
    const timeout = setTimeout(() => {
      if (onComplete) onComplete();
    }, 260);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: radius * 2,
        height: radius * 2,
        borderRadius: radius,
        borderWidth: 3,
        borderColor: '#fff',
        backgroundColor: 'rgba(255,255,255,0.5)',
        opacity,
        transform: [{ scale }],
        zIndex: 200,
      }}
    />
  );
}