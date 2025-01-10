import React from "react";
import { useWindowDimensions } from "react-native";
import { Canvas, Fill, Rect, Text, useFont } from "@shopify/react-native-skia";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import { cancelAnimation, useDerivedValue, useSharedValue, withDecay } from "react-native-reanimated";

const HourLine = ({ index, translateX, width }) => {
  const HOUR_WIDTH = 100;
  const INDICATOR_POSITION = width / 2;
  const totalHours = 24;
  const font = useFont(require("../assets/fonts/SpaceMono-Regular.ttf"), 14);

  const xPosition = useDerivedValue(() => {
    const position = INDICATOR_POSITION + ((index * HOUR_WIDTH + translateX.value) % (totalHours * HOUR_WIDTH));
    return position < 0 ? position + totalHours * HOUR_WIDTH : position;
  });

  const hourText = ((index % totalHours) + totalHours) % totalHours;

  const textXPosition = useDerivedValue(() => {
    return hourText < 10 ? xPosition.value - 3 : xPosition.value - 6;
  });

  return (
    <>
      <Rect
        x={xPosition}
        y={0}
        width={2}
        height={100}
        color="white"
      />
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

const MinuteLine = ({ index, translateX, minute, width }) => {
  const HOUR_WIDTH = 100;
  const MINUTE_WIDTH = 50;
  const INDICATOR_POSITION = width / 2;
  const totalHours = 24;

  const xPosition = useDerivedValue(() => {
    const position = INDICATOR_POSITION + ((index * HOUR_WIDTH + minute * MINUTE_WIDTH + translateX.value) % (totalHours * HOUR_WIDTH));
    return position < 0 ? position + totalHours * HOUR_WIDTH : position;
  });

  return (
    <Rect
      x={xPosition}
      y={0}
      width={1}
      height={60}
      color="white"
    />
  );
}

const RulerLines = ({ translateX, width }) => {
  const totalHours = 24;
  const lines = [];

  for (let i = -totalHours; i < totalHours * 2; i++) {
    lines.push(
      <HourLine key={`hour-line-${i}`} index={i} translateX={translateX} width={width} />
    );

    // Minute lines
    for (let m = 1; m < 6; m++) {
      lines.push(
        <MinuteLine key={`minute-line-${i}-${m}`} index={i} translateX={translateX} minute={m} width={width} />
      );
    }
  }

  return lines;
};

const TimeRuler = () => {
  const { width } = useWindowDimensions();
  const translateX = useSharedValue(0);

  const tapGesture = Gesture.Tap()
    .onStart(() => {
      cancelAnimation(translateX);
    });

  const panGesture = Gesture.Pan()
    .onChange((e) => {
      translateX.value += e.changeX;
    })
    .onEnd((e) => {
      translateX.value = withDecay({
        velocity: e.velocityX,
      });
    });

  return (
    <GestureDetector gesture={Gesture.Simultaneous(tapGesture, panGesture)}>
      <Canvas style={{ flex: 1 }}>
        <Fill color="black" />
        <RulerLines translateX={translateX} width={width} />
        {/* Indicator Line */}
        <Rect
          x={width / 2}
          y={0}
          width={3}
          height={150}
          color="yellow"
        />
      </Canvas>
    </GestureDetector>
  );
};

export default TimeRuler;
