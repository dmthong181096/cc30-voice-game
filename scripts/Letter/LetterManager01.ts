import * as cc from 'cc';
import Declaration from '../Declaration01';
import { LetterItem01 } from './LetterItem01';
import { Config01 } from '../Helper/Config01';
import { Subscriber01 } from '../Helper/Subscriber01';

const { ccclass, property } = cc._decorator;
const { BaseSubscriber } = Declaration;

@ccclass('LetterManager01')
export class LetterManager01 extends Subscriber01 {

    @property({displayName: "Container", type: cc.Node})
    container: cc.Node = null;

    
    start() {
        super.start && super.start();
    }
    
    generateRandomNumber(min, max, isFloat = false): number {
        let number = min;
        if (isFloat) {
            number =  (Math.random() * max - min) + min;
        } else {
            number = Math.floor(Math.random() * (max-min)) + min;
        }
        return number
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
            randomLetters.push(this.generateRandomNumber(26, 1));
        }
        
        cc.log('LetterManager01: Generated random letters:', randomLetters);
        return randomLetters;
    }

    generateRandomTimeline(number){
        const randomTimeline: number[] = [];
        for (let index = 0; index < number; index++) {
            randomTimeline.push(this.generateRandomNumber(0.5, 1.5, true));
        }   
        return randomTimeline;
    }

    playTimeLine(arrTimeLine){
        arrTimeLine.forEach((time, index) => {
            const letterItem: LetterItem01 = this.container.children[index]?.getComponent(LetterItem01);
            const delayTime = this.getCurrentTimeDelay(arrTimeLine, index);
            if (letterItem) {
                const callback = () => {
                    this.resetStatus();
                }
                letterItem.playAnimActive(delayTime, time, callback);
            }
            
        });
    }
    getCurrentTimeDelay(arrTimeLine , currentIndex){
        let delayTime = 0;
        for (let index = 0; index < currentIndex; index++) {
            delayTime+= arrTimeLine[index];
            
        }
        return delayTime
    }

    resetStatus(){
        this.container.children.forEach((letterItem, index) => {
            letterItem.getComponent(LetterItem01).setStatus(0);
        });
    }


}