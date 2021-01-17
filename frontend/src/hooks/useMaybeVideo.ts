import { useContext } from 'react';
import VideoContext from '../contexts/VideoContext';
import Video from '../classes/Video/Video';

/**
 * Use this hook to access the video instance.
 */
export default function useMaybeVideo(): Video | null {
  return useContext(VideoContext);
}
