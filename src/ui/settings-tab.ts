import { 
    App,
    PluginSettingTab, 
    Setting, 
    Modal, 
    Notice 
} from 'obsidian';

import NPCGenerator from '../main';
import { 
    Race, 
    CharacterClass, 
    CustomParameter, 
    AbilityName 
} from '../types';

export class NPCGeneratorSettingsTab extends PluginSettingTab {
    private plugin: NPCGenerator;

    constructor(app: App, plugin: NPCGenerator) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display() {
        const { containerEl } = this;
        containerEl.empty();

        // Title
        containerEl.createEl('h1', { text: 'NPC Generator Settings' });

        // Statblock Format Section
        this.addStatblockFormatSection();

        // Races Section
        this.addRacesSection();

        // Classes Section
        this.addClassesSection();

        // Custom Parameters Section
        this.addCustomParametersSection();
    }

    /**
     * Add Statblock Format Selection
     */
    private addStatblockFormatSection() {
        const statblockSection = this.containerEl.createDiv('statblock-format-section');
        statblockSection.createEl('h2', { text: 'Statblock Format' });

        new Setting(statblockSection)
            .setName('Choose Statblock Style')
            .setDesc('Select the format for generated NPC statblocks')
            .addDropdown(dropdown => {
                dropdown
                    .addOption('fantasyStatblock', 'Fantasy Statblock')
                    .addOption('basic', 'Basic Text')
                    .setValue(this.plugin.settings.statblockFormat)
                    .onChange(async (value) => {
                        this.plugin.settings.statblockFormat = value as "fantasyStatblock" | "basic";
                        await this.plugin.saveSettings();
                    });
            });
    }

    /**
     * Add Races Management Section
     */
    private addRacesSection() {
        const racesSection = this.containerEl.createDiv('races-section');
        racesSection.createEl('h2', { text: 'Races' });

        // Add Race Button
        new Setting(racesSection)
            .setName('Add New Race')
            .setDesc('Create a new playable race for NPC generation')
            .addButton(button => {
                return button
                    .setButtonText('Add Race')
                    .onClick(() => this.openRaceModal());
            });

        // Existing Races List
        this.plugin.settings.races.forEach((race, index) => {
            new Setting(racesSection)
                .setName(race.name)
                .setDesc(this.formatRaceDescription(race))
                .addButton(button => {
                    return button
                        .setButtonText('Edit')
                        .onClick(() => this.openRaceModal(race, index));
                })
                .addButton(button => {
                    return button
                        .setButtonText('Delete')
                        .setClass("warning")
                        .onClick(async () => {
                            if (confirm(`Are you sure you want to delete the ${race.name} race?`)) {
                                this.plugin.settings.races.splice(index, 1);
                                await this.plugin.saveSettings();
                                this.display();
                            }
                        });
                });
        });
    }

    /**
     * Add Classes Management Section
     */
    private addClassesSection() {
        const classesSection = this.containerEl.createDiv('classes-section');
        classesSection.createEl('h2', { text: 'Classes' });

        // Add Class Button
        new Setting(classesSection)
            .setName('Add New Class')
            .setDesc('Create a new character class for NPC generation')
            .addButton(button => {
                return button
                    .setButtonText('Add Class')
                    .onClick(() => this.openClassModal());
            });

        // Existing Classes List
        this.plugin.settings.classes.forEach((characterClass, index) => {
            new Setting(classesSection)
                .setName(characterClass.name)
                .setDesc(this.formatClassDescription(characterClass))
                .addButton(button => {
                    return button
                        .setButtonText('Edit')
                        .onClick(() => this.openClassModal(characterClass, index));
                })
                .addButton(button => {
                    return button
                        .setButtonText('Delete')
                        .setClass("warning")
                        .onClick(async () => {
                            if (confirm(`Are you sure you want to delete the ${characterClass.name} class?`)) {
                                this.plugin.settings.classes.splice(index, 1);
                                await this.plugin.saveSettings();
                                this.display();
                            }
                        });
                });
        });
    }

