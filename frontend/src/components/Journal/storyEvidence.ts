import { EvidenceModel } from "./EvidenceModel";

// Every piece of evidence the player can collect, grouped by the story event
// that gives it (Figma: Page Story → Evidence by Event). The ids are rated per
// article question in backend/seed/articleRatings.json. Only events with a
// built activity are listed; add a group here when its activity exists.
export type StoryEventId =
    | "cnn-article"            // E2 News Article Deciphering: CNN vs. UC Cat City study
    | "public-opinion"         // E3 Social Media Evaluation: Find Public Opinion Online
    | "ceo-coffee-chat";       // E4 Interview: Coffee Chat w/ Big Drug Inc. CEO

function evidence(id : string, toolName : string, toolDescription : string) : EvidenceModel {
    return new EvidenceModel(id, toolName, toolDescription, "");
}

export const STORY_EVIDENCE : Record<StoryEventId, readonly EvidenceModel[]> = {
    "cnn-article": [
            // I will add this CNN Article to the journal as evidence
        evidence("ev-cnn-article", "CNN Article Claim", "Says catnip helps Cats relax after a long day. Citing a UC Cat City study where over 90% of new users feel much happier."),
            // I will add this CNN Ownership to the journal as evidence
        evidence("ev-cnn-owner", "CNN Ownership", "CNN (Cat News Network) is owned by Big Drug Inc."),
            // I will add this UC Cat City Study to the journal as evidence.
        evidence("ev-ucc-study", "UC Cat City Study", "92% of cats are much happier in week 1, but by week 4 are less happy than cats who never took it."),
            // I will add this CNN Omission to the journal as evidence. This should be the Strongest evidence of this section
        evidence("ev-cnn-omission", "CNN Claim Vs. Study", "The article only reports short-term effects and never mentions week 4 onward."),
        evidence("ev-nicotine", "Addictive Chemical", "An Addictive chemical found in Big Drug Inc.'s catnip by the research paper."),
    ],
    "public-opinion": [
        evidence("ev-rentfreecat-post", "RentFreeCat wellness post", "The influencer promotes catnip with no #sponsored tag."),
    ],
    "ceo-coffee-chat": [
        evidence("ev-ceo-values", "CEO's view on catnip", "\"Repeat customers are good customers.\" Profit comes before the customers' health."),
        evidence("ev-ceo-request", "CEO's request", "Asked the journalist not to post bad claims about the company."),
        evidence("ev-ceo-pr-claims", "CEO's safety claims", "\"Our catnip is perfectly safe.\" No data given."),
        evidence("ev-ceo-deluxe-hint", "Next-product hint", "The CEO teases a \"better\" catnip coming soon."),
    ],
};

export const ALL_STORY_EVIDENCE : readonly EvidenceModel[] = Object.values(STORY_EVIDENCE).flat();
