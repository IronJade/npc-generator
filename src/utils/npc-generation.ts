import { 
    AbilityName, 
    AbilityScores, 
    CharacterClass, 
    Race, 
    Alignment
} from '../types';

export class NPCGenerationUtils {
    /**
     * Roll ability scores using 4d6 drop lowest method
     * @returns AbilityScores object
     */
    static generateAbilityScores(): AbilityScores {
        const rollAbilityScore = (): number => {
            // Roll 4d6, drop the lowest
            const rolls = Array(4).fill(0).map(() => Math.floor(Math.random() * 6) + 1);
            rolls.sort((a, b) => a - b);
            rolls.shift(); // Remove lowest roll
            return rolls.reduce((a, b) => a + b, 0);
        };

        return {
            str: rollAbilityScore(),
            dex: rollAbilityScore(),
            con: rollAbilityScore(),
            int: rollAbilityScore(),
            wis: rollAbilityScore(),
            cha: rollAbilityScore()
        };
    }

    /**
     * Calculate ability modifiers
     * @param abilityScores 
     * @returns Partial ability modifiers
     */
    static calculateAbilityModifiers(abilityScores: AbilityScores): Partial<AbilityScores> {
        return Object.fromEntries(
            Object.entries(abilityScores).map(([ability, score]) => [
                ability, 
                Math.floor((score - 10) / 2)
            ])
        );
    }

    /**
     * Generate a random alignment
     * @returns Alignment
     */
    static generateAlignment(): Alignment {
        const lawfulness: string[] = ['Lawful', 'Neutral', 'Chaotic'];
        const goodness: string[] = ['Good', 'Neutral', 'Evil'];
        
        const lawChoice = lawfulness[Math.floor(Math.random() * lawfulness.length)];
        const goodChoice = goodness[Math.floor(Math.random() * goodness.length)];
        
        // Handle "Neutral Neutral" case
        if (lawChoice === 'Neutral' && goodChoice === 'Neutral') {
            return 'Neutral';
        }
        
        return `${lawChoice} ${goodChoice}` as Alignment;
    }

    /**
     * Generate a name based on race
     * @param race Race object
     * @returns string
     */
    static generateName(race: Race): string {
        const namesByRace: Record<string, { first: string[], last: string[] }> = {
            'Human': {
                first: ['James', 'John', 'Mary', 'Emma', 'Liam', 'Olivia', 'William', 'Ava', 'Sophia', 'Lucas'],
                last: ['Smith', 'Johnson', 'Brown', 'Williams', 'Jones', 'Miller', 'Davis', 'Garcia', 'Rodriguez', 'Wilson']
            },
            'Elf': {
                first: ['Aerith', 'Legolas', 'Elrond', 'Galadriel', 'Thranduil', 'Arwen', 'Celeborn', 'Tauriel', 'Haldir', 'Fëanor'],
                last: ['Silverleaf', 'Starweaver', 'Moonshadow', 'Windrider', 'Dawnbringer', 'Nightwalker', 'Sunseeker', 'Forestborn', 'Lightbringer', 'Swiftarrow']
            },
            // Add other races similarly...
        };

        // Default to human names if race doesn't exist
        const nameOptions = namesByRace[race.name] || namesByRace['Human'];
        
        const firstName = nameOptions.first[Math.floor(Math.random() * nameOptions.first.length)];
        const lastName = nameOptions.last[Math.floor(Math.random() * nameOptions.last.length)];
        
        return `${firstName} ${lastName}`;
    }

    /**
     * Calculate hit points for an NPC
     * @param characterClass Character's class
     * @param conModifier Constitution modifier
     * @param level Character level
     * @returns number
     */
    static calculateHitPoints(
        characterClass: CharacterClass, 
        conModifier: number, 
        level: number
    ): number {
        // First level: maximum hit die + constitution modifier
        const firstLevelHP = characterClass.hitDie + conModifier;
        
        // Subsequent levels: average of hit die + constitution modifier
        const subsequentLevelsHP = 
            ((characterClass.hitDie / 2) + 1 + conModifier) * (level - 1);
        
        return Math.floor(firstLevelHP + subsequentLevelsHP);
    }

    /**
     * Calculate proficiency bonus based on level
     * @param level Character level
     * @returns number
     */
    static calculateProficiencyBonus(level: number): number {
        return Math.ceil(level / 4) + 1;
    }

    /**
     * Apply racial ability score adjustments
     * @param baseScores Original ability scores
     * @param race Race with adjustments
     * @returns Adjusted ability scores
     */
    static applyRacialAdjustments(
        baseScores: AbilityScores, 
        race: Race
    ): AbilityScores {
        return {
            str: baseScores.str + (race.abilityScoreAdjustments.str || 0),
            dex: baseScores.dex + (race.abilityScoreAdjustments.dex || 0),
            con: baseScores.con + (race.abilityScoreAdjustments.con || 0),
            int: baseScores.int + (race.abilityScoreAdjustments.int || 0),
            wis: baseScores.wis + (race.abilityScoreAdjustments.wis || 0),
            cha: baseScores.cha + (race.abilityScoreAdjustments.cha || 0)
        };
    }

    /**
     * Generate skills for an NPC
     * @param characterClass Character's class
     * @param abilityModifiers Ability modifiers
     * @param level Character level
     * @returns Record of skills and their bonuses
     */
    static generateSkills(
        characterClass: CharacterClass, 
        abilityModifiers: Partial<AbilityScores>, 
        level: number
    ): Record<string, number> {
        const allSkills: Record<string, AbilityName> = {
            'Acrobatics': 'dex',
            'Animal Handling': 'wis',
            'Arcana': 'int',
            'Athletics': 'str',
            'Deception': 'cha',
            'History': 'int',
            'Insight': 'wis',
            'Intimidation': 'cha',
            'Investigation': 'int',
            'Medicine': 'wis',
            'Nature': 'int',
            'Perception': 'wis',
            'Performance': 'cha',
            'Persuasion': 'cha',
            'Religion': 'int',
            'Sleight of Hand': 'dex',
            'Stealth': 'dex',
            'Survival': 'wis'
        };
        
        const proficiencyBonus = this.calculateProficiencyBonus(level);
        const skills: Record<string, number> = {};
        
        // Get class skills
        const classSkills = characterClass.skills;
        const numProficiencies = 2 + Math.floor(Math.random() * 3); // 2-4 proficiencies
        const proficientSkills: string[] = [];
        
        // Select random proficiencies from class skills
        while (proficientSkills.length < numProficiencies && classSkills.length > proficientSkills.length) {
            const skill = classSkills[Math.floor(Math.random() * classSkills.length)];
            if (!proficientSkills.includes(skill)) {
                proficientSkills.push(skill);
            }
        }
        
        // Calculate skill bonuses
        for (const [skill, ability] of Object.entries(allSkills)) {
            const isProficient = proficientSkills.includes(skill);
            skills[skill] = (abilityModifiers[ability] || 0) + (isProficient ? proficiencyBonus : 0);
        }
        
        return skills;
    }
}