    /**
     * Add Custom Parameters Management Section
     */
    private addCustomParametersSection() {
        const customParamsSection = this.containerEl.createDiv('custom-parameters-section');
        customParamsSection.createEl('h2', { text: 'Custom Parameters' });

        // Add Custom Parameter Button
        new Setting(customParamsSection)
            .setName('Add Custom Parameter')
            .setDesc('Create a new custom parameter for NPC generation')
            .addButton(button => {
                return button
                    .setButtonText('Add Parameter')
                    .onClick(() => this.openCustomParameterModal());
            });

        // Existing Custom Parameters List
        const customParams = this.plugin.settings.customParameters
            .filter(param => 
                param.name !== 'spellcasting' && 
                param.name !== 'possessions'
            );

        if (customParams.length === 0) {
            customParamsSection.createEl('p', { 
                text: 'No custom parameters defined.',
                attr: { style: 'color: #666; font-style: italic; text-align: center;' }
            });
        } else {
            customParams.forEach((param) => {
                new Setting(customParamsSection)
                    .setName(param.label)
                    .setDesc(`Name: ${param.name}, Format: ${param.format}`)
                    .addToggle(toggle => {
                        toggle
                            .setValue(param.enabled)
                            .onChange(async (value) => {
                                param.enabled = value;
                                await this.plugin.saveSettings();
                            });
                    })
                    .addButton(button => {
                        return button
                            .setButtonText('Edit')
                            .onClick(() => this.openCustomParameterModal(param));
                    })
                    .addButton(button => {
                        return button
                            .setButtonText('Delete')
                            .setClass("warning")
                            .onClick(async () => {
                                if (confirm(`Are you sure you want to delete the ${param.label} parameter?`)) {
                                    this.plugin.settings.customParameters.splice(
                                        this.plugin.settings.customParameters.indexOf(param), 
                                        1
                                    );
                                    await this.plugin.saveSettings();
                                    this.display();
                                }
                            });
                    });
            });
        }
    }

