export class EvidenceModel {
    toolName : string;
    toolDescription : string;
    iconPath : string; 

    constructor(toolName : string, toolDescription : string, iconPath : string) {
        this.toolName = toolName;
        this.toolDescription = toolDescription;
        this.iconPath = iconPath;
    }
}