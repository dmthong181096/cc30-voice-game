import * as cc from 'cc';
import Declaration from '../Declaration01';
import { LetterManager01 } from '../Letter/LetterManager01';
const { ccclass, property } = cc._decorator;
const { BaseGameDirector } = Declaration;

LetterManager01
@ccclass('GameDirector01')
export class GameDirector01 extends BaseGameDirector {

    @property({displayName: "Letter Manager", type: cc.Node})
    letterManager: cc.Node = null;

    private _letterManager: LetterManager01 = null;

    initComponent() {
        this._letterManager =  this.letterManager.getComponent(LetterManager01);
    }

    protected onLoad(): void {
        super.onLoad();
        this.initComponent();
    }
    start(): void {
        const arrLetter =  this._letterManager.generateRandomLetters(10);
        const arrTimeTine = this._letterManager.generateRandomTimeline(10);
        cc.log(arrTimeTine)
        const dataFake =  {
          arrLetter
        }
        this.joinGame(dataFake);
    }

    joinGame(data) {
        const {arrLetter } = data;
        if( arrLetter){
            this._letterManager.updateLetter(arrLetter);
        }
    }
}


