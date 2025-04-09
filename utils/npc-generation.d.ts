import { AbilityScores, CharacterClass, Race, Alignment } from '../types';
export declare class NPCGenerationUtils {
    /**
     * Roll ability scores using 4d6 drop lowest method
     * @returns AbilityScores object
     */
    static generateAbilityScores(): AbilityScores;
    /**
     * Calculate ability modifiers
     * @param abilityScores
     * @returns Partial ability modifiers
     */
    static calculateAbilityModifiers(abilityScores: AbilityScores): Partial<AbilityScores>;
    /**
     * Generate a random alignment
     * @returns Alignment
     */
    static generateAlignment(): Alignment;
    /**
     * Generate a name based on race
     * @param race Race object
     * @returns string
     */
    static generateName(race: Race): string;
    /**
     * Calculate hit points for an NPC
     * @param characterClass Character's class
     * @param conModifier Constitution modifier
     * @param level Character level
     * @returns number
     */
    static calculateHitPoints(characterClass: CharacterClass, conModifier: number, level: number): number;
    /**
     * Calculate proficiency bonus based on level
     * @param level Character level
     * @returns number
     */
    static calculateProficiencyBonus(level: number): number;
    /**
     * Apply racial ability score adjustments
     * @param baseScores Original ability scores
     * @param race Race with adjustments
     * @returns Adjusted ability scores
     */
    static applyRacialAdjustments(baseScores: AbilityScores, race: Race): AbilityScores;
    /**
     * Generate skills for an NPC
     * @param characterClass Character's class
     * @param abilityModifiers Ability modifiers
     * @param level Character level
     * @returns Record of skills and their bonuses
     */
    static generateSkills(characterClass: CharacterClass, abilityModifiers: Partial<AbilityScores>, level: number): Record<string, number>;
}
