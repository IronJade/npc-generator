import { Modal, App, Notice, MarkdownView } from 'obsidian';
import type NPCGenerator from '../main';
import { 
    NPCGenerationOptions, 
    NPC, 
    Alignment 
} from '../types';

export class NPCGeneratorModal extends Modal {
    private plugin: NPCGenerator;
    private npc: NPC | null = null;

    constructor(app: App, plugin: NPCGenerator) {
        super(app);
        this.plugin = plugin;
    }

    onOpen() {
        const { contentEl } = this;
        
        // Clear any existing content
        contentEl.empty();
        
        // Create modal title
        contentEl.createEl('h2', { text: 'Generate NPC' });
        
        // Create generation options container
        const optionsContainer = contentEl.createDiv('npc-generation-options');
        
        // Level selection
        const levelContainer = this.createLabeledInput(
            optionsContainer, 
            'Level', 
            'number', 
            '1', 
            { min: '1', max: '20' }
        );
        const levelInput = levelContainer.querySelector('input') as HTMLInputElement;
        
        // Race selection
        const raceContainer = this.createLabeledSelect(
            optionsContainer, 
            'Race', 
            this.plugin.settings.races.map(race => race.name)
        );
        const raceSelect = raceContainer.querySelector('select') as HTMLSelectElement;
        
        // Class selection
        const classContainer = this.createLabeledSelect(
            optionsContainer, 
            'Class', 
            this.plugin.settings.classes.map(characterClass => characterClass.name)
        );
        const classSelect = classContainer.querySelector('select') as HTMLSelectElement;
        
        // Subclass selection
        const subclassContainer = this.createLabeledSelect(
            optionsContainer, 
            'Subclass',
            ['None'] // Default option
        );
        const subclassSelect = subclassContainer.querySelector('select') as HTMLSelectElement;
        
        // Update subclass options when class changes
        classSelect.addEventListener('change', () => {
            const selectedClass = this.plugin.settings.classes.find(c => c.name === classSelect.value);
            
            // Clear existing options except "None"
            while (subclassSelect.options.length > 1) {
                subclassSelect.remove(1);
            }
            
            // Add subclass options if available
            if (selectedClass?.subclasses) {
                selectedClass.subclasses.forEach(subclass => {
                    subclassSelect.add(new Option(subclass.name, subclass.name));
                });
            }
        });
        
        // Trigger the change event to initialize subclass options
        classSelect.dispatchEvent(new Event('change'));
        
        // Alignment selection
        const alignments: Alignment[] = [
            'Lawful Good', 'Neutral Good', 'Chaotic Good',
            'Lawful Neutral', 'Neutral', 'Chaotic Neutral',
            'Lawful Evil', 'Neutral Evil', 'Chaotic Evil'
        ];
        const alignmentContainer = this.createLabeledSelect(
            optionsContainer, 
            'Alignment', 
            alignments
        );
        const alignmentSelect = alignmentContainer.querySelector('select') as HTMLSelectElement;
        
        // Custom parameters container
        const customParamsContainer = contentEl.createDiv('custom-parameters');
        customParamsContainer.createEl('h3', { text: 'Custom Parameters' });
        
        // Add custom parameter inputs based on plugin settings
        const enabledParams = this.plugin.settings.customParameters.filter(p => p.enabled);
        
        if (enabledParams.length === 0) {
            customParamsContainer.createEl('p', { 
                text: 'No custom parameters enabled. Add parameters in plugin settings.',
                attr: { style: 'color: #666; font-style: italic;' }
            });
        } else {
            enabledParams.forEach(param => {
                // Skip built-in parameters
                if (['spellcasting', 'possessions'].includes(param.name)) return;
                
                this.createLabeledInput(
                    customParamsContainer, 
                    param.label, 
                    'text', 
                    '', 
                    { placeholder: `Enter ${param.label.toLowerCase()}` }
                );
            });
        }
        
        // Button container
        const buttonContainer = contentEl.createDiv('npc-generation-buttons');
        
        // Generate NPC button
        const generateButton = buttonContainer.createEl('button', { text: 'Generate NPC' });
        generateButton.addEventListener('click', () => {
            // Prepare generation options
            const options: NPCGenerationOptions = {
                level: parseInt(levelInput.value, 10),
                race: raceSelect.value,
                class: classSelect.value,
                alignment: alignmentSelect.value as Alignment,
                customParameters: {}
            };
            
            // Collect custom parameter values
            enabledParams.forEach(param => {
                if (['spellcasting', 'possessions'].includes(param.name)) return;
                
                const input = customParamsContainer.querySelector(
                    `input[placeholder="Enter ${param.label.toLowerCase()}"]`
                ) as HTMLInputElement;
                
                if (input && input.value.trim()) {
                    options.customParameters![param.name] = input.value.trim();
                }
            });
            
            // Generate NPC
            try {
                this.npc = this.plugin.generateNPC(options);
                this.showResults();
            } catch (error) {
                console.error('NPC Generation Error:', error);
                new Notice('Failed to generate NPC. Check console for details.');
            }
        });
        
        // Random NPC button
        const randomButton = buttonContainer.createEl('button', { text: 'Random NPC' });
        randomButton.addEventListener('click', () => {
            try {
                this.npc = this.plugin.generateNPC();
                this.showResults();
            } catch (error) {
                console.error('Random NPC Generation Error:', error);
                new Notice('Failed to generate random NPC. Check console for details.');
            }
        });
    }

