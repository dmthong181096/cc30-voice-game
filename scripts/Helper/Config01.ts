import { _decorator } from 'cc';
import Declaration from '../Declaration01';

const { ccclass } = _decorator;
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
    
    /**
     * Get letter by number
     * @param number - Number from 1 to 26
     * @returns Corresponding letter or empty string if invalid
     */
    getLetterByNumber(number: number): string {
        return this.letterMap[number] || '';
    }
    
    /**
     * Get all letter mappings
     * @returns Copy of letter map
     */
    getLetterMap(): { [key: number]: string } {
        return { ...this.letterMap };
    }
}


