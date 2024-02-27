import { createContext, useState } from 'react';

import Room from '@app/index';
import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import { Lobby } from '@components/index';
import { useMediaStream } from '@hooks/index';
import { NextPage, GetServerSidePropsContext, PreviewData } from 'next';

import { LoaderError } from '@common/components';
import { FAILURE_MSG, LOADER_STREAM_MSG } from '@common/constants';

export const QoraContext = createContext<any>({});

const Qora: NextPage = () => {
  
  const [isLobby, setIsLobby] = useState(true);
  const { stream, isLoading } = useMediaStream();
  console.log("qora| stream", stream)
  if (isLoading){ console.log("isloading"); return <LoaderError msg={LOADER_STREAM_MSG} />;}
  if (!stream) {console.log("!stream"); return <LoaderError msg={FAILURE_MSG} />;}

  if (isLobby)
    {  console.log("islobby")
      return <Lobby stream={stream} onJoinRoom={() => setIsLobby(false)} />;}

  console.log("Room")
  return <Room stream={stream} />;
};

export default Qora;

// export const getServerSideProps = async (
//   ctx: GetServerSidePropsContext<any, PreviewData>
// ) =>

//   await withPageAuthRequired({
//     returnTo: '/qora/' + ctx.query.qoraId,
//   })(ctx);
