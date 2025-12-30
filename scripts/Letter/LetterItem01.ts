import * as cc from 'cc';
import { Subscriber01 } from '../Helper/Subscriber01';
const { ccclass, property } = cc._decorator;   

@ccclass('LetterItem01')
export class LetterItem01 extends Subscriber01 {
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
    getLetterText(): string {
        return this.letterText.string;
    }
    
    setStatus(statusID: number) {
        this.currentState = statusID;
        const color = this.getConfig().getStateColor(statusID);
        const sprite = this.status.getComponent(cc.Sprite);
        if (sprite) {
            sprite.color = color;
        }
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

    statusActive() {
        this.setStatus(1);
    }

    playAnimActive(delayTime: number = 0, time: number = 0, callback: () => void): void {
        cc.Tween.stopAllByTarget(this.node);
        cc.tween(this.node)
            .delay(delayTime)
            .call(() => {
                callback();
                this.statusActive();
            })
            .start();
    }

}


