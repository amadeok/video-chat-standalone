import { useContext, useEffect, useState } from 'react';

import { useMediaStream } from '@hooks/index';
import { SocketContext } from '@pages/_app';
import { useRouter } from 'next/router';
import Peer from 'peerjs';

import { Nullable, PeerId, RoomId } from '@common/types';
import { createRoomId, error, getUser } from '@common/utils';

/**
 * Creates a peer and joins them into the room
 * @returns peer object, its id and meta-state whether is peer fully created
 */
const usePeer = (stream: MediaStream) => {
  const socket = useContext(SocketContext);
  const room = useRouter().query.qoraId as RoomId;
  const user =  getUser();;
  console.log("peer room id", room)
  const { muted, visible } = useMediaStream(stream);

  const [isLoading, setIsLoading] = useState(true);
  const [peer, setPeer] = useState<Nullable<Peer>>(null);
  const [myId, setMyId] = useState<PeerId>('');

  useEffect(() => {

    (async function createPeerAndJoinRoom() {
      console.log("2peer room id", room)
      if (room) {
        try {
          const peer = new (await import('peerjs')).default();
          setPeer(peer);
          setIsLoading(false);

          peer.on('open', (id) => {
            console.log('your device id: ', id);
            setMyId(id);
            socket.emit('room:join', {
              room,
              user: {
                id,
                muted,
                visible,
                name: user.name,
                picture: user.picture,
              },
            });
          });

          peer.on('error', error('Failed to setup peer connection'));
        } catch (e) {
          error('Unable to create peer')(e);
        }
      }
    })();
  }, [room]);

  return {
    peer,
    myId,
    isPeerReady: !isLoading,
  };
};

export default usePeer;
