import {dateTimeParse} from '@gravity-ui/date-utils';
type SuggestTimeWords = 's' | 'm' | 'h' | 'd' | 'w' | 'M' | 'y';

const wordPriorityMap = {
    s: 1,
    m: 1,
    h: 2,
    d: 3,
    w: 4,
    M: 5,
    y: 6,
};
/**
 *
 * @param {string} suggestLimit - maximum date to be shown
 * @param inputText - user input
 * A function that creates an array of valid values   for `CustomPresetButton` based on a given time limit.
 * Example - suggestLimit = 2d, so the suggests would be in 1s < n < 2d diapasone.
 */
export const createSuggestValues = (suggestLimit: string, inputText: string) => {
    const indexOfWord = suggestLimit.length - 1;
    const suggestLimitWord = suggestLimit.charAt(indexOfWord);
    const suggestLimitNumber = parseInt(suggestLimit);

    const inputAsNumber = Number(inputText);
    const currentLimitWordPriority = wordPriorityMap[suggestLimitWord as SuggestTimeWords];

    if (Number.isInteger(inputAsNumber) && inputAsNumber > 0) {
        const result: string[] = [];

        const checkAllowance = (limit: number, word: SuggestTimeWords) => {
            const wordPriority = wordPriorityMap[word];
            if (wordPriority === currentLimitWordPriority && inputAsNumber <= suggestLimitNumber) {
                return true;
            } else if (limit >= inputAsNumber && wordPriority < currentLimitWordPriority) {
                return true;
            } else {
                return false;
            }
        };
        if (inputAsNumber <= 180 && currentLimitWordPriority >= 1) {
            const isAllowedToPushSec = checkAllowance(180, 's');
            const isAllowedToPushMin = checkAllowance(180, 'm');
            if (isAllowedToPushSec) {
                result.push(inputText + 's');
            }
            if (isAllowedToPushMin) {
                result.push(inputText + 'm');
            }
        }
        if (inputAsNumber <= 72 && currentLimitWordPriority >= 2 && checkAllowance(72, 'h')) {
            result.push(inputText + 'h');
        }
        if (currentLimitWordPriority >= 3 && checkAllowance(72, 'd')) {
            result.push(inputText + 'd');
        }
        if (inputAsNumber <= 25 && currentLimitWordPriority >= 4 && checkAllowance(25, 'w')) {
            result.push(inputText + 'w');
        }
        if (inputAsNumber <= 18 && currentLimitWordPriority >= 5 && checkAllowance(18, 'M')) {
            result.push(inputText + 'M');
        }
        if (inputAsNumber <= 2 && currentLimitWordPriority === 6 && checkAllowance(72, 'y')) {
            result.push(inputText + 'y');
        }
        return result;
    }

    if (dateTimeParse('now-' + inputText, {timeZone: 'UTC'})) {
        const indexOfInputTextWord = inputText.length - 1;
        const inputTextWord = inputText.charAt(indexOfInputTextWord);
        const inputWordPriority = wordPriorityMap[inputTextWord as SuggestTimeWords];
        const inputNumber = Number(inputText.slice(0, indexOfInputTextWord));
        if (inputText === suggestLimit) {
            return [inputText];
        } else if (inputWordPriority < currentLimitWordPriority) {
            return [inputText];
        } else if (
            inputWordPriority <= currentLimitWordPriority &&
            inputNumber <= suggestLimitNumber
        ) {
            return [inputText];
        } else {
            return [];
        }
    }

    return [];
};
