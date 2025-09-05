import React from "react";

const CallModal = ({ incomingCall, onAccept, onReject }) => {
  if (!incomingCall) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body items-center text-center">
          <div className="avatar mb-4">
            <div className="w-24 rounded-full">
              <img 
                src={incomingCall.callerInfo.profilePic || '/default-avatar.png'} 
                alt={incomingCall.callerInfo.fullName || 'Caller'}
                onError={(e) => {
                  e.target.src = '/default-avatar.png';
                }}
              />
            </div>
          </div>
          
          <h2 className="card-title text-2xl mb-2">
            {incomingCall.callerInfo.fullName}
          </h2>
          
          <p className="text-base-content/70 mb-2">
            Incoming {incomingCall.callType} call...
          </p>
          
          {incomingCall.callType === 'audio' && (
            <div className="mb-4">
              <span className="text-4xl">🎤</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 mb-6">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
            <span className="text-sm">{incomingCall.callType === 'audio' ? 'Voice call ringing...' : 'Video call ringing...'}</span>
          </div>
          
          <div className="card-actions justify-center gap-6">
            <button
              onClick={() => onReject(incomingCall)}
              className="btn btn-circle btn-error btn-lg"
              title="Reject Call"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
              </svg>
            </button>
            
            <button
              onClick={() => onAccept(incomingCall)}
              className="btn btn-circle btn-success btn-lg"
              title="Accept Call"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallModal;