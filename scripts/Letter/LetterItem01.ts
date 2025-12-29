import * as cc from 'cc';
import Declaration from '../Declaration01';
const { ccclass, property } = cc._decorator;   
const {BaseSubscriber} = Declaration

@ccclass('LetterItem01')
export class LetterItem01 extends BaseSubscriber {
    @property({displayName: "Background", type: cc.Node})
    background: cc.Node = null;

    @property({displayName: "Status", type: cc.Node})
    status: cc.Node = null;

    @property({displayName: "Letter Text", type: cc.Label})
    letterText: cc.Label = null;


    private currentState: number

    setLetterText(letterText: string) {
        this.letterText.string = letterText;
    }
    
    setStatus(statusID: number) {
        this.currentState = statusID;
        const color = this.getConfig().getStateColor(statusID);
        
        // Update status node color
        const sprite = this.status.getComponent(cc.Sprite);
        if (sprite) {
            sprite.color = color;
        }
        
        cc.log(`LetterItem01: Set status to ${statusID} with color`, color);
    }
    
    /**
     * Get current state
     */
    getCurrentState(): number {
        return this.currentState;
    }

    resetUI() {
        this.setLetterText("");
        this.setStatus(0)
    }

}


