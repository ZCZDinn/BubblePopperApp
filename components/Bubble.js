/**
 * Bubble Component
 * 
 * Renders a circular bubble for the Bubble Popper game.
 * Each bubble has a position (x, y) and size (radius).
 * 
 * CURRENT IMPLEMENTATION:
 * - Simple green circle with drop shadow
 * - Fixed radius (typically 30)
 * - Absolute positioning
 * 
 * ============== STUDENT EXTENSION IDEAS ==============
 * Consider enhancing this component with:
 * 1. Different bubble types/colors
 * 2. Animation effects (pulsing, rotation)
 * 3. Pop animation when hit by laser
 * 4. Special power-up bubbles
 */

import React from 'react';
import { View, StyleSheet, Image } from 'react-native';

/**
 * Bubble component for the Bubble Popper game
 * 
 * @param {Object} props - Component properties
 * @param {number} props.x - X coordinate of the bubble
 * @param {number} props.y - Y coordinate of the bubble
 * @param {number} props.radius - Radius of the bubble
 * @returns {React.Component} Rendered bubble
 */
export default function Bubble({ x, y, radius }) {
  return (
    <Image
      source={require('../assets/bubble_img.png')} // Place your bubble.png in the assets folder
      style={[
        styles.bubble,
        {
          left: x,
          top: y,
          width: radius * 2,
          height: radius * 2,
          borderRadius: radius,
        },
      ]}
      resizeMode="contain"
    />
  );
}

const styles = StyleSheet.create({
  bubble: {
    position: 'absolute',
  },
});
