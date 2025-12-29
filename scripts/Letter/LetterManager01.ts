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
    
    generateRandomNumber(): number {
        return Math.floor(Math.random() * 26) + 1;
    }

    updateLetter(arrLetter: Array<number>) {
        arrLetter.forEach((letterID, index) => {
            const letterItem: LetterItem01 = this.container.children[index]?.getComponent(LetterItem01);
            const textLetter: string = this.getConfig().getLetterByNumber(letterID);      
            
            if (letterItem) {
                letterItem.setLetterText(textLetter);
                cc.log(`LetterManager01: Set letter ${index + 1}: ${textLetter} (ID: ${letterID})`);
            }
        });
    }

    generateRandomLetters(number) {
        const randomLetters: number[] = [];
        
        for (let i = 0; i < number; i++) {
            randomLetters.push(this.generateRandomNumber());
        }
        
        cc.log('LetterManager01: Generated random letters:', randomLetters);
        return randomLetters;
    }
}