import { EvidenceModel } from "./EvidenceModel";
import { JournalController } from "./JournalController";

// Every piece of evidence the player can collect, grouped by the story event
// that gives it (Figma: Page Story → Evidence by Event, badges E1–E7). The ids
// are rated per article question in backend/seed/articleRatings.json.
export type StoryEventId =
    | "inciting-letter"        // E1 Inciting Event: the whistleblower's letter
    | "cnn-article"            // E2 News Article Deciphering: CNN vs. UC Cat City study
    | "public-opinion"         // E3 Social Media Evaluation: Find Public Opinion Online
    | "ceo-coffee-chat"        // E4 Interview: Coffee Chat w/ Big Drug Inc. CEO
    | "whistleblower-interview" // E5 Interview: Formal Interview w/ Whistleblower
    | "deluxe-transcript"      // E6 News Article Deciphering: Owned Article vs Transcript
    | "deluxe-reaction"        // E7 Social Media: Analyze reaction to the new product
    | "unassigned";            // From the story notes; no event gives it yet

function evidence(id : string, toolName : string, toolDescription : string) : EvidenceModel {
    return new EvidenceModel(id, toolName, toolDescription, "");
}

export const STORY_EVIDENCE : Record<StoryEventId, readonly EvidenceModel[]> = {
    "inciting-letter": [
        evidence("ev-letter", "Anonymous letter", "Claims Big Drug Inc. uses its ownership of local media to make itself look better."),
        evidence("ev-letter-addiction", "Letter's addiction claim", "Says cats are more addicted to catnip than the company admits."),
        evidence("ev-letter-newproduct", "New product tip", "Warns that a new version of the catnip is coming soon."),
    ],
    "cnn-article": [
        evidence("ev-cnn-article", "CNN catnip article", "Says catnip helps workers relax after a long day. Published by a Big Drug Inc.-owned paper."),
        evidence("ev-cnn-testimonials", "\"Local worker\" quotes", "Unnamed workers praising catnip. No way to check who they are."),
        evidence("ev-cnn-owner", "CNN ownership", "CNN (Cat News Network) is owned by Big Drug Inc."),
        evidence("ev-ucc-study", "UC Cat City study", "92% of cats are much happier in week 1, but by week 4 are less happy than cats who never took it."),
        evidence("ev-cnn-omission", "What CNN left out", "The article only reports short-term effects and never mentions week 4 onward."),
        evidence("ev-nicotine", "Nicotine", "A dangerous chemical found in Big Drug Inc.'s catnip by the research paper."),
    ],
    "public-opinion": [
        evidence("ev-avogato-post", "Avogato Fisher's review", "A regular buyer describes being addicted and having bad withdrawals."),
        evidence("ev-withdrawal-posts", "Withdrawal posts", "Several unrelated users report the same withdrawal symptoms."),
        evidence("ev-rentfreecat-post", "RentFreeCat wellness post", "The influencer promotes catnip with no #sponsored tag."),
        evidence("ev-before-after", "\"Before & after\" photo", "An AI-generated photo of a cat's catnip transformation."),
        evidence("ev-fan-reposts", "Fan reposts", "Fans repeat the influencer's script word for word."),
        evidence("ev-irrelevant-post", "Catnip Burger price post", "A cat complaining that Catnip Burger raised its prices."),
    ],
    "ceo-coffee-chat": [
        evidence("ev-ceo-values", "CEO's view on catnip", "\"Repeat customers are good customers.\" Profit comes before the customers' health."),
        evidence("ev-ceo-request", "CEO's request", "Asked the journalist not to post bad claims about the company."),
        evidence("ev-ceo-pr-claims", "CEO's safety claims", "\"Our catnip is perfectly safe.\" No data given."),
        evidence("ev-ceo-deluxe-hint", "Next-product hint", "The CEO teases a \"better\" catnip coming soon."),
    ],
    "whistleblower-interview": [
        evidence("ev-wb-testimony", "Whistleblower testimony", "A former employee describes life at the company and why they were fired."),
        evidence("ev-wb-internal-docs", "Leaked internal memo", "Internal plans for the new product's formula: more of the addictive ingredient."),
        evidence("ev-wb-warning", "Whistleblower's warning", "Says the new product will be more addictive than the current one."),
        evidence("ev-wb-fired-staff", "Fired media staff", "Journalists and social media managers were fired for honest reports."),
    ],
    "deluxe-transcript": [
        evidence("ev-deluxe-article", "Catnip Deluxe launch article", "Company-owned coverage that reads like an ad for Catnip Deluxe."),
        evidence("ev-deluxe-transcript", "Press conference transcript", "The full, unedited record of what the CEO said at the launch."),
        evidence("ev-deluxe-cut-question", "Dodged question", "A reporter asked about side effects and the CEO deflected. The article left it out."),
        evidence("ev-deluxe-misquote", "Misquote", "The article turns the CEO's \"less tested\" into \"well tested\"."),
    ],
    "deluxe-reaction": [
        evidence("ev-catthew-week1", "Catthew Myers, first try", "Loved Catnip Deluxe on day one."),
        evidence("ev-catthew-week2", "Catthew Myers, a week later", "Now heavily reliant on catnip."),
        evidence("ev-deluxe-hype", "Hype posts", "Many identical \"best catnip ever!\" posts, possibly paid or bots."),
        evidence("ev-deluxe-rumor", "Viral rumor", "\"Deluxe killed my neighbor's cat.\" No source."),
    ],
    "unassigned": [
        evidence("ev-doctor-records", "Prescription records", "A doctor over-prescribes Big Drug Inc. catnip, with grant and vacation receipts."),
        evidence("ev-burger-manual", "Catnip Burger training manual", "Sales quotas for the catnip add-on and delivery routes into Tabby Town."),
        evidence("ev-clinic-data", "Free clinic data", "A spike in emergency visits and a lab test of the laced catnip."),
        evidence("ev-mayor-donations", "Mayor donation records", "Big Drug Inc. funded the mayor's campaign."),
        evidence("ev-chief-golf", "Police chief golf photo", "The police chief golfing with the CEO."),
    ],
};

export const ALL_STORY_EVIDENCE : readonly EvidenceModel[] = Object.values(STORY_EVIDENCE).flat();

// TEMPORARY: fills an empty journal with every piece of story evidence, until
// each activity screen adds its own STORY_EVIDENCE[event] with
// JournalController.getInstance().add() as the player finds it.
export function seedStoryEvidence() : void {
    const journal = JournalController.getInstance();
    if (journal.read().length > 0) return;
    ALL_STORY_EVIDENCE.forEach((item) => journal.add(item));
}
