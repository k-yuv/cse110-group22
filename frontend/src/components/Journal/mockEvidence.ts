import { EvidenceModel } from "./EvidenceModel";
import { JournalController } from "./JournalController";

// MOCK: stands in for evidence the player collects on other screens. Remove
// once those screens call JournalController.getInstance().add().
const MOCK_EVIDENCE : EvidenceModel[] = [
    new EvidenceModel("ev-marshal", "Fire marshal report", "Official report naming faulty wiring as the cause.", ""),
    new EvidenceModel("ev-cctv", "Security camera footage", "Shows no one entering the building that night.", ""),
    new EvidenceModel("ev-inspection", "Inspection records", "Wiring flagged as unsafe two months earlier.", ""),
    new EvidenceModel("ev-foreman", "Foreman interview", "First-hand account of sparks near the fuse box.", ""),
    new EvidenceModel("ev-insurance", "Insurance claim", "Filed a week after the fire, at the usual value.", ""),
    new EvidenceModel("ev-forum", "Anonymous forum post", "Claims the owner set the fire for money.", ""),
    new EvidenceModel("ev-neighbor", "Neighbor's rumor", "Heard from a friend that it was arson.", ""),
    new EvidenceModel("ev-weather", "Weather report", "It was cloudy that evening.", ""),
    new EvidenceModel("ev-electrician", "Electrician invoice", "Repair to the fuse box was booked but never done.", ""),
    new EvidenceModel("ev-911", "911 call transcript", "Caller reports smoke from the electrical room.", ""),
    new EvidenceModel("ev-lab", "Lab analysis", "No accelerants found in the debris samples.", ""),
    new EvidenceModel("ev-photos", "Scene photos", "Burn pattern starts at the main panel.", ""),
    new EvidenceModel("ev-employee", "Night shift log", "Guard noted a burning smell an hour before.", ""),
    new EvidenceModel("ev-tweet", "Viral tweet", "Unverified account says the doors were chained.", ""),
    new EvidenceModel("ev-tabloid", "Tabloid headline", "\"Owner's Secret Debts!\" with no named sources.", ""),
    new EvidenceModel("ev-cousin", "Owner's cousin", "Second-hand: \"He always hated that building.\"", ""),
    new EvidenceModel("ev-menu", "Cafeteria menu", "Lunch that day was tomato soup.", ""),
    new EvidenceModel("ev-parking", "Parking tickets", "Two tickets on a nearby street that week.", ""),
    new EvidenceModel("ev-nicotine", "Nicotine", "A dangerous chemical, found in Big Drug Inc’s catnip by some research paper.", ""),
];

export function seedMockEvidence() : void {
    const journal = JournalController.getInstance();
    if (journal.read().length > 0) return;
    MOCK_EVIDENCE.forEach((evidence) => journal.add(evidence));
}
