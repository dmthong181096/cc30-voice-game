import * as cc from 'cc';
import Declaration from '../Declaration01';
import { LetterItem01 } from './LetterItem01';
import { Subscriber01 } from '../Helper/Subscriber01';

const { ccclass, property } = cc._decorator;

@ccclass('LetterManager01')
export class LetterManager01 extends Subscriber01 {

    @property({displayName: "Container", type: cc.Node})
    container: cc.Node = null;

    
    start() {
        super.start && super.start();
    }
    
    generateRandomNumber(min: number, max: number, isFloat: boolean = false): number {
        let number = min;
        if (isFloat) {
            number = (Math.random() * (max - min)) + min;
        } else {
            number = Math.floor(Math.random() * (max - min)) + min;
        }
        return number;
    }
    

    updateLetter(arrLetter: Array<number>) {
        arrLetter.forEach((letterID, index) => {
            const letterItem: LetterItem01 = this.container.children[index]?.getComponent(LetterItem01);
            const textLetter: string = this.getConfig().getLetterByNumber(letterID);      
            
            if (letterItem) {
                letterItem.setLetterText(textLetter);
                letterItem.setStatus(0); // Set to idle state
                cc.log(`LetterManager01: Set letter ${index + 1}: ${textLetter} (ID: ${letterID})`);
            }
        });
    }

    generateRandomLetters(number: number): number[] {
        const randomLetters: number[] = [];
        
        for (let i = 0; i < number; i++) {
            randomLetters.push(this.generateRandomNumber(1, 26));
        }
        
        cc.log('LetterManager01: Generated random letters:', randomLetters);
        return randomLetters;
    }

    generateRandomTimeline(number: number): number[] {
        const randomTimeline: number[] = [];
        for (let index = 0; index < number; index++) {
            randomTimeline.push(this.generateRandomNumber(0.5, 1.5, true));
        }   
        return randomTimeline;
    }

    playTimeLine(arrTimeLine: number[]): void {
        arrTimeLine.forEach((time: number, index: number) => {
            const letterItem: LetterItem01 = this.container.children[index]?.getComponent(LetterItem01);
            const delayTime = this.getCurrentTimeDelay(arrTimeLine, index);
            if (letterItem) {
                const callback = () => {
                    const letter = letterItem.getLetterText();
                    this.resetStatus();
                    
                    // cc.log(`LetterManager01: Setting target letter: ${letter}`);
                    this.fireEvent("set-target-letter", {letter});
                    
                    // cc.log(`LetterManager01: Starting voice input for letter: ${letter}`);
                    this.fireEvent("start-voice-input");
                }
                letterItem.playAnimActive(delayTime, time, callback);
            }
        });
    }

    getCurrentTimeDelay(arrTimeLine: number[], currentIndex: number): number {
        let delayTime = 0;
        for (let index = 0; index < currentIndex; index++) {
            delayTime += arrTimeLine[index];
        }
        return delayTime;
    }

    resetStatus(): void {
        // cc.log(`LetterManager01: Stopping voice input`);
        this.fireEvent("stop-voice-input");
        
        this.container.children.forEach((letterNode) => {
            letterNode.getComponent(LetterItem01).setStatus(0);
        });
    }


}