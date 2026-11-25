import { Group, Image, Line, Rect, Text } from "react-konva";
import useImage from "use-image";
import boxUrl from "../../../assets/box.png";
import catUrl from "../../../assets/cat.png";
import puddleSheetUrl from "../../../assets/puddle_sheet.png";
import puddleSheet from "../../../assets/puddle_sheet.json";
import { COLORS, DISPLAY_FONT } from "../../../theme";
import { SCENE_HEIGHT, SCENE_WIDTH } from "../endingContent";

const GROUND_Y = 700;
const BRICK_HEIGHT = 80;
const BRICK_WIDTH = 160;

// Brick wall and sidewalk outside the newsroom, running past the scene edges
// so they fill the window once scaled.
function Street() {
  const rows = Math.ceil(GROUND_Y / BRICK_HEIGHT);
  return (
    <Group listening={false}>
      <Rect
        x={-SCENE_WIDTH}
        y={-SCENE_HEIGHT}
        width={SCENE_WIDTH * 3}
        height={SCENE_HEIGHT + GROUND_Y}
        fill={COLORS.streetWall}
      />
      {Array.from({ length: rows }, (_, row) => (
        <Group key={row}>
          <Line
            points={[
              -SCENE_WIDTH,
              row * BRICK_HEIGHT,
              SCENE_WIDTH * 2,
              row * BRICK_HEIGHT,
            ]}
            stroke={COLORS.streetBrick}
            strokeWidth={3}
          />
          {Array.from({ length: 36 }, (_, col) => {
            const x = (col - 12) * BRICK_WIDTH + (row % 2) * (BRICK_WIDTH / 2);
            return (
              <Line
                key={col}
                points={[x, row * BRICK_HEIGHT, x, (row + 1) * BRICK_HEIGHT]}
                stroke={COLORS.streetBrick}
                strokeWidth={3}
              />
            );
          })}
        </Group>
      ))}
      <Rect
        x={-SCENE_WIDTH}
        y={GROUND_Y}
        width={SCENE_WIDTH * 3}
        height={SCENE_HEIGHT}
        fill={COLORS.sidewalk}
      />
      <Line
        points={[-SCENE_WIDTH, GROUND_Y, SCENE_WIDTH * 2, GROUND_Y]}
        stroke={COLORS.streetBrick}
        strokeWidth={6}
      />
    </Group>
  );
}

// Box and cat sit where they were placed in cat.aseprite: the cat is drawn
// 155px right of and 15px above the box's top-left corner.
const BOX_X = 600;
const BOX_Y = 425;

const SHADOW = {
  shadowColor: "#000000",
  shadowOpacity: 0.1,
  shadowBlur: 16,
  shadowOffsetX: -25,
  shadowOffsetY: -25,
};
const CAT_X = BOX_X + 155;
const CAT_Y = BOX_Y - 15;

// Where each piece of puddle_sheet.png lies on the sidewalk, by frame name.
// Pieces not listed here aren't drawn.
const PUDDLE_SPOTS: Partial<Record<string, { x: number; y: number }>> = {
  puddle_0: { x: 110, y: 780 },
  puddle_1: { x: 10, y: 900 },
  puddle_3: { x: 450, y: 802 },
};

// Puddles of tears littered around the sidewalk, cut from puddle_sheet.png.
function Puddles() {
  const [sheet] = useImage(puddleSheetUrl);
  return (
    <Group listening={false}>
      {puddleSheet.frames.map(({ name, x, y, w, h }) => {
        const spot = PUDDLE_SPOTS[name];
        if (!spot) return null;
        return (
          <Image
            key={name}
            image={sheet}
            crop={{ x, y, width: w, height: h }}
            x={spot.x}
            y={spot.y}
            width={w}
            height={h}
          />
        );
      })}
    </Group>
  );
}

// The reporter cat sitting in its open cardboard box.
function CatInBox() {
  const [box] = useImage(boxUrl);
  const [cat] = useImage(catUrl);
  return (
    <Group listening={false}>
      {/* box and cat cast the same soft shadow up and to the left, following their outlines */}
      <Image image={box} x={BOX_X} y={BOX_Y} {...SHADOW} />
      <Image image={cat} x={CAT_X} y={CAT_Y} {...SHADOW} />
    </Group>
  );
}

// The player's retracted article, dropped on the sidewalk.
function RetractedArticle() {
  return (
    <Group x={1080} y={735} rotation={5}>
      <Line
        points={[0, 6, 70, 0, 140, 10, 135, 62, 62, 54, 4, 64]}
        closed
        fill={COLORS.paper}
        stroke={COLORS.divider}
        strokeWidth={2}
      />
      <Text
        x={10}
        y={12}
        width={125}
        text="RETRACTED"
        fontFamily={DISPLAY_FONT}
        fontSize={18}
        fill={COLORS.tie}
      />
      <Line
        points={[12, 42, 126, 47]}
        stroke={COLORS.divider}
        strokeWidth={4}
      />
    </Group>
  );
}

// Bad Ending art: the reporter cat sits in an open cardboard box out on the street.
export default function FiredScene() {
  return (
    <Group>
      <Street />
      <Puddles />
      <CatInBox />
      <RetractedArticle />
    </Group>
  );
}
