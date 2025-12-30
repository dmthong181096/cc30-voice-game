import * as cc from 'cc';
import Declaration from '../Declaration01';
import { LetterManager01 } from '../Letter/LetterManager01';
import { VoiceManager01 } from './VoiceManager01';
import { LetterItem01 } from '../Letter/LetterItem01';
const { ccclass, property } = cc._decorator;
const { BaseSubscriber } = Declaration;

@ccclass('GameDirector01')
export class GameDirector01 extends BaseSubscriber {

    @property({displayName: "Letter Manager", type: cc.Node})
    letterManager: cc.Node = null;

    @property({displayName: "Voice Manager", type: cc.Node})
    voiceManager: cc.Node = null;

    private _letterManager: LetterManager01 = null;
    private _voiceManager: VoiceManager01 = null;

    initComponent() {
        this._letterManager = this.letterManager.getComponent(LetterManager01);
        this._voiceManager = this.voiceManager.getComponent(VoiceManager01);
    }

    onLoad(): void {
        super.onLoad && super.onLoad();
        this.initComponent();
        this.registerVoiceEvents();
    }

    private registerVoiceEvents(): void {
        // Register to handle voice recognition results
        this.registerEvent('letter-matched', this.onLetterMatched.bind(this));
        this.registerEvent('letter-not-matched', this.onLetterNotMatched.bind(this));
        this.registerEvent('voice-error', this.onVoiceError.bind(this));
        this.registerEvent('voice-initialized', this.onVoiceInitialized.bind(this));
        this.registerEvent('voice-not-supported', this.onVoiceNotSupported.bind(this));
    }

    private onVoiceInitialized(): void {
        cc.log('🎮 GameDirector01: Voice system initialized successfully!');
    }

    private onVoiceNotSupported(data: any): void {
        cc.error('🎮 GameDirector01: Voice not supported:', data.reason);
    }

    private onLetterMatched(data: any): void {
        cc.log('🎮 GameDirector01: Letter matched!', data);
        // Set the current active letter to "done" state (green)
        this.setCurrentLetterState(3); // done state
    }

    private onLetterNotMatched(data: any): void {
        cc.log('🎮 GameDirector01: Letter not matched!', data);
        // Set the current active letter to "miss" state (red)
        this.setCurrentLetterState(2); // miss state
    }

    private onVoiceError(data: any): void {
        cc.error('🎮 GameDirector01: Voice error:', data);
    }

    private setCurrentLetterState(state: number): void {
        // Find the currently active letter and set its state
        if (this._letterManager && this._letterManager.container) {
            for (let i = 0; i < this._letterManager.container.children.length; i++) {
                const letterItem = this._letterManager.container.children[i].getComponent(LetterItem01);
                if (letterItem && letterItem.getCurrentState() === 1) { // Currently active
                    letterItem.setStatus(state);
                    cc.log('🎮 GameDirector01: Set letter state to:', state);
                    break;
                }
            }
        }
    }
    start(): void {
        cc.log('🎮 GameDirector01: Starting game...');
        
        const arrLetter = this._letterManager.generateRandomLetters(10);
        const arrTimeLine = this._letterManager.generateRandomTimeline(10);
        cc.log('🎮 GameDirector01: Generated timeline:', arrTimeLine);
        
        const dataFake = {
            arrLetter,
            arrTimeLine
        }
        this.joinGame(dataFake);
    }

    joinGame(data: any): void {
        const { arrLetter, arrTimeLine } = data;
      
        cc.log('🎮 GameDirector01: Joining game with data:', data);
        
        if (arrLetter) {
            this._letterManager.updateLetter(arrLetter);
        }
        if (arrTimeLine) {
            this._letterManager.playTimeLine(arrTimeLine);
        }
            
        cc.tween(this.node)
        .delay(1)
        .call(() => {
            this._voiceManager.onSetTargetLetter({letter: "A"});
             this.fireEvent("start-voice-input");
        })
        .start();
    }
}


