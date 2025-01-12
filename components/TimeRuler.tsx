import React from "react";
import { useWindowDimensions } from "react-native";
import { Canvas, Fill, Rect, Text, useFont } from "@shopify/react-native-skia";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import {
  cancelAnimation,
  useDerivedValue,
  useSharedValue,
  withDecay,
  SharedValue,
} from "react-native-reanimated";

interface LineProps {
  index: number;
  translateX: SharedValue<number>;
  width: number;
  scale: SharedValue<number>;
}

const HourLine: React.FC<LineProps> = ({ index, translateX, width, scale }) => {
  const HOUR_WIDTH = 100;
  const INDICATOR_POSITION = width / 2;
  const totalHours = 24;
  const font = useFont(require("../assets/fonts/SpaceMono-Regular.ttf"), 14);

  const xPosition = useDerivedValue(() => {
    const position =
      INDICATOR_POSITION +
      ((index * HOUR_WIDTH * scale.value + translateX.value) %
        (totalHours * HOUR_WIDTH * scale.value));
    return position < 0
      ? position + totalHours * HOUR_WIDTH * scale.value
      : position;
  });

  const hourText = ((index % totalHours) + totalHours) % totalHours;

  const textXPosition = useDerivedValue(() => {
    return hourText < 10 ? xPosition.value - 3 : xPosition.value - 6;
  });

  return (
    <>
      <Rect x={xPosition} y={0} width={2} height={100} color="white" />
      <Text
        x={textXPosition}
        y={120}
        text={hourText.toString()}
        font={font}
        color="white"
      />
    </>
  );
};

interface MinuteLineProps extends LineProps {
  minute: number;
}

const MinuteLine: React.FC<MinuteLineProps> = ({
  index,
  translateX,
  minute,
  width,
  scale,
}) => {
  const HOUR_WIDTH = 100;
  const MINUTE_WIDTH = scale.value > 2 ? HOUR_WIDTH / 6 : 50; // Each minute line represents 10 minutes or 30 minutes based on scale
  const INDICATOR_POSITION = width / 2;
  const totalHours = 24;

  const xPosition = useDerivedValue(() => {
    const position =
      INDICATOR_POSITION +
      ((index * HOUR_WIDTH * scale.value +
        minute * MINUTE_WIDTH * scale.value +
        translateX.value) %
        (totalHours * HOUR_WIDTH * scale.value));
    return position < 0
      ? position + totalHours * HOUR_WIDTH * scale.value
      : position;
  });

  const height = minute === 3 ? 80 : 60; // Make the line at 30 minutes higher

  return <Rect x={xPosition} y={0} width={1} height={height} color="white" />;
};

interface RulerLinesProps {
  translateX: SharedValue<number>;
  width: number;
  scale: SharedValue<number>;
}

const RulerLines: React.FC<RulerLinesProps> = ({
  translateX,
  width,
  scale,
}) => {
  const totalHours = 24;
  const lines = [];

  for (let i = -totalHours; i < totalHours * 2; i++) {
    lines.push(
      <HourLine
        key={`hour-line-${i}`}
        index={i}
        translateX={translateX}
        width={width}
        scale={scale}
      />
    );

    // Minute lines
    for (let m = 1; m <= 5; m++) {
      lines.push(
        <MinuteLine
          key={`minute-line-${i}-${m * 10}`}
          index={i}
          translateX={translateX}
          minute={m}
          width={width}
          scale={scale}
        />
      );
    }
  }

  return <>{lines}</>;
};

const TimeRuler: React.FC = () => {
  const { width } = useWindowDimensions();
  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);

  const tapGesture = Gesture.Tap().onStart(() => {
    cancelAnimation(translateX);
  });

  const panGesture = Gesture.Pan()
    .onChange((e) => {
      cancelAnimation(translateX);
      translateX.value += e.changeX;
    })
    .onEnd((e) => {
      translateX.value = withDecay({
        velocity: e.velocityX,
      });
    });

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      const value = scale.value * e.scale;

      if (value < 1) {
        scale.value = 1;
      } else if (value <= 4) {
        scale.value = value;
      }
    })
    .onEnd(() => {
      scale.value = scale.value;
    });

  return (
    <GestureDetector
      gesture={Gesture.Simultaneous(tapGesture, panGesture, pinchGesture)}
    >
      <Canvas style={{ flex: 1 }}>
        <Fill color="black" />
        <RulerLines translateX={translateX} width={width} scale={scale} />
        <Rect x={width / 2} y={0} width={3} height={150} color="yellow" />
      </Canvas>
    </GestureDetector>
  );
};

export default TimeRuler;
