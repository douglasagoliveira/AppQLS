import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Polygon, Line, Circle } from 'react-native-svg';

interface BeamPreviewProps {
  beamAngle?: number; // ex: 36, 60
  cctKelvin?: number; // ex: 2700, 3000, 4000
  lumens?: number;
  className?: string;
}

export function BeamPreview({
  beamAngle = 38,
  cctKelvin = 3000,
  lumens = 1050,
  className = '',
}: BeamPreviewProps) {
  // Ajuste de cor do feixe conforme CCT
  const getLightColor = () => {
    if (cctKelvin <= 2700) return 'rgba(255, 185, 95, 0.28)'; // Quente âmbar
    if (cctKelvin <= 3200) return 'rgba(255, 214, 153, 0.25)'; // Branco quente
    return 'rgba(235, 245, 255, 0.22)'; // Branco neutro
  };

  const getLightCoreColor = () => {
    if (cctKelvin <= 2700) return '#ffb95f';
    if (cctKelvin <= 3200) return '#ffd699';
    return '#ebf5ff';
  };

  // Cálculo da abertura do cone no SVG (largura baseada no ângulo)
  const halfAngleRad = ((beamAngle / 2) * Math.PI) / 180;
  const coneSpread = Math.min(65, Math.max(20, Math.tan(halfAngleRad) * 60));

  const apexX = 50;
  const apexY = 10;
  const leftX = 50 - coneSpread;
  const rightX = 50 + coneSpread;
  const bottomY = 70;

  return (
    <View className={`items-center justify-center py-2 ${className}`}>
      <View style={{ width: 100, height: 75 }}>
        <Svg width="100" height="75" viewBox="0 0 100 75">
          {/* Facho de Luz Cônico */}
          <Polygon
            points={`${apexX},${apexY} ${leftX},${bottomY} ${rightX},${bottomY}`}
            fill={getLightColor()}
          />
          {/* Linhas de Feixe Delicadas */}
          <Line
            x1={apexX}
            y1={apexY}
            x2={leftX}
            y2={bottomY}
            stroke={getLightCoreColor()}
            strokeWidth="0.8"
            strokeOpacity="0.4"
          />
          <Line
            x1={apexX}
            y1={apexY}
            x2={rightX}
            y2={bottomY}
            stroke={getLightCoreColor()}
            strokeWidth="0.8"
            strokeOpacity="0.4"
          />
          {/* Ponto focal da luminária */}
          <Circle cx={apexX} cy={apexY} r="3" fill={getLightCoreColor()} />
          {/* Base Iluminada / Reflexo de superfície */}
          <Line
            x1={leftX}
            y1={bottomY}
            x2={rightX}
            y2={bottomY}
            stroke={getLightCoreColor()}
            strokeWidth="1.5"
            strokeOpacity="0.6"
          />
        </Svg>
      </View>
      <Text className="text-[10px] font-semibold text-zinc-400 mt-1">
        Beam Angle {beamAngle}° · {lumens} lm
      </Text>
    </View>
  );
}
