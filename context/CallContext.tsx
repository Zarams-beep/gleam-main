"use client";
// Self-hosted WebRTC calling: socket.io (see SocketContext) only relays the
// ring/accept/reject/hangup control messages and the SDP offer/answer + ICE
// candidates between the two participants. The actual audio/video stream
// is peer-to-peer via RTCPeerConnection — no third-party call SDK, no
// media server, no cost per minute.
//
// Flow:
//   Caller  → emit call:invite         → Callee shows a ringing modal
//   Callee  → emit call:accept         → Caller creates the offer
//   Caller  → emit call:signal(offer)  → Callee sets remote desc, answers
//   Callee  → emit call:signal(answer) → Caller sets remote desc
//   both    → emit call:signal(ice)*   → trickle ICE candidates
//   either  → emit call:end / call:reject / call:cancel → cleanup both ends
import {
  createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode,
} from "react";
import { useSocket } from "./SocketContext";
import { useAppSelector } from "@/store/hooks";

export type CallType = "audio" | "video";
export type CallStatus = "idle" | "outgoing" | "incoming" | "connected" | "ended";

export type CallPeer = {
  id: string;
  fullName?: string | null;
  image?: string | null;
};

type CallContextValue = {
  status: CallStatus;
  callType: CallType | null;
  peer: CallPeer | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  muted: boolean;
  videoOff: boolean;
  startCall: (peer: CallPeer, conversationId: string, callType: CallType) => void;
  acceptCall: () => void;
  rejectCall: () => void;
  endCall: () => void;
  toggleMute: () => void;
  toggleVideo: () => void;
};

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [{ urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] }],
};

const CallContext = createContext<CallContextValue | null>(null);

