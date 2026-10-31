import type { EvidenceModel } from "./EvidenceModel";
import { JournalModel } from "./JournalModel";

// The one shared journal. Other screens get it with JournalController.getInstance().
export class JournalController {
    private static instance : JournalController | null = null;

    private model : JournalModel;

    private constructor() {
        this.model = new JournalModel();
    }

    static getInstance() : JournalController {
        if (JournalController.instance === null) {
            JournalController.instance = new JournalController();
        }
        return JournalController.instance;
    }

    read() : readonly EvidenceModel[] {
        return this.model.evidenceList;
    }

    add(evidence : EvidenceModel) : void {
        this.model.evidenceList.push(evidence);
    }

    // Empties the journal. Tests use this so evidence doesn't leak between them.
    clear() : void {
        this.model.evidenceList = [];
    }
}
