import { 
    Plugin, 
    PluginSettingTab, 
    Setting, 
    Modal, 
    Notice, 
    MarkdownView 
} from 'obsidian';

import { 
    NPCGeneratorSettings, 
    NPC, 
    NPCGenerationOptions, 
    CharacterClass, 
    Race,
    Alignment 
} from './types';

import { NPCGenerationUtils } from './utils/npc-generation-utils';
import { PossessionsUtils } from './utils/possessions-utils';
import { SpellcastingUtils } from './utils/spellcasting-utils';

export default class NPCGenerator extends Plugin {
    settings: NPCGeneratorSettings;

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
            abilityModifiers.con || 0, 
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
        // Currently just a placeholder - we'll implement full formatting later
        return `# ${npc.name}
Level ${npc.level} ${npc.race} ${npc.class}
${npc.alignment}`;
    }
}

// Placeholder for Modal and Settings Tab classes
// These will be implemented in subsequent steps
class NPCGeneratorModal extends Modal {
    constructor(app: App, plugin: NPCGenerator) {
        super(app);
        // Modal implementation will come in next iteration
    }

    onOpen() {
        // Modal open implementation
    }

    onClose() {
        // Modal close implementation
    }
}

class NPCGeneratorSettingsTab extends PluginSettingTab {
    constructor(app: App, plugin: NPCGenerator) {
        super(app, plugin);
        // Settings tab implementation will come in next iteration
    }

    display() {
        // Display settings implementation
    }
}
