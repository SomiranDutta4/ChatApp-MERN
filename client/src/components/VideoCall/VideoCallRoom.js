import React, { useContext, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AppContext } from '../Context/ContextProvider';

const VideoCallRoom = () => {
  const { roomId } = useParams();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);
  const { socket, User } = useContext(AppContext);
  const [isInitiator, setIsInitiator] = useState(false);

  useEffect(() => {
    const servers = {
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    };

    const pc = new RTCPeerConnection(servers);
    peerConnection.current = pc;

    // Get media and add to peer connection
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
      localVideoRef.current.srcObject = stream;
      if (peerConnection.current.signalingState !== 'closed') {
        stream.getTracks().forEach(track => peerConnection.current.addTrack(track, stream));
      } else {
        console.warn('PeerConnection is closed. Skipping track addition.');
      }
    }).catch(err => {
      console.error('Media error:', err);
    });

    // Receive remote media
    pc.ontrack = ({ streams: [stream] }) => {
      console.log('Remote stream received');
      remoteVideoRef.current.srcObject = stream;
    };

    // Send ICE candidates
    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit('ice-candidate', { candidate: e.candidate, roomId });
      }
    };

    // Join room
    socket.emit('join-video-room', { roomId, userId: User._id });

    // Listen for new peer (makes this user initiator)
    socket.on('other-user-joined', () => {
      console.log('Other user joined. I will create the offer.');
      setIsInitiator(true);
    });

    // Offer received from initiator
    socket.on('offer', async ({ sdp }) => {
      console.log('Received offer');
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localVideoRef.current.srcObject = stream;
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('answer', { sdp: answer, roomId });
    });

    // Answer received from callee
    socket.on('answer', async ({ sdp }) => {
      console.log('Received answer');
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    });

    // ICE candidate received
    socket.on('ice-candidate', ({ candidate }) => {
      console.log('Received ICE candidate');
      if (candidate) {
        pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    // Delay and then create offer if initiator
    const offerTimeout = setTimeout(async () => {
      if (isInitiator) {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('offer', { sdp: offer, roomId });
        console.log('Created and sent offer');
      }
    }, 1000);

    return () => {
      peerConnection.current?.close();
      socket.off('offer');
      socket.off('answer');
      socket.off('ice-candidate');
      socket.off('other-user-joined');
      clearTimeout(offerTimeout);
    };
  }, [isInitiator]);

  return (
    <div className="video-call-container flex flex-col items-center gap-4 p-4 bg-black min-h-screen text-white">
      <h2 className="text-xl mb-2">Video Call Room</h2>
      <div className="flex gap-4 justify-center w-full">
        <video ref={localVideoRef} autoPlay muted playsInline className="w-1/2 h-[300px] bg-gray-900 rounded-lg" />
        <video ref={remoteVideoRef} autoPlay playsInline className="w-1/2 h-[300px] bg-gray-900 rounded-lg" />
      </div>
    </div>
  );
};

export default VideoCallRoom;
