import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, {
  Defs,
  RadialGradient,
  LinearGradient,
  Stop,
  Circle,
  Path,
  Rect,
  G,
} from 'react-native-svg';

interface MascotCharacterProps {
  message: string;
  isCelebrating?: boolean;
}

export const MascotCharacter: React.FC<MascotCharacterProps> = ({
  message,
  isCelebrating = false,
}) => {
  return (
    <View style={styles.container}>
      {/* Mascot Vector Face / Avatar */}
      <View style={styles.avatarContainer}>
        <Svg width={54} height={54} viewBox="0 0 100 100">
          <Defs>
            <RadialGradient id="skinGrad" cx="40%" cy="40%" r="60%">
              <Stop offset="0%" stopColor="#FFE0BD" />
              <Stop offset="80%" stopColor="#F5C08F" />
              <Stop offset="100%" stopColor="#E09960" />
            </RadialGradient>
            <LinearGradient id="hatGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#FFFFFF" />
              <Stop offset="70%" stopColor="#F0E8FA" />
              <Stop offset="100%" stopColor="#D9C5F2" />
            </LinearGradient>
            <LinearGradient id="bowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#FF4081" />
              <Stop offset="100%" stopColor="#D81B60" />
            </LinearGradient>
          </Defs>

          {/* Head */}
          <Circle cx="50" cy="56" r="28" fill="url(#skinGrad)" />

          {/* Rosy Cheeks */}
          <Circle cx="32" cy="62" r="6" fill="#FF80AB" opacity="0.6" />
          <Circle cx="68" cy="62" r="6" fill="#FF80AB" opacity="0.6" />

          {/* Eyes */}
          {isCelebrating ? (
            // Happy closed eyes (^ ^)
            <G>
              <Path
                d="M 34 50 Q 40 44 46 50"
                stroke="#35165E"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
              />
              <Path
                d="M 54 50 Q 60 44 66 50"
                stroke="#35165E"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
              />
            </G>
          ) : (
            // Bright cheerful eyes
            <G>
              <Circle cx="40" cy="50" r="4.5" fill="#35165E" />
              <Circle cx="42" cy="48" r="1.5" fill="#FFFFFF" />
              <Circle cx="60" cy="50" r="4.5" fill="#35165E" />
              <Circle cx="62" cy="48" r="1.5" fill="#FFFFFF" />
            </G>
          )}

          {/* Smiling Mouth */}
          <Path
            d="M 42 63 Q 50 72 58 63"
            stroke="#C2185B"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />

          {/* Chef / Candy Hat */}
          <Path
            d="M 28 36 C 24 20, 40 10, 50 14 C 60 10, 76 20, 72 36 Z"
            fill="url(#hatGrad)"
          />
          <Rect x="26" y="34" width="48" height="8" rx="4" fill="#E1BEE7" />
          <Circle cx="50" cy="22" r="4" fill="#FF4081" />

          {/* Candy Bow Tie */}
          <Path d="M 40 84 L 50 88 L 40 92 Z" fill="url(#bowGrad)" />
          <Path d="M 60 84 L 50 88 L 60 92 Z" fill="url(#bowGrad)" />
          <Circle cx="50" cy="88" r="3.5" fill="#FFD700" />
        </Svg>
      </View>

      {/* Speech Bubble */}
      <View style={styles.bubble}>
        <View style={styles.bubbleArrow} />
        <Text style={styles.messageText}>{message}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginVertical: 4,
    width: '100%',
    maxWidth: 420,
  },
  avatarContainer: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#4A1D7A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 5,
  },
  bubble: {
    flex: 1,
    marginLeft: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  bubbleArrow: {
    position: 'absolute',
    left: -7,
    top: 18,
    width: 0,
    height: 0,
    borderTopWidth: 6,
    borderTopColor: 'transparent',
    borderBottomWidth: 6,
    borderBottomColor: 'transparent',
    borderRightWidth: 8,
    borderRightColor: '#FFFFFF',
  },
  messageText: {
    color: '#35165E',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
});
