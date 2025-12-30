import * as cc from 'cc';
import Declaration from '../Declaration01';

const { ccclass } = cc._decorator;
const { BaseConfig } = Declaration;

@ccclass('Config01')
export class Config01 extends BaseConfig {

    // Letter mapping: number -> letter
    private letterMap: { [key: number]: string } = {
        1: 'A', 2: 'B', 3: 'C', 4: 'D', 5: 'E', 6: 'F',
        7: 'G', 8: 'H', 9: 'I', 10: 'J', 11: 'K', 12: 'L',
        13: 'M', 14: 'N', 15: 'O', 16: 'P', 17: 'Q', 18: 'R',
        19: 'S', 20: 'T', 21: 'U', 22: 'V', 23: 'W', 24: 'X',
        25: 'Y', 26: 'Z'
    };

    // Letter item state colors
    private stateColors: { [key: string]: cc.Color } = {
        0: cc.Color.GRAY,      // Chưa active - màu xám
        1: cc.Color.BLUE,    // Đang active - màu xanh dương  
        2: cc.Color.RED,       // Đọc sai - màu đỏ
        3: cc.Color.GREEN      // Hoàn thành - màu xanh lá
    };

    getLetterByNumber(number: number): string {
        return this.letterMap[number] || '';
    }

    getLetterMap(): { [key: number]: string } {
        return { ...this.letterMap };
    }

    getStateColor(stateID: number): cc.Color {
        return this.stateColors[stateID] || cc.Color.WHITE;
    }

    
}


