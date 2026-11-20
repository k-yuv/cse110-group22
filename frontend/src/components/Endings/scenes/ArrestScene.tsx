import { useEffect, useState } from 'react';
import { Circle, Ellipse, Group, Line, Rect, Text, Wedge } from 'react-konva';
import { COLORS, DISPLAY_FONT } from '../../../theme';
import { SCENE_HEIGHT, SCENE_WIDTH } from '../endingContent';

const FLASH_MS = 600;
const FLOOR_Y = 740;

// Swaps which siren light is on. Stays still for players who prefer reduced motion.
function useSirenFlash() {
  const [redOn, setRedOn] = useState(true);

  useEffect(() => {
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;
    const id = window.setInterval(() => setRedOn((on) => !on), FLASH_MS);
    return () => window.clearInterval(id);
  }, []);

  return redOn;
}

// Night window behind the desk with a police car's light bar outside.
function PoliceWindow({ redOn }: { redOn: boolean }) {
  return (
    <Group x={900} y={60}>
      <Rect width={300} height={220} fill={COLORS.endingWoodDark} cornerRadius={8} />
      <Rect x={14} y={14} width={272} height={192} fill={COLORS.endingNight} />
      {/* light bar on the car roof */}
      <Rect x={70} y={150} width={160} height={18} fill="#1b1b1b" cornerRadius={4} />
      <Wedge x={110} y={150} radius={34} angle={180} rotation={180} fill={COLORS.sirenRed} opacity={redOn ? 1 : 0.35} />
      <Wedge x={190} y={150} radius={34} angle={180} rotation={180} fill={COLORS.sirenBlue} opacity={redOn ? 0.35 : 1} />
      <Circle x={110} y={135} radius={70} fill={COLORS.sirenRed} opacity={redOn ? 0.35 : 0} />
      <Circle x={190} y={135} radius={70} fill={COLORS.sirenBlue} opacity={redOn ? 0 : 0.35} />
      {/* window panes */}
      <Line points={[150, 14, 150, 206]} stroke={COLORS.endingWoodDark} strokeWidth={10} />
      <Line points={[14, 110, 286, 110]} stroke={COLORS.endingWoodDark} strokeWidth={10} />
    </Group>
  );
}

// Red and blue light sweeping into the office from the window.
function SirenBeams({ redOn }: { redOn: boolean }) {
  return (
    <Group listening={false}>
      <Wedge x={1010} y={210} radius={1100} angle={26} rotation={130} fill={COLORS.sirenRed} opacity={redOn ? 0.1 : 0.02} />
      <Wedge x={1090} y={210} radius={1100} angle={26} rotation={100} fill={COLORS.sirenBlue} opacity={redOn ? 0.02 : 0.12} />
    </Group>
  );
}

function CeoCat() {
  return (
    <Group>
      {/* body in a suit */}
      <Ellipse x={820} y={560} radiusX={175} radiusY={150} fill="#2f3542" />
      <Line points={[770, 445, 820, 570, 870, 445]} closed fill={COLORS.shirt} />
      <Line points={[810, 460, 830, 460, 838, 540, 820, 565, 802, 540]} closed fill={COLORS.tie} />

      {/* ears */}
      <Line points={[715, 320, 735, 195, 805, 270]} closed fill={COLORS.catFur} stroke={COLORS.catFurDark} strokeWidth={6} lineJoin="round" />
      <Line points={[835, 270, 905, 195, 925, 320]} closed fill={COLORS.catFur} stroke={COLORS.catFurDark} strokeWidth={6} lineJoin="round" />
      <Line points={[738, 295, 745, 230, 785, 272]} closed fill={COLORS.catInnerEar} />
      <Line points={[855, 272, 895, 230, 902, 295]} closed fill={COLORS.catInnerEar} />

      {/* head */}
      <Ellipse x={820} y={360} radiusX={130} radiusY={115} fill={COLORS.catFur} stroke={COLORS.catFurDark} strokeWidth={6} />

      {/* angry eyes */}
      <Ellipse x={770} y={360} radiusX={28} radiusY={20} fill={COLORS.catEye} />
      <Ellipse x={870} y={360} radiusX={28} radiusY={20} fill={COLORS.catEye} />
      <Ellipse x={774} y={364} radiusX={7} radiusY={14} fill="#1b1b1b" />
      <Ellipse x={866} y={364} radiusX={7} radiusY={14} fill="#1b1b1b" />
      <Line points={[735, 318, 805, 352]} stroke={COLORS.catFurDark} strokeWidth={12} lineCap="round" />
      <Line points={[905, 318, 835, 352]} stroke={COLORS.catFurDark} strokeWidth={12} lineCap="round" />

      {/* nose, frown and whiskers */}
      <Line points={[808, 395, 832, 395, 820, 410]} closed fill={COLORS.catInnerEar} />
      <Line points={[790, 445, 820, 428, 850, 445]} stroke="#1b1b1b" strokeWidth={5} tension={0.5} lineCap="round" />
      {[-12, 0, 12].map((dy) => (
        <Group key={dy}>
          <Line points={[760, 412 + dy, 680, 400 + dy * 2]} stroke="#3d3d3d" strokeWidth={3} lineCap="round" />
          <Line points={[880, 412 + dy, 960, 400 + dy * 2]} stroke="#3d3d3d" strokeWidth={3} lineCap="round" />
        </Group>
      ))}
    </Group>
  );
}

