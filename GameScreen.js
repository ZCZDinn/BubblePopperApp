/**
 * Bubble Popper Game
 * 
 * ============== GAME OVERVIEW ==============
 * A bubble shooting game built with React Native and Expo.
 * 
 * CURRENT IMPLEMENTATION:
 * - Bubble Spawning: Random horizontal positions every 0.5s
 * - Bubble Movement: Upward motion until off-screen
 * - Static Gun: Fixed at bottom center
 * - Basic Laser: Vertical red line appearing for 0.3s on tap
 * - Simple Hit Detection: X-axis distance comparison
 * - Game Flow: Start screen, 120s countdown, score tracking, game over screen
 * 
 * ============== STUDENT ASSIGNMENT ==============
 * Your task is to extend this game by implementing a movable gun that can
 * fire in different directions to make the game more engaging.
 * 
 * ASSESSMENT CRITERIA:
 * 1. Functionality: Gun movement and response to input
 * 2. Code Quality: Structure, comments, efficiency
 * 3. User Experience: Intuitive gameplay, visual appeal
 * 4. Creativity: Unique features beyond requirements
 * 5. Performance: Smooth operation without issues
 * 
 * TIPS:
 * - Use React Native's touch handling for smooth control
 * - Consider Animated API for smoother animations
 * - Clean up any event listeners or timers you add
 * - Test on different device sizes for responsive UI
 */

