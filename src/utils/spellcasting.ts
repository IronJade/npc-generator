import { CharacterClass, Spellcasting, AbilityName } from '../types';

export class SpellcastingUtils {
    /**
     * Spellcasting ability for different classes
     */
    private static spellcastingAbilities: Record<string, AbilityName> = {
        'Wizard': 'int',
        'Cleric': 'wis',
        'Bard': 'cha',
        'Druid': 'wis',
        'Paladin': 'cha',
        'Sorcerer': 'cha',
        'Warlock': 'cha'
    };

    /**
     * Predefined spell lists by class and level
     */
    private static spellsByClassAndLevel: Record<string, Record<number, string[]>> = {
        'Wizard': {
            1: ['mage armor', 'magic missile', 'shield', 'detect magic'],
            2: ['mirror image', 'misty step', 'web', 'invisibility'],
            3: ['fireball', 'counterspell', 'fly', 'haste'],
            4: ['polymorph', 'greater invisibility', 'ice storm', 'banishment'],
            5: ['cone of cold', 'wall of force', 'teleportation circle', 'scrying'],
            6: ['disintegrate', 'globe of invulnerability', 'chain lightning', 'true seeing'],
            7: ['teleport', 'finger of death', 'simulacrum', 'plane shift'],
            8: ['power word stun', 'mind blank', 'maze', 'dominate monster'],
            9: ['wish', 'time stop', 'meteor swarm', 'power word kill']
        },
        'Cleric': {
            1: ['cure wounds', 'guiding bolt', 'healing word', 'bless'],
            2: ['spiritual weapon', 'prayer of healing', 'lesser restoration', 'hold person'],
            3: ['revivify', 'mass healing word', 'spirit guardians', 'dispel magic'],
            4: ['guardian of faith', 'death ward', 'freedom of movement', 'banishment'],
            5: ['flame strike', 'greater restoration', 'mass cure wounds', 'raise dead'],
            6: ['heal', 'harm', 'heroes\' feast', 'word of recall'],
            7: ['divine word', 'regenerate', 'resurrection', 'plane shift'],
            8: ['holy aura', 'earthquake', 'antimagic field', 'control weather'],
            9: ['mass heal', 'true resurrection', 'gate', 'power word heal']
        }
    };

    /**
     * Predefined cantrips by class
     */
    private static cantrips: Record<string, string[]> = {
        'Wizard': ['fire bolt', 'mage hand', 'prestidigitation', 'minor illusion'],
        'Cleric': ['sacred flame', 'guidance', 'light', 'thaumaturgy']
    };

    /**
     * Determine if a class is a spellcaster
     * @param characterClass Character's class
     * @returns boolean
     */
    static isSpellcaster(characterClass: CharacterClass): boolean {
        return characterClass.name in this.spellcastingAbilities;
    }

    /**
     * Generate spellcasting information
     * @param characterClass Character's class
     * @param abilityModifiers Ability modifiers
     * @param level Character level
     * @returns Spellcasting object or null
     */
    static generateSpellcasting(
        characterClass: CharacterClass, 
        abilityModifiers: Partial<Record<AbilityName, number>>, 
        level: number
    ): Spellcasting | null {
        // Check if the class is a spellcaster
        const spellcastingAbility = this.spellcastingAbilities[characterClass.name];
        if (!spellcastingAbility) return null;

        // Get ability modifier
        const modifier = abilityModifiers[spellcastingAbility] || 0;

        // Calculate spellcasting parameters
        const saveDC = 8 + Math.ceil(level / 4) + 1 + modifier;
        const attackBonus = Math.ceil(level / 4) + 1 + modifier;
        
        // Cantrips known
        const cantripsKnown = Math.min(4, Math.floor(level / 4) + 2);
        
        // Spell slots
        const maxSlotLevel = Math.min(9, Math.ceil(level / 2));
        const slots: Record<number, number> = {};
        
        for (let i = 1; i <= maxSlotLevel; i++) {
            if (level < i * 2 - 1) continue;
            
            // Basic formula for slot count (simplified from 5e rules)
            let slotCount = 0;
            if (i === 1) slotCount = Math.min(4, level);
            else if (i === 2) slotCount = Math.min(3, Math.floor((level - 2) / 2));
            else if (i === 3) slotCount = Math.min(3, Math.floor((level - 4) / 2));
            else if (i === 4) slotCount = Math.min(3, Math.floor((level - 6) / 2));
            else if (i === 5) slotCount = Math.min(3, Math.floor((level - 8) / 2));
            else if (i <= 9) slotCount = Math.min(1, Math.floor((level - 10) / 2));
            
            slots[i] = Math.max(0, slotCount);
        }
        
        return {
            ability: spellcastingAbility.toUpperCase(),
            saveDC,
            attackBonus,
            cantripsKnown,
            slots
        };
    }

    /**
     * Get spells for a given class and spell level
     * @param className Class name
     * @param spellLevel Spell level
     * @returns Array of spell names
     */
    static getSpellsByClassAndLevel(
        className: string, 
        spellLevel: number
    ): string[] {
        return this.spellsByClassAndLevel[className]?.[spellLevel] || [];
    }

    /**
     * Get cantrips for a given class
     * @param className Class name
     * @returns Array of cantrip names
     */
    static getCantrips(className: string): string[] {
        return this.cantrips[className] || [];
    }
}