function Desk() {
  return (
    <Group>
      <Rect x={500} y={600} width={640} height={30} fill={COLORS.endingWoodDark} cornerRadius={6} />
      <Rect x={520} y={630} width={600} height={FLOOR_Y - 630 + 20} fill={COLORS.endingWood} />
      <Rect x={560} y={655} width={240} height={70} stroke={COLORS.endingWoodDark} strokeWidth={4} cornerRadius={6} />
      <Rect x={840} y={655} width={240} height={70} stroke={COLORS.endingWoodDark} strokeWidth={4} cornerRadius={6} />

      {/* nameplate */}
      <Rect x={540} y={556} width={150} height={44} fill={COLORS.nameplate} stroke={COLORS.endingWoodDark} strokeWidth={3} cornerRadius={4} />
      <Text x={540} y={556} width={150} height={44} text="CEO" align="center" verticalAlign="middle" fontFamily={DISPLAY_FONT} fontSize={28} fill={COLORS.endingWoodDark} />

      {/* the player's article, on the desk */}
      <Group x={960} y={540} rotation={-8}>
        <Rect width={150} height={80} fill={COLORS.paper} stroke={COLORS.divider} strokeWidth={2} />
        <Text x={10} y={10} width={130} text="EXPOSED!" fontFamily={DISPLAY_FONT} fontSize={22} fill={COLORS.text} />
        {[44, 54, 64].map((y) => (
          <Line key={y} points={[10, y, 140, y]} stroke={COLORS.divider} strokeWidth={4} />
        ))}
      </Group>
    </Group>
  );
}

// Paws resting on the desk, cuffed together.
function CuffedPaws() {
  return (
    <Group>
      <Ellipse x={765} y={598} radiusX={42} radiusY={24} fill={COLORS.catFur} stroke={COLORS.catFurDark} strokeWidth={5} />
      <Ellipse x={875} y={598} radiusX={42} radiusY={24} fill={COLORS.catFur} stroke={COLORS.catFurDark} strokeWidth={5} />
      <Ellipse x={765} y={592} radiusX={34} radiusY={22} stroke={COLORS.handcuffs} strokeWidth={9} />
      <Ellipse x={875} y={592} radiusX={34} radiusY={22} stroke={COLORS.handcuffs} strokeWidth={9} />
      {[808, 820, 832].map((x) => (
        <Circle key={x} x={x} y={584} radius={6} stroke={COLORS.handcuffs} strokeWidth={4} />
      ))}
    </Group>
  );
}

// Good Ending art: the CEO cat cuffed at the desk while police lights flash outside.
export default function ArrestScene() {
  const redOn = useSirenFlash();

  return (
    <Group>
      {/* wall and floor run past the scene edges so they fill the window once scaled */}
      <Rect x={-SCENE_WIDTH} y={-SCENE_HEIGHT} width={SCENE_WIDTH * 3} height={SCENE_HEIGHT + FLOOR_Y} fill={COLORS.wall} />
      <Rect x={-SCENE_WIDTH} y={FLOOR_Y} width={SCENE_WIDTH * 3} height={SCENE_HEIGHT} fill={COLORS.endingFloor} />
      <PoliceWindow redOn={redOn} />
      <CeoCat />
      <Desk />
      <CuffedPaws />
      <SirenBeams redOn={redOn} />
    </Group>
  );
}
