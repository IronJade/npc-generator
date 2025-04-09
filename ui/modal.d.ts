import { Modal, App } from 'obsidian';
import type NPCGenerator from '../main';
export declare class NPCGeneratorModal extends Modal {
    private plugin;
    private npc;
    constructor(app: App, plugin: NPCGenerator);
    onOpen(): void;
    /**
     * Create a labeled input element
     * @param container Parent container
     * @param label Input label
     * @param type Input type
     * @param defaultValue Default value
     * @param additionalAttributes Additional input attributes
     * @returns Container element
     */
    private createLabeledInput;
    /**
     * Create a labeled select element
     * @param container Parent container
     * @param label Select label
     * @param options Select options
     * @returns Container element
     */
    private createLabeledSelect;
    /**
     * Display generated NPC results
     */
    private showResults;
    /**
     * Insert statblock into the current active note
     */
    private insertStatblockIntoNote;
    onClose(): void;
}
