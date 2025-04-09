import { CharacterClass, Possession } from '../types';
export declare class PossessionsUtils {
    /**
     * Base equipment for different classes
     */
    private static classEquipment;
    /**
     * List of possible special items
     */
    private static specialItems;
    /**
     * Generate possessions for an NPC
     * @param characterClass Character's class
     * @returns Array of possessions
     */
    static generatePossessions(characterClass: CharacterClass): (string | Possession)[];
    /**
     * Add special items to base equipment
     * @param baseEquipment Base equipment list
     * @returns Enhanced equipment list
     */
    private static addSpecialItems;
    /**
     * Format possessions for display
     * @param possessions List of possessions
     * @returns Formatted possession strings
     */
    static formatPossessions(possessions: (string | Possession)[]): string[];
}
