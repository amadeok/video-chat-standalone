import { NextApiRequest } from 'next';
import { Server as ServerIO } from 'socket.io';

import { NextApiResponseServerIO } from 'common/types';
import { SOCKET_PATH } from 'common/constants';

let startTime: Date = new Date(); // Define the variable you want to monitor
let endTime: Date = startTime;
const desiredIntervalMins: number = 120;

const AWS = require('aws-sdk');

const region = "eu-central-1"
// Configure AWS credentials and region
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET,
  region: region
});

//const ec2 = new AWS.EC2({apiVersion: '2016-11-15'});
const ec2 = new AWS.EC2();
// https://video-chat-ayurveda-108.loophole.site/api/hello

const describeParams = {
  InstanceIds: [process.env.AWS_INSTANCE_ID]
};

function printInstanceState() {
  ec2.describeInstances(describeParams, function(err:any, data:any) {
    if (err) {
      console.log("Error describing instance", err);
    } else if (data) {
      const state = data.Reservations[0].Instances[0].State.Name;
      console.log("instance state", state)
    }
  });
}

function stopInstance() {

  return new Promise((resolve, reject) => {
    ec2.stopInstances(describeParams, function (err:any, data:any) {
      if (err) {
        reject("Error stopping instance: " + err);
      } else {
        resolve("stopped");
      }
    });
  });
}
function stopIfRunning() {
  return new Promise((resolve, reject) => {
    ec2.describeInstances(describeParams, function (err:any, data:any) {
      if (err) {
        reject("Error describing instance: " + err);
      } else {
        const state = data.Reservations[0].Instances[0].State.Name;

        if (state === 'running') {
          stopInstance()
            .then((message) => resolve("stopped"))
            .catch((error) => reject(error));
        } else resolve("already stopped")
      }
    });
  });
}


function checkVariable() {
  endTime = new Date()
  const elapsedTime: number = endTime.getTime() - startTime.getTime();

  if (elapsedTime >= desiredIntervalMins*60*1000) {
    console.log(desiredIntervalMins, " minutes have elapsed. timeout");
    stopIfRunning().then( (m)=> console.log("Instance ", m)).catch((e:any)=> console.error(e))
} else {
    console.log("Time has not yet elapsed.", (elapsedTime/1000)/60, "mins");
}
}

let interval: NodeJS.Timer | null = null

function rs() {startTime = new Date()}

const socketHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
  console.log('Socket api call');
  if (!interval)
    interval = setInterval(checkVariable, 5000);
  if (!res.socket.server.io) {
    console.log('------------------> \n\n\nSocket is initializing');

    const httpServer = res.socket.server;
    const io = new ServerIO(httpServer, { path: SOCKET_PATH });
    res.socket.server.io = io;

    io.on('connection', (socket) => {
      console.log('connected');

      socket.on('room:join', ({ room, user }) => {
        console.table({
          'room-id': room,
          'used-id': user.id,
          'user-name': user.name,
        });
        rs() 
        socket.join(room);

        socket.to(room).emit('user:joined', user);

        socket.on('disconnect', () => {
          socket.to(room).emit('user:left', user.id);rs() 
        });

        socket.on('user:leave', (userId) => {
          socket.to(room).emit('user:left', userId);rs() 
        });

        socket.on('host:mute-user', (userId) => {
          socket.to(room).emit('host:muted-user', userId);rs() 
        });

        socket.on('host:remove-user-shared-screen', () => {
          socket.to(room).emit('host:removed-user-shared-screen');rs() 
        });

        socket.on('user:toggle-audio', (userId) => {
          socket.to(room).emit('user:toggled-audio', userId);rs() 
        });

        socket.on('user:toggle-video', (userId) => {
          socket.to(room).emit('user:toggled-video', userId);rs() 
        });

        socket.on('user:share-screen', (username) => {
          socket.to(room).emit('user:shared-screen', username);rs() 
        });

        socket.on('user:stop-share-screen', () => {
          socket.to(room).emit('user:stopped-screen-share', user.name);rs() 
        });

        socket.on('chat:post', (message) => {
          socket.to(room).emit('chat:get', message);rs() 
        });
      });
    });
  }

  res.end();
};

export default socketHandler;