    /**
     * Open Race Modal for Adding/Editing
     */
    private openRaceModal(existingRace?: Race, index?: number) {
        const modal = new Modal(this.app);
        modal.titleEl.setText(existingRace ? `Edit ${existingRace.name} Race` : 'Add New Race');

        // Race Name
        new Setting(modal.contentEl)
            .setName('Race Name')
            .addText(text => {
                text.setValue(existingRace?.name || '')
                    .onChange(value => {
                        if (existingRace) existingRace.name = value;
                    });
            });

        // Ability Score Adjustments
        const abilities: AbilityName[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
        abilities.forEach(ability => {
            new Setting(modal.contentEl)
                .setName(`${ability.toUpperCase()} Adjustment`)
                .addSlider(slider => {
                    slider
                        .setLimits(-2, 2, 1)
                        .setValue(existingRace?.abilityScoreAdjustments[ability] || 0)
                        .setDynamicTooltip()
                        .onChange(value => {
                            if (existingRace) {
                                existingRace.abilityScoreAdjustments[ability] = value;
                            }
                        });
                });
        });

        // Traits
        const traitsContainer = modal.contentEl.createDiv('race-traits');
        traitsContainer.createEl('h3', { text: 'Racial Traits' });

        // Trait list
        const traitsList = traitsContainer.createEl('ul');
        (existingRace?.traits || []).forEach((trait, traitIndex) => {
            const traitItem = traitsList.createEl('li');
            traitItem.createEl('span', { text: trait });
            traitItem.createEl('button', { 
                text: '×',
                attr: { style: 'margin-left: 10px; color: red;' }
            }).addEventListener('click', () => {
                if (existingRace) {
                    existingRace.traits.splice(traitIndex, 1);
                    traitItem.remove();
                }
            });
        });

        // Add trait input
        const newTraitContainer = modal.contentEl.createDiv('new-trait-input');
        const traitInput = newTraitContainer.createEl('input', { 
            type: 'text', 
            placeholder: 'Add a new trait' 
        });
        const addTraitButton = newTraitContainer.createEl('button', { text: 'Add Trait' });
        
        addTraitButton.addEventListener('click', () => {
            const newTrait = traitInput.value.trim();
            if (newTrait) {
                if (!existingRace) {
                    existingRace = {
                        name: '',
                        abilityScoreAdjustments: { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 },
                        traits: []
                    };
                }
                existingRace.traits.push(newTrait);
                const traitItem = traitsList.createEl('li');
                traitItem.createEl('span', { text: newTrait });
                traitItem.createEl('button', { 
                    text: '×',
                    attr: { style: 'margin-left: 10px; color: red;' }
                }).addEventListener('click', () => {
                    existingRace!.traits.splice(existingRace!.traits.length - 1, 1);
                    traitItem.remove();
                });
                traitInput.value = '';
            }
        });

        // Save Button
        const saveButton = modal.contentEl.createEl('button', { text: 'Save' });
        saveButton.addEventListener('click', async () => {
            if (!existingRace || !existingRace.name) {
                new Notice('Race name is required');
                return;
            }

            if (index !== undefined) {
                // Editing existing race
                this.plugin.settings.races[index] = existingRace;
            } else {
                // Adding new race
                this.plugin.settings.races.push(existingRace);
            }

            await this.plugin.saveSettings();
            this.display();
            modal.close();
        });

        modal.open();
    }

    /**
     * Open Class Modal for Adding/Editing
     */
    private openClassModal(existingClass?: CharacterClass, index?: number) {
        const modal = new Modal(this.app);
        modal.titleEl.setText(existingClass ? `Edit ${existingClass.name} Class` : 'Add New Class');

        // Class Name
        new Setting(modal.contentEl)
            .setName('Class Name')
            .addText(text => {
                text.setValue(existingClass?.name || '')
                    .onChange(value => {
                        if (existingClass) existingClass.name = value;
                    });
            });

        // Hit Die
        new Setting(modal.contentEl)
            .setName('Hit Die')
            .addDropdown(dropdown => {
                dropdown
                    .addOption('6', 'd6')
                    .addOption('8', 'd8')
                    .addOption('10', 'd10')
                    .addOption('12', 'd12')
                    .setValue((existingClass?.hitDie || 8).toString())
                    .onChange(value => {
                        if (existingClass) existingClass.hitDie = parseInt(value) as 6 | 8 | 10 | 12;
                    });
            });

        // Primary Ability
        new Setting(modal.contentEl)
            .setName('Primary Ability')
            .addDropdown(dropdown => {
                dropdown
                    .addOption('str', 'STR')
                    .addOption('dex', 'DEX')
                    .addOption('con', 'CON')
                    .addOption('int', 'INT')
                    .addOption('wis', 'WIS')
                    .addOption('cha', 'CHA')
                    .setValue(existingClass?.primaryAbility || 'str')
                    .onChange(value => {
                        if (existingClass) existingClass.primaryAbility = value as AbilityName;
                    });
            });

        // Saving Throws
        const savingThrowsContainer = modal.contentEl.createDiv('saving-throws');
        savingThrowsContainer.createEl('h3', { text: 'Saving Throws' });

        const abilityNames: AbilityName[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
        const savingThrowCheckboxes: Record<AbilityName, HTMLInputElement> = {} as Record<AbilityName, HTMLInputElement>;

        abilityNames.forEach(ability => {
            const setting = new Setting(savingThrowsContainer)
                .setName(ability.toUpperCase());
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = existingClass?.savingThrows.includes(ability) || false;
            setting.controlEl.appendChild(checkbox);
            savingThrowCheckboxes[ability] = checkbox;
        });

        // Skills
        const skillsContainer = modal.contentEl.createDiv('class-skills');
        skillsContainer.createEl('h3', { text: 'Class Skills' });

        const allSkills = [
            'Acrobatics', 'Animal Handling', 'Arcana', 'Athletics', 'Deception', 
            'History', 'Insight', 'Intimidation', 'Investigation', 'Medicine', 
            'Nature', 'Perception', 'Performance', 'Persuasion', 'Religion', 
            'Sleight of Hand', 'Stealth', 'Survival'
        ];

        const skillCheckboxes: Record<string, HTMLInputElement> = {};
        
        allSkills.forEach(skill => {
            const setting = new Setting(skillsContainer)
                .setName(skill);
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = existingClass?.skills.includes(skill) || false;
            setting.controlEl.appendChild(checkbox);
            skillCheckboxes[skill] = checkbox;
        });

        // Save Button
        const saveButton = modal.contentEl.createEl('button', { text: 'Save' });
        saveButton.addEventListener('click', async () => {
            if (!existingClass || !existingClass.name) {
                new Notice('Class name is required');
                return;
            }

            // Update saving throws
            existingClass.savingThrows = abilityNames.filter(
                ability => savingThrowCheckboxes[ability].checked
            );

            // Update skills
            existingClass.skills = allSkills.filter(
                skill => skillCheckboxes[skill].checked
            );

            if (index !== undefined) {
                // Editing existing class
                this.plugin.settings.classes[index] = existingClass;
            } else {
                // Adding new class
                this.plugin.settings.classes.push(existingClass);
            }

            await this.plugin.saveSettings();
            this.display();
            modal.close();
        });

        modal.open();
    }

    /**
     * Open Custom Parameter Modal for Adding/Editing
     */
    private openCustomParameterModal(existingParam?: CustomParameter) {
        const modal = new Modal(this.app);
        modal.titleEl.setText(existingParam ? `Edit ${existingParam.label} Parameter` : 'Add New Custom Parameter');

        // Parameter Name (for code)
        const nameContainer = modal.contentEl.createDiv('parameter-name');
        nameContainer.createEl('h3', { text: 'Parameter Identification' });
        
        const nameInput = nameContainer.createEl('input', {
            type: 'text',
            placeholder: 'Internal parameter name (lowercase, no spaces)',
            value: existingParam?.name || ''
        });
        
        nameContainer.createEl('div', {
            attr: { 
                style: 'color: red; display: none;',
                id: 'name-error' 
            }
        });

        // Validate parameter name
        const validateName = (): boolean => {
            const name = nameInput.value.trim().toLowerCase();
            const nameErrorEl = document.getElementById('name-error');
            
            if (!nameErrorEl) return false;
            
            // Check if name is empty
            if (!name) {
                nameErrorEl.textContent = 'Parameter name is required';
                nameErrorEl.style.display = 'block';
                return false;
            }

            // Check for valid characters (alphanumeric and underscore)
            const validNameRegex = /^[a-z0-9_]+$/;
            if (!validNameRegex.test(name)) {
                nameErrorEl.textContent = 'Name must contain only lowercase letters, numbers, and underscores';
                nameErrorEl.style.display = 'block';
                return false;
            }

            // Check for uniqueness (excluding current parameter)
            const existingNames = this.plugin.settings.customParameters
                .filter(p => p !== existingParam)
                .map(p => p.name);
            
            if (existingNames.includes(name)) {
                nameErrorEl.textContent = 'Parameter name must be unique';
                nameErrorEl.style.display = 'block';
                return false;
            }

            nameErrorEl.style.display = 'none';
            return true;
        };

        nameInput.addEventListener('blur', validateName);

        // Display Label
        const labelContainer = modal.contentEl.createDiv('parameter-label');
        labelContainer.createEl('h3', { text: 'Display Settings' });
        
        const labelInput = labelContainer.createEl('input', {
            type: 'text',
            placeholder: 'Label to display in UI',
            value: existingParam?.label || ''
        });

        // Format Template
        const formatContainer = modal.contentEl.createDiv('parameter-format');
        formatContainer.createEl('h3', { text: 'Formatting' });
        
        const formatInput = formatContainer.createEl('input', {
            type: 'text',
            placeholder: 'Format template (e.g., "- {content}")',
            value: existingParam?.format || '- "{content}"'
        });

        // Format help text
        formatContainer.createEl('p', {
            text: 'Use {content} for single values or {item} for list items',
            attr: { style: 'color: #666; font-size: 0.8em;' }
        });

        // Example Preview
        const previewContainer = modal.contentEl.createDiv('parameter-preview');
        previewContainer.createEl('h3', { text: 'Preview' });
        
        const previewOutput = previewContainer.createEl('div', {
            attr: { 
                style: 'background: #f0f0f0; padding: 10px; border-radius: 5px; font-family: monospace;' 
            }
        });

        // Update preview function
        const updatePreview = () => {
            const format = formatInput.value || '- "{content}"';
            previewOutput.textContent = format
                .replace('{content}', 'Example content')
                .replace('{item}', 'Example item');
        };

        // Update preview on input
        formatInput.addEventListener('input', updatePreview);
        updatePreview();

        // Enabled Toggle
        const enabledContainer = modal.contentEl.createDiv('parameter-enabled');
        enabledContainer.createEl('h3', { text: 'Visibility' });
        
        const enabledToggle = document.createElement('input');
        enabledToggle.type = 'checkbox';
        enabledToggle.checked = existingParam?.enabled ?? true;
        enabledContainer.appendChild(enabledToggle);
        
        enabledContainer.createEl('label', { 
            text: ' Enabled (visible in NPC generation)',
            attr: { style: 'margin-left: 10px;' }
        });

        // Save Button
        const saveButton = modal.contentEl.createEl('button', { text: 'Save' });
        saveButton.addEventListener('click', async () => {
            // Validate name before saving
            if (!validateName()) return;

            // Prepare parameter object
            const paramToSave: CustomParameter = {
                name: nameInput.value.trim().toLowerCase(),
                label: labelInput.value.trim() || 'Custom Parameter',
                format: formatInput.value.trim() || '- "{content}"',
                enabled: enabledToggle.checked
            };

            // Update or add parameter
            if (existingParam) {
                // Replace existing parameter
                const paramIndex = this.plugin.settings.customParameters.indexOf(existingParam);
                this.plugin.settings.customParameters[paramIndex] = paramToSave;
            } else {
                // Add new parameter
                this.plugin.settings.customParameters.push(paramToSave);
            }

            // Save settings and refresh display
            await this.plugin.saveSettings();
            this.display();
            modal.close();
        });

        // Cancel Button
        const cancelButton = modal.contentEl.createEl('button', { 
            text: 'Cancel',
            attr: { style: 'margin-left: 10px;' }
        });
        cancelButton.addEventListener('click', () => modal.close());

        modal.open();
    }

    /**
     * Format race description for display
     */
    private formatRaceDescription(race: Race): string {
        const bonuses = Object.entries(race.abilityScoreAdjustments)
            .filter(([_, value]) => value !== 0)
            .map(([ability, value]) => `${ability.toUpperCase()} ${value > 0 ? '+' + value : value}`)
            .join(', ');
        
        const traits = race.traits.length ? race.traits.join(', ') : 'None';
        
        return `Ability Adjustments: ${bonuses || 'None'}, Traits: ${traits}`;
    }

    /**
     * Format class description for display
     */
    private formatClassDescription(characterClass: CharacterClass): string {
        return `Hit Die: d${characterClass.hitDie}, Primary: ${characterClass.primaryAbility.toUpperCase()}, Skills: ${characterClass.skills.length}`;
    }
}