import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Dimensions, Animated, TouchableWithoutFeedback, TouchableOpacity, Image, ImageBackground, PanResponder } from 'react-native';
import Bubble from './components/Bubble';
import ScorePopup from './components/ScorePopup';
import BubblePopEffect from './components/BubblePopEffect';
import Laser from './components/Laser';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function GameScreen() {
  /**
   * Game State
   * 
   * These state variables manage the core game functionality:
   * - gameStarted/gameOver: Control game flow
   * - score/timeLeft: Track player progress
   * - bubbles: Array of bubble objects with positions
   * - laserVisible: Controls when the laser is shown
   */
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const [bubbles, setBubbles] = useState([]);
  const [laserVisible, setLaserVisible] = useState(false);
  
  /**
   * ============== STUDENT TASK 1 ==============
   * TODO: IMPLEMENT MOVABLE GUN
   * 
   * Currently the gun is fixed in the middle. Modify this code to:
   * 1. Add state to track gun position (both X and Y coordinates)
   * 2. Allow the gun to move based on user input (e.g., touch/drag or buttons)
   * 3. Ensure the gun stays within screen boundaries
   * 
   * Example implementation approach:
   * const [gunPosition, setGunPosition] = useState({ 
   *   x: screenWidth / 2 - gunWidth / 2, 
   *   y: screenHeight - 70
   * });
   */
  
  // Dynamic gun position variables - allows for horizontal movement of the gun
  const gunWidth = 60;
  const [gunX, setGunX] = useState(screenWidth / 2 - gunWidth / 2);
  const initialGunX = useRef(gunX);
  const gunXRef = useRef(gunX);

  useEffect(() => {
    gunXRef.current = gunX;
  }, [gunX]);

  //Charging animation values - when moving/holding the gun a charging effect will be shown
  const [isCharging, setIsCharging] = useState(false);
  const chargeAnim = useRef(new Animated.Value(1)).current;
  const chargeAnimLoop = useRef(null);
  
  /**
   * ============== STUDENT TASK 2 ==============
   * TODO: IMPLEMENT GUN MOVEMENT
   * 
   * Add functions to:
   * 1. Handle touch/drag events to move the gun
   * 2. Update the gun position state
   * 3. Add visual feedback for active controls
   * 
   * Example implementation approach:
   * const handleTouchMove = (event) => {
   *   const { locationX, locationY } = event.nativeEvent;
   *   // Apply constraints to keep gun on screen
   *   setGunPosition({ x: locationX - gunWidth/2, y: locationY });
   * };
   */

  //PanResponder to allow for dynamic gun movement based on a 'touch and drag' movement style
  //Incorporates a charging animation when moving/holding the gun
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => {
        const touchX = evt.nativeEvent.pageX;
        const gunLeft = gunXRef.current;
        const gunRight = gunXRef.current + gunWidth;
        return touchX >= gunLeft && touchX <= gunRight;
      },
      onPanResponderGrant: () => {
        initialGunX.current = gunXRef.current;
        setIsCharging(true);
        chargeAnim.setValue(1);
        chargeAnimLoop.current = Animated.loop(
          Animated.sequence([
            Animated.timing(chargeAnim, { toValue: 1.5, duration: 400, useNativeDriver: false }),
            Animated.timing(chargeAnim, { toValue: 1, duration: 400, useNativeDriver: false }),
          ])
        );
        chargeAnimLoop.current.start();
      },
      onPanResponderMove: (evt, gestureState) => {
        let newX = initialGunX.current + gestureState.dx;
        newX = Math.max(0, Math.min(screenWidth - gunWidth, newX));
        setGunX(newX);
      },
      onPanResponderRelease: () => {
        setIsCharging(false);
        if (chargeAnimLoop.current) {
          chargeAnimLoop.current.stop();
          chargeAnimLoop.current = null;
        }
        chargeAnim.setValue(1);
        fireLaser(gunXRef.current + gunWidth / 2);
      },
      onPanResponderTerminationRequest: () => false,
    })
  ).current;
  
  // Refs for game timers and IDs
  const bubbleIdRef = useRef(1);
  const timerRef = useRef(null);
  const bubbleTimerRef = useRef(null);
  const laserTimeoutRef = useRef(null);
  
  /**
   * Handle tap to shoot laser
   * Currently fires the laser on any tap when game is active
   */
  const handleTap = () => {
    if (!gameStarted || gameOver) return;
    fireLaser();
  }; 
  
  /**
   * Fire a laser from the gun center
   * Creates visible laser and checks for bubble hits
   */
  const fireLaser = (laserX = gunX + gunWidth / 2) => {
    // Clear any existing laser timeout
    if (laserTimeoutRef.current) {
      clearTimeout(laserTimeoutRef.current);
    }
    
    // Make laser visible
    setLaserVisible(true);
    
    /**
     * ============== STUDENT TASK 3 ==============
     * TODO: MODIFY LASER FIRING
     * 
     * Currently the laser always fires from the center.
     * Update this to:
     * 1. Fire from the current gun position
     * 2. Consider firing angle/direction based on gun orientation
     * 3. Add visual or sound effects for better feedback
     * 
     * Example implementation approach:
     * - Calculate laser end point based on angle
     * - Update laser rendering to show angled beam
     * - Add impact effects when laser hits bubbles
     */
    
    // Check for hits immediately
    checkHits(laserX);
    
    // Make laser disappear after 300ms
    laserTimeoutRef.current = setTimeout(() => {
      setLaserVisible(false);
    }, 300);
  };

  // List of possible bubble colors
  const BUBBLE_COLORS = [
    '#ff4d4d',   // red
    '#4dff4d',   // green
    '#ffe14d',   // yellow
    '#4d4dff',   // dark blue
    '#b84dff',   // purple
  ];

  // Map of colors to scores, this allows for complex scoring based on bubble color
  const COLOR_SCORES = {
  '#4d4dff': 1,   // dark blue
  '#4dff4d': 2,   // green
  '#ffe14d': 3,   // yellow
  '#ff4d4d': 4,   // red
  '#b84dff': 5,   // purple
  };

  // State for score popups (appear when bubbles are popped)
  const [scorePopups, setScorePopups] = useState([]); // {id, x, y, value}

  // State for Bubble pop animation (appear when bubbles are popped)
  const [popAnimations, setPopAnimations] = useState([]); // {id, x, y, radius}
  
  /**
   * Check if laser hits any bubbles
   * @param {number} laserX - X coordinate of the laser
   */
  const checkHits = (laserX) => {
    setBubbles(prevBubbles => {
      const hitBubbleIds = [];
      let pointsToAdd = 0;
      
      /**
       * ============== STUDENT TASK 4 ==============
       * TODO: IMPROVE COLLISION DETECTION
       * 
       * The current collision only works on X axis.
       * Enhance it to:
       * 1. Consider both X and Y coordinates
       * 2. Account for gun position and angle
       * 3. Add smarter targeting or auto-aiming features
       * 
       * Example implementation approach:
       * - Calculate distance between laser line and bubble center
       * - Use line-circle intersection algorithms for angled lasers
       * - Consider adding laser width for more realistic collision
       */
      
      // Check each bubble for collision
      prevBubbles.forEach(bubble => {
        // Calculate bubble center
        const bubbleCenterX = bubble.x + bubble.radius;
        
        // Check if laser x-coordinate is within bubble's horizontal range
        const distanceX = Math.abs(bubbleCenterX - laserX);
        
        // If laser is within bubble radius, it's a hit
        if (distanceX <= bubble.radius) {
          hitBubbleIds.push(bubble.id);

          // Add points based on bubble color
          const points = COLOR_SCORES[bubble.color] || 1;
          pointsToAdd += points;

          // Add score popup
          setScorePopups(prev => [
            ...prev,
            {
              id: `${bubble.id}-${Date.now()}-${Math.random()}`,
              x: bubble.x + bubble.radius,
              y: bubble.y,
              value: points,
            }
          ]);

          // Bubble pop animation
          setPopAnimations(prev => [
            ...prev,
            {
              id: `${bubble.id}-${Date.now()}-${Math.random()}`,
              x: bubble.x,
              y: bubble.y,
              radius: bubble.radius,
            }
          ]);
        }
      });
      
      // If any bubbles were hit, update the score
      if (pointsToAdd > 0) {
        setScore(prevScore => prevScore + pointsToAdd);
      }
      
      // Return bubbles that weren't hit
      return prevBubbles.filter(bubble => !hitBubbleIds.includes(bubble.id));
    });
  };

  // Helper to pick a random color
  function getRandomColor() {
    return BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)];
  }
  
  /**
   * Spawn a new bubble with random horizontal position
   * Creates bubble at bottom of screen with random X position
   */
  const spawnBubble = () => {
    const radius = 30;
    // Ensure bubble stays within screen bounds
    const maxX = screenWidth - (radius * 2);
    const newBubble = {
      id: bubbleIdRef.current++,
      x: Math.random() * maxX,
      y: screenHeight - 100, // Start near bottom of screen
      radius: radius,
      color: getRandomColor(), // Assign random color
    };
    
    setBubbles(prev => [...prev, newBubble]);
  };
  
  /**
   * Start the game
   * Initializes game state and starts timers for bubble spawning and countdown
   */
  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setTimeLeft(120);
    setBubbles([]);
    setLaserVisible(false);
    bubbleIdRef.current = 1;
    
    // Start spawning bubbles every 500ms
    bubbleTimerRef.current = setInterval(spawnBubble, 500);
    
    // Start countdown timer
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Game over
          clearInterval(timerRef.current);
          clearInterval(bubbleTimerRef.current);
          setGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  /**
   * Reset game
   * Returns game to initial state and cleans up timers
   */
  const resetGame = () => {
    setGameStarted(false);
    setGameOver(false);
    setBubbles([]);
    setScore(0);
    setTimeLeft(120);
    setLaserVisible(false);
    bubbleIdRef.current = 1;
    
    if (timerRef.current) clearInterval(timerRef.current);
    if (bubbleTimerRef.current) clearInterval(bubbleTimerRef.current);
  };
  
  /**
   * Move bubbles upward
   * Uses effect to animate bubbles moving up the screen
   */
  useEffect(() => {
    if (!gameStarted || gameOver) return;
    
    const moveInterval = setInterval(() => {
      setBubbles(prev => {
        const updatedBubbles = prev
          .map(bubble => ({
            ...bubble,
            y: bubble.y - 2, // Move bubbles up
          }))
          .filter(bubble => bubble.y > -60); // Remove bubbles that exit the top
        
        return updatedBubbles;
      });
    }, 16); // ~60 FPS
    
    return () => clearInterval(moveInterval);
  }, [gameStarted, gameOver]);
  
  /**
   * Cleanup on unmount
   * Ensures all timers are cleared when component unmounts
   */
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (bubbleTimerRef.current) clearInterval(bubbleTimerRef.current);
      if (laserTimeoutRef.current) clearTimeout(laserTimeoutRef.current);
    };
  }, []);
  
  return (
    <View style={styles.container}>
      {/* Game area with background image */}
      <ImageBackground
        source={require('./assets/background.png')} // Background Image
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <TouchableWithoutFeedback onPress={handleTap} disabled={!gameStarted || gameOver}>
          <View style={styles.gameArea}>
            {/* Bubbles */}
            {bubbles.map(bubble => (
              <Bubble
                key={`bubble-${bubble.id}`}
                x={bubble.x}
                y={bubble.y}
                radius={bubble.radius}
                color={bubble.color}
              />
            ))}

            {/* Score Popup Effect */}
            {scorePopups.map(popup => (
              <ScorePopup
                key={popup.id}
                x={popup.x}
                y={popup.y}
                value={popup.value}
                onComplete={() =>
                  setScorePopups(prev => prev.filter(p => p.id !== popup.id))
                }
              />
            ))}

            {/* Bubble Pop Effect */}
            {popAnimations.map(pop => (
              <BubblePopEffect
                key={pop.id}
                x={pop.x}
                y={pop.y}
                radius={pop.radius}
                onComplete={() =>
                  setPopAnimations(anims => anims.filter(a => a.id !== pop.id))
                }
              />
            ))}

            {/* Charging Ball */}
            {isCharging && (
              <Animated.View
                style={{
                  position: 'absolute',
                  left: gunX + gunWidth / 2 - 11, // Centered at gun tip, half of new width
                  bottom: 85,                     // Moved down from 90 to 80
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  backgroundColor: '#fff',        // White inner color
                  borderWidth: 3,
                  borderColor: '#ff0000',
                  opacity: 0.9,
                  transform: [{ scale: chargeAnim }],
                  zIndex: 100,
                }}
              />
            )}
            
            {/**
             * ============== STUDENT TASK 5 ==============
             * TODO: MODIFY LASER RENDERING
             * Currently the laser is a simple vertical line.
             * Enhance it to:
             * 1. Render based on gun position and angle
             * 2. Add visual effects (color, thickness, etc.)
             * 3. Consider adding a cooldown or power meter
             */}
            
            {/* Laser - fires from center of gun based on gun position */}
            {laserVisible && (
              <Laser 
                gunX={gunX}
                gunWidth={gunWidth} 
                screenHeight={screenHeight} 
              />
            )}
          </View>
        </TouchableWithoutFeedback>
            
        {/**
         * ============== STUDENT TASK 6 ==============
         * TODO: MODIFY GUN RENDERING
         * Currently the gun is fixed at the bottom center.
         * Update it to:
         * 1. Use the gun position state you created
         * 2. Add visual indication of gun direction/angle
         * 3. Add controls or touch areas for movement
         */}
        
        {/* Gun - dynamically moveable horizontally, incorporates a charging animation when held */}
        <View
          style={[
            styles.gun,
            { left: gunX, width: gunWidth, height: 60 },
          ]}
          {...panResponder.panHandlers}
        >
          <Image
            source={require('./assets/tank_img3.png')}
            style={{ width: gunWidth, height: 60 }}
            resizeMode="contain"
          />
        </View>
      </ImageBackground>

      {/* Score and Timer */}
      <View style={styles.hudContainer}>
        <Text style={styles.scoreText}>Score: {score}</Text>
        <Text style={styles.scoreText}>Time: {timeLeft}s</Text>
      </View>
      
      {/* Start Screen */}
      {!gameStarted && !gameOver && (
        <View style={styles.overlay}>
          <Image
            source={require('./assets/bubble_popper.png')}
            style={styles.bubbleTitle}
            resizeMode="contain"
          />
          <TouchableOpacity onPress={startGame} activeOpacity={0.5}>
            <ImageBackground
              source={require('./assets/button-bg.png')} // button image
              style={styles.imageButton}
              imageStyle={{ borderRadius: 25 }}
            >
              <Text style={styles.buttonText}>Start Game</Text>
            </ImageBackground>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Game Over Screen */}
      {gameOver && (
        <View style={styles.overlay}>
          <Image
            source={require('./assets/game_over.png')}
            style={styles.bubbleTitle}
            resizeMode="contain"
          />
          <Text style={styles.scoreText}>Final Score: {score}</Text>
          <TouchableOpacity onPress={resetGame} activeOpacity={0.5}>
            <ImageBackground
              source={require('./assets/button-bg.png')} // button image
              style={styles.imageButton}
              imageStyle={{ borderRadius: 25 }}
            >
              <Text style={styles.buttonText}>Play Again</Text>
            </ImageBackground>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

/**
 * ============== STUDENT TASK 7 ==============
 * TODO: ENHANCE THE STYLING
 * Consider adding styles for:
 * 1. Different gun states (active, cooldown)
 * 2. Enhanced laser effects
 * 3. Controls for gun movement
 * 4. Power-ups or special ability indicators
 */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  gameArea: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  hudContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    top: 30,
    left: 20,
    right: 20,
    zIndex: 10,
  },
  scoreText: {
    color: 'cyan',
    fontSize: 18,
    fontWeight: '900',
    fontStyle:'italic',
    fontVariant: 'lining-nums',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  bubbleTitle: {
    width: 300,
    height: 60,
    marginBottom: 10,
  },
  imageButton: {
    width: 200,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  buttonText: {
    color: '#9D00FF',
    fontSize: 18,
    fontWeight: '900',
    fontStyle:'italic',
    fontVariant: 'lining-nums',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: -1, height: 0 },
    textShadowRadius: 1,
  },
  gun: {
    position: 'absolute',
    bottom: 30, //Moved gun up from bottom to avoid overlap with android navigation bar
    width: 60,
    height: 60,
    zIndex: 50,
  },
});