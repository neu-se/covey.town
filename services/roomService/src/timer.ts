/* This class was created by DreamOfAWhale and is modified in our code to find the time left
   and time remaining in  our timeout.
   https://www.reddit.com/r/learnjavascript/comments/hzc3ux/how_to_find_the_remaining_time_in_settimeout/
*/
export default class Timer {
    id;
    endTime: number;
    videoLength: number = 0;
    constructor(fn: (...args: any[]) => void, delay: number, ...params: any) {
        this.id = setTimeout(fn, delay, ...params);
        this.endTime = new Date().getTime() + delay;
        this.videoLength = delay;
    }

    getId() {
        return this.id;
    }

    clearTimer(){
        clearTimeout(this.id);
    }

    getRemainingMiliseconds() {
        const remainingTime = (this.endTime - new Date().getTime());
        return remainingTime > 0 ? remainingTime : 0;
    }

    getElapsedMiliseconds() {
        // I added one because it looked better
        const elapsedTime = this.videoLength - this.getRemainingMiliseconds() + 1;
        return elapsedTime > 0 ? elapsedTime : 0;
    }

    getRemainingSeconds() {
        return this.getRemainingMiliseconds() / 1000;
    }

    getElapsedSeconds() {
        return this.getElapsedMiliseconds() / 1000;
    }

}