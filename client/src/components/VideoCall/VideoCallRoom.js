import React, { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppContext } from '../Context/ContextProvider';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone, faMicrophoneSlash, faVideo, faVideoSlash, faPhone } from '@fortawesome/free-solid-svg-icons';

const VideoCallRoom = () => {
  const { roomId } = useParams();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);
  const localStream = useRef(null);
  const { socket, User } = useContext(AppContext);
  const [isInitiator, setIsInitiator] = useState(false);
  const isRemoteDescriptionSet = useRef(false);
  const pendingCandidates = useRef([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const navigate = useNavigate();

  const endCall = (cutByMe) => {
    toast.info("Call ended");
    if (localStream.current) {
      localStream.current.getTracks().forEach(track => track.stop());
    }
    if (peerConnection.current) {
      peerConnection.current.close();
    }
    if (cutByMe) {
      socket.emit('leave-video-room', { roomId, userId: User._id });
    }
    setTimeout(() => {
      navigate('/feedback?reload=true');
    }, 2000)
  };

  const toggleMute = () => {
    const audioTrack = localStream.current?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!audioTrack.enabled);
    }
  };

  const toggleVideo = () => {
    const videoTrack = localStream.current?.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoOff(!videoTrack.enabled);
    }
  };

  useEffect(() => {
    if (!socket) return;

    const servers = {
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    };

    const pc = new RTCPeerConnection(servers);
    peerConnection.current = pc;

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        localStream.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        if (pc.signalingState !== 'closed') {
          stream.getTracks().forEach(track => pc.addTrack(track, stream));
        }
      })
      .catch(err => {
        console.error('Media error:', err);
      });

    pc.ontrack = ({ streams: [stream] }) => {
      remoteVideoRef.current.srcObject = stream;
    };

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit('ice-candidate', { candidate: e.candidate, roomId });
      }
    };

    socket.emit('join-video-room', { roomId, userId: User._id });

    socket.on('other-user-joined', () => {
      setIsInitiator(true);
    });

    socket.on('offer', async ({ sdp }) => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStream.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      isRemoteDescriptionSet.current = true;

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('answer', { sdp: answer, roomId });

      pendingCandidates.current.forEach(candidate => {
        pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(console.error);
      });
      pendingCandidates.current = [];
    });

    socket.on('answer', async ({ sdp }) => {
      if (pc.signalingState === 'stable') {
        console.warn('Already in stable state. Skipping answer.');
        return;
      }
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      isRemoteDescriptionSet.current = true;

      pendingCandidates.current.forEach(candidate => {
        pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(console.error);
      });
      pendingCandidates.current = [];
    });

    socket.on('ice-candidate', ({ candidate }) => {
      if (candidate) {
        if (isRemoteDescriptionSet.current) {
          pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(console.error);
        } else {
          pendingCandidates.current.push(candidate);
        }
      }
    });

    return () => {
      peerConnection.current?.close();
      socket.off('offer');
      socket.off('answer');
      socket.off('ice-candidate');
      socket.off('other-user-joined');
    };
  }, [socket, User._id, roomId]);

  useEffect(() => {
    const createOffer = async () => {
      if (!isInitiator || !peerConnection.current) return;

      try {
        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);
        socket.emit('offer', { sdp: offer, roomId });
        console.log('Created and sent offer');
      } catch (error) {
        console.error('Error creating offer:', error);
      }
    };
    createOffer();
  }, [isInitiator]);

  useEffect(() => {
    if (!socket) return;
    socket.on('user-left-video-room', () => {
      endCall(false);
    });
    return () => {
      socket.off('user-left-video-room');
    };
  }, [socket]);

  return (
    <div className="video-call-container relative flex flex-col items-center justify-center bg-black min-h-screen w-screen overflow-hidden text-white">
      <ToastContainer position="top-center" autoClose={2000} hideProgressBar pauseOnHover={false} />

      {/* Remote Video Fullscreen */}
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
      />

      {/* Local Video Small Preview */}
      <video
        ref={localVideoRef}
        autoPlay
        muted
        playsInline
        className="absolute bottom-6 right-6 w-40 h-28 bg-gray-900 rounded-lg border-2 border-white z-10 object-cover"
      />

      {/* Control Buttons */}
      <div className="absolute bottom-8 flex gap-6 justify-center z-20">
        <button
          onClick={toggleMute}
          className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg transition"
          title="Toggle Mute"
        >
          <FontAwesomeIcon icon={isMuted ? faMicrophoneSlash : faMicrophone} />
        </button>

        <button
          onClick={toggleVideo}
          className="w-12 h-12 flex items-center justify-center rounded-full bg-yellow-600 hover:bg-yellow-700 shadow-lg transition"
          title="Toggle Video"
        >
          <FontAwesomeIcon icon={isVideoOff ? faVideoSlash : faVideo} />
        </button>

        <button
          onClick={() => endCall(true)}
          className="w-12 h-12 flex items-center justify-center rounded-full bg-red-600 hover:bg-red-700 shadow-lg transition"
          title="End Call"
        >
          <FontAwesomeIcon icon={faPhone} />
        </button>
      </div>
    </div>
  );
};

export default VideoCallRoom;
