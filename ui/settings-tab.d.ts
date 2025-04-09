import { App, PluginSettingTab } from 'obsidian';
import NPCGenerator from '../main';
export declare class NPCGeneratorSettingsTab extends PluginSettingTab {
    private plugin;
    constructor(app: App, plugin: NPCGenerator);
    display(): void;
    /**
     * Add Statblock Format Selection
     */
    private addStatblockFormatSection;
    /**
     * Add Races Management Section
     */
    private addRacesSection;
    /**
     * Add Classes Management Section
     */
    private addClassesSection;
    /**
     * Add Custom Parameters Management Section
     */
    private addCustomParametersSection;
    /**
     * Open Race Modal for Adding/Editing
     */
    private openRaceModal;
    /**
     * Open Class Modal for Adding/Editing
     */
    private openClassModal;
    /**
     * Open Custom Parameter Modal for Adding/Editing
     */
    private openCustomParameterModal;
    /**
     * Format race description for display
     */
    private formatRaceDescription;
    /**
     * Format class description for display
     */
    private formatClassDescription;
}
