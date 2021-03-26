import useVideoContext from '../VideoCall/VideoFrontend/hooks/useVideoContext/useVideoContext';

interface ChatProps {
    token:string
  }

export default function ChatWindow({token}:ChatProps): JSX.Element {

    const { room } = useVideoContext();

    return (
        <form>

        </form>
    );
}