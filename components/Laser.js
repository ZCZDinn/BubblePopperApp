import React from 'react';
import { View, StyleSheet} from 'react-native';

export default function Laser({ gunX, gunWidth, screenHeight }) {
  return (
    <View
      style={[
        styles.laser,
        {
          left: gunX + gunWidth / 2 - 2, // Center the laser
          bottom: 90,           // 30 (gun bottom) + 60 (gun height)
          height: screenHeight - 90, // Laser height from gun tip to top of the screen
        }
      ]}
    />
  );
}

const styles = StyleSheet.create({
  laser: {
    position: 'absolute',
    width: 4,
    backgroundColor: '#fff',      // White center
    borderColor: '#ff0000',       // Red border
    borderWidth: 1,               // 1px border on all sides (so 2px white, 1px red each side)
    borderRadius: 2,
    shadowColor: '#ff0000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 20,
    zIndex: 90,
  },
});