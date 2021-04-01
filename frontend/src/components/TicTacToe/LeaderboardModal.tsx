import React, { useCallback, useState, useEffect } from 'react';
import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  useToast
} from '@chakra-ui/react';
import { ScoreList } from '../../classes/TownsServiceClient';
import useCoveyAppState from '../../hooks/useCoveyAppState';
import useMaybeVideo from '../../hooks/useMaybeVideo';


const LeaderboardModal: React.FunctionComponent = () => {
  const {isOpen, onOpen, onClose} = useDisclosure()
  const video = useMaybeVideo()
  const [currentLeaderboard, setCurrentLeaderboard] = useState<ScoreList[]>();;
  const { apiClient } = useCoveyAppState();
  const { currentTownID } =  useCoveyAppState();


  const openLeaderboard = useCallback(()=>{
    onOpen();
    video?.pauseGame();
  }, [onOpen, video]);

  if (video) {
    video.openLeaderboardModal = openLeaderboard;
  }

  const closeLeaderboard = useCallback(()=>{
    onClose();
    video?.unPauseGame();
  }, [onClose, video]);

  // get scores
  const updateLeaderboard: () => void = useCallback(async ()=>{
    const scoreList = await apiClient.leaderboard({
        coveyTownID: currentTownID
    }    
  );
setCurrentLeaderboard(scoreList.scores);
}, [setCurrentLeaderboard, apiClient]);

  useEffect(() => {
    updateLeaderboard();
    const timer = setInterval(updateLeaderboard, 5000);
    return () => {
      clearInterval(timer)
    };
  }, [updateLeaderboard]);


  return <>
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay/>
      <ModalContent>
          {}
        <ModalHeader>Tic-Tac-Toe Leaderboard</ModalHeader>
        {currentLeaderboard?.map((result, index) => 
                  <div key={result.userName} className="row">
                  {"Username: "}{result.userName}{" Score: "}{result.score}
              </div>)}
              <Button onClick={closeLeaderboard}>Close</Button>
          <ModalBody pb={6}/>
      </ModalContent>
    </Modal>
  </>
}


export default LeaderboardModal;
