import { addEvidence, clearEvidence, getEvidence } from "../../services/journal";
import { EvidenceModel } from "./EvidenceModel";
import { JournalModel } from "./JournalModel";

type Listener = () => void;

// The one shared journal. Other screens get it with JournalController.getInstance().
// It keeps a copy of the saved evidence in memory, so reading is instant and
// the views update right away. Changes are then saved through the service, and
// undone if saving fails.
export class JournalController {
    private static instance : JournalController | null = null;

    private model : JournalModel;
    private listeners = new Set<Listener>();
    private loading : Promise<void> | null = null;

    private constructor() {
        this.model = new JournalModel();
    }

    static getInstance() : JournalController {
        if (JournalController.instance === null) {
            JournalController.instance = new JournalController();
        }
        return JournalController.instance;
    }

    // Forgets the in-memory copy, like a page reload does. Tests only.
    static resetInstance() : void {
        JournalController.instance = null;
    }

    // Fetches the saved evidence. App.tsx waits for this before showing any
    // screen. Only fetches once, unless the last attempt failed.
    load() : Promise<void> {
        if (this.loading === null) {
            this.loading = getEvidence()
                .then((saved) => {
                    this.setEvidence(saved.map((item) =>
                        new EvidenceModel(item.id, item.toolName, item.toolDescription, item.iconPath)));
                })
                .catch((error : unknown) => {
                    this.loading = null;
                    throw error;
                });
        }
        return this.loading;
    }

    // A new array after every change, so React can tell that it changed.
    read() : readonly EvidenceModel[] {
        return this.model.evidenceList;
    }

    // Tells the listener about every change. Returns how to stop listening.
    subscribe(listener : Listener) : () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    // Resolves to false if it couldn't be saved. The evidence is removed again
    // in that case. Adding an id the journal already has does nothing.
    async add(evidence : EvidenceModel) : Promise<boolean> {
        if (this.read().some((item) => item.id === evidence.id)) return true;

        this.setEvidence([...this.read(), evidence]);
        try {
            await addEvidence(evidence);
            return true;
        } catch {
            this.setEvidence(this.read().filter((item) => item.id !== evidence.id));
            return false;
        }
    }

    // Empties the journal. Resolves to false, with the evidence put back, if
    // that couldn't be saved.
    async clear() : Promise<boolean> {
        const previous = this.model.evidenceList;

        this.setEvidence([]);
        try {
            await clearEvidence();
            return true;
        } catch {
            this.setEvidence(previous);
            return false;
        }
    }

    private setEvidence(evidence : EvidenceModel[]) : void {
        this.model.evidenceList = evidence;
        this.listeners.forEach((listener) => listener());
    }
}
