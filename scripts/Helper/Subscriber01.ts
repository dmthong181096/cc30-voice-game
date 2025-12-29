import { _decorator, Component, Node } from 'cc';
import Declaration from '../Declaration01';
import { Config01 } from './Config01';
const {BaseSubscriber} = Declaration;
const { ccclass, property } = _decorator;

@ccclass('Subscriber01')
export class Subscriber01 extends BaseSubscriber {


    getConfig(): Config01 {
        return new Config01
    }
}


