export class EvidenceModel {
    id : string;
    toolName : string;
    toolDescription : string;
    iconPath : string; 

    constructor(id : string, toolName : string, toolDescription : string, iconPath : string) {
        this.id = id;
        this.toolName = toolName;
        this.toolDescription = toolDescription;
        this.iconPath = iconPath;
    }
}
