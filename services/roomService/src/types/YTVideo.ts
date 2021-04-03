export type YTVideo = {
    url: string;
    title: string;
    channel: string;
    duration: string;
}


export const videoList : YTVideo[] = [];

export function getDefaultVideos(): YTVideo[] {
    return [...videoList];
}

const video1 : YTVideo = {
    url: "https://www.youtube.com/watch?v=QtXby3twMmI",
    title: "Coldplay - Adventure Of A Lifetime (Official Video)",
    channel: "Coldplay",
    duration: "5:16",
};
videoList.push(video1);
  
const video2 : YTVideo = {
    url: "https://www.youtube.com/watch?v=YqeW9_5kURI",
    title: "Major Lazer & DJ Snake - Lean On (feat. MØ) (Official Music Video)",
    channel: "Major Lazer",
    duration: "2:59",
};
videoList.push(video2);

const video3 : YTVideo = {
    url: "https://www.youtube.com/watch?v=QtMzV73NAgk",
    title: "PlayStation 5 Unboxing & Accessories!",
    channel: "Marques Brownlee",
    duration: "11:39",
};
videoList.push(video3);

const video4 : YTVideo = {
    url: "https://www.youtube.com/watch?v=QxGVgXf_LNk",
    title: "Going Through The Same Drive Thru 1,000 Times",
    channel: "MrBeast",
    duration: "15:38",
};
videoList.push(video4);

const video5 : YTVideo = {
    url: "https://www.youtube.com/watch?v=Kh3RHV5G1Fc",
    title: "Inside El Chapo’s Escape Tunnel",
    channel: "Vice News",
    duration: "11:19",
};
videoList.push(video5);

const video6 : YTVideo = {
    url: "https://www.youtube.com/watch?v=dllm-HH0toI",
    title: "Barcelona vs. Paris Saint-Germain: Extended Highlights",
    channel: "Champions League on CBS Sports",
    duration: "14:23",
};
videoList.push(video6);

const video7 : YTVideo = {
    url: "https://www.youtube.com/watch?v=cg1rtWXHSKU",
    title: "Captain America vs Ultron - Fight Scene - Avengers: Age of Ultron - Movie CLIP HD",
    channel: "TopMovieClips",
    duration: "3:52",
};
videoList.push(video7);

const video8 : YTVideo = {
    url: "https://www.youtube.com/watch?v=kZZj831VbEM",
    title: "15 Minutes Of Pure Gabriel 'Fluffy' Iglesias Stand-Up",
    channel: "Netflix Is A Joke",
    duration: "14:31",
};
videoList.push(video8);

const video9 : YTVideo = {
    url: "https://www.youtube.com/watch?v=3_9v-7rtVDk",
    title: "Key & Peele Lose Their Minds Eating Spicy Wings | Hot Ones",
    channel: "First We Feast",
    duration: "14:11",
};
videoList.push(video9);

const video10 : YTVideo = {
    url: "https://www.youtube.com/watch?v=KUwAvIOAHx0",
    title: "Inside A $387 Million Penthouse In Monaco",
    channel: "TheRichest",
    duration: "8:43",
};
videoList.push(video10);