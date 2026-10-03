import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Text, Animated, Platform } from 'react-native';
import { Tile } from '../types/game';
import { AnimalPalSvg } from './AnimalPalSvg';

interface CandyPieceProps {
  tile: Tile;
  size: number;
  isSelected?: boolean;
  isNeighborTarget?: boolean;
  isMatched?: boolean;
  isHinted?: boolean;
}

const CandyPieceBase: React.FC<CandyPieceProps> = ({
  tile,
  size,
  isSelected = false,
  isNeighborTarget = false,
  isMatched = false,
  isHinted = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  // Spring landing bounce on tile fall or spawn
  useEffect(() => {
    scaleAnim.setValue(0.72);
    opacityAnim.setValue(1);
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4.5,
      tension: 130,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [tile.id, tile.row, scaleAnim, opacityAnim]);

  // Tactile squash-and-stretch on select
  useEffect(() => {
    if (isSelected) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.18,
          duration: 90,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.spring(scaleAnim, {
          toValue: 1.1,
          friction: 4,
          tension: 140,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start();
    } else if (!isMatched) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 120,
        useNativeDriver: Platform.OS !== 'web',
      }).start();
    }
  }, [isSelected, isMatched, scaleAnim]);

  // Explosive pop when matched before dissolving into particles
  useEffect(() => {
    if (isMatched) {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1.32,
          duration: 160,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.1,
          duration: 220,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start();
    }
  }, [isMatched, scaleAnim, opacityAnim]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }],
        },
        isSelected && styles.selectedContainer,
        isNeighborTarget && styles.neighborContainer,
        isHinted && styles.hintContainer,
      ]}
    >
      <AnimalPalSvg
        species={tile.color}
        special={tile.special}
        size={size * 0.9}
      />
      {/* Gentle sparkle indicator for 4-second hint */}
      {isHinted && (
        <View style={styles.sparkleBadge}>
          <Text style={styles.sparkleText}>✨</Text>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    position: 'relative',
  },
  selectedContainer: {
    backgroundColor: 'rgba(255, 215, 0, 0.38)',
    borderRadius: 14,
    borderWidth: 2.5,
    borderColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOpacity: 0.9,
    shadowRadius: 10,
    elevation: 8,
  },
  neighborContainer: {
    backgroundColor: 'rgba(0, 230, 118, 0.22)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#00E676',
  },
  hintContainer: {
    backgroundColor: 'rgba(255, 235, 59, 0.35)',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#FFF59D',
  },
  sparkleBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
  sparkleText: {
    fontSize: 14,
  },
});

/** Memoised on the visible tile fields so identical clones don't re-render the SVG. */
export const CandyPiece = React.memo(
  CandyPieceBase,
  (prev, next) =>
    prev.size === next.size &&
    prev.isSelected === next.isSelected &&
    prev.isNeighborTarget === next.isNeighborTarget &&
    prev.isMatched === next.isMatched &&
    prev.isHinted === next.isHinted &&
    prev.tile.id === next.tile.id &&
    prev.tile.color === next.tile.color &&
    prev.tile.special === next.tile.special &&
    prev.tile.row === next.tile.row &&
    prev.tile.col === next.tile.col
);
