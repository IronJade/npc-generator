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
    private activeTab: string = 'general';

    constructor(app: App, plugin: NPCGenerator) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display() {
        // Clear any potential lingering event listeners
        this.containerEl.innerHTML = '';

        // Recreate the entire settings view
        const { containerEl } = this;
        containerEl.empty();

        // Title
        containerEl.createEl('h1', { text: 'NPC Generator Settings' });

        // Create navigation tabs
        const navContainer = containerEl.createDiv('nav-container');
        navContainer.style.display = 'flex';
        navContainer.style.marginBottom = '20px';
        navContainer.style.borderBottom = '1px solid var(--background-modifier-border)';
        
        const createTab = (id: string, label: string) => {
            const tab = navContainer.createEl('button', { text: label });
            tab.style.padding = '8px 16px';
            tab.style.border = 'none';
            tab.style.background = 'none';
            tab.style.cursor = 'pointer';
            tab.style.borderRadius = '4px 4px 0 0';
            tab.style.marginRight = '4px';
            
            if (id === this.activeTab) {
                tab.style.borderBottom = '2px solid var(--interactive-accent)';
                tab.style.fontWeight = 'bold';
                tab.style.color = 'var(--interactive-accent)';
            }

            tab.addEventListener('click', () => {
                this.activeTab = id;
                this.display();
            });
            
            return tab;
        };

        // Create the tabs
        createTab('general', 'General');
        createTab('races', 'Races');
        createTab('classes', 'Classes');
        createTab('parameters', 'Custom Parameters');

        // Content container
        const contentContainer = containerEl.createDiv('content-container');
        contentContainer.style.maxHeight = '500px';
        contentContainer.style.overflowY = 'auto';
        contentContainer.style.padding = '10px';
        contentContainer.style.border = '1px solid var(--background-modifier-border)';
        contentContainer.style.borderRadius = '4px';

        // Display the active tab content
        switch (this.activeTab) {
            case 'general':
                this.addStatblockFormatSection(contentContainer);
                break;
            case 'races':
                this.addRacesSection(contentContainer);
                break;
            case 'classes':
                this.addClassesSection(contentContainer);
                break;
            case 'parameters':
                this.addCustomParametersSection(contentContainer);
                break;
        }
    }

    /**
     * Add Statblock Format Selection
     */
    private addStatblockFormatSection(contentEl: HTMLElement) {
        const statblockSection = contentEl.createDiv('statblock-format-section');
        statblockSection.createEl('h2', { text: 'Statblock Format' });
        statblockSection.createEl('p', { 
            text: 'Select how NPC statblocks should be formatted when inserted into your notes.',
            cls: 'setting-item-description'
        });

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
private addRacesSection(contentEl: HTMLElement) {
    const racesSection = contentEl.createDiv('races-section');
    
    // Section header with description
    const headerContainer = racesSection.createDiv('section-header');
    headerContainer.createEl('h2', { text: 'Races' });
    headerContainer.createEl('p', { 
        text: 'Manage the available races for NPC generation.',
        cls: 'setting-item-description'
    });

    // Add Race Button
    new Setting(racesSection)
        .setName('Add New Race')
        .setDesc('Create a new playable race for NPC generation')
        .addButton(button => {
            return button
                .setButtonText('Add Race')
                .setCta()
                .onClick(() => this.openRaceModal());
        });

    // Race cards container with grid layout
    const racesContainer = racesSection.createDiv('races-container');
    racesContainer.style.display = 'grid';
    racesContainer.style.gridTemplateColumns = 'repeat(auto-fill, minmax(250px, 1fr))';
    racesContainer.style.gap = '10px';
    racesContainer.style.marginTop = '20px';

    // Existing Races List as cards
    this.plugin.settings.races.forEach((race, index) => {
        const raceCard = racesContainer.createDiv('race-card');
        raceCard.style.border = '1px solid var(--background-modifier-border)';
        raceCard.style.borderRadius = '5px';
        raceCard.style.padding = '10px';
        raceCard.style.backgroundColor = 'var(--background-secondary)';
        
        const raceHeader = raceCard.createDiv('race-header');
        raceHeader.style.borderBottom = '1px solid var(--background-modifier-border)';
        raceHeader.style.paddingBottom = '5px';
        raceHeader.style.marginBottom = '8px';
        
        raceHeader.createEl('h3', { 
            text: race.name,
            attr: { style: 'margin: 0; font-size: 1.1em;' }
        });
        
        const raceDescription = raceCard.createDiv('race-description');
        raceDescription.style.fontSize = '0.9em';
        raceDescription.style.marginBottom = '10px';
        raceDescription.style.color = 'var(--text-muted)';
        raceDescription.textContent = this.formatRaceDescription(race);
        
        const raceActions = raceCard.createDiv('race-actions');
        raceActions.style.display = 'flex';
        raceActions.style.justifyContent = 'space-between';
        
        const editButton = raceActions.createEl('button', { text: 'Edit' });
        editButton.style.padding = '4px 8px';
        editButton.style.fontSize = '0.8em';
        editButton.addEventListener('click', () => {
            this.openRaceModal(race, index);
        });
        
        const deleteButton = raceActions.createEl('button', { text: 'Delete' });
        deleteButton.style.padding = '4px 8px';
        deleteButton.style.fontSize = '0.8em';
        deleteButton.style.color = 'var(--text-error)';
        deleteButton.addEventListener('click', async () => {
            if (confirm(`Are you sure you want to delete the ${race.name} race?`)) {
                this.plugin.settings.races.splice(index, 1);
                await this.plugin.saveSettings();
                
                // Clear and recreate the section
                contentEl.empty();
                this.addRacesSection(contentEl);
            }
        });
    });
}

    /**
     * Add Classes Management Section
     */
    private addClassesSection(contentEl: HTMLElement) {
        const classesSection = contentEl.createDiv('classes-section');
        
        // Section header with description
        const headerContainer = classesSection.createDiv('section-header');
        headerContainer.createEl('h2', { text: 'Classes' });
        headerContainer.createEl('p', { 
            text: 'Manage the available classes and subclasses for NPC generation.',
            cls: 'setting-item-description'
        });

        // Add Class Button
        new Setting(classesSection)
            .setName('Add New Class')
            .setDesc('Create a new character class for NPC generation')
            .addButton(button => {
                return button
                    .setButtonText('Add Class')
                    .setCta()
                    .onClick(() => this.openClassModal());
            });

        // Create a collapsible list for classes
        const classesContainer = classesSection.createDiv('classes-container');
        classesContainer.style.marginTop = '15px';

        // Existing Classes List with collapsible details
        this.plugin.settings.classes.forEach((characterClass, index) => {
            const classItem = classesContainer.createDiv('class-item');
            classItem.style.marginBottom = '10px';
            classItem.style.border = '1px solid var(--background-modifier-border)';
            classItem.style.borderRadius = '5px';
            classItem.style.overflow = 'hidden';
            
            // Class header (always visible)
            const classHeader = classItem.createDiv('class-header');
            classHeader.style.padding = '10px';
            classHeader.style.backgroundColor = 'var(--background-secondary)';
            classHeader.style.cursor = 'pointer';
            classHeader.style.display = 'flex';
            classHeader.style.justifyContent = 'space-between';
            classHeader.style.alignItems = 'center';
            
            const classTitle = classHeader.createDiv('class-title');
            classTitle.style.fontWeight = 'bold';
            classTitle.textContent = characterClass.name;
            
            const classSummary = classHeader.createDiv('class-summary');
            classSummary.style.fontSize = '0.9em';
            classSummary.style.color = 'var(--text-muted)';
            classSummary.textContent = this.formatClassDescription(characterClass);
            
            const expandIcon = classHeader.createDiv('expand-icon');
            expandIcon.textContent = '▼';
            expandIcon.style.marginLeft = '10px';
            
            // Class details (collapsible)
            const classDetails = classItem.createDiv('class-details');
            classDetails.style.padding = '10px';
            classDetails.style.borderTop = '1px solid var(--background-modifier-border)';
            classDetails.style.display = 'none';
            
            // Class features section
            const featuresSection = classDetails.createDiv('features-section');
            featuresSection.style.marginBottom = '10px';
            
            featuresSection.createEl('h4', { 
                text: 'Class Features',
                attr: { style: 'margin: 0 0 5px 0; font-size: 1em;' }
            });
            
            if (characterClass.features && characterClass.features.length > 0) {
                const featuresList = featuresSection.createEl('ul');
                featuresList.style.margin = '0';
                featuresList.style.paddingLeft = '20px';
                
                characterClass.features.forEach(feature => {
                    const featureItem = featuresList.createEl('li');
                    featureItem.style.fontSize = '0.9em';
                    featureItem.textContent = `Level ${feature.level}: ${feature.name}`;
                });
            } else {
                featuresSection.createEl('p', {
                    text: 'No features defined.',
                    attr: { style: 'color: var(--text-muted); font-style: italic; margin: 0;' }
                });
            }
            
    // Subclasses section
    const subclassesSection = classDetails.createDiv('subclasses-section');
    
    const subclassHeader = subclassesSection.createDiv('subclass-header');
    subclassHeader.style.display = 'flex';
    subclassHeader.style.justifyContent = 'space-between';
    subclassHeader.style.alignItems = 'center';
    subclassHeader.style.marginBottom = '5px';
    
    subclassHeader.createEl('h4', { 
        text: 'Subclasses',
        attr: { style: 'margin: 0; font-size: 1em;' }
    });
    
    const addSubclassButton = subclassHeader.createEl('button', { text: 'Add Subclass' });
    addSubclassButton.style.fontSize = '0.8em';
    addSubclassButton.style.padding = '2px 6px';
    addSubclassButton.addEventListener('click', () => {
        this.openSubclassModal(characterClass, index);
    });
    
    if (characterClass.subclasses && characterClass.subclasses.length > 0) {
        const subclassesList = subclassesSection.createEl('ul');
        subclassesList.style.margin = '0';
        subclassesList.style.paddingLeft = '20px';
        
        characterClass.subclasses.forEach((subclass, subclassIndex) => {
            const subclassItem = subclassesList.createEl('li');
            subclassItem.style.fontSize = '0.9em';
            subclassItem.style.marginBottom = '5px';
            
            const subclassText = subclassItem.createSpan();
            subclassText.textContent = subclass.name;
            
            const subclassActions = subclassItem.createSpan();
            subclassActions.style.marginLeft = '10px';
            
            const editSubclassButton = subclassActions.createEl('button', { text: 'Edit' });
            editSubclassButton.style.fontSize = '0.7em';
            editSubclassButton.style.padding = '2px 4px';
            editSubclassButton.style.marginRight = '5px';
            editSubclassButton.addEventListener('click', () => {
                this.openSubclassModal(characterClass, index, subclass, subclassIndex);
            });
            
            const deleteSubclassButton = subclassActions.createEl('button', { text: 'Delete' });
            deleteSubclassButton.style.fontSize = '0.7em';
            deleteSubclassButton.style.padding = '2px 4px';
            deleteSubclassButton.style.color = 'var(--text-error)';
            deleteSubclassButton.addEventListener('click', async () => {
                if (confirm(`Are you sure you want to delete the ${subclass.name} subclass?`)) {
                    characterClass.subclasses?.splice(subclassIndex, 1);
                    await this.plugin.saveSettings();
                
                    // Clear and recreate the section
                    contentEl.empty();
                    this.addClassesSection(contentEl);
                }
            });
        });
    } else {
        subclassesSection.createEl('p', {
            text: 'No subclasses defined.',
            attr: { style: 'color: var(--text-muted); font-style: italic; margin: 0;' }
        });
    }
            
            // Class actions
            const classActions = classDetails.createDiv('class-actions');
            classActions.style.display = 'flex';
            classActions.style.justifyContent = 'flex-end';
            classActions.style.marginTop = '10px';
            classActions.style.borderTop = '1px solid var(--background-modifier-border)';
            classActions.style.paddingTop = '10px';
            
            const editButton = classActions.createEl('button', { text: 'Edit Class' });
            editButton.style.marginRight = '10px';
            editButton.addEventListener('click', () => {
                this.openClassModal(characterClass, index);
            });
            
            const deleteButton = classActions.createEl('button', { text: 'Delete Class' });
            deleteButton.style.color = 'var(--text-error)';
            deleteButton.addEventListener('click', async () => {
                if (confirm(`Are you sure you want to delete the ${characterClass.name} class?`)) {
                    this.plugin.settings.classes.splice(index, 1);
                    await this.plugin.saveSettings();
                
                // Clear and recreate the section
                contentEl.empty();
                this.addClassesSection(contentEl);
            }
            });
            
            // Toggle expansion on header click
            classHeader.addEventListener('click', () => {
                const expanded = classDetails.style.display !== 'none';
                classDetails.style.display = expanded ? 'none' : 'block';
                expandIcon.textContent = expanded ? '▼' : '▲';
            });
        });
    }

    /**
     * Add Custom Parameters Management Section
     */
    private addCustomParametersSection(contentEl: HTMLElement) {
        contentEl.empty();
        
        const customParamsSection = contentEl.createDiv('custom-parameters-section');
        
        // Section header with description
        const headerContainer = customParamsSection.createDiv('section-header');
        headerContainer.createEl('h2', { text: 'Custom Parameters' });
        headerContainer.createEl('p', { 
            text: 'Add custom fields to your NPC generation form and statblocks.',
            cls: 'setting-item-description'
        });
    
        // Add Custom Parameter Button
        new Setting(customParamsSection)
            .setName('Add Custom Parameter')
            .setDesc('Create a new custom parameter for NPC generation')
            .addButton(button => {
                return button
                    .setButtonText('Add Parameter')
                    .setCta()
                    .onClick(() => {
                        this.createCustomParameterModal();
                    });
            });
    
        // Existing Custom Parameters List
        const customParams = this.plugin.settings.customParameters
            .filter(param => 
                param.name !== 'spellcasting' && 
                param.name !== 'possessions'
            );
    
        const paramsContainer = customParamsSection.createDiv('params-container');
        paramsContainer.style.marginTop = '20px';
    
        if (customParams.length === 0) {
            paramsContainer.createEl('p', { 
                text: 'No custom parameters defined.',
                attr: { style: 'color: var(--text-muted); font-style: italic; text-align: center; padding: 20px;' }
            });
        } else {
            for (const param of customParams) {
                new Setting(paramsContainer)
                    .setName(param.label)
                    .setDesc(param.format)
                    .addToggle(toggle => {
                        toggle.setValue(param.enabled)
                            .onChange(async (value) => {
                                param.enabled = value;
                                await this.plugin.saveSettings();
                            });
                    })
                    .addExtraButton(button => {
                        button.setIcon('pencil')
                            .setTooltip('Edit')
                            .onClick(() => {
                                this.createCustomParameterModal(param);
                            });
                    })
                    .addExtraButton(button => {
                        button.setIcon('trash')
                            .setTooltip('Delete')
                            .onClick(async () => {
                                if (confirm(`Are you sure you want to delete the ${param.label} parameter?`)) {
                                    // Filter out the parameter
                                    this.plugin.settings.customParameters = 
                                        this.plugin.settings.customParameters.filter(p => p !== param);
                                    
                                    await this.plugin.saveSettings();
                                    // Refresh just this section instead of the entire settings page
                                    this.addCustomParametersSection(contentEl);
                                }
                            });
                    });
            }
        }
    }
    
    /**
     * Create Custom Parameter Modal
     */
    private createCustomParameterModal(existingParam?: CustomParameter) {
        const modal = new Modal(this.app);
        let parameter: CustomParameter = existingParam ? {...existingParam} : {
            name: '',
            label: '',
            format: '- "{content}"',
            enabled: true
        };
        
        modal.titleEl.setText(parameter.name ? `Edit ${parameter.label} Parameter` : 'New Custom Parameter');
        modal.contentEl.empty();
        
    // Name input
    new Setting(modal.contentEl)
        .setName('Internal Name')
        .setDesc('Used internally. Lowercase, no spaces.')
        .addText(text => {
            text.setValue(parameter.name)
                .onChange(value => {
                    parameter.name = value.toLowerCase().replace(/[^a-z0-9_]/g, '');
                });
            
            // Add a small delay to make sure focus works properly
            setTimeout(() => {
                text.inputEl.focus();
            }, 50);
        });
    
    // Label input
    new Setting(modal.contentEl)
        .setName('Display Label')
        .setDesc('Shown in the UI.')
        .addText(text => {
            text.setValue(parameter.label)
                .onChange(value => {
                    parameter.label = value;
                });
        });
    
    // Format input
    new Setting(modal.contentEl)
        .setName('Format')
        .setDesc('Format template for displaying the parameter value. Use {content} as placeholder.')
        .addText(text => {
            text.setValue(parameter.format)
                .onChange(value => {
                    parameter.format = value;
                });
        });
    
    // Buttons
    const footerEl = modal.contentEl.createDiv();
    const footerButtons = new Setting(footerEl);
    
    footerButtons.addButton(btn => {
        return btn.setButtonText('Save')
            .setCta()
            .onClick(async () => {
                if (!parameter.name) {
                    new Notice('Parameter name is required');
                    return;
                }
                
                if (!parameter.label) {
                    parameter.label = parameter.name;
                }
                
                if (existingParam) {
                    // Find and replace the existing parameter
                    const index = this.plugin.settings.customParameters.indexOf(existingParam);
                    if (index !== -1) {
                        this.plugin.settings.customParameters[index] = parameter;
                    }
                } else {
                    // Add new parameter
                    this.plugin.settings.customParameters.push(parameter);
                }
                
                await this.plugin.saveSettings();
                modal.close();
                
                // Refresh the custom parameters section
                this.addCustomParametersSection(
                    this.containerEl.querySelector('.content-container') as HTMLElement
                );
            });
    });
    
    footerButtons.addButton(btn => {
        return btn.setButtonText('Cancel')
            .onClick(() => {
                modal.close();
            });
    });
    
    modal.open();
}

/**
 * Open Subclass Modal for Adding/Editing
 */
private openSubclassModal(
    characterClass: CharacterClass, 
    classIndex: number, 
    existingSubclass?: { name: string; description: string; features: { level: number; name: string; description: string; }[] },
    subclassIndex?: number
) {
    const modal = new Modal(this.app);
    modal.titleEl.setText(existingSubclass ? `Edit ${existingSubclass.name} Subclass` : `Add New Subclass for ${characterClass.name}`);
    modal.contentEl.style.width = '500px';

    // Subclass Name
    new Setting(modal.contentEl)
        .setName('Subclass Name')
        .addText(text => {
            text.setValue(existingSubclass?.name || '')
                .setPlaceholder('Enter subclass name')
                .onChange(value => {
                    if (existingSubclass) existingSubclass.name = value;
                });
        });

    // Subclass Description
    new Setting(modal.contentEl)
        .setName('Description')
        .setDesc('Brief description of the subclass and its strengths')
        .addTextArea(text => {
            text.setValue(existingSubclass?.description || '')
                .setPlaceholder('Description of the subclass...')
                .onChange(value => {
                    if (existingSubclass) existingSubclass.description = value;
                });
            
            const textEl = text.inputEl;
            textEl.style.width = '100%';
            textEl.style.height = '100px';
        });

    // Features section
    const featuresContainer = modal.contentEl.createDiv('subclass-features');
    featuresContainer.createEl('h3', { text: 'Subclass Features' });
    featuresContainer.style.marginTop = '20px';
    
    const featuresList = featuresContainer.createDiv('features-list');
    
    // Function to add a feature row
    const addFeatureRow = (feature?: {level: number, name: string, description: string}) => {
        const featureRow = featuresList.createDiv('feature-row');
        featureRow.style.display = 'flex';
        featureRow.style.marginBottom = '10px';
        featureRow.style.gap = '10px';
        
        // Level input
        const levelInput = document.createElement('input');
        levelInput.type = 'number';
        levelInput.min = '1';
        levelInput.max = '20';
        levelInput.value = feature?.level?.toString() || '3';
        levelInput.style.width = '60px';
        levelInput.placeholder = 'Level';
        featureRow.appendChild(levelInput);
        
        // Name input
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.value = feature?.name || '';
        nameInput.style.flex = '1';
        nameInput.placeholder = 'Feature name';
        featureRow.appendChild(nameInput);
        
        // Description input
        const descInput = document.createElement('input');
        descInput.type = 'text';
        descInput.value = feature?.description || '';
        descInput.style.flex = '2';
        descInput.placeholder = 'Feature description';
        featureRow.appendChild(descInput);
        
        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '×';
        deleteBtn.style.color = 'var(--text-error)';
        deleteBtn.addEventListener('click', () => {
            featureRow.remove();
        });
        featureRow.appendChild(deleteBtn);
        
        return { row: featureRow, levelInput, nameInput, descInput };
    };
    
    // Add existing features or a default empty one
    if (existingSubclass?.features && existingSubclass.features.length > 0) {
        existingSubclass.features.forEach((feature: {level: number, name: string, description: string}) => {
            addFeatureRow(feature);
        });
    } else {
        addFeatureRow();
    }
    
    // Button to add more features
    const addFeatureButton = featuresContainer.createEl('button', { text: 'Add Feature' });
    addFeatureButton.style.marginTop = '10px';
    addFeatureButton.addEventListener('click', () => {
        addFeatureRow();
    });

    // Save Button
    const buttonContainer = modal.contentEl.createDiv('button-container');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'flex-end';
    buttonContainer.style.marginTop = '20px';
    buttonContainer.style.gap = '10px';
    
    const cancelButton = buttonContainer.createEl('button', { text: 'Cancel' });
    cancelButton.addEventListener('click', () => {
        modal.close();
    });
    
    const saveButton = buttonContainer.createEl('button', { 
        text: 'Save Subclass',
        cls: 'mod-cta'
    });
    
    saveButton.addEventListener('click', async () => {
        const nameInput = modal.contentEl.querySelector('input[placeholder="Enter subclass name"]') as HTMLInputElement;
        const descriptionInput = modal.contentEl.querySelector('textarea[placeholder="Description of the subclass..."]') as HTMLTextAreaElement;
        
        if (!nameInput.value.trim()) {
            new Notice('Subclass name is required');
            return;
        }
        
        // Collect all feature data
        const features: {level: number, name: string, description: string}[] = [];
        
        const featureRows = featuresList.querySelectorAll('.feature-row');
        featureRows.forEach(row => {
            const inputs = row.querySelectorAll('input');
            if (inputs[1].value.trim()) { // Only add if name is not empty
                features.push({
                    level: parseInt(inputs[0].value, 10) || 3,
                    name: inputs[1].value.trim(),
                    description: inputs[2].value.trim() || 'No description provided.'
                });
            }
        });
        
        // Sort features by level
        features.sort((a, b) => a.level - b.level);
        
        // Create or update the subclass
        const subclass = {
            name: nameInput.value.trim(),
            description: descriptionInput.value.trim() || 'No description provided.',
            features: features
        };
        
        // Ensure the class has a subclasses array
        if (!characterClass.subclasses) {
            characterClass.subclasses = [];
        }
        
        if (existingSubclass && subclassIndex !== undefined) {
            // Update existing subclass
            characterClass.subclasses[subclassIndex] = subclass;
        } else {
            // Add new subclass
            characterClass.subclasses.push(subclass);
        }
        
        // Update the class in settings
        this.plugin.settings.classes[classIndex] = characterClass;
        
        // Save settings and refresh display
        await this.plugin.saveSettings();
        this.display();
        modal.close();
    });

    modal.open();
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
                attr: { style: 'margin-left: 10px; color: var(--text-error);' }
            }).addEventListener('click', () => {
                if (existingRace) {
                    existingRace.traits.splice(traitIndex, 1);
                    traitItem.remove();
                }
            });
        });
        // Add trait input
        const newTraitContainer = modal.contentEl.createDiv('new-trait-input');
        newTraitContainer.style.display = 'flex';
        newTraitContainer.style.gap = '10px';
        newTraitContainer.style.marginTop = '10px';
        
        const traitInput = newTraitContainer.createEl('input', { 
            type: 'text', 
            placeholder: 'Add a new trait' 
        });
        traitInput.style.flex = '1';
        
        const addTraitButton = newTraitContainer.createEl('button', { text: 'Add Trait' });
        
        addTraitButton.addEventListener('click', () => {
            const newTrait = traitInput.value.trim();
            if (newTrait) {
                if (!existingRace) {
                    existingRace = {
                        name: '',
                        abilityScoreAdjustments: { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 },
                        traits: [],
                        size: "Medium",
                        speed: 30,
                        languages: ["Common"]
                    };
                }
                existingRace.traits.push(newTrait);
                const traitItem = traitsList.createEl('li');
                traitItem.createEl('span', { text: newTrait });
                traitItem.createEl('button', { 
                    text: '×',
                    attr: { style: 'margin-left: 10px; color: var(--text-error);' }
                }).addEventListener('click', () => {
                    existingRace!.traits.splice(existingRace!.traits.length - 1, 1);
                    traitItem.remove();
                });
                traitInput.value = '';
            }
        });

        // Race Size
        new Setting(modal.contentEl)
            .setName('Size')
            .addDropdown(dropdown => {
                dropdown
                    .addOption('Small', 'Small')
                    .addOption('Medium', 'Medium')
                    .addOption('Large', 'Large')
                    .setValue(existingRace?.size || 'Medium')
                    .onChange(value => {
                        if (existingRace) existingRace.size = value as "Small" | "Medium" | "Large" | "Tiny" | "Huge" | "Gargantuan";
                    });
            });

        // Race Speed
        new Setting(modal.contentEl)
            .setName('Speed')
            .addSlider(slider => {
                slider
                    .setLimits(20, 40, 5)
                    .setValue(existingRace?.speed || 30)
                    .setDynamicTooltip()
                    .onChange(value => {
                        if (existingRace) existingRace.speed = value;
                    });
            });

        // Languages
        const languagesContainer = modal.contentEl.createDiv('race-languages');
        languagesContainer.createEl('h3', { text: 'Languages' });
        
        const commonLanguages = ['Common', 'Dwarvish', 'Elvish', 'Giant', 'Gnomish', 'Goblin', 
            'Halfling', 'Orc', 'Abyssal', 'Celestial', 'Draconic', 'Deep Speech', 
            'Infernal', 'Primordial', 'Sylvan', 'Undercommon'];
        
        const languagesList = languagesContainer.createDiv('languages-list');
        languagesList.style.display = 'grid';
        languagesList.style.gridTemplateColumns = 'repeat(3, 1fr)';
        languagesList.style.gap = '5px';
        
        commonLanguages.forEach(language => {
            const languageCheck = languagesList.createDiv('language-check');
            languageCheck.style.display = 'flex';
            languageCheck.style.alignItems = 'center';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = existingRace?.languages.includes(language) || false;
            checkbox.id = `lang-${language}`;
            languageCheck.appendChild(checkbox);
            
            const label = document.createElement('label');
            label.textContent = language;
            label.htmlFor = `lang-${language}`;
            label.style.marginLeft = '5px';
            languageCheck.appendChild(label);
        });

        // Save Button
        const buttonContainer = modal.contentEl.createDiv('button-container');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.justifyContent = 'flex-end';
        buttonContainer.style.marginTop = '20px';
        buttonContainer.style.gap = '10px';
        
        const cancelButton = buttonContainer.createEl('button', { text: 'Cancel' });
        cancelButton.addEventListener('click', () => {
            modal.close();
        });
        
        const saveButton = buttonContainer.createEl('button', { 
            text: 'Save Race',
            cls: 'mod-cta'
        });
        
        saveButton.addEventListener('click', async () => {
            if (!existingRace || !existingRace.name) {
                new Notice('Race name is required');
                return;
            }

            // Get languages
            const selectedLanguages: string[] = [];
            commonLanguages.forEach(language => {
                const checkbox = document.getElementById(`lang-${language}`) as HTMLInputElement;
                if (checkbox && checkbox.checked) {
                    selectedLanguages.push(language);
                }
            });
            
            // Make sure there's at least one language
            if (selectedLanguages.length === 0) {
                selectedLanguages.push('Common');
            }
            
            existingRace.languages = selectedLanguages;

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
    openClassModal(existingClass?: CharacterClass, index?: number) {
        const modal = new Modal(this.app);
        modal.titleEl.setText(existingClass ? `Edit ${existingClass.name} Class` : 'Add New Class');
        
        // Ensure full width and proper responsiveness
        modal.contentEl.style.width = '100%';
        modal.contentEl.style.maxWidth = '1000px';  // Increased max-width
        modal.contentEl.style.margin = '0 auto';    // Center the modal
        modal.contentEl.style.padding = '0 20px';   // Add some side padding
        modal.contentEl.style.boxSizing = 'border-box';
        
        // Create a scrollable container
        const modalScrollContainer = modal.contentEl.createDiv('modal-scroll-container');
        modalScrollContainer.style.maxHeight = '80vh';
        modalScrollContainer.style.overflowY = 'auto';
        modalScrollContainer.style.overflowX = 'hidden';
        
        // Basic info row with flexible layout
        const basicRow = modalScrollContainer.createDiv('basic-class-info-row');
        basicRow.style.display = 'flex';
        basicRow.style.flexWrap = 'wrap';
        basicRow.style.gap = '10px';
        basicRow.style.marginBottom = '20px';
        
        // Class Name input
        const nameContainer = basicRow.createDiv('class-name-container');
        nameContainer.style.flex = '1';
        nameContainer.style.minWidth = '200px';
        
        // Class Hit Die and Primary Ability in a row
        const formContainer = basicRow.createDiv('class-form-container');
        formContainer.style.display = 'grid';
        formContainer.style.gap = '15px';
        
        new Setting(nameContainer)
        .setName('Class Name')
        .addText(text => {
            text.setValue(existingClass?.name || '')
                .setPlaceholder('Enter class name')
                .onChange(value => {
                    if (existingClass) existingClass.name = value;
                });
            text.inputEl.style.width = '100%';
        });
        
    // Hit Die and Primary Ability in a row
    const detailsContainer = basicRow.createDiv('class-details-container');
    detailsContainer.style.display = 'grid';
    detailsContainer.style.gridTemplateColumns = '1fr 1fr';
    detailsContainer.style.gap = '15px';
        
    // Hit Die
    const hitDieContainer = detailsContainer.createDiv('hit-die-container');
    new Setting(hitDieContainer)
        .setName('Hit Die')
        .addDropdown(dropdown => {
            dropdown
                .addOption('6', 'd6')
                .addOption('8', 'd8')
                .addOption('10', 'd10')
                .addOption('12', 'd12')
                .setValue(((existingClass?.hitDie) || 8).toString())
                .onChange(value => {
                    if (existingClass) existingClass.hitDie = parseInt(value) as 6 | 8 | 10 | 12;
                });
        });

    // Primary Ability
    const abilityContainer = detailsContainer.createDiv('ability-container');
    new Setting(abilityContainer)
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

    // Spellcasting
    const spellcastingContainer = basicRow.createDiv('spellcasting-container');
    const spellcasterCheck = spellcastingContainer.createEl('div', { cls: 'setting-item' });
    spellcasterCheck.style.display = 'flex';
    spellcasterCheck.style.justifyContent = 'space-between';
    spellcasterCheck.style.alignItems = 'center';

    const spellcasterLabel = spellcasterCheck.createEl('label', { text: 'Spellcasting' });
    spellcasterLabel.style.fontWeight = 'normal';

    const checkboxContainer = spellcasterCheck.createEl('div');
    const checkbox = checkboxContainer.createEl('input', { type: 'checkbox' });
    checkbox.checked = !!existingClass?.spellcasting;
    checkbox.addEventListener('change', () => {
        if (existingClass) {
            if (checkbox.checked) {
                existingClass.spellcasting = {
                    ability: 'int', // default
                    prepareSpells: false
                };
            } else {
                delete existingClass.spellcasting;
            }
        }
    });

    
        // Create tabs for class properties
        const classTabsContainer = modalScrollContainer.createDiv('class-tabs');
        classTabsContainer.style.display = 'flex';
        classTabsContainer.style.flexWrap = 'wrap';
        classTabsContainer.style.gap = '5px';
        classTabsContainer.style.marginBottom = '10px';
        classTabsContainer.style.borderBottom = '1px solid var(--background-modifier-border)';
        classTabsContainer.style.paddingBottom = '10px';
        
        let activeClassTab = 'saves';
        
        // Tab content container
        const classTabContent = modalScrollContainer.createDiv('class-tab-content');
        classTabContent.style.padding = '15px 0';
        classTabContent.style.minHeight = '300px';
        
        const showClassTab = (tabId: string) => {
            activeClassTab = tabId;
            
            // Update tab buttons
            const tabs = classTabsContainer.querySelectorAll('button');
            tabs.forEach(tab => {
                if (tab.id === `tab-${tabId}`) {
                    tab.style.borderBottom = '2px solid var(--interactive-accent)';
                    tab.style.color = 'var(--interactive-accent)';
                    tab.style.fontWeight = 'bold';
                } else {
                    tab.style.borderBottom = 'none';
                    tab.style.color = 'var(--text-normal)';
                    tab.style.fontWeight = 'normal';
                }
            });
            
            // Show correct content
            classTabContent.empty();
            
            switch (tabId) {
                case 'saves':
                    this.renderSavingThrowsTab(classTabContent, existingClass);
                    break;
                case 'skills':
                    this.renderSkillsTab(classTabContent, existingClass);
                    break;
                case 'features':
                    this.renderFeaturesTab(classTabContent, existingClass);
                    break;
                case 'proficiencies':
                    this.renderProficienciesTab(classTabContent, existingClass);
                    break;
            }
        };
        
        // Create tab buttons
        const createClassTab = (id: string, label: string) => {
            const tab = classTabsContainer.createEl('button', { 
                text: label,
                attr: { id: `tab-${id}` }
            });
            tab.style.padding = '8px 16px';
            tab.style.border = 'none';
            tab.style.borderRadius = '4px';
            tab.style.background = 'var(--background-secondary)';
            tab.style.cursor = 'pointer';
            
            if (id === activeClassTab) {
                tab.style.borderBottom = '2px solid var(--interactive-accent)';
                tab.style.color = 'var(--interactive-accent)';
                tab.style.fontWeight = 'bold';
            }
            
            tab.addEventListener('click', () => {
                showClassTab(id);
            });
        };
        
        // Add the tabs
        createClassTab('saves', 'Saving Throws');
        createClassTab('skills', 'Skills');
        createClassTab('features', 'Features');
        createClassTab('proficiencies', 'Proficiencies');
        
        // Show initial tab
        showClassTab('saves');
    
        // Save Button - outside the scroll container
        const buttonContainer = modal.contentEl.createDiv('button-container');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.justifyContent = 'flex-end';
        buttonContainer.style.margin = '20px 0 10px 0';
        buttonContainer.style.gap = '10px';
        buttonContainer.style.padding = '10px 20px';
        buttonContainer.style.borderTop = '1px solid var(--background-modifier-border)';
        
        const cancelButton = buttonContainer.createEl('button', { text: 'Cancel' });
        cancelButton.style.minWidth = '80px';
        cancelButton.addEventListener('click', () => {
            modal.close();
        });
        
        const saveButton = buttonContainer.createEl('button', { 
            text: 'Save Class',
            cls: 'mod-cta'
        });
        saveButton.style.minWidth = '120px';
        
        saveButton.addEventListener('click', async () => {
            // Get class name
            const nameInput = nameContainer.querySelector('input[placeholder="Class name"]') as HTMLInputElement;
            if (!nameInput || !nameInput.value.trim()) {
                new Notice('Class name is required');
                return;
            }
            
            // If this is a new class, initialize it
            if (!existingClass) {
                existingClass = {
                    name: nameInput.value.trim(),
                    hitDie: 8,
                    primaryAbility: 'str',
                    savingThrows: ['str', 'con'],
                    skills: [],
                    skillChoices: 2,
                    proficiencies: {
                        weapons: [],
                        armor: [],
                        tools: []
                    },
                    features: []
                };
            }
            
            // Update saving throws
            existingClass.savingThrows = [];
            const abilities: AbilityName[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
            abilities.forEach(ability => {
                const checkbox = modalScrollContainer.querySelector(`#save-${ability}`) as HTMLInputElement;
                if (checkbox && checkbox.checked) {
                    existingClass!.savingThrows.push(ability);
                }
            });
            
            // Update skills
            existingClass.skills = [];
            const allSkills = [
                'Acrobatics', 'Animal Handling', 'Arcana', 'Athletics', 'Deception', 
                'History', 'Insight', 'Intimidation', 'Investigation', 'Medicine', 
                'Nature', 'Perception', 'Performance', 'Persuasion', 'Religion', 
                'Sleight of Hand', 'Stealth', 'Survival'
            ];
            allSkills.forEach(skill => {
                const checkbox = modalScrollContainer.querySelector(`#skill-${skill}`) as HTMLInputElement;
                if (checkbox && checkbox.checked) {
                    existingClass!.skills.push(skill);
                }
            });
            
            // Skill choices
            const skillChoicesInput = modalScrollContainer.querySelector('#skill-choices') as HTMLInputElement;
            if (skillChoicesInput) {
                existingClass.skillChoices = parseInt(skillChoicesInput.value, 10) || 2;
            }
            
            // Update features
            existingClass.features = [];
            const featureRows = modalScrollContainer.querySelectorAll('.feature-row');
            featureRows.forEach(row => {
                const inputs = row.querySelectorAll('input');
                if (inputs.length >= 3 && inputs[1].value.trim()) {
                    existingClass!.features.push({
                        level: parseInt(inputs[0].value, 10) || 1,
                        name: inputs[1].value.trim(),
                        description: inputs[2].value.trim() || 'No description provided.'
                    });
                }
            });
            
            // Update proficiencies
            existingClass.proficiencies.weapons = [];
            const weaponsInputs = modalScrollContainer.querySelectorAll('input[name="weapon-prof"]');
            weaponsInputs.forEach(input => {
                if ((input as HTMLInputElement).value.trim()) {
                    existingClass!.proficiencies.weapons.push((input as HTMLInputElement).value.trim());
                }
            });
            
            existingClass.proficiencies.armor = [];
            const armorInputs = modalScrollContainer.querySelectorAll('input[name="armor-prof"]');
            armorInputs.forEach(input => {
                if ((input as HTMLInputElement).value.trim()) {
                    existingClass!.proficiencies.armor.push((input as HTMLInputElement).value.trim());
                }
            });
            
            existingClass.proficiencies.tools = [];
            const toolInputs = modalScrollContainer.querySelectorAll('input[name="tool-prof"]');
            toolInputs.forEach(input => {
                if ((input as HTMLInputElement).value.trim()) {
                    existingClass!.proficiencies.tools.push((input as HTMLInputElement).value.trim());
                }
            });
            
            // Update spellcasting
            const isSpellcaster = modalScrollContainer.querySelector('#is-spellcaster') as HTMLInputElement;
            if (isSpellcaster && isSpellcaster.checked) {
                const spellAbility = modalScrollContainer.querySelector('#spell-ability') as HTMLSelectElement;
                const prepareSpells = modalScrollContainer.querySelector('#prepare-spells') as HTMLInputElement;
                
                existingClass.spellcasting = {
                    ability: spellAbility.value as AbilityName,
                    prepareSpells: prepareSpells.checked
                };
            } else {
                delete existingClass.spellcasting;
            }
            
            // Save to plugin settings
            if (index !== undefined) {
                this.plugin.settings.classes[index] = existingClass;
            } else {
                this.plugin.settings.classes.push(existingClass);
            }
            
            await this.plugin.saveSettings();
            this.display();
            modal.close();
        });
    
        modal.open();
    }

    /**
     * Render Saving Throws Tab
     */
    private renderSavingThrowsTab(container: HTMLElement, existingClass?: CharacterClass) {
        container.createEl('h3', { text: 'Saving Throw Proficiencies' });
        container.createEl('p', { 
            text: 'Select which ability saving throws this class is proficient in (typically two).',
            cls: 'setting-item-description'
        });
        
        const savesContainer = container.createDiv('saves-container');
        savesContainer.style.display = 'grid';
        savesContainer.style.gridTemplateColumns = 'repeat(3, 1fr)';
        savesContainer.style.gap = '10px';
        savesContainer.style.marginTop = '10px';
        
        const abilities: AbilityName[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
        
        abilities.forEach(ability => {
            const saveCheck = savesContainer.createDiv('save-check');
            saveCheck.style.display = 'flex';
            saveCheck.style.alignItems = 'center';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = existingClass?.savingThrows.includes(ability) || false;
            checkbox.id = `save-${ability}`;
            saveCheck.appendChild(checkbox);
            
            const label = document.createElement('label');
            label.textContent = ability.toUpperCase();
            label.htmlFor = `save-${ability}`;
            label.style.marginLeft = '5px';
            saveCheck.appendChild(label);
        });
    }

    /**
     * Render Skills Tab
     */
    private renderSkillsTab(container: HTMLElement, existingClass?: CharacterClass) {
        container.createEl('h3', { text: 'Class Skills' });
        container.createEl('p', { 
            text: 'Select which skills this class can choose proficiencies from.',
            cls: 'setting-item-description'
        });
        
        const skillChoiceContainer = container.createDiv('skill-choice-container');
        skillChoiceContainer.style.marginBottom = '15px';
        
        skillChoiceContainer.createEl('label', { 
            text: 'Number of skill choices: ',
            attr: { for: 'skill-choices' }
        });
        
        const skillChoiceInput = document.createElement('input');
        skillChoiceInput.type = 'number';
        skillChoiceInput.id = 'skill-choices';
        skillChoiceInput.min = '1';
        skillChoiceInput.max = '8';
        skillChoiceInput.value = (existingClass?.skillChoices || 2).toString();
        skillChoiceInput.style.width = '60px';
        skillChoiceInput.style.marginLeft = '10px';
        skillChoiceContainer.appendChild(skillChoiceInput);
        
        const skillsContainer = container.createDiv('skills-container');
        skillsContainer.style.display = 'grid';
        skillsContainer.style.gridTemplateColumns = 'repeat(3, 1fr)';
        skillsContainer.style.gap = '10px';
        
        const allSkills = [
            'Acrobatics', 'Animal Handling', 'Arcana', 'Athletics', 'Deception', 
            'History', 'Insight', 'Intimidation', 'Investigation', 'Medicine', 
            'Nature', 'Perception', 'Performance', 'Persuasion', 'Religion', 
            'Sleight of Hand', 'Stealth', 'Survival'
        ];
        
        allSkills.forEach(skill => {
            const skillCheck = skillsContainer.createDiv('skill-check');
            skillCheck.style.display = 'flex';
            skillCheck.style.alignItems = 'center';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = existingClass?.skills.includes(skill) || false;
            checkbox.id = `skill-${skill}`;
            skillCheck.appendChild(checkbox);
            
            const label = document.createElement('label');
            label.textContent = skill;
            label.htmlFor = `skill-${skill}`;
            label.style.marginLeft = '5px';
            skillCheck.appendChild(label);
        });
    }

    /**
     * Render Features Tab
     */
    private renderFeaturesTab(container: HTMLElement, existingClass?: CharacterClass) {
        container.createEl('h3', { text: 'Class Features' });
        container.createEl('p', { 
            text: 'Define the features this class gains as it levels up.',
            cls: 'setting-item-description'
        });
        
        const featuresContainer = container.createDiv('features-container');
        featuresContainer.style.marginTop = '10px';
        
        // Function to add a feature row
        const addFeatureRow = (feature?: {level: number, name: string, description: string}) => {
            const featureRow = featuresContainer.createDiv('feature-row');
            featureRow.style.display = 'flex';
            featureRow.style.marginBottom = '10px';
            featureRow.style.gap = '10px';
            
            // Level input
            const levelInput = document.createElement('input');
            levelInput.type = 'number';
            levelInput.min = '1';
            levelInput.max = '20';
            levelInput.value = feature?.level?.toString() || '1';
            levelInput.style.width = '60px';
            levelInput.placeholder = 'Level';
            featureRow.appendChild(levelInput);
            
            // Name input
            const nameInput = document.createElement('input');
            nameInput.type = 'text';
            nameInput.value = feature?.name || '';
            nameInput.style.flex = '1';
            nameInput.placeholder = 'Feature name';
            featureRow.appendChild(nameInput);
            
            // Description input
            const descInput = document.createElement('input');
            descInput.type = 'text';
            descInput.value = feature?.description || '';
            descInput.style.flex = '2';
            descInput.placeholder = 'Feature description';
            featureRow.appendChild(descInput);
            
            // Delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = '×';
            deleteBtn.style.color = 'var(--text-error)';
            deleteBtn.addEventListener('click', () => {
                featureRow.remove();
            });
            featureRow.appendChild(deleteBtn);
            
            return { row: featureRow, levelInput, nameInput, descInput };
        };
        
        // Add existing features or a default empty one
        if (existingClass?.features && existingClass.features.length > 0) {
            existingClass.features.forEach((feature) => {
                addFeatureRow(feature);
            });
        } else {
            addFeatureRow();
        }
        
        // Button to add more features
        const addFeatureButton = container.createEl('button', { text: 'Add Feature' });
        addFeatureButton.style.marginTop = '10px';
        addFeatureButton.addEventListener('click', () => {
            addFeatureRow();
        });
    }

    /**
     * Render Proficiencies Tab
     */
    private renderProficienciesTab(container: HTMLElement, existingClass?: CharacterClass) {
        container.createEl('h3', { text: 'Proficiencies' });
        container.createEl('p', { 
            text: 'Define what equipment this class is proficient with.',
            cls: 'setting-item-description'
        });
        
        // Weapons
        const weaponsContainer = container.createDiv('weapons-container');
        weaponsContainer.createEl('h4', { text: 'Weapon Proficiencies' });
        
        const addWeaponProf = (value?: string) => {
            const weaponInput = document.createElement('input');
            weaponInput.type = 'text';
            weaponInput.name = 'weapon-prof';
            weaponInput.placeholder = 'e.g., Simple weapons, Martial weapons';
            weaponInput.value = value || '';
            weaponInput.style.width = '100%';
            weaponInput.style.marginBottom = '5px';
            weaponsContainer.appendChild(weaponInput);
        };
        
        if (existingClass?.proficiencies.weapons && existingClass.proficiencies.weapons.length > 0) {
            existingClass.proficiencies.weapons.forEach(weapon => {
                addWeaponProf(weapon);
            });
        } else {
            addWeaponProf();
        }
        
        const addWeaponButton = weaponsContainer.createEl('button', { text: 'Add Weapon Proficiency' });
        addWeaponButton.style.fontSize = '0.8em';
        addWeaponButton.style.marginBottom = '15px';
        addWeaponButton.addEventListener('click', () => {
            addWeaponProf();
        });
        
        // Armor
        const armorContainer = container.createDiv('armor-container');
        armorContainer.createEl('h4', { text: 'Armor Proficiencies' });
        
        const addArmorProf = (value?: string) => {
            const armorInput = document.createElement('input');
            armorInput.type = 'text';
            armorInput.name = 'armor-prof';
            armorInput.placeholder = 'e.g., Light armor, Medium armor, Shields';
            armorInput.value = value || '';
            armorInput.style.width = '100%';
            armorInput.style.marginBottom = '5px';
            armorContainer.appendChild(armorInput);
        };
        
        if (existingClass?.proficiencies.armor && existingClass.proficiencies.armor.length > 0) {
            existingClass.proficiencies.armor.forEach(armor => {
                addArmorProf(armor);
            });
        } else {
            addArmorProf();
        }
        
        const addArmorButton = armorContainer.createEl('button', { text: 'Add Armor Proficiency' });
        addArmorButton.style.fontSize = '0.8em';
        addArmorButton.style.marginBottom = '15px';
        addArmorButton.addEventListener('click', () => {
            addArmorProf();
        });
        
        // Tools
        const toolsContainer = container.createDiv('tools-container');
        toolsContainer.createEl('h4', { text: 'Tool Proficiencies' });
        
        const addToolProf = (value?: string) => {
            const toolInput = document.createElement('input');
            toolInput.type = 'text';
            toolInput.name = 'tool-prof';
            toolInput.placeholder = 'e.g., Thieves\' tools, Musical instruments';
            toolInput.value = value || '';
            toolInput.style.width = '100%';
            toolInput.style.marginBottom = '5px';
            toolsContainer.appendChild(toolInput);
        };
        
        if (existingClass?.proficiencies.tools && existingClass.proficiencies.tools.length > 0) {
            existingClass.proficiencies.tools.forEach(tool => {
                addToolProf(tool);
            });
        } else {
            addToolProf();
        }
        
        const addToolButton = toolsContainer.createEl('button', { text: 'Add Tool Proficiency' });
        addToolButton.style.fontSize = '0.8em';
        addToolButton.style.marginBottom = '15px';
        addToolButton.addEventListener('click', () => {
            addToolProf();
        });
    }

    /**
     * Format race description for display
     */
    private formatRaceDescription(race: Race): string {
        const bonuses = Object.entries(race.abilityScoreAdjustments)
            .filter(([_, value]) => value !== 0)
            .map(([ability, value]) => `${ability.toUpperCase()} ${value > 0 ? '+' + value : value}`)
            .join(', ');
        
        return `${bonuses || 'No ability adjustments'}`;
    }

    /**
     * Format class description for display
     */
    private formatClassDescription(characterClass: CharacterClass): string {
        return `d${characterClass.hitDie} • ${characterClass.primaryAbility.toUpperCase()} • ${characterClass.skills.length} skills`;
    }
}