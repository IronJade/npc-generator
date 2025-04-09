import { CharacterClass, Spellcasting, AbilityName } from '../types';
export declare class SpellcastingUtils {
    /**
     * Spellcasting ability for different classes
     */
    private static spellcastingAbilities;
    /**
     * Predefined spell lists by class and level
     */
    private static spellsByClassAndLevel;
    /**
     * Predefined cantrips by class
     */
    private static cantrips;
    /**
     * Determine if a class is a spellcaster
     * @param characterClass Character's class
     * @returns boolean
     */
    static isSpellcaster(characterClass: CharacterClass): boolean;
    /**
     * Generate spellcasting information
     * @param characterClass Character's class
     * @param abilityModifiers Ability modifiers
     * @param level Character level
     * @returns Spellcasting object or null
     */
    static generateSpellcasting(characterClass: CharacterClass, abilityModifiers: Partial<Record<AbilityName, number>>, level: number): Spellcasting | null;
    /**
     * Get spells for a given class and spell level
     * @param className Class name
     * @param spellLevel Spell level
     * @returns Array of spell names
     */
    static getSpellsByClassAndLevel(className: string, spellLevel: number): string[];
    /**
     * Get cantrips for a given class
     * @param className Class name
     * @returns Array of cantrip names
     */
    static getCantrips(className: string): string[];
}
