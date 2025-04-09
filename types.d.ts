export type AbilityName = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';
export interface AbilityScores {
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
}
export interface Race {
    name: string;
    abilityScoreAdjustments: Partial<AbilityScores>;
    traits: string[];
}
export interface CharacterClass {
    name: string;
    hitDie: 6 | 8 | 10 | 12;
    primaryAbility: AbilityName;
    savingThrows: AbilityName[];
    skills: string[];
}
export interface CustomParameter {
    name: string;
    label: string;
    enabled: boolean;
    format: string;
}
export interface Spellcasting {
    ability: string;
    saveDC: number;
    attackBonus: number;
    cantripsKnown: number;
    slots: Record<number, number>;
}
export type Alignment = 'Lawful Good' | 'Neutral Good' | 'Chaotic Good' | 'Lawful Neutral' | 'Neutral' | 'Chaotic Neutral' | 'Lawful Evil' | 'Neutral Evil' | 'Chaotic Evil';
export interface Trait {
    name: string;
    desc: string;
    attack_bonus: number;
}
export interface Action {
    name: string;
    desc: string;
    attack_bonus: number;
    damage_dice?: string;
    damage_bonus?: number;
}
export interface Possession {
    name: string;
    desc?: string;
}
export interface NPC {
    name: string;
    level: number;
    race: string;
    class: string;
    alignment: Alignment;
    abilityScores: AbilityScores;
    abilityModifiers: Partial<AbilityScores>;
    hitPoints: number;
    proficiencyBonus: number;
    skills: Record<string, number>;
    traits: string[];
    possessions: (Possession | string)[];
    customParameters: {
        spellcasting?: Spellcasting;
        [key: string]: any;
    };
}
export interface NPCGeneratorSettings {
    races: Race[];
    classes: CharacterClass[];
    customParameters: CustomParameter[];
    statblockFormat: 'fantasyStatblock' | 'basic';
}
export interface NPCGenerationOptions {
    level?: number;
    race?: string;
    class?: string;
    alignment?: Alignment;
    customParameters?: Record<string, any>;
}