    /**
     * Create a labeled input element
     * @param container Parent container
     * @param label Input label
     * @param type Input type
     * @param defaultValue Default value
     * @param additionalAttributes Additional input attributes
     * @returns Container element
     */
    private createLabeledInput(
        container: HTMLElement, 
        label: string, 
        type: string, 
        defaultValue: string = '', 
        additionalAttributes: Record<string, string> = {}
    ): HTMLDivElement {
        const inputContainer = container.createDiv('labeled-input');
        inputContainer.createEl('label', { text: label });
        
        inputContainer.createEl('input', {
            type, 
            value: defaultValue,
            ...additionalAttributes
        });
        
        return inputContainer;
    }

    /**
     * Create a labeled select element
     * @param container Parent container
     * @param label Select label
     * @param options Select options
     * @returns Container element
     */
    private createLabeledSelect(
        container: HTMLElement, 
        label: string, 
        options: string[]
    ): HTMLDivElement {
        const selectContainer = container.createDiv('labeled-select');
        selectContainer.createEl('label', { text: label });
        
        const select = selectContainer.createEl('select');
        options.forEach(option => {
            select.createEl('option', { 
                text: option, 
                value: option 
            });
        });
        
        return selectContainer;
    }

    /**
     * Display generated NPC results
     */
    private showResults() {
        if (!this.npc) return;
    
        const { contentEl } = this;
        contentEl.empty();
    
        // NPC Summary
        contentEl.createEl('h2', { 
            text: `${this.npc.name} (Level ${this.npc.level} ${this.npc.race} ${this.npc.class})` 
        });
    
        // Ability Scores
        const abilitiesContainer = contentEl.createDiv('npc-abilities');
        abilitiesContainer.createEl('h3', { text: 'Ability Scores' });
        
        const abilitiesTable = abilitiesContainer.createEl('table');
        const headerRow = abilitiesTable.createEl('tr');
        ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'].forEach(ability => {
            headerRow.createEl('th', { text: ability });
        });
        
        const scoresRow = abilitiesTable.createEl('tr');
        (['str', 'dex', 'con', 'int', 'wis', 'cha'] as const).forEach(ability => {
            const score = this.npc!.abilityScores[ability];
            const modifier = this.npc!.abilityModifiers[ability] || 0;
            scoresRow.createEl('td', { 
                text: `${score} (${modifier >= 0 ? '+' : ''}${modifier})` 
            });
        });
    
        // Statblock
        const statblockContainer = contentEl.createDiv('npc-statblock');
        statblockContainer.createEl('h3', { text: 'Statblock' });
        
        const statblockText = statblockContainer.createEl('textarea', {
            text: this.plugin.formatStatblock(this.npc)
        });
        statblockText.setAttribute('readonly', 'true');
        statblockText.style.width = '100%';
        statblockText.style.height = '300px';
        statblockText.style.fontFamily = 'monospace';
    
        // Button container
        const buttonContainer = contentEl.createDiv('npc-buttons');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.justifyContent = 'space-between';
        buttonContainer.style.marginTop = '20px';
    
        // Regenerate NPC button
        const regenerateButton = buttonContainer.createEl('button', { text: 'Regenerate NPC' });
        regenerateButton.addEventListener('click', () => {
            // Get the same options but generate a new NPC
            const options = {
                level: this.npc!.level,
                race: this.npc!.race,
                class: this.npc!.class,
                alignment: this.npc!.alignment
            };
            
            this.npc = this.plugin.generateNPC(options);
            this.showResults();
        });
    
        // Insert into Note button
        const insertButton = buttonContainer.createEl('button', { text: 'Insert into Current Note' });
        insertButton.addEventListener('click', this.insertStatblockIntoNote.bind(this));
    
        // Back button
        const backButton = buttonContainer.createEl('button', { text: 'Generate Another NPC' });
        backButton.addEventListener('click', () => this.onOpen());
    }

    /**
     * Insert statblock into the current active note
     */
    private insertStatblockIntoNote() {
        if (!this.npc) return;

        try {
            // Get active file
            const activeFile = this.app.workspace.getActiveFile();
            if (!activeFile) {
                throw new Error('No active file');
            }

            // Get active editor
            const activeEditor = this.app.workspace.getActiveViewOfType(MarkdownView);
            if (!activeEditor) {
                throw new Error('No active editor');
            }

            // Insert statblock
            const editor = activeEditor.editor;
            editor.replaceSelection(this.plugin.formatStatblock(this.npc));

            // Close modal and show success notice
            this.close();
            new Notice('NPC statblock inserted!');
        } catch (error) {
            console.error('Insert Statblock Error:', error);
            new Notice('Failed to insert statblock. Please ensure a note is open.');
        }
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}
