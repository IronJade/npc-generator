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
                    traits: ["Versatile"],
                    size: "Medium",
                    speed: 30,
                    languages: ["Common"],
                    additionalLanguages: 1
                },
                { 
                    name: "Variant Human",
                    abilityScoreAdjustments: { str: 1, dex: 1 },  // Player can choose any two
                    traits: ["Versatile", "Skilled", "Feat"],
                    size: "Medium",
                    speed: 30,
                    languages: ["Common"],
                    additionalLanguages: 1
                },
                { 
                    name: "Elf (High)",
                    abilityScoreAdjustments: { dex: 2, int: 1 },
                    traits: ["Darkvision", "Fey Ancestry", "Trance", "Keen Senses", "Elf Weapon Training", "Cantrip"],
                    size: "Medium",
                    speed: 30,
                    languages: ["Common", "Elvish"],
                    additionalLanguages: 1
                },
                { 
                    name: "Elf (Wood)",
                    abilityScoreAdjustments: { dex: 2, wis: 1 },
                    traits: ["Darkvision", "Fey Ancestry", "Trance", "Keen Senses", "Elf Weapon Training", "Fleet of Foot", "Mask of the Wild"],
                    size: "Medium",
                    speed: 35,
                    languages: ["Common", "Elvish"]
                },
                { 
                    name: "Elf (Drow)",
                    abilityScoreAdjustments: { dex: 2, cha: 1 },
                    traits: ["Superior Darkvision", "Fey Ancestry", "Trance", "Keen Senses", "Drow Magic", "Sunlight Sensitivity", "Drow Weapon Training"],
                    size: "Medium",
                    speed: 30,
                    languages: ["Common", "Elvish", "Undercommon"]
                },
                { 
                    name: "Dwarf (Hill)",
                    abilityScoreAdjustments: { con: 2, wis: 1 },
                    traits: ["Darkvision", "Dwarven Resilience", "Dwarven Combat Training", "Stonecunning", "Dwarven Toughness"],
                    size: "Medium",
                    speed: 25,
                    languages: ["Common", "Dwarvish"]
                },
                { 
                    name: "Dwarf (Mountain)",
                    abilityScoreAdjustments: { con: 2, str: 2 },
                    traits: ["Darkvision", "Dwarven Resilience", "Dwarven Combat Training", "Stonecunning", "Dwarven Armor Training"],
                    size: "Medium",
                    speed: 25,
                    languages: ["Common", "Dwarvish"]
                },
                { 
                    name: "Halfling (Lightfoot)",
                    abilityScoreAdjustments: { dex: 2, cha: 1 },
                    traits: ["Lucky", "Brave", "Halfling Nimbleness", "Naturally Stealthy"],
                    size: "Small",
                    speed: 25,
                    languages: ["Common", "Halfling"]
                },
                { 
                    name: "Halfling (Stout)",
                    abilityScoreAdjustments: { dex: 2, con: 1 },
                    traits: ["Lucky", "Brave", "Halfling Nimbleness", "Stout Resilience"],
                    size: "Small",
                    speed: 25,
                    languages: ["Common", "Halfling"]
                },
                { 
                    name: "Dragonborn",
                    abilityScoreAdjustments: { str: 2, cha: 1 },
                    traits: ["Draconic Ancestry", "Breath Weapon", "Damage Resistance"],
                    size: "Medium",
                    speed: 30,
                    languages: ["Common", "Draconic"]
                },
                { 
                    name: "Gnome (Forest)",
                    abilityScoreAdjustments: { int: 2, dex: 1 },
                    traits: ["Darkvision", "Gnome Cunning", "Natural Illusionist", "Speak with Small Beasts"],
                    size: "Small",
                    speed: 25,
                    languages: ["Common", "Gnomish"]
                },
                { 
                    name: "Gnome (Rock)",
                    abilityScoreAdjustments: { int: 2, con: 1 },
                    traits: ["Darkvision", "Gnome Cunning", "Artificer's Lore", "Tinker"],
                    size: "Small",
                    speed: 25,
                    languages: ["Common", "Gnomish"]
                },
                { 
                    name: "Half-Elf",
                    abilityScoreAdjustments: { cha: 2, dex: 1, wis: 1 }, // Player can choose any two besides CHA
                    traits: ["Darkvision", "Fey Ancestry", "Skill Versatility"],
                    size: "Medium",
                    speed: 30,
                    languages: ["Common", "Elvish"],
                    additionalLanguages: 1
                },
                { 
                    name: "Half-Orc",
                    abilityScoreAdjustments: { str: 2, con: 1 },
                    traits: ["Darkvision", "Menacing", "Relentless Endurance", "Savage Attacks"],
                    size: "Medium",
                    speed: 30,
                    languages: ["Common", "Orc"]
                },
                { 
                    name: "Tiefling",
                    abilityScoreAdjustments: { cha: 2, int: 1 },
                    traits: ["Darkvision", "Hellish Resistance", "Infernal Legacy"],
                    size: "Medium",
                    speed: 30,
                    languages: ["Common", "Infernal"]
                },
                // Races from other sources
                { 
                    name: "Aasimar (Protector)",
                    abilityScoreAdjustments: { cha: 2, wis: 1 },
                    traits: ["Darkvision", "Celestial Resistance", "Healing Hands", "Light Bearer", "Radiant Soul"],
                    size: "Medium",
                    speed: 30,
                    languages: ["Common", "Celestial"]
                },
                { 
                    name: "Aasimar (Scourge)",
                    abilityScoreAdjustments: { cha: 2, con: 1 },
                    traits: ["Darkvision", "Celestial Resistance", "Healing Hands", "Light Bearer", "Radiant Consumption"],
                    size: "Medium",
                    speed: 30,
                    languages: ["Common", "Celestial"]
                },
                { 
                    name: "Aasimar (Fallen)",
                    abilityScoreAdjustments: { cha: 2, str: 1 },
                    traits: ["Darkvision", "Celestial Resistance", "Healing Hands", "Light Bearer", "Necrotic Shroud"],
                    size: "Medium",
                    speed: 30,
                    languages: ["Common", "Celestial"]
                },
                { 
                    name: "Firbolg",
                    abilityScoreAdjustments: { wis: 2, str: 1 },
                    traits: ["Firbolg Magic", "Hidden Step", "Powerful Build", "Speech of Beast and Leaf"],
                    size: "Medium",
                    speed: 30,
                    languages: ["Common", "Elvish", "Giant"]
                },
                { 
                    name: "Goliath",
                    abilityScoreAdjustments: { str: 2, con: 1 },
                    traits: ["Stone's Endurance", "Powerful Build", "Mountain Born", "Natural Athlete"],
                    size: "Medium",
                    speed: 30,
                    languages: ["Common", "Giant"]
                },
                { 
                    name: "Tabaxi",
                    abilityScoreAdjustments: { dex: 2, cha: 1 },
                    traits: ["Darkvision", "Feline Agility", "Cat's Claws", "Cat's Talent"],
                    size: "Medium",
                    speed: 30,
                    languages: ["Common"],
                    additionalLanguages: 1
                },
                { 
                    name: "Kenku",
                    abilityScoreAdjustments: { dex: 2, wis: 1 },
                    traits: ["Expert Forgery", "Mimicry", "Kenku Training"],
                    size: "Medium",
                    speed: 30,
                    languages: ["Common", "Auran"]
                },
                { 
                    name: "Triton",
                    abilityScoreAdjustments: { str: 1, con: 1, cha: 1 },
                    traits: ["Amphibious", "Control Air and Water", "Emissary of the Sea", "Guardians of the Depths"],
                    size: "Medium",
                    speed: 30,
                    languages: ["Common", "Primordial"]
                },
                { 
                    name: "Leonin",
                    abilityScoreAdjustments: { str: 2, con: 1 },
                    traits: ["Darkvision", "Claws", "Hunter's Instincts", "Daunting Roar"],
                    size: "Medium",
                    speed: 35,
                    languages: ["Common"]
                },
                { 
                    name: "Satyr",
                    abilityScoreAdjustments: { cha: 2, dex: 1 },
                    traits: ["Fey", "Magic Resistance", "Mirthful Leaps", "Reveler"],
                    size: "Medium",
                    speed: 35,
                    languages: ["Common", "Elvish", "Sylvan"]
                },
                { 
                    name: "Fairy",
                    abilityScoreAdjustments: { dex: 2, cha: 1 },
                    traits: ["Flight", "Fey", "Fairy Magic"],
                    size: "Small",
                    speed: 30,
                    languages: ["Common", "Sylvan"]
                },
                { 
                    name: "Harengon",
                    abilityScoreAdjustments: { dex: 2, wis: 1 },
                    traits: ["Hare-Trigger", "Leporine Senses", "Lucky Footwork", "Rabbit Hop"],
                    size: "Medium",
                    speed: 30,
                    languages: ["Common"],
                    additionalLanguages: 1
                }
            ],
            classes: [
                { 
                    name: "Barbarian", 
                    hitDie: 12, 
                    primaryAbility: "str", 
                    savingThrows: ["str", "con"], 
                    skills: ["Animal Handling", "Athletics", "Intimidation", "Nature", "Perception", "Survival"],
                    skillChoices: 2,
                    proficiencies: {
                        weapons: ["Simple weapons", "Martial weapons"],
                        armor: ["Light armor", "Medium armor", "Shields"],
                        tools: []
                    },
                    features: [
                        { level: 1, name: "Rage", description: "In battle, you fight with primal ferocity. You can enter a rage as a bonus action." },
                        { level: 1, name: "Unarmored Defense", description: "While not wearing armor, your AC equals 10 + your Dexterity modifier + your Constitution modifier." },
                        { level: 2, name: "Reckless Attack", description: "You can throw aside all concern for defense to attack with fierce desperation." },
                        { level: 2, name: "Danger Sense", description: "You gain an uncanny sense of when things nearby aren't as they should be." }
                    ]
                },
                { 
                    name: "Bard", 
                    hitDie: 8, 
                    primaryAbility: "cha", 
                    savingThrows: ["dex", "cha"], 
                    skills: ["Acrobatics", "Animal Handling", "Arcana", "Athletics", "Deception", "History", "Insight", "Intimidation", "Investigation", "Medicine", "Nature", "Perception", "Performance", "Persuasion", "Religion", "Sleight of Hand", "Stealth", "Survival"],
                    skillChoices: 3,
                    proficiencies: {
                        weapons: ["Simple weapons", "Hand crossbows", "Longswords", "Rapiers", "Shortswords"],
                        armor: ["Light armor"],
                        tools: ["Three musical instruments of your choice"]
                    },
                    spellcasting: {
                        ability: "cha",
                        cantripsKnown: [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
                        spellsKnown: [4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 15, 16, 18, 19, 19, 20, 22, 22, 22]
                    },
                    features: [
                        { level: 1, name: "Bardic Inspiration", description: "You can inspire others through stirring words or music." },
                        { level: 1, name: "Spellcasting", description: "You have learned to untangle and reshape the fabric of reality in harmony with your wishes and music." },
                        { level: 2, name: "Jack of All Trades", description: "You can add half your proficiency bonus, rounded down, to any ability check you make that doesn't already include your proficiency bonus." },
                        { level: 2, name: "Song of Rest", description: "You can use soothing music or oration to help revitalize your wounded allies during a short rest." }
                    ]
                },
                { 
                    name: "Cleric", 
                    hitDie: 8, 
                    primaryAbility: "wis", 
                    savingThrows: ["wis", "cha"], 
                    skills: ["History", "Insight", "Medicine", "Persuasion", "Religion"],
                    skillChoices: 2,
                    proficiencies: {
                        weapons: ["Simple weapons"],
                        armor: ["Light armor", "Medium armor", "Shields"],
                        tools: []
                    },
                    spellcasting: {
                        ability: "wis",
                        cantripsKnown: [3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
                        prepareSpells: true
                    },
                    features: [
                        { level: 1, name: "Divine Domain", description: "Choose one domain related to your deity: Knowledge, Life, Light, Nature, Tempest, Trickery, or War." },
                        { level: 1, name: "Spellcasting", description: "As a conduit for divine power, you can cast cleric spells." },
                        { level: 2, name: "Channel Divinity", description: "You gain the ability to channel divine energy directly from your deity, using that energy to fuel magical effects." },
                        { level: 2, name: "Divine Domain Feature", description: "Your divine domain grants you additional abilities." }
                    ]
                },
                { 
                    name: "Druid", 
                    hitDie: 8, 
                    primaryAbility: "wis", 
                    savingThrows: ["int", "wis"], 
                    skills: ["Arcana", "Animal Handling", "Insight", "Medicine", "Nature", "Perception", "Religion", "Survival"],
                    skillChoices: 2,
                    proficiencies: {
                        weapons: ["Clubs", "Daggers", "Darts", "Javelins", "Maces", "Quarterstaffs", "Scimitars", "Sickles", "Slings", "Spears"],
                        armor: ["Light armor", "Medium armor", "Shields"],
                        tools: ["Herbalism kit"]
                    },
                    spellcasting: {
                        ability: "wis",
                        cantripsKnown: [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
                        prepareSpells: true
                    },
                    features: [
                        { level: 1, name: "Druidic", description: "You know Druidic, the secret language of druids." },
                        { level: 1, name: "Spellcasting", description: "Drawing on the divine essence of nature itself, you can cast spells to shape that essence to your will." },
                        { level: 2, name: "Wild Shape", description: "You can use your action to magically assume the shape of a beast that you have seen before." },
                        { level: 2, name: "Druid Circle", description: "You choose to identify with a circle of druids: the Circle of the Land or the Circle of the Moon." }
                    ]
                },
                { 
                    name: "Fighter", 
                    hitDie: 10, 
                    primaryAbility: "str", 
                    savingThrows: ["str", "con"], 
                    skills: ["Acrobatics", "Animal Handling", "Athletics", "History", "Insight", "Intimidation", "Perception", "Survival"],
                    skillChoices: 2,
                    proficiencies: {
                        weapons: ["Simple weapons", "Martial weapons"],
                        armor: ["All armor", "Shields"],
                        tools: []
                    },
                    features: [
                        { level: 1, name: "Fighting Style", description: "You adopt a particular style of fighting as your specialty." },
                        { level: 1, name: "Second Wind", description: "You have a limited well of stamina that you can draw on to protect yourself from harm." },
                        { level: 2, name: "Action Surge", description: "You can push yourself beyond your normal limits for a moment." },
                        { level: 3, name: "Martial Archetype", description: "You choose an archetype that you strive to emulate in your combat styles and techniques." }
                    ]
                },
                { 
                    name: "Monk", 
                    hitDie: 8, 
                    primaryAbility: "dex", 
                    savingThrows: ["str", "dex"], 
                    skills: ["Acrobatics", "Athletics", "History", "Insight", "Religion", "Stealth"],
                    skillChoices: 2,
                    proficiencies: {
                        weapons: ["Simple weapons", "Shortswords"],
                        armor: [],
                        tools: ["One type of artisan's tools or one musical instrument"]
                    },
                    features: [
                        { level: 1, name: "Unarmored Defense", description: "While you are wearing no armor and not wielding a shield, your AC equals 10 + your Dexterity modifier + your Wisdom modifier." },
                        { level: 1, name: "Martial Arts", description: "Your practice of martial arts gives you mastery of combat styles that use unarmed strikes and monk weapons." },
                        { level: 2, name: "Ki", description: "Your training allows you to harness the mystic energy of ki." },
                        { level: 2, name: "Unarmored Movement", description: "Your speed increases when you are not wearing armor or wielding a shield." }
                    ]
                },
                { 
                    name: "Paladin", 
                    hitDie: 10, 
                    primaryAbility: "str", 
                    savingThrows: ["wis", "cha"], 
                    skills: ["Athletics", "Insight", "Intimidation", "Medicine", "Persuasion", "Religion"],
                    skillChoices: 2,
                    proficiencies: {
                        weapons: ["Simple weapons", "Martial weapons"],
                        armor: ["All armor", "Shields"],
                        tools: []
                    },
                    spellcasting: {
                        ability: "cha",
                        prepareSpells: true
                    },
                    features: [
                        { level: 1, name: "Divine Sense", description: "The presence of strong evil registers on your senses like a noxious odor." },
                        { level: 1, name: "Lay on Hands", description: "Your blessed touch can heal wounds." },
                        { level: 2, name: "Fighting Style", description: "You adopt a style of fighting as your specialty." },
                        { level: 2, name: "Spellcasting", description: "You have learned to draw on divine magic through meditation and prayer." },
                        { level: 2, name: "Divine Smite", description: "When you hit a creature with a melee weapon attack, you can expend one spell slot to deal radiant damage." }
                    ]
                },
                { 
                    name: "Ranger", 
                    hitDie: 10, 
                    primaryAbility: "dex", 
                    savingThrows: ["str", "dex"], 
                    skills: ["Animal Handling", "Athletics", "Insight", "Investigation", "Nature", "Perception", "Stealth", "Survival"],
                    skillChoices: 3,
                    proficiencies: {
                        weapons: ["Simple weapons", "Martial weapons"],
                        armor: ["Light armor", "Medium armor", "Shields"],
                        tools: []
                    },
                    spellcasting: {
                        ability: "wis",
                        spellsKnown: [0, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11]
                    },
                    features: [
                        { level: 1, name: "Favored Enemy", description: "You have significant experience studying, tracking, hunting, and even talking to a certain type of enemy." },
                        { level: 1, name: "Natural Explorer", description: "You are particularly familiar with one type of natural environment and are adept at traveling and surviving in such regions." },
                        { level: 2, name: "Fighting Style", description: "You adopt a particular style of fighting as your specialty." },
                        { level: 2, name: "Spellcasting", description: "You have learned to use the magical essence of nature to cast spells, much as a druid does." }
                    ]
                },
                { 
                    name: "Rogue", 
                    hitDie: 8, 
                    primaryAbility: "dex", 
                    savingThrows: ["dex", "int"], 
                    skills: ["Acrobatics", "Athletics", "Deception", "Insight", "Intimidation", "Investigation", "Perception", "Performance", "Persuasion", "Sleight of Hand", "Stealth"],
                    skillChoices: 4,
                    proficiencies: {
                        weapons: ["Simple weapons", "Hand crossbows", "Longswords", "Rapiers", "Shortswords"],
                        armor: ["Light armor"],
                        tools: ["Thieves' tools"]
                    },
                    features: [
                        { level: 1, name: "Expertise", description: "Choose two of your skill proficiencies, or one of your skill proficiencies and your proficiency with thieves' tools." },
                        { level: 1, name: "Sneak Attack", description: "You know how to strike subtly and exploit a foe's distraction." },
                        { level: 1, name: "Thieves' Cant", description: "During your rogue training you learned thieves' cant, a secret mix of dialect, jargon, and code." },
                        { level: 2, name: "Cunning Action", description: "Your quick thinking and agility allow you to move and act quickly." }
                    ]
                },
                { 
                    name: "Sorcerer", 
                    hitDie: 6, 
                    primaryAbility: "cha", 
                    savingThrows: ["con", "cha"], 
                    skills: ["Arcana", "Deception", "Insight", "Intimidation", "Persuasion", "Religion"],
                    skillChoices: 2,
                    proficiencies: {
                        weapons: ["Daggers", "Darts", "Slings", "Quarterstaffs", "Light crossbows"],
                        armor: [],
                        tools: []
                    },
                    spellcasting: {
                        ability: "cha",
                        cantripsKnown: [4, 4, 4, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6],
                        spellsKnown: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 12, 13, 13, 14, 14, 15, 15, 15, 15]
                    },
                    features: [
                        { level: 1, name: "Sorcerous Origin", description: "Choose a sorcerous origin, which describes the source of your innate magical power." },
                        { level: 1, name: "Spellcasting", description: "An event in your past, or in the life of a parent or ancestor, left an indelible mark on you, infusing you with arcane magic." },
                        { level: 2, name: "Font of Magic", description: "You tap into a deep wellspring of magic within yourself." },
                        { level: 3, name: "Metamagic", description: "You gain the ability to twist your spells to suit your needs." }
                    ]
                },
                { 
                    name: "Warlock", 
                    hitDie: 8, 
                    primaryAbility: "cha", 
                    savingThrows: ["wis", "cha"], 
                    skills: ["Arcana", "Deception", "History", "Intimidation", "Investigation", "Nature", "Religion"],
                    skillChoices: 2,
                    proficiencies: {
                        weapons: ["Simple weapons"],
                        armor: ["Light armor"],
                        tools: []
                    },
                    spellcasting: {
                        ability: "cha",
                        cantripsKnown: [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
                        spellsKnown: [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15]
                    },
                    features: [
                        { level: 1, name: "Otherworldly Patron", description: "You have struck a bargain with an otherworldly being of your choice." },
                        { level: 1, name: "Pact Magic", description: "Your arcane research and the magic bestowed on you by your patron have given you facility with spells." },
                        { level: 2, name: "Eldritch Invocations", description: "In your study of occult lore, you have unearthed eldritch invocations, fragments of forbidden knowledge that imbue you with an abiding magical ability." },
                        { level: 3, name: "Pact Boon", description: "Your otherworldly patron bestows a gift upon you for your loyal service." }
                    ]
                },
                { 
                    name: "Wizard", 
                    hitDie: 6, 
                    primaryAbility: "int", 
                    savingThrows: ["int", "wis"], 
                    skills: ["Arcana", "History", "Insight", "Investigation", "Medicine", "Religion"],
                    skillChoices: 2,
                    proficiencies: {
                        weapons: ["Daggers", "Darts", "Slings", "Quarterstaffs", "Light crossbows"],
                        armor: [],
                        tools: []
                    },
                    spellcasting: {
                        ability: "int",
                        cantripsKnown: [3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
                        prepareSpells: true
                    },
                    features: [
                        { level: 1, name: "Arcane Recovery", description: "You have learned to regain some of your magical energy by studying your spellbook." },
                        { level: 1, name: "Spellcasting", description: "As a student of arcane magic, you have a spellbook containing spells that show the first glimmerings of your true power." },
                        { level: 2, name: "Arcane Tradition", description: "You choose an arcane tradition, shaping your practice of magic through one of eight schools." },
                        { level: 3, name: "Arcane Tradition Feature", description: "Your arcane tradition grants you additional abilities." }
                    ]
                },
                // Classes from other sources
                { 
                    name: "Artificer", 
                    hitDie: 8, 
                    primaryAbility: "int", 
                    savingThrows: ["con", "int"], 
                    skills: ["Arcana", "History", "Investigation", "Medicine", "Nature", "Perception", "Sleight of Hand"],
                    skillChoices: 2,
                    proficiencies: {
                        weapons: ["Simple weapons", "Firearms"],
                        armor: ["Light armor", "Medium armor", "Shields"],
                        tools: ["Thieves' tools", "Tinker's tools", "One type of artisan's tools of your choice"]
                    },
                    spellcasting: {
                        ability: "int",
                        prepareSpells: true
                    },
                    features: [
                        { level: 1, name: "Magical Tinkering", description: "You have learned how to invest a spark of magic into mundane objects." },
                        { level: 1, name: "Spellcasting", description: "You have studied the workings of magic and how to cast spells, channeling the magic through objects." },
                        { level: 2, name: "Infuse Item", description: "You gain the ability to imbue mundane items with certain magical infusions." },
                        { level: 3, name: "Artificer Specialist", description: "You choose the type of specialist you are: Alchemist, Artillerist, Battle Smith, or Armorer." }
                    ]
                },
                { 
                    name: "Blood Hunter", 
                    hitDie: 10, 
                    primaryAbility: "str", 
                    savingThrows: ["dex", "int"], 
                    skills: ["Acrobatics", "Arcana", "Athletics", "History", "Insight", "Investigation", "Religion", "Survival"],
                    skillChoices: 3,
                    proficiencies: {
                        weapons: ["Simple weapons", "Martial weapons"],
                        armor: ["Light armor", "Medium armor", "Shields"],
                        tools: ["Alchemist's supplies"]
                    },
                    features: [
                        { level: 1, name: "Hunter's Bane", description: "You can track certain types of creatures with unnatural efficiency." },
                        { level: 1, name: "Blood Maledict", description: "You gain the ability to channel your vital essence into curses against your foes." },
                        { level: 2, name: "Crimson Rite", description: "You can imbue your weapon strikes with elemental energy." },
                        { level: 3, name: "Blood Hunter Order", description: "You commit to an order of blood hunter martial traditions." }
                    ]
                },
                { 
                    name: "Echo Knight", 
                    hitDie: 10, 
                    primaryAbility: "str", 
                    savingThrows: ["str", "con"], 
                    skills: ["Acrobatics", "Animal Handling", "Athletics", "History", "Insight", "Intimidation", "Perception", "Survival"],
                    skillChoices: 2,
                    proficiencies: {
                        weapons: ["Simple weapons", "Martial weapons"],
                        armor: ["All armor", "Shields"],
                        tools: []
                    },
                    features: [
                        { level: 1, name: "Fighting Style", description: "You adopt a style of fighting as your specialty." },
                        { level: 1, name: "Second Wind", description: "You can use a bonus action to regain hit points." },
                        { level: 3, name: "Manifest Echo", description: "You can use a bonus action to magically manifest an echo of yourself." },
                        { level: 3, name: "Unleash Incarnation", description: "You can heighten your echo's fury." }
                    ]
                },
                { 
                    name: "Chronurgy Wizard", 
                    hitDie: 6, 
                    primaryAbility: "int", 
                    savingThrows: ["int", "wis"], 
                    skills: ["Arcana", "History", "Insight", "Investigation", "Medicine", "Religion"],
                    skillChoices: 2,
                    proficiencies: {
                        weapons: ["Daggers", "Darts", "Slings", "Quarterstaffs", "Light crossbows"],
                        armor: [],
                        tools: []
                    },
                    spellcasting: {
                        ability: "int",
                        cantripsKnown: [3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
                        prepareSpells: true
                    },
                    features: [
                        { level: 1, name: "Arcane Recovery", description: "You have learned to regain some of your magical energy by studying your spellbook." },
                        { level: 1, name: "Spellcasting", description: "You have a spellbook containing spells that show the first glimmerings of your true power." },
                        { level: 2, name: "Chronurgy Magic", description: "You focus your studies on time manipulation, rewinding the flow of time to safeguard yourself and your allies." },
                        { level: 2, name: "Temporal Awareness", description: "You can add your Intelligence modifier to your initiative rolls." }
                    ]
                },
                { 
                    name: "Graviturgy Wizard", 
                    hitDie: 6, 
                    primaryAbility: "int", 
                    savingThrows: ["int", "wis"], 
                    skills: ["Arcana", "History", "Insight", "Investigation", "Medicine", "Religion"],
                    skillChoices: 2,
                    proficiencies: {
                        weapons: ["Daggers", "Darts", "Slings", "Quarterstaffs", "Light crossbows"],
                        armor: [],
                        tools: []
                    },
                    spellcasting: {
                        ability: "int",
                        cantripsKnown: [3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
                        prepareSpells: true
                    },
                    features: [
                        { level: 1, name: "Arcane Recovery", description: "You have learned to regain some of your magical energy by studying your spellbook." },
                        { level: 1, name: "Spellcasting", description: "You have a spellbook containing spells that show the first glimmerings of your true power." },
                        { level: 2, name: "Graviturgy Magic", description: "Your fascination with gravity has led you to learn spells that manipulate it." },
                        { level: 2, name: "Adjust Density", description: "As an action, you can magically alter the weight of a creature or object." }
                    ]
                },
                { 
                    name: "College of Eloquence Bard", 
                    hitDie: 8, 
                    primaryAbility: "cha", 
                    savingThrows: ["dex", "cha"], 
                    skills: ["Acrobatics", "Animal Handling", "Arcana", "Athletics", "Deception", "History", "Insight", "Intimidation", "Investigation", "Medicine", "Nature", "Perception", "Performance", "Persuasion", "Religion", "Sleight of Hand", "Stealth", "Survival"],
                    skillChoices: 3,
                    proficiencies: {
                        weapons: ["Simple weapons", "Hand crossbows", "Longswords", "Rapiers", "Shortswords"],
                        armor: ["Light armor"],
                        tools: ["Three musical instruments of your choice"]
                    },
                    spellcasting: {
                        ability: "cha",
                        cantripsKnown: [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
                        spellsKnown: [4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 15, 16, 18, 19, 19, 20, 22, 22, 22]
                    },
                    features: [
                        { level: 1, name: "Bardic Inspiration", description: "You can inspire others through stirring words or music." },
                        { level: 1, name: "Spellcasting", description: "You have learned to untangle and reshape the fabric of reality." },
                        { level: 3, name: "Silver Tongue", description: "You are a master at saying the right thing at the right time." },
                        { level: 3, name: "Unsettling Words", description: "You can use your bardic inspiration to undermine someone else's confidence." }
                    ]
                },
                { 
                    name: "Circle of Stars Druid", 
                    hitDie: 8, 
                    primaryAbility: "wis", 
                    savingThrows: ["int", "wis"], 
                    skills: ["Arcana", "Animal Handling", "Insight", "Medicine", "Nature", "Perception", "Religion", "Survival"],
                    skillChoices: 2,
                    proficiencies: {
                        weapons: ["Clubs", "Daggers", "Darts", "Javelins", "Maces", "Quarterstaffs", "Scimitars", "Sickles", "Slings", "Spears"],
                        armor: ["Light armor", "Medium armor", "Shields"],
                        tools: ["Herbalism kit"]
                    },
                    spellcasting: {
                        ability: "wis",
                        cantripsKnown: [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
                        prepareSpells: true
                    },
                    features: [
                        { level: 1, name: "Druidic", description: "You know Druidic, the secret language of druids." },
                        { level: 1, name: "Spellcasting", description: "Drawing on the divine essence of nature itself, you can cast spells." },
                        { level: 2, name: "Wild Shape", description: "You can use your action to magically assume the shape of a beast." },
                        { level: 2, name: "Star Map", description: "You've created a star map, a mystical chart to track heavenly bodies." },
                        { level: 2, name: "Starry Form", description: "You can expend a use of your Wild Shape to take on a starry form." }
                    ]
                },
                { 
                    name: "Path of Wild Magic Barbarian", 
                    hitDie: 12, 
                    primaryAbility: "str", 
                    savingThrows: ["str", "con"], 
                    skills: ["Animal Handling", "Athletics", "Intimidation", "Nature", "Perception", "Survival"],
                    skillChoices: 2,
                    proficiencies: {
                        weapons: ["Simple weapons", "Martial weapons"],
                        armor: ["Light armor", "Medium armor", "Shields"],
                        tools: []
                    },
                    features: [
                        { level: 1, name: "Rage", description: "In battle, you fight with primal ferocity." },
                        { level: 1, name: "Unarmored Defense", description: "While not wearing armor, your AC equals 10 + your Dexterity modifier + your Constitution modifier." },
                        { level: 3, name: "Magic Awareness", description: "As an action, you can open your awareness to the presence of magic." },
                        { level: 3, name: "Wild Surge", description: "When you enter your rage, roll on the Wild Magic table to determine the magical effect that manifests." }
                    ]
                }
            ],
            customParameters: [],
            statblockFormat: "fantasyStatblock"
        };

            // Add subclasses to some of the default classes
            // Fighter subclasses
            const fighterClass = defaultSettings.classes.find(c => c.name === "Fighter");
            if (fighterClass) {
                fighterClass.subclasses = [
            {
                name: "Champion",
                description: "A simple but powerful archetype that focuses on weapon combat through improved critical hits and superior physical attributes.",
                features: [
                    { level: 3, name: "Improved Critical", description: "Your weapon attacks score a critical hit on a roll of 19 or 20." },
                    { level: 7, name: "Remarkable Athlete", description: "You can add half your proficiency bonus to any Strength, Dexterity, or Constitution check you make that doesn't already use your proficiency bonus." }
                ]
            },
            {
                name: "Battle Master",
                description: "A skilled warrior who uses combat maneuvers and tactical acumen to control the battlefield.",
                features: [
                    { level: 3, name: "Combat Superiority", description: "You learn maneuvers that are fueled by special dice called superiority dice." },
                    { level: 3, name: "Student of War", description: "You gain proficiency with one type of artisan's tools of your choice." }
                ]
            },
            {
                name: "Eldritch Knight",
                description: "An arcane warrior who combines martial prowess with magical ability, focusing on abjuration and evocation spells.",
                features: [
                    { level: 3, name: "Spellcasting", description: "You learn to cast wizard spells alongside your martial abilities." },
                    { level: 3, name: "Weapon Bond", description: "You learn a ritual that creates a magical bond between yourself and one weapon." }
                ]
            }
        ];
    }

    // Wizard subclasses
    const wizardClass = defaultSettings.classes.find(c => c.name === "Wizard");
    if (wizardClass) {
        wizardClass.subclasses = [
            {
                name: "School of Evocation",
                description: "Focuses on channeling powerful elemental energies to destroy opponents.",
                features: [
                    { level: 2, name: "Evocation Savant", description: "The gold and time you must spend to copy an evocation spell into your spellbook is halved." },
                    { level: 2, name: "Sculpt Spells", description: "You can create pockets of relative safety within the effects of your evocation spells." }
                ]
            },
            {
                name: "School of Abjuration",
                description: "Specializes in protective magic and warding against attacks and other spells.",
                features: [
                    { level: 2, name: "Abjuration Savant", description: "The gold and time you must spend to copy an abjuration spell into your spellbook is halved." },
                    { level: 2, name: "Arcane Ward", description: "You can weave abjuration magic around yourself for protection." }
                ]
            },
            {
                name: "School of Divination",
                description: "Masters the ability to see into the past, present, and future.",
                features: [
                    { level: 2, name: "Divination Savant", description: "The gold and time you must spend to copy a divination spell into your spellbook is halved." },
                    { level: 2, name: "Portent", description: "Glimpses of the future allow you to replace attack rolls, saving throws, or ability checks." }
                ]
            }
        ];
    }

    // Rogue subclasses
    const rogueClass = defaultSettings.classes.find(c => c.name === "Rogue");
    if (rogueClass) {
        rogueClass.subclasses = [
            {
                name: "Thief",
                description: "A rogue who excels at stealth, burglary, and using items with great skill.",
                features: [
                    { level: 3, name: "Fast Hands", description: "You can use the bonus action granted by your Cunning Action to make a Dexterity (Sleight of Hand) check, use your thieves' tools, or use an object." },
                    { level: 3, name: "Second-Story Work", description: "You gain the ability to climb faster than normal and jump farther." }
                ]
            },
            {
                name: "Assassin",
                description: "A rogue who specializes in disguise and eliminating targets quickly and efficiently.",
                features: [
                    { level: 3, name: "Bonus Proficiencies", description: "You gain proficiency with the disguise kit and the poisoner's kit." },
                    { level: 3, name: "Assassinate", description: "You are at your deadliest when you get the drop on your enemies." }
                ]
            },
            {
                name: "Arcane Trickster",
                description: "A rogue who enhances their skills with magic, focusing on illusion and enchantment.",
                features: [
                    { level: 3, name: "Spellcasting", description: "You augment your roguish skills with the ability to cast spells." },
                    { level: 3, name: "Mage Hand Legerdemain", description: "You can make your mage hand invisible, and you can perform additional tasks with it." }
                ]
            }
        ];
    }

        // Load saved settings
        const savedData = await this.loadData();
    
        // Create settings by merging defaults with saved data
        this.settings = {
            races: (savedData?.races?.length > 5) ? savedData.races : defaultSettings.races,
            classes: (savedData?.classes?.length > 5) ? savedData.classes : defaultSettings.classes,
            customParameters: savedData?.customParameters || [],
            statblockFormat: savedData?.statblockFormat || "fantasyStatblock"
        };
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
        
        // In the method, update the subclass selection:
        let subclass = null;
        if (characterClass.subclasses && characterClass.subclasses.length > 0) {
            // If a specific subclass is requested, use that
            if (mergedOptions.subclass) {
                console.log(`Looking for subclass: ${mergedOptions.subclass}`);
                subclass = characterClass.subclasses.find(s => s.name === mergedOptions.subclass);
        
                // Log if we found the subclass or not
                if (subclass) {
                    console.log(`Found subclass: ${subclass.name}`);
                } else {
                    console.log(`Subclass not found: ${mergedOptions.subclass}`);
                }
            } 
            // Otherwise randomly select a subclass if level is high enough and no specific "None" was selected
            else if (mergedOptions.subclass !== 'None') {
                const subclassLevel = characterClass.name === "Wizard" ? 2 : 3;

                if (mergedOptions.level! >= subclassLevel) {
                    subclass = characterClass.subclasses[Math.floor(Math.random() * characterClass.subclasses.length)];
                    console.log(`Randomly selected subclass: ${subclass.name}`);
        }
    }
        }

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
            subclass: subclass ? subclass.name : undefined,
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
    // Get class and race details
    const characterClass = this.settings.classes.find(c => c.name === npc.class);
    if (!characterClass) {
        throw new Error(`Class ${npc.class} not found`);
    }
    
    const race = this.settings.races.find(r => r.name === npc.race);
    if (!race) {
        throw new Error(`Race ${npc.race} not found`);
    }
    
    const hitDie = characterClass.hitDie || 8;
    
    // Calculate class-specific attack bonuses
    const strAttackBonus = (npc.abilityModifiers.str ?? 0) + npc.proficiencyBonus;
    const dexAttackBonus = (npc.abilityModifiers.dex ?? 0) + npc.proficiencyBonus;
    
    // Determine primary attack based on class and ability scores
    const isPrimaryStrength = (characterClass.primaryAbility === 'str' || 
                             (npc.abilityModifiers.str ?? 0) > (npc.abilityModifiers.dex ?? 0));
    
    const primaryAttackBonus = isPrimaryStrength ? strAttackBonus : dexAttackBonus;
    const primaryDamageBonus = isPrimaryStrength ? (npc.abilityModifiers.str ?? 0) : (npc.abilityModifiers.dex ?? 0);
    const attackType = isPrimaryStrength ? "Longsword" : "Shortsword";
    const attackDamage = isPrimaryStrength ? "1d8" : "1d6";
    const damageType = "slashing";
    
    // Calculate average damage
    const damageDie = parseInt(attackDamage.split('d')[1]);
    const averageDamage = Math.ceil(damageDie / 2) + 1 + primaryDamageBonus;
    
    // Determine languages
    const languageList = race.languages?.join(", ") || "Common";

    // Add subclass features separately from regular features
    const subclassContent = npc.subclass ? this.getSubclassFeatures(characterClass, npc.subclass, npc.level) : '';
    
    return `\`\`\`statblock
name: ${npc.name}
source: NPC Generator
size: ${race?.size || "Medium"}
type: humanoid
subtype: ${npc.race.toLowerCase()}
alignment: ${npc.alignment.toLowerCase()}
ac: ${10 + (npc.abilityModifiers.dex ?? 0)}
hp: ${npc.hitPoints}
hit_dice: ${npc.level}d${hitDie} + ${npc.level * (npc.abilityModifiers.con ?? 0)}
speed: ${race?.speed || 30} ft.
stats:
  - ${npc.abilityScores.str}
  - ${npc.abilityScores.dex}
  - ${npc.abilityScores.con}
  - ${npc.abilityScores.int}
  - ${npc.abilityScores.wis}
  - ${npc.abilityScores.cha}
saves:
  - strength: ${(npc.abilityModifiers.str ?? 0) + (characterClass?.savingThrows.includes('str') ? npc.proficiencyBonus : 0)}
  - dexterity: ${(npc.abilityModifiers.dex ?? 0) + (characterClass?.savingThrows.includes('dex') ? npc.proficiencyBonus : 0)}
  - constitution: ${(npc.abilityModifiers.con ?? 0) + (characterClass?.savingThrows.includes('con') ? npc.proficiencyBonus : 0)}
  - intelligence: ${(npc.abilityModifiers.int ?? 0) + (characterClass?.savingThrows.includes('int') ? npc.proficiencyBonus : 0)}
  - wisdom: ${(npc.abilityModifiers.wis ?? 0) + (characterClass?.savingThrows.includes('wis') ? npc.proficiencyBonus : 0)}
  - charisma: ${(npc.abilityModifiers.cha ?? 0) + (characterClass?.savingThrows.includes('cha') ? npc.proficiencyBonus : 0)}
skillsaves:
${Object.entries(npc.skills).filter(([_, value]) => value !== 0).map(([skill, bonus]) => 
`  - ${skill.toLowerCase()}: ${bonus}`).join('\n')}
damage_vulnerabilities: ""
damage_resistances: ""
damage_immunities: ""
condition_immunities: ""
senses: ${race?.traits.includes("Darkvision") ? "darkvision 60 ft., " : ""}passive Perception ${10 + (npc.skills['Perception'] ?? 0)}
languages: ${languageList}
cr: "${Math.max(1, Math.floor(npc.level / 4))}"
bestiary: true
traits:
${npc.traits.map(trait => `  - name: ${trait}
    desc: ${this.getTraitDescription(trait, npc.race)}
    attack_bonus: 0`).join('\n')}
${characterClass?.features?.filter(f => f.level <= npc.level).map(feature => 
`  - name: ${feature.name}
    desc: ${feature.description}
    attack_bonus: 0`).join('\n') || ''}
${subclassContent}
actions:
  - name: ${attackType}
    desc: "Melee Weapon Attack: +${primaryAttackBonus} to hit, reach 5 ft., one target. Hit: ${averageDamage} (${attackDamage} + ${primaryDamageBonus}) ${damageType} damage."
    attack_bonus: ${primaryAttackBonus}
    damage_dice: ${attackDamage}
    damage_bonus: ${primaryDamageBonus}
${npc.customParameters.spellcasting ? `spells:
  - "The ${npc.name} is a level ${npc.level} spellcaster. Its spellcasting ability is ${npc.customParameters.spellcasting.ability} (spell save DC ${npc.customParameters.spellcasting.saveDC}, +${npc.customParameters.spellcasting.attackBonus} to hit with spell attacks)."
  - Cantrips (at will): ${SpellcastingUtils.getCantrips(npc.class).slice(0, npc.customParameters.spellcasting.cantripsKnown).join(', ')}
${Object.entries(npc.customParameters.spellcasting.slots).filter(([_, slots]) => Number(slots) > 0).map(([level, slots]) => 
`  - ${this.getOrdinal(parseInt(level))} level (${slots} slots): ${SpellcastingUtils.getSpellsByClassAndLevel(npc.class, parseInt(level)).slice(0, Math.min(4, Number(slots) + 1)).join(', ')}`
).join('\n')}` : ''}
possessions:
${this.formatPossessions(npc.possessions)}\n\`\`\``;
}

// Get subclass features for statblock
private getSubclassFeatures(characterClass: CharacterClass, subclassName: string, level: number): string {
    console.log(`Getting features for subclass: ${subclassName}`);
    
    const subclass = characterClass.subclasses?.find(s => s.name === subclassName);
    if (!subclass) {
        console.log(`Subclass not found: ${subclassName}`);
        return '';
    }
    
    console.log(`Found subclass: ${subclass.name} with ${subclass.features.length} features`);
    
    return subclass.features
        .filter(feature => feature.level <= level)
        .map(feature => {
            // Sanitize the feature name and description
            const sanitizeName = feature.name.replace(/['"]/g, '');
            const sanitizeDesc = feature.description
                .replace(/['"]/g, '')
                .replace(/`/g, '')
                .replace(/\n/g, ' ');
            
            console.log(`Adding feature: ${sanitizeName}`);
            
            return `  - name: ${sanitizeName} (${subclassName})
    desc: ${sanitizeDesc}
    attack_bonus: 0`;
        }).join('\n');
}

    /**
     * Format possessions for statblock
     */
    private formatPossessions(possessions: any[]): string {
        return possessions.map(item => {
            if (typeof item === 'string') {
                return ` - name: ${item}`;
            } else if (typeof item === 'object' && item !== null) {
                if ('desc' in item && 'name' in item) {
                    return ` - name: ${item.name}\n   desc: ${item.desc}`;
                } else if ('name' in item) {
                    return ` - name: ${item.name}`;
                }
            }
            return ` - name: ${String(item)}`;
        }).join('\n');
    }

    /**
     * Format NPC using Basic Text format
     * @param npc NPC to format
     * @returns Formatted Basic Text string
     */
    private formatBasicStatblock(npc: NPC): string {
    // Get class and race details
    const characterClass = this.settings.classes.find(c => c.name === npc.class);
    if (!characterClass) {
        throw new Error(`Class ${npc.class} not found`);
    }
    
    const race = this.settings.races.find(r => r.name === npc.race);
    if (!race) {
        throw new Error(`Race ${npc.race} not found`);
    }
    
    const hitDie = characterClass.hitDie || 8;
    
    // Calculate class-specific attack bonuses
    const strAttackBonus = (npc.abilityModifiers.str ?? 0) + npc.proficiencyBonus;
    const dexAttackBonus = (npc.abilityModifiers.dex ?? 0) + npc.proficiencyBonus;
    
    // Determine primary attack based on class and ability scores
    const isPrimaryStrength = (characterClass.primaryAbility === 'str' || 
                             (npc.abilityModifiers.str ?? 0) > (npc.abilityModifiers.dex ?? 0));
    
    const primaryAttackBonus = isPrimaryStrength ? strAttackBonus : dexAttackBonus;
    const primaryDamageBonus = isPrimaryStrength ? (npc.abilityModifiers.str ?? 0) : (npc.abilityModifiers.dex ?? 0);
    const attackType = isPrimaryStrength ? "Longsword" : "Shortsword";
    const attackDamage = isPrimaryStrength ? "1d8" : "1d6";
    const damageType = "slashing";
    
    // Calculate average damage
    const damageDie = parseInt(attackDamage.split('d')[1]);
    const averageDamage = Math.ceil(damageDie / 2) + 1 + primaryDamageBonus;
    
    // Determine languages
    const languageList = race.languages?.join(", ") || "Common";

        // Basic text format
        return `name: ${npc.name}
source: NPC Generator
size: ${race?.size || "Medium"}
type: humanoid
subtype: ${npc.race.toLowerCase()}
alignment: ${npc.alignment.toLowerCase()}
ac: ${10 + (npc.abilityModifiers.dex ?? 0)}
hp: ${npc.hitPoints}
hit_dice: ${npc.level}d${hitDie} + ${npc.level * (npc.abilityModifiers.con ?? 0)}
speed: ${race?.speed || 30} ft.
stats:
  - ${npc.abilityScores.str}
  - ${npc.abilityScores.dex}
  - ${npc.abilityScores.con}
  - ${npc.abilityScores.int}
  - ${npc.abilityScores.wis}
  - ${npc.abilityScores.cha}
saves:
  - strength: ${(npc.abilityModifiers.str ?? 0) + (characterClass?.savingThrows.includes('str') ? npc.proficiencyBonus : 0)}
  - dexterity: ${(npc.abilityModifiers.dex ?? 0) + (characterClass?.savingThrows.includes('dex') ? npc.proficiencyBonus : 0)}
  - constitution: ${(npc.abilityModifiers.con ?? 0) + (characterClass?.savingThrows.includes('con') ? npc.proficiencyBonus : 0)}
  - intelligence: ${(npc.abilityModifiers.int ?? 0) + (characterClass?.savingThrows.includes('int') ? npc.proficiencyBonus : 0)}
  - wisdom: ${(npc.abilityModifiers.wis ?? 0) + (characterClass?.savingThrows.includes('wis') ? npc.proficiencyBonus : 0)}
  - charisma: ${(npc.abilityModifiers.cha ?? 0) + (characterClass?.savingThrows.includes('cha') ? npc.proficiencyBonus : 0)}
skillsaves:
${Object.entries(npc.skills).filter(([_, value]) => value !== 0).map(([skill, bonus]) => 
`  - ${skill.toLowerCase()}: ${bonus}`).join('\n')}
damage_vulnerabilities: ""
damage_resistances: ""
damage_immunities: ""
condition_immunities: ""
senses: ${race?.traits.includes("Darkvision") ? "darkvision 60 ft., " : ""}passive Perception ${10 + (npc.skills['Perception'] ?? 0)}
languages: ${languageList}
cr: "${Math.max(1, Math.floor(npc.level / 4))}"
bestiary: true
traits:
${npc.traits.map(trait => `  - name: ${trait}
    desc: ${this.getTraitDescription(trait, npc.race)}
    attack_bonus: 0`).join('\n')}
${characterClass?.features?.filter(f => f.level <= npc.level).map(feature => 
`  - name: ${feature.name}
    desc: ${feature.description}
    attack_bonus: 0`).join('\n') || ''}
${npc.subclass ? this.getSubclassFeatures(characterClass, npc.subclass, npc.level) : ''}
actions:
  - name: ${attackType}
    desc: "Melee Weapon Attack: +${primaryAttackBonus} to hit, reach 5 ft., one target. Hit: ${averageDamage} (${attackDamage} + ${primaryDamageBonus}) ${damageType} damage."
    attack_bonus: ${primaryAttackBonus}
    damage_dice: ${attackDamage}
    damage_bonus: ${primaryDamageBonus}
${npc.customParameters.spellcasting ? `spells:
  - "The ${npc.name} is a level ${npc.level} spellcaster. Its spellcasting ability is ${npc.customParameters.spellcasting.ability} (spell save DC ${npc.customParameters.spellcasting.saveDC}, +${npc.customParameters.spellcasting.attackBonus} to hit with spell attacks)."
  - Cantrips (at will): ${SpellcastingUtils.getCantrips(npc.class).slice(0, npc.customParameters.spellcasting.cantripsKnown).join(', ')}
${Object.entries(npc.customParameters.spellcasting.slots).filter(([_, slots]) => Number(slots) > 0).map(([level, slots]) => 
`  - ${this.getOrdinal(parseInt(level))} level (${slots} slots): ${SpellcastingUtils.getSpellsByClassAndLevel(npc.class, parseInt(level)).slice(0, Math.min(4, Number(slots) + 1)).join(', ')}`
).join('\n')}` : ''}
possessions:
${this.formatPossessions(npc.possessions)}`;
}

    /**
     * Get ordinal suffix for a number
     * @param n Number to format
     * @returns Number with ordinal suffix
     */
    private getOrdinal(n: number): string {
        const suffixes = ['th', 'st', 'nd', 'rd'];
        const remainder = n % 100;
        
        return n + (suffixes[(remainder - 20) % 10] || suffixes[remainder] || suffixes[0]);
    }

    /**
    * Get description for racial traits
    */
    private getTraitDescription(trait: string, race: string): string {
        const traitDescriptions: Record<string, string> = {
            // Basic traits
            "Darkvision": "Can see in dim light within 60 feet as if it were bright light, and in darkness as if it were dim light.",
            "Superior Darkvision": "Can see in dim light within 120 feet as if it were bright light, and in darkness as if it were dim light.",
            "Fey Ancestry": "Has advantage on saving throws against being charmed, and magic can't put it to sleep.",
            "Trance": "Doesn't need to sleep, but meditates semiconsciously for 4 hours a day.",
            "Keen Senses": "Has proficiency in the Perception skill.",
            "Dwarven Resilience": "Has advantage on saving throws against poison, and has resistance against poison damage.",
            "Stonecunning": "Has doubled proficiency bonus when making Intelligence (History) checks related to stonework.",
            "Dwarven Combat Training": "Has proficiency with the battleaxe, handaxe, light hammer, and warhammer.",
            "Lucky": "When rolling a 1 on an attack roll, ability check, or saving throw, can reroll the die and must use the new roll.",
            "Brave": "Has advantage on saving throws against being frightened.",
            "Halfling Nimbleness": "Can move through the space of any creature that is of a size larger than yours.",
            "Versatile": "Gains proficiency in one additional skill of your choice.",
            "Skilled": "Gains proficiency in one skill of your choice, one tool of your choice, and one language of your choice.",
            "Feat": "Gains one Feat of your choice.",
            
            // Elf traits
            "Elf Weapon Training": "Has proficiency with the longsword, shortsword, shortbow, and longbow.",
            "Cantrip": "Knows one cantrip of your choice from the wizard spell list.",
            "Fleet of Foot": "Base walking speed increases to 35 feet.",
            "Mask of the Wild": "Can attempt to hide even when only lightly obscured by foliage, heavy rain, falling snow, mist, and other natural phenomena.",
            "Drow Magic": "Knows the dancing lights cantrip. At 3rd level, can cast faerie fire once per day. At 5th level, can cast darkness once per day.",
            "Sunlight Sensitivity": "Has disadvantage on attack rolls and Wisdom (Perception) checks that rely on sight when you, the target of your attack, or whatever you are trying to perceive is in direct sunlight.",
            "Drow Weapon Training": "Has proficiency with rapiers, shortswords, and hand crossbows.",
            
            // Dwarf traits
            "Dwarven Toughness": "Hit point maximum increases by 1, and increases by 1 every time you gain a level.",
            "Dwarven Armor Training": "Has proficiency with light and medium armor.",
            
            // Halfling traits
            "Naturally Stealthy": "Can attempt to hide even when obscured only by a creature that is at least one size larger.",
            "Stout Resilience": "Has advantage on saving throws against poison, and has resistance against poison damage.",
            
            // Dragonborn traits
            "Draconic Ancestry": "Has draconic ancestry. Choose one type of dragon; your breath weapon and damage resistance are determined by the dragon type.",
            "Breath Weapon": "Can use your action to exhale destructive energy. Your draconic ancestry determines the size, shape, and damage type of the exhalation.",
            "Damage Resistance": "Has resistance to the damage type associated with your draconic ancestry.",
            
            // Gnome traits
            "Gnome Cunning": "Has advantage on all Intelligence, Wisdom, and Charisma saving throws against magic.",
            "Natural Illusionist": "Knows the minor illusion cantrip. Intelligence is your spellcasting ability for it.",
            "Speak with Small Beasts": "Can communicate simple ideas with Small or smaller beasts through sounds and gestures.",
            "Artificer's Lore": "Has doubled proficiency bonus when making Intelligence (History) checks related to magic items, alchemical objects, or technological devices.",
            "Tinker": "Has proficiency with artisan's tools (tinker's tools) and can use them to construct tiny clockwork devices.",
            
            // Half-orc traits
            "Menacing": "Has proficiency in the Intimidation skill.",
            "Relentless Endurance": "When reduced to 0 hit points but not killed outright, can drop to 1 hit point instead. Can't use this feature again until after a long rest.",
            "Savage Attacks": "When scoring a critical hit with a melee weapon attack, can roll one of the weapon's damage dice one additional time and add it to the extra damage.",
            
            // Tiefling traits
            "Hellish Resistance": "Has resistance to fire damage.",
            "Infernal Legacy": "Knows the thaumaturgy cantrip. At 3rd level, can cast hellish rebuke once per day. At 5th level, can cast darkness once per day.",
            
            // Aasimar traits
            "Celestial Resistance": "Has resistance to necrotic damage and radiant damage.",
            "Healing Hands": "As an action, can touch a creature and heal a total number of hit points equal to your level. Can't use this trait again until after a long rest.",
            "Light Bearer": "Knows the light cantrip.",
            "Radiant Soul": "Can unleash divine energy within yourself. Your eyes glimmer and two luminous, incorporeal wings emerge from your back.",
            "Radiant Consumption": "Can unleash divine energy within yourself, causing a searing light to radiate from you.",
            "Necrotic Shroud": "Can unleash divine energy within yourself, causing your eyes to turn into pools of darkness and two skeletal, ghostly wings to emerge from your back.",
            
            // Other races
            "Firbolg Magic": "Can cast detect magic and disguise self spells once per short rest.",
            "Hidden Step": "As a bonus action, can magically turn invisible until the start of your next turn or until you attack, make a damage roll, or force someone to make a saving throw.",
            "Powerful Build": "Counts as one size larger when determining your carrying capacity and the weight you can push, drag, or lift.",
            "Speech of Beast and Leaf": "Can communicate simple ideas with beasts and plants.",
            "Stone's Endurance": "Can focus to resist damage. When taking damage, can use your reaction to roll a d12, adding your Constitution modifier, and reduce the damage by that total.",
            "Mountain Born": "Has resistance to cold damage and are acclimated to high altitude.",
            "Natural Athlete": "Has proficiency in the Athletics skill.",
            "Feline Agility": "Your reflexes and agility allow you to move with a burst of speed.",
            "Cat's Claws": "Has retractable claws that are natural weapons, which can be used to make unarmed strikes.",
            "Cat's Talent": "Has proficiency in the Perception and Stealth skills.",
            "Expert Forgery": "Can duplicate other creatures' handwriting and craftwork.",
            "Mimicry": "Can mimic sounds you have heard, including voices.",
            "Kenku Training": "Has proficiency in two of the following skills of your choice: Acrobatics, Deception, Stealth, and Sleight of Hand.",
            "Amphibious": "Can breathe air and water.",
            "Control Air and Water": "Can cast fog cloud once per day. At 3rd level, can cast gust of wind once per day. At 5th level, can cast wall of water once per day.",
            "Emissary of the Sea": "Can communicate simple ideas with beasts that can breathe water.",
            "Guardians of the Depths": "Adapted to even the most extreme ocean depths.",
            "Claws": "Has retractable claws that are natural weapons, which can be used to make unarmed strikes.",
            "Hunter's Instincts": "Has proficiency in two of the following skills of your choice: Athletics, Perception, Stealth, or Survival.",
            "Daunting Roar": "As a bonus action, can let out an especially menacing roar.",
            "Fey": "Your creature type is fey, rather than humanoid.",
            "Magic Resistance": "Has advantage on saving throws against spells and other magical effects.",
            "Mirthful Leaps": "Whenever you make a long jump or high jump, you can roll a d8 and add the number rolled to the total distance in feet.",
            "Reveler": "Has proficiency in the Performance and Persuasion skills.",
            "Flight": "Has a flying speed of 30 feet. To use this speed, you can't be wearing medium or heavy armor.",
            "Fairy Magic": "Knows the druidcraft cantrip. Starting at 3rd level, can cast faerie fire once per day. Starting at 5th level, can cast enlarge/reduce once per day.",
            "Hare-Trigger": "Can add your proficiency bonus to your initiative rolls.",
            "Leporine Senses": "Has proficiency in the Perception skill.",
            "Lucky Footwork": "When you fail a Dexterity saving throw, you can use your reaction to roll a d4 and add it to the save.",
            "Rabbit Hop": "As a bonus action, can jump a number of feet equal to five times your proficiency bonus."
        };
    
        return traitDescriptions[trait] || `Racial trait of ${race}.`;
    }
}