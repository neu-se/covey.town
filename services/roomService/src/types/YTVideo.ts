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
    url: "https://www.youtube.com/watch?v=5kcdRBHM7kM",
    title: "Super Mario Odyssey - Nintendo Switch Presentation 2017 Trailer",
    channel: "Nintendo",
    duration: "02:42",
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
    url: "https://www.youtube.com/watch?v=1GnpegxJRYk",
    title: "Erik Myers - Taco Bell Application (Stand-up Clip)",
    channel: "Laugh Factory",
    duration: "2:20",
};
videoList.push(video3);

const video4 : YTVideo = {
    url: "https://www.youtube.com/watch?v=PlpjPCssEXE",
    title: "Marvel's Loki - Official Trailer (2021) Tom Hiddleston, Owen Wilson",
    channel: "IGN",
    duration: "02:44",
};
videoList.push(video4);

const video5 : YTVideo = {
    url: "https://www.youtube.com/watch?v=pTrTOMahg6A",
    title: "Chic-Fil-A be like...(Original Tik Tok)",
    channel: "Thee BlackBadger",
    duration: "00:33",
};
videoList.push(video5);

const video6 : YTVideo = {
    url: "https://www.youtube.com/watch?v=leL_bsHEZdM",
    title: "Key & Peele - Gangsta Standoff",
    channel: "Key & Peele",
    duration: "02:49",
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
    url: "https://www.youtube.com/watch?v=rR4n-0KYeKQ",
    title: "how we write/review code in big tech companies",
    channel: "Joma Tech",
    duration: "01:11",
};
videoList.push(video8);

const video9 : YTVideo = {
    url: "https://www.youtube.com/watch?v=D7y_hoT_YZI",
    title: "Reversing a linked list | GeeksforGeeks",
    channel: "GeeksforGeeks",
    duration: "01:44",
};
videoList.push(video9);

const video10 : YTVideo = {
    url: "https://www.youtube.com/watch?v=kXaWHHN_fxs",
    title: "Movie hackers vs real programmers #shorts",
    channel: "Mansoor Codes",
    duration: "00:31",
};
videoList.push(video10);