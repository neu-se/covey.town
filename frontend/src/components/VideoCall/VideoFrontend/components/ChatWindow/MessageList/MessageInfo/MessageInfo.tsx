import { createStyles, makeStyles } from '@material-ui/core/styles';
import { UserProfile } from '../../../../../../../CoveyTypes';

const useStyles = makeStyles(() =>
  createStyles({
    messageInfoContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1.425em 0 0.083em',
      fontSize: '12px',
      color: '#606B85',
    },
  })
);

interface MessageInfoProps {
  author: string;
  dateCreated: string;
  isLocalParticipant: boolean;
  receiver?:UserProfile;
}

export default function MessageInfo({ author, dateCreated, isLocalParticipant, receiver }: MessageInfoProps) {
  const classes = useStyles();

  return (
    <div className={classes.messageInfoContainer}>
      
      <div>{isLocalParticipant ? `${author} (You)` : author} to {receiver?receiver.displayName:"everyone"}</div>
      <div>{dateCreated}</div>
    </div>
  );
}
