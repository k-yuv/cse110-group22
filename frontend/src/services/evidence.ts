// A piece of evidence the player collected. It carries no rating: how strong
// it is depends on the article subject, and that is decided by the backend.
export interface Evidence {
  id: string;
  title: string;
  description: string;
}

// MOCK: stands in for the Journal's read API (issue #36). Replace the body
// with a fetch call once that exists; callers won't need to change.
const MOCK_EVIDENCE: Evidence[] = [
  {
    id: "ev-marshal",
    title: "Fire marshal report",
    description: "Official report naming faulty wiring as the cause.",
  },
  {
    id: "ev-cctv",
    title: "Security camera footage",
    description: "Shows no one entering the building that night.",
  },
  {
    id: "ev-inspection",
    title: "Inspection records",
    description: "Wiring flagged as unsafe two months earlier.",
  },
  {
    id: "ev-foreman",
    title: "Foreman interview",
    description: "First-hand account of sparks near the fuse box.",
  },
  {
    id: "ev-insurance",
    title: "Insurance claim",
    description: "Filed a week after the fire, at the usual value.",
  },
  {
    id: "ev-forum",
    title: "Anonymous forum post",
    description: "Claims the owner set the fire for money.",
  },
  {
    id: "ev-neighbor",
    title: "Neighbor's rumor",
    description: "Heard from a friend that it was arson.",
  },
  {
    id: "ev-weather",
    title: "Weather report",
    description: "It was cloudy that evening.",
  },
  {
    id: "ev-electrician",
    title: "Electrician invoice",
    description: "Repair to the fuse box was booked but never done.",
  },
  {
    id: "ev-911",
    title: "911 call transcript",
    description: "Caller reports smoke from the electrical room.",
  },
  {
    id: "ev-lab",
    title: "Lab analysis",
    description: "No accelerants found in the debris samples.",
  },
  {
    id: "ev-photos",
    title: "Scene photos",
    description: "Burn pattern starts at the main panel.",
  },
  {
    id: "ev-employee",
    title: "Night shift log",
    description: "Guard noted a burning smell an hour before.",
  },
  {
    id: "ev-tweet",
    title: "Viral tweet",
    description: "Unverified account says the doors were chained.",
  },
  {
    id: "ev-tabloid",
    title: "Tabloid headline",
    description: '"Owner\'s Secret Debts!" with no named sources.',
  },
  {
    id: "ev-cousin",
    title: "Owner's cousin",
    description: 'Second-hand: "He always hated that building."',
  },
  {
    id: "ev-menu",
    title: "Cafeteria menu",
    description: "Lunch that day was tomato soup.",
  },
  {
    id: "ev-parking",
    title: "Parking tickets",
    description: "Two tickets on a nearby street that week.",
  },
  {
    id: "ev-nicotine",
    title: "Nicotine",
    description:
      "A dangerous chemical, found in Big Drug Inc’s catnip by some research paper.",
  },
];

export async function getCollectedEvidence(): Promise<Evidence[]> {
  return MOCK_EVIDENCE;
}
