import { Plugin } from 'obsidian';

import { 
    NPCGeneratorSettings, 
    NPC, 
    NPCGenerationOptions, 
    CharacterClass, 
    Race
} from './types';

import { NPCGenerationUtils } from './utils/npc-generation';
import { PossessionsUtils } from './utils/possessions';
import { SpellcastingUtils } from './utils/spellcasting';
import { NPCGeneratorModal } from './ui/modal';
import { NPCGeneratorSettingsTab } from './ui/settings-tab';

export default class NPCGenerator extends Plugin {
    settings: NPCGeneratorSettings = {} as NPCGeneratorSettings;

    async onload() {
        // Load settings
        await this.loadSettings();
        
        // Add ribbon icon
        this.addRibbonIcon('dice', 'Generate NPC', () => {
            new NPCGeneratorModal(this.app, this).open();
        });

        // Add settings tab
        this.addSettingTab(new NPCGeneratorSettingsTab(this.app, this));
        
        // Add command to generate NPC
        this.addCommand({
            id: 'generate-npc',
            name: 'Generate NPC',
            callback: () => {
                new NPCGeneratorModal(this.app, this).open();
            }
        });
    }

    async loadSettings() {
        // Default settings
        const defaultSettings: NPCGeneratorSettings = {
            races: [
                { 
                    name: "Human", 
                    abilityScoreAdjustments: { str: 1, dex: 1, con: 1, int: 1, wis: 1, cha: 1 }, 
                    traits: [] 
                },
                { 
                    name: "Elf", 
                    abilityScoreAdjustments: { dex: 2, int: 1 }, 
                    traits: ["Darkvision", "Fey Ancestry"] 
                },
                // Add other default races...
            ],
            classes: [
                { 
                    name: "Fighter", 
                    hitDie: 10, 
                    primaryAbility: "str", 
                    savingThrows: ["str", "con"], 
                    skills: ["Athletics", "Intimidation", "Perception"] 
                },
                // Add other default classes...
            ],
            customParameters: [],
            statblockFormat: "fantasyStatblock"
        };

        // Load saved settings or use defaults
        this.settings = Object.assign({}, defaultSettings, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    /**
     * Generate an NPC based on provided options
     * @param options Generation options
     * @returns Generated NPC
     */
    generateNPC(options: NPCGenerationOptions = {}): NPC {
        // Default options
        const defaults: NPCGenerationOptions = {
            level: Math.floor(Math.random() * 20) + 1,
            race: this.getRandomRace().name,
            class: this.getRandomClass().name,
            alignment: NPCGenerationUtils.generateAlignment(),
        };

        // Merge defaults with provided options
        const mergedOptions = { ...defaults, ...options };

        // Find selected race and class
        const race = this.settings.races.find(r => r.name === mergedOptions.race)!;
        const characterClass = this.settings.classes.find(c => c.name === mergedOptions.class)!;

        // Generate base ability scores
        let abilityScores = NPCGenerationUtils.generateAbilityScores();
        
        // Apply racial adjustments
        abilityScores = NPCGenerationUtils.applyRacialAdjustments(abilityScores, race);
        
        // Calculate ability modifiers
        const abilityModifiers = NPCGenerationUtils.calculateAbilityModifiers(abilityScores);

        // Calculate hit points
        const hitPoints = NPCGenerationUtils.calculateHitPoints(
            characterClass, 
            abilityModifiers.con ?? 0, 
            mergedOptions.level!
        );

        // Generate skills
        const skills = NPCGenerationUtils.generateSkills(
            characterClass, 
            abilityModifiers, 
            mergedOptions.level!
        );

        // Generate proficiency bonus
        const proficiencyBonus = NPCGenerationUtils.calculateProficiencyBonus(mergedOptions.level!);

        // Generate name
        const name = NPCGenerationUtils.generateName(race);

        // Generate possessions
        const possessions = PossessionsUtils.generatePossessions(characterClass);

        // Generate spellcasting (if applicable)
        const spellcasting = SpellcastingUtils.isSpellcaster(characterClass)
            ? SpellcastingUtils.generateSpellcasting(
                characterClass, 
                abilityModifiers, 
                mergedOptions.level!
            )
            : undefined;

        // Prepare custom parameters
        const customParameters: Record<string, any> = {};
        if (spellcasting) {
            customParameters.spellcasting = spellcasting;
        }

        // Return complete NPC object
        return {
            name,
            level: mergedOptions.level!,
            race: race.name,
            class: characterClass.name,
            alignment: mergedOptions.alignment!,
            abilityScores,
            abilityModifiers,
            hitPoints,
            proficiencyBonus,
            skills,
            traits: race.traits,
            possessions,
            customParameters
        };
    }

    /**
     * Get a random race from settings
     * @returns Race
     */
    private getRandomRace(): Race {
        return this.settings.races[
            Math.floor(Math.random() * this.settings.races.length)
        ];
    }

    /**
     * Get a random class from settings
     * @returns CharacterClass
     */
    private getRandomClass(): CharacterClass {
        return this.settings.classes[
            Math.floor(Math.random() * this.settings.classes.length)
        ];
    }

    /**
     * Format NPC statblock
     * @param npc NPC to format
     * @returns Formatted statblock string
     */
    formatStatblock(npc: NPC): string {
        if (this.settings.statblockFormat === 'fantasyStatblock') {
            return this.formatFantasyStatblock(npc);
        } else {
            return this.formatBasicStatblock(npc);
        }
    }

    /**
     * Format NPC using Fantasy Statblock format
     * @param npc NPC to format
     * @returns Formatted Fantasy Statblock string
     */
    private formatFantasyStatblock(npc: NPC): string {
        // Fantasy Statblock format (compatible with Fantasy Statblock plugin)
        return `---
name: ${npc.name}
size: Medium
type: humanoid
alignment: ${npc.alignment}
ac: ${10 + (npc.abilityModifiers.dex ?? 0)}
hp: ${npc.hitPoints}
hit_dice: ${npc.level}d${this.settings.classes.find(c => c.name === npc.class)?.hitDie || 8}
speed: 30 ft.
stats: [${npc.abilityScores.str}, ${npc.abilityScores.dex}, ${npc.abilityScores.con}, ${npc.abilityScores.int}, ${npc.abilityScores.wis}, ${npc.abilityScores.cha}]
skillsaves:
${Object.entries(npc.skills).filter(([_, value]) => value !== 0).map(([skill, bonus]) => 
`  "${skill}": ${bonus >= 0 ? '+' + bonus : bonus}`).join('\n')}
damage_resistances: 
condition_immunities: 
senses: passive Perception ${10 + (npc.skills['Perception'] ?? 0)}
languages: Common
cr: ${Math.max(1, Math.floor(npc.level / 4))}
---

# ${npc.name}
*Level ${npc.level} ${npc.race} ${npc.class}, ${npc.alignment}*

**Armor Class** ${10 + (npc.abilityModifiers.dex ?? 0)}
**Hit Points** ${npc.hitPoints} (${npc.level}d${this.settings.classes.find(c => c.name === npc.class)?.hitDie || 8} + ${npc.level * (npc.abilityModifiers.con ?? 0)})
**Speed** 30 ft.

|STR|DEX|CON|INT|WIS|CHA|
|:---:|:---:|:---:|:---:|:---:|:---:|
|${npc.abilityScores.str} (${(npc.abilityModifiers.str ?? 0) >= 0 ? '+' + (npc.abilityModifiers.str ?? 0) : npc.abilityModifiers.str ?? 0})|${npc.abilityScores.dex} (${(npc.abilityModifiers.dex ?? 0) >= 0 ? '+' + (npc.abilityModifiers.dex ?? 0) : npc.abilityModifiers.dex ?? 0})|${npc.abilityScores.con} (${(npc.abilityModifiers.con ?? 0) >= 0 ? '+' + (npc.abilityModifiers.con ?? 0) : npc.abilityModifiers.con ?? 0})|${npc.abilityScores.int} (${(npc.abilityModifiers.int ?? 0) >= 0 ? '+' + (npc.abilityModifiers.int ?? 0) : npc.abilityModifiers.int ?? 0})|${npc.abilityScores.wis} (${(npc.abilityModifiers.wis ?? 0) >= 0 ? '+' + (npc.abilityModifiers.wis ?? 0) : npc.abilityModifiers.wis ?? 0})|${npc.abilityScores.cha} (${(npc.abilityModifiers.cha ?? 0) >= 0 ? '+' + (npc.abilityModifiers.cha ?? 0) : npc.abilityModifiers.cha ?? 0})|

**Skills** ${Object.entries(npc.skills).filter(([_, value]) => value !== 0).map(([skill, bonus]) => 
`${skill} ${bonus >= 0 ? '+' + bonus : bonus}`).join(', ')}
**Senses** passive Perception ${10 + (npc.skills['Perception'] ?? 0)}
**Languages** Common
**Challenge** ${Math.max(1, Math.floor(npc.level / 4))} (${Math.max(200, npc.level * 50)} XP)
**Proficiency Bonus** +${npc.proficiencyBonus}

${npc.traits.length > 0 ? '## Traits\n\n' + npc.traits.map(trait => `***${trait}.*** Racial trait description.`).join('\n\n') + '\n\n' : ''}
${npc.customParameters.spellcasting ? '## Spellcasting\n\n' + 
`The NPC is a level ${npc.level} spellcaster. Its spellcasting ability is ${npc.customParameters.spellcasting.ability} (spell save DC ${npc.customParameters.spellcasting.saveDC}, ${npc.customParameters.spellcasting.attackBonus >= 0 ? '+' + npc.customParameters.spellcasting.attackBonus : npc.customParameters.spellcasting.attackBonus} to hit with spell attacks). It has the following spells prepared:\n\n` +
`Cantrips (at will): ${SpellcastingUtils.getCantrips(npc.class).slice(0, npc.customParameters.spellcasting.cantripsKnown).join(', ')}\n` +
Object.entries(npc.customParameters.spellcasting.slots).filter(([_, slots]) => slots > 0).map(([level, slots]) => 
`${getOrdinal(parseInt(level))} level (${slots} slots): ${SpellcastingUtils.getSpellsByClassAndLevel(npc.class, parseInt(level)).slice(0, Math.min(4, slots + 1)).join(', ')}`
).join('\n') + '\n\n' : ''}

## Possessions
${PossessionsUtils.formatPossessions(npc.possessions).map(item => `* ${item}`).join('\n')}
`;
    }

    /**
     * Format NPC using Basic Text format
     * @param npc NPC to format
     * @returns Formatted Basic Text string
     */
    private formatBasicStatblock(npc: NPC): string {
        // Basic text format
        return `# ${npc.name}
Level ${npc.level} ${npc.race} ${npc.class} (${npc.alignment})

**Ability Scores**
- STR: ${npc.abilityScores.str} (${(npc.abilityModifiers.str ?? 0) >= 0 ? '+' + (npc.abilityModifiers.str ?? 0) : npc.abilityModifiers.str ?? 0})
- DEX: ${npc.abilityScores.dex} (${(npc.abilityModifiers.dex ?? 0) >= 0 ? '+' + (npc.abilityModifiers.dex ?? 0) : npc.abilityModifiers.dex ?? 0})
- CON: ${npc.abilityScores.con} (${(npc.abilityModifiers.con ?? 0) >= 0 ? '+' + (npc.abilityModifiers.con ?? 0) : npc.abilityModifiers.con ?? 0})
- INT: ${npc.abilityScores.int} (${(npc.abilityModifiers.int ?? 0) >= 0 ? '+' + (npc.abilityModifiers.int ?? 0) : npc.abilityModifiers.int ?? 0})
- WIS: ${npc.abilityScores.wis} (${(npc.abilityModifiers.wis ?? 0) >= 0 ? '+' + (npc.abilityModifiers.wis ?? 0) : npc.abilityModifiers.wis ?? 0})
- CHA: ${npc.abilityScores.cha} (${(npc.abilityModifiers.cha ?? 0) >= 0 ? '+' + (npc.abilityModifiers.cha ?? 0) : npc.abilityModifiers.cha ?? 0})

**Core Stats**
- HP: ${npc.hitPoints}
- AC: ${10 + (npc.abilityModifiers.dex ?? 0)}
- Proficiency: +${npc.proficiencyBonus}

**Skills**
${Object.entries(npc.skills).filter(([_, value]) => value !== 0).map(([skill, bonus]) => 
`- ${skill}: ${bonus >= 0 ? '+' + bonus : bonus}`).join('\n')}

${npc.traits.length > 0 ? '**Racial Traits**\n' + npc.traits.map(trait => `- ${trait}`).join('\n') + '\n\n' : ''}
${npc.customParameters.spellcasting ? '**Spellcasting**\n' + 
`- Ability: ${npc.customParameters.spellcasting.ability}\n` +
`- Save DC: ${npc.customParameters.spellcasting.saveDC}\n` +
`- Attack Bonus: ${npc.customParameters.spellcasting.attackBonus >= 0 ? '+' + npc.customParameters.spellcasting.attackBonus : npc.customParameters.spellcasting.attackBonus}\n` +
`- Cantrips Known: ${SpellcastingUtils.getCantrips(npc.class).slice(0, npc.customParameters.spellcasting.cantripsKnown).join(', ')}\n` +
`- Spell Slots: ${Object.entries(npc.customParameters.spellcasting.slots).filter(([_, slots]) => slots > 0).map(([level, slots]) => 
`${level}${getOrdinal(parseInt(level)).slice(-2)} (${slots})`).join(', ')}\n\n` : ''}

**Possessions**
${PossessionsUtils.formatPossessions(npc.possessions).map(item => `- ${item}`).join('\n')}
`;
    }
}

/**
 * Get ordinal suffix for a number
 * @param n Number to format
 * @returns Number with ordinal suffix
 */
function getOrdinal(n: number): string {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const remainder = n % 100;
    
    return n + (suffixes[(remainder - 20) % 10] || suffixes[remainder] || suffixes[0]);
}