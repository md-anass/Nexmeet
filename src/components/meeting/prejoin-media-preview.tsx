"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Camera, CameraOff, Mic, MicOff, RefreshCw } from "lucide-react";

type MediaState = "loading" | "ready" | "denied" | "unavailable" | "unsupported" | "error";

export type PrejoinMediaHandle = {
  getState: () => { cameraEnabled: boolean; microphoneEnabled: boolean };
  stop: () => void;
};

export const PrejoinMediaPreview = forwardRef<PrejoinMediaHandle, { displayName: string }>(function PrejoinMediaPreview({ displayName }, ref) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [mediaState, setMediaState] = useState<MediaState>("loading");
  const [message, setMessage] = useState("");
  const [microphoneEnabled, setMicrophoneEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [cameraPending, setCameraPending] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const initializeMedia = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setMediaState("unsupported");
        setMessage("Camera and microphone are not supported in this browser.");
        return;
      }

      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        if (!devices.some((device) => device.kind === "videoinput") || !devices.some((device) => device.kind === "audioinput")) {
          setMediaState("unavailable");
          setMessage("No camera or microphone was found.");
          return;
        }

        const nextStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        if (cancelled) {
          nextStream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = nextStream;
        setStream(nextStream);
        setMicrophoneEnabled(true);
        setCameraEnabled(true);
        setCameraError("");
        setMediaState("ready");
        setMessage("");
      } catch (error) {
        if (cancelled) return;
        const errorName = error instanceof DOMException ? error.name : "";
        if (process.env.NODE_ENV === "development") console.warn("Local media initialization failed", errorName);
        if (errorName === "NotAllowedError" || errorName === "SecurityError") {
          setMediaState("denied");
          setMessage("Camera and microphone access is blocked in your browser settings.");
        } else if (errorName === "NotFoundError") {
          setMediaState("unavailable");
          setMessage("No camera or microphone was found.");
        } else {
          setMediaState("error");
          setMessage("We couldn't start your camera and microphone. Please try again.");
        }
      }
    };

    initializeMedia();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, [retryKey]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !stream || !cameraEnabled) return;

    videoElement.srcObject = stream;
    void videoElement.play().catch(() => {
      // Ignore the autoplay race; the video is muted and marked autoplay.
    });
  }, [stream, cameraEnabled]);

  useImperativeHandle(ref, () => ({
    getState: () => ({
      cameraEnabled: mediaState === "ready" && stream !== null && cameraEnabled,
      microphoneEnabled: mediaState === "ready" && stream !== null && microphoneEnabled,
    }),
    stop: () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setStream(null);
    },
  }), [cameraEnabled, mediaState, microphoneEnabled, stream]);

  function toggleMicrophone() {
    const nextEnabled = !microphoneEnabled;
    streamRef.current?.getAudioTracks().forEach((track) => { track.enabled = nextEnabled; });
    setMicrophoneEnabled(nextEnabled);
  }

  async function toggleCamera() {
    if (cameraPending) return;

    if (cameraEnabled) {
      streamRef.current?.getVideoTracks().forEach((track) => {
        track.stop();
        streamRef.current?.removeTrack(track);
      });
      setCameraEnabled(false);
      setCameraError("");
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Camera is not supported in this browser.");
      return;
    }

    setCameraPending(true);
    setCameraError("");
    try {
      const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      const videoTrack = cameraStream.getVideoTracks()[0];
      const currentStream = streamRef.current;
      if (!videoTrack || !currentStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
        setCameraError("We couldn't start your camera. Please try again.");
        return;
      }

      currentStream.getVideoTracks().forEach((track) => {
        track.stop();
        currentStream.removeTrack(track);
      });
      currentStream.addTrack(videoTrack);
      setStream(currentStream);
      setCameraEnabled(true);
    } catch (error) {
      const errorName = error instanceof DOMException ? error.name : "";
      if (errorName === "NotAllowedError" || errorName === "SecurityError") {
        setCameraError("Camera access was blocked.");
      } else if (errorName === "NotFoundError") {
        setCameraError("No camera was found.");
      } else {
        setCameraError("We couldn't start your camera. Please try again.");
      }
    } finally {
      setCameraPending(false);
    }
  }

  function retry() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setStream(null);
    setMediaState("loading");
    setMessage("");
    setCameraError("");
    setRetryKey((key) => key + 1);
  }

  const initials = displayName.trim().slice(0, 1).toUpperCase() || "N";
  const isReady = mediaState === "ready" && stream !== null;

  if (!isReady) {
    return (
      <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
        <div className="mx-auto flex min-h-44 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-5 text-sm text-slate-500">
          {mediaState === "loading" ? "Starting camera and microphone..." : message}
        </div>
        {mediaState !== "loading" && <button type="button" onClick={retry} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"><RefreshCw className="size-4" />Retry</button>}
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-slate-950">
        {cameraEnabled ? (
          <video ref={videoRef} autoPlay muted playsInline className="size-full object-cover mirror" />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-3 px-5 text-center text-white"><div className="flex size-20 items-center justify-center rounded-full bg-white/15 text-2xl font-semibold">{initials}</div><p className="font-medium">{displayName}</p><p className="text-sm text-slate-300">Camera off</p>{cameraError && <><p className="text-sm text-red-200">{cameraError}</p><button type="button" onClick={() => void toggleCamera()} disabled={cameraPending} className="rounded-lg bg-white/15 px-3 py-2 text-xs font-semibold text-white hover:bg-white/25">{cameraPending ? "Retrying..." : "Retry camera"}</button></>}</div>
        )}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <button type="button" onClick={toggleMicrophone} aria-label={microphoneEnabled ? "Turn microphone off" : "Turn microphone on"} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 hover:border-slate-300">{microphoneEnabled ? <Mic className="size-4" /> : <MicOff className="size-4" />}{microphoneEnabled ? "Mic on" : "Mic off"}</button>
        <button type="button" onClick={() => void toggleCamera()} disabled={cameraPending} aria-label={cameraEnabled ? "Turn camera off" : "Turn camera on"} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-60">{cameraEnabled ? <Camera className="size-4" /> : <CameraOff className="size-4" />}{cameraPending ? "Starting camera..." : cameraEnabled ? "Camera on" : "Camera off"}</button>
      </div>
    </div>
  );
});
