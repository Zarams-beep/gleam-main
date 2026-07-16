"use client";
import { useEffect, useRef } from "react";
import { IoIosCall, IoIosMic, IoIosMicOff, IoIosVideocam } from "react-icons/io";
import { MdCallEnd, MdVideocamOff } from "react-icons/md";
import { useCall } from "@/context/CallContext";
import "@/styles/Dashboard.css";

// Rendered once at the dashboard-layout level (see app/dashboard/layout.tsx)
// so an incoming call surfaces no matter which page the user is currently
// viewing — not just when they happen to have the message page open.
export default function CallModal() {
  const {
    status, callType, peer, localStream, remoteStream,
    muted, videoOff, acceptCall, rejectCall, endCall, toggleMute, toggleVideo,
  } = useCall();

  const localVideoRef  = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (localVideoRef.current) localVideoRef.current.srcObject = localStream;
  }, [localStream]);

  useEffect(() => {
    if (callType === "video" && remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
    if (callType === "audio" && remoteAudioRef.current) remoteAudioRef.current.srcObject = remoteStream;
  }, [remoteStream, callType]);

  if (status === "idle") return null;

  const name = peer?.fullName || "Teammate";

  return (
    <div className="call-modal-overlay">
      <div className={`call-modal ${status === "connected" && callType === "video" ? "call-modal-video" : ""}`}>
        {status === "connected" && callType === "video" ? (
          <>
            <video ref={remoteVideoRef} autoPlay playsInline className="call-remote-video" />
            <video ref={localVideoRef} autoPlay playsInline muted className="call-local-video" />
          </>
        ) : (
          <div className="call-avatar-block">
            {peer?.image ? (
              <img src={peer.image} alt={name} className="call-avatar" />
            ) : (
              <div className="call-avatar call-avatar-fallback">{name.charAt(0).toUpperCase()}</div>
            )}
            <h3>{name}</h3>
            <p className="call-status-text">
              {status === "incoming" && `Incoming ${callType} call…`}
              {status === "outgoing" && "Calling…"}
              {status === "connected" && `${callType === "video" ? "Video" : "Voice"} call in progress`}
            </p>
          </div>
        )}

        {/* Hidden audio sink for audio-only calls */}
        {callType === "audio" && <audio ref={remoteAudioRef} autoPlay />}

        <div className="call-controls">
          {status === "incoming" ? (
            <>
              <button className="call-btn call-btn-reject" onClick={rejectCall} aria-label="Decline">
                <MdCallEnd />
              </button>
              <button className="call-btn call-btn-accept" onClick={acceptCall} aria-label="Accept">
                <IoIosCall />
              </button>
            </>
          ) : (
            <>
              {status === "connected" && (
                <>
                  <button className="call-btn call-btn-muted-toggle" onClick={toggleMute} aria-label="Toggle mute">
                    {muted ? <IoIosMicOff /> : <IoIosMic />}
                  </button>
                  {callType === "video" && (
                    <button className="call-btn call-btn-muted-toggle" onClick={toggleVideo} aria-label="Toggle camera">
                      {videoOff ? <MdVideocamOff /> : <IoIosVideocam />}
                    </button>
                  )}
                </>
              )}
              <button className="call-btn call-btn-reject" onClick={endCall} aria-label="Hang up">
                <MdCallEnd />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