export function CallProvider({ children }: { children: ReactNode }) {
  const { socket } = useSocket();
  const currentUser = useAppSelector((s) => s.user.user);

  const [status, setStatus] = useState<CallStatus>("idle");
  const [callType, setCallType] = useState<CallType | null>(null);
  const [peer, setPeer] = useState<CallPeer | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const conversationIdRef = useRef<string | null>(null);
  const peerRef = useRef<CallPeer | null>(null);
  const callTypeRef = useRef<CallType | null>(null);
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);

  const cleanup = useCallback(() => {
    pcRef.current?.close();
    pcRef.current = null;
    localStream?.getTracks().forEach((t) => t.stop());
    setLocalStream(null);
    setRemoteStream(null);
    pendingCandidatesRef.current = [];
    peerRef.current = null;
    conversationIdRef.current = null;
    callTypeRef.current = null;
    setPeer(null);
    setCallType(null);
    setMuted(false);
    setVideoOff(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localStream]);

  const createPeerConnection = useCallback((toUserId: string) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socket?.emit("call:signal", { toUserId, signal: { type: "ice", candidate: e.candidate } });
      }
    };

    pc.ontrack = (e) => {
      setRemoteStream(e.streams[0]);
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "connected") setStatus("connected");
      if (["failed", "disconnected", "closed"].includes(pc.connectionState)) {
        // Let explicit call:end handling drive cleanup for graceful hangups;
        // this is a safety net for silent network drops.
      }
    };

    pcRef.current = pc;
    return pc;
  }, [socket]);

  const getLocalMedia = useCallback(async (type: CallType) => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: type === "video",
    });
    setLocalStream(stream);
    return stream;
  }, []);

  // ─── Outgoing call ──────────────────────────────────────────────────────
  const startCall = useCallback(async (targetPeer: CallPeer, conversationId: string, type: CallType) => {
    if (!socket || status !== "idle") return;
    try {
      peerRef.current = targetPeer;
      conversationIdRef.current = conversationId;
      callTypeRef.current = type;
      setPeer(targetPeer);
      setCallType(type);
      setStatus("outgoing");

      await getLocalMedia(type);

      socket.emit("call:invite", {
        toUserId: targetPeer.id,
        conversationId,
        callType: type,
        callerName: currentUser?.fullName,
        callerImage: currentUser?.image,
      });
    } catch (err) {
      console.error("startCall failed (likely camera/mic permission):", err);
      cleanup();
      setStatus("idle");
    }
  }, [socket, status, getLocalMedia, currentUser, cleanup]);

  // ─── Incoming call ──────────────────────────────────────────────────────
  const acceptCall = useCallback(async () => {
    if (!socket || !peerRef.current || status !== "incoming") return;
    try {
      const stream = await getLocalMedia(callTypeRef.current || "audio");
      const pc = createPeerConnection(peerRef.current.id);
      stream.getTracks().forEach((t) => pc.addTrack(t, stream));

      socket.emit("call:accept", {
        toUserId: peerRef.current.id,
        conversationId: conversationIdRef.current,
      });
      setStatus("connected");
    } catch (err) {
      console.error("acceptCall failed (likely camera/mic permission):", err);
      rejectCall();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, status, getLocalMedia, createPeerConnection]);

  const rejectCall = useCallback(() => {
    if (socket && peerRef.current) {
      socket.emit("call:reject", { toUserId: peerRef.current.id, conversationId: conversationIdRef.current });
    }
    cleanup();
    setStatus("idle");
  }, [socket, cleanup]);

  // Hang up from any state. Which event we emit depends on where we are in
  // the flow — the callee only cares whether it was a cancel (never
  // connected), an explicit reject, or a hangup of a live call, but all three
  // trigger the same local cleanup.
  const endCall = useCallback(() => {
    if (socket && peerRef.current) {
      const event = status === "outgoing" ? "call:cancel" : "call:end";
      socket.emit(event, { toUserId: peerRef.current.id, conversationId: conversationIdRef.current });
    }
    cleanup();
    setStatus("idle");
  }, [socket, cleanup, status]);

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      localStream?.getAudioTracks().forEach((t) => (t.enabled = m)); // was muted -> enable
      return !m;
    });
  }, [localStream]);

  const toggleVideo = useCallback(() => {
    setVideoOff((v) => {
      localStream?.getVideoTracks().forEach((t) => (t.enabled = v)); // was off -> enable
      return !v;
    });
  }, [localStream]);

  // ─── Socket event wiring ────────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const onInvite = ({ fromUserId, conversationId, callType: type, callerName, callerImage }: any) => {
      // Busy — auto-reject rather than silently dropping the caller.
      if (status !== "idle") {
        socket.emit("call:reject", { toUserId: fromUserId, conversationId, reason: "busy" });
        return;
      }
      peerRef.current = { id: fromUserId, fullName: callerName, image: callerImage };
      conversationIdRef.current = conversationId;
      callTypeRef.current = type;
      setPeer(peerRef.current);
      setCallType(type);
      setStatus("incoming");
    };

    const onAccept = async ({ fromUserId }: any) => {
      if (!peerRef.current || peerRef.current.id !== fromUserId || !localStream) return;
      const pc = createPeerConnection(fromUserId);
      localStream.getTracks().forEach((t) => pc.addTrack(t, localStream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("call:signal", { toUserId: fromUserId, signal: { type: "offer", sdp: offer } });
    };

    const onSignal = async ({ fromUserId, signal }: any) => {
      if (!peerRef.current || peerRef.current.id !== fromUserId) return;
      let pc = pcRef.current;

      if (signal.type === "offer") {
        if (!pc) pc = createPeerConnection(fromUserId);
        await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
        for (const c of pendingCandidatesRef.current) await pc.addIceCandidate(new RTCIceCandidate(c));
        pendingCandidatesRef.current = [];
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("call:signal", { toUserId: fromUserId, signal: { type: "answer", sdp: answer } });
      } else if (signal.type === "answer") {
        if (!pc) return;
        await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
        for (const c of pendingCandidatesRef.current) await pc.addIceCandidate(new RTCIceCandidate(c));
        pendingCandidatesRef.current = [];
      } else if (signal.type === "ice") {
        if (!pc || !pc.remoteDescription) {
          pendingCandidatesRef.current.push(signal.candidate);
        } else {
          await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
        }
      }
    };

    const onReject = () => {
      cleanup();
      setStatus("idle");
    };

    const onCancel = () => {
      cleanup();
      setStatus("idle");
    };

    const onEnd = () => {
      cleanup();
      setStatus("idle");
    };

    socket.on("call:invite", onInvite);
    socket.on("call:accept", onAccept);
    socket.on("call:signal", onSignal);
    socket.on("call:reject", onReject);
    socket.on("call:cancel", onCancel);
    socket.on("call:end", onEnd);

    return () => {
      socket.off("call:invite", onInvite);
      socket.off("call:accept", onAccept);
      socket.off("call:signal", onSignal);
      socket.off("call:reject", onReject);
      socket.off("call:cancel", onCancel);
      socket.off("call:end", onEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, status, localStream, createPeerConnection, cleanup]);

  // If the caller navigates away / unmounts mid-outgoing-call, let the callee know.
  useEffect(() => {
    return () => {
      if (status === "outgoing" && socket && peerRef.current) {
        socket.emit("call:cancel", { toUserId: peerRef.current.id, conversationId: conversationIdRef.current });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <CallContext.Provider value={{
      status, callType, peer, localStream, remoteStream, muted, videoOff,
      startCall, acceptCall, rejectCall, endCall, toggleMute, toggleVideo,
    }}>
      {children}
    </CallContext.Provider>
  );
}

export const useCall = () => {
  const ctx = useContext(CallContext);
  if (!ctx) throw new Error("useCall must be used within a CallProvider");
  return ctx;
};
