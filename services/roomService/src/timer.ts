/* This class was created by DreamOfAWhale and is implemented in our code to find the time left
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

    getRemainingTime() {
        // const remainingTime = Math.round( (this.endTime - new Date().getTime() ) / 1000);
        const remainingTime = (this.endTime - new Date().getTime()) / 1000;
        return remainingTime > 0 ? remainingTime : 0;
    }

    getElapsedTime() {
        const remainingTime = (this.videoLength/1000) - this.getRemainingTime() + 1;
        return remainingTime > 0 ? remainingTime : 0;
    }

}