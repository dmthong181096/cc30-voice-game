import * as cc from 'cc';
import Declaration from '../Declaration01';
const { ccclass, property } = cc._decorator;   
const {BaseSubscriber} = Declaration

@ccclass('LetterItem01')
export class LetterItem01 extends BaseSubscriber {
    @property({displayName: "Background", type: cc.Node})
    background: cc.Node = null;

    @property({displayName: "Letter Text", type: cc.Label})
    letterText: cc.Label = null;


    setLetterText(letterText){
        this.letterText.string = letterText;
    }
    setBackground(spr) {
        this.background.getComponent(cc.Sprite).spriteFrame = spr;  
    }
}


