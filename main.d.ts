import { Plugin } from 'obsidian';
import { NPCGeneratorSettings, NPC, NPCGenerationOptions } from './types';
export default class NPCGenerator extends Plugin {
    settings: NPCGeneratorSettings;
    onload(): Promise<void>;
    loadSettings(): Promise<void>;
    saveSettings(): Promise<void>;
    /**
     * Generate an NPC based on provided options
     * @param options Generation options
     * @returns Generated NPC
     */
    generateNPC(options?: NPCGenerationOptions): NPC;
    /**
     * Get a random race from settings
     * @returns Race
     */
    private getRandomRace;
    /**
     * Get a random class from settings
     * @returns CharacterClass
     */
    private getRandomClass;
    /**
     * Format NPC statblock
     * @param npc NPC to format
     * @returns Formatted statblock string
     */
    formatStatblock(npc: NPC): string;
    /**
     * Format NPC using Fantasy Statblock format
     * @param npc NPC to format
     * @returns Formatted Fantasy Statblock string
     */
    private formatFantasyStatblock;
    /**
     * Format NPC using Basic Text format
     * @param npc NPC to format
     * @returns Formatted Basic Text string
     */
    private formatBasicStatblock;
}
