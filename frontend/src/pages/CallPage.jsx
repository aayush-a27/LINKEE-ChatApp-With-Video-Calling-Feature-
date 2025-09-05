import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../socket.jsx';
import { endCall } from '../lib/api';
import { useNavigate, useLocation } from 'react-router';
import useAuthUser from '../hooks/useAuthUser';

const CallPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { socket } = useSocket();
  const { authUser } = useAuthUser();
  

  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [currentCallId, setCurrentCallId] = useState(location.state?.callData?.callId || null);
  const [friendId, setFriendId] = useState(location.state?.friendData?._id || null);
  const [callType, setCallType] = useState(location.state?.callData?.callType || 'video');
  
  // Redirect if accessed directly without call data
  useEffect(() => {
    if (!location.state?.callData?.callId && !location.state?.friendData?._id) {
      navigate('/');
      return;
    }
  }, [location.state, navigate]);
  

  const [callDuration, setCallDuration] = useState(0);
  const [audioDevices, setAudioDevices] = useState([]);
  const [videoDevices, setVideoDevices] = useState([]);
  const [selectedAudioInput, setSelectedAudioInput] = useState('');
  const [selectedAudioOutput, setSelectedAudioOutput] = useState('');
  const [selectedVideoInput, setSelectedVideoInput] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    // Ensure socket has user ID
    if (authUser?._id && !socket.userId) {
      socket.emit('join', authUser._id);
      socket.userId = authUser._id;
    }
    
    initializeCall();
    getMediaDevices();
    
    const eventHandlers = {
      'call-started': handleCallStarted,
      'call-accepted': handleCallAccepted,
      'call-initiated': handleCallInitiated,
      'call-ended': handleCallEnded,
      'offer': handleOffer,
      'answer': handleAnswer,
      'ice-candidate': handleIceCandidate
    };
    
    // Register event listeners
    Object.entries(eventHandlers).forEach(([event, handler]) => {
      socket.on(event, handler);
    });

    return () => {
      // Clean up event listeners
      Object.keys(eventHandlers).forEach(event => {
        socket.off(event);
      });
      cleanup();
    };
  }, [authUser]);

  const initializeCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: callType === 'video',
        audio: true
      });
      
      localStreamRef.current = stream;
      if (localVideoRef.current && callType === 'video') {
        localVideoRef.current.srcObject = stream;
      }
      
      setupPeerConnection();
    } catch (error) {
      console.error('Error accessing media devices:', error);
    }
  };

  const getMediaDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter(device => device.kind === 'audioinput');
      const audioOutputs = devices.filter(device => device.kind === 'audiooutput');
      const videoInputs = devices.filter(device => device.kind === 'videoinput');
      
      setAudioDevices([...audioInputs, ...audioOutputs]);
      setVideoDevices(videoInputs);
      
      if (audioInputs.length > 0) setSelectedAudioInput(audioInputs[0].deviceId);
      if (audioOutputs.length > 0) setSelectedAudioOutput(audioOutputs[0].deviceId);
      if (videoInputs.length > 0) setSelectedVideoInput(videoInputs[0].deviceId);
    } catch (error) {
      console.error('Error getting media devices:', error);
    }
  };

  const setupPeerConnection = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    
    const configuration = {
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    };
    
    peerConnectionRef.current = new RTCPeerConnection(configuration);
    
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        peerConnectionRef.current.addTrack(track, localStreamRef.current);
      });
    }
    
    peerConnectionRef.current.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };
    
    peerConnectionRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        const targetFriendId = friendId || location.state?.friendData?._id;
        if (targetFriendId) {
          socket.emit('ice-candidate', {
            candidate: event.candidate,
            to: targetFriendId
          });
        }
      }
    };
  };

  const handleCallInitiated = (data) => {
    setCurrentCallId(data.callId);
    setFriendId(data.calleeId);
  };

  const handleCallAccepted = (data) => {
    setIsCallActive(true);
    setCurrentCallId(data.callId);
    if (!intervalRef.current) {
      startCallTimer();
    }
    // CALLER creates offer when call is accepted
    setTimeout(() => createOffer(), 1000);
  };

  const handleCallStarted = (data) => {
    setIsCallActive(true);
    setCurrentCallId(data.callId);
    setFriendId(data.with);
    if (!intervalRef.current) {
      startCallTimer();
    }
  };

  const handleCallEnded = (data) => {
    if (data.reason === 'user_disconnected' && data.endedBy !== authUser?._id) {
      return;
    }
    setIsCallActive(false);
    setCurrentCallId(null);
    stopCallTimer();
    cleanup();
    navigate('/');
  };

  const handleOffer = async (data) => {
    try {
      await peerConnectionRef.current.setRemoteDescription(data.offer);
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);
      
      socket.emit('answer', {
        answer: answer,
        to: data.from
      });
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  };

  const handleAnswer = async (data) => {
    try {
      await peerConnectionRef.current.setRemoteDescription(data.answer);
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  };

  const handleIceCandidate = async (data) => {
    try {
      await peerConnectionRef.current.addIceCandidate(data.candidate);
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  };

  const startCallTimer = () => {
    intervalRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  };

  const stopCallTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setCallDuration(0);
  };

  const handleEndCall = async () => {
    try {
      if (currentCallId) {
        await endCall(currentCallId);
      }
    } catch (error) {
      console.error('Error ending call:', error);
      // If API call fails, still end the call locally
      setIsCallActive(false);
      setCurrentCallId(null);
      stopCallTimer();
      cleanup();
      navigate('/');
    }
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const changeAudioDevice = async (deviceId, type) => {
    try {
      if (type === 'input') {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { deviceId: { exact: deviceId } },
          video: true
        });
        
        const audioTrack = stream.getAudioTracks()[0];
        const sender = peerConnectionRef.current.getSenders().find(s => 
          s.track && s.track.kind === 'audio'
        );
        
        if (sender) {
          await sender.replaceTrack(audioTrack);
        }
        
        setSelectedAudioInput(deviceId);
      } else {
        setSelectedAudioOutput(deviceId);
        if (remoteVideoRef.current && remoteVideoRef.current.setSinkId) {
          await remoteVideoRef.current.setSinkId(deviceId);
        }
      }
    } catch (error) {
      console.error('Error changing audio device:', error);
    }
  };

  const changeVideoDevice = async (deviceId) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId } },
        audio: true
      });
      
      const videoTrack = stream.getVideoTracks()[0];
      const sender = peerConnectionRef.current.getSenders().find(s => 
        s.track && s.track.kind === 'video'
      );
      
      if (sender) {
        await sender.replaceTrack(videoTrack);
      }
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      setSelectedVideoInput(deviceId);
    } catch (error) {
      console.error('Error changing video device:', error);
    }
  };

  const cleanup = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    stopCallTimer();
  };

  const createOffer = async () => {
    const targetFriendId = friendId || location.state?.friendData?._id;
    
    if (!targetFriendId) {
      console.error('No friend ID available for offer');
      return;
    }
    
    try {
      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);
      
      socket.emit('offer', {
        offer: offer,
        to: targetFriendId
      });
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-screen bg-base-300 flex flex-col">
      {/* Header */}
      <div className="navbar bg-base-100 shadow-lg">
        <div className="flex-1">
          <h1 className="text-xl font-bold">{callType === 'video' ? 'Video Call' : 'Voice Call'}</h1>
        </div>
        <div className="flex-none">
          <div className="text-sm opacity-70">
            {isCallActive ? formatTime(callDuration) : 'Connecting...'}
          </div>
        </div>
      </div>

      {/* Call Container */}
      <div className="flex-1 relative">
        {callType === 'video' ? (
          <>
            {/* Remote Video */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover bg-black"
            />
            
            {/* Local Video */}
            <div className="absolute top-4 right-4 w-48 h-36 bg-black rounded-lg overflow-hidden border-2 border-base-content/20">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            </div>
          </>
        ) : (
          /* Voice Call UI */
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary/20 to-secondary/20">
            <div className="text-center">
              <div className="avatar mb-6">
                <div className="w-32 rounded-full bg-primary/30 flex items-center justify-center">
                  <span className="text-6xl">🎤</span>
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-2">Voice Call</h2>
              <p className="text-base-content/70">Audio connection active</p>
            </div>
            {/* Hidden video elements for voice call */}
            <video ref={remoteVideoRef} autoPlay playsInline className="hidden" />
            <video ref={localVideoRef} autoPlay playsInline muted className="hidden" />
          </div>
        )}

        {/* Settings Panel */}
        {showSettings && (
          <div className="absolute top-4 left-4 bg-base-100 p-4 rounded-lg shadow-xl w-80">
            <h3 className="font-bold mb-3">Device Settings</h3>
            
            <div className="space-y-3">
              <div>
                <label className="label">
                  <span className="label-text">Microphone</span>
                </label>
                <select 
                  className="select select-bordered w-full select-sm"
                  value={selectedAudioInput}
                  onChange={(e) => changeAudioDevice(e.target.value, 'input')}
                >
                  {audioDevices.filter(d => d.kind === 'audioinput').map(device => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || `Microphone ${device.deviceId.slice(0, 5)}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">
                  <span className="label-text">Speaker</span>
                </label>
                <select 
                  className="select select-bordered w-full select-sm"
                  value={selectedAudioOutput}
                  onChange={(e) => changeAudioDevice(e.target.value, 'output')}
                >
                  {audioDevices.filter(d => d.kind === 'audiooutput').map(device => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || `Speaker ${device.deviceId.slice(0, 5)}`}
                    </option>
                  ))}
                </select>
              </div>

              {callType === 'video' && (
                <div>
                  <label className="label">
                    <span className="label-text">Camera</span>
                  </label>
                  <select 
                    className="select select-bordered w-full select-sm"
                    value={selectedVideoInput}
                    onChange={(e) => changeVideoDevice(e.target.value)}
                  >
                    {videoDevices.map(device => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label || `Camera ${device.deviceId.slice(0, 5)}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-base-100 p-4">
        <div className="flex justify-center items-center gap-4">
          <button
            onClick={toggleMute}
            className={`btn btn-circle ${isMuted ? 'btn-error' : 'btn-primary'}`}
          >
            {isMuted ? '🔇' : '🎤'}
          </button>

          {callType === 'video' && (
            <button
              onClick={toggleVideo}
              className={`btn btn-circle ${isVideoOff ? 'btn-error' : 'btn-primary'}`}
            >
              {isVideoOff ? '📹' : '📷'}
            </button>
          )}

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="btn btn-circle btn-secondary"
          >
            ⚙️
          </button>

          <button
            onClick={handleEndCall}
            className="btn btn-circle btn-error"
          >
            📞
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallPage;