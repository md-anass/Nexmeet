"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Camera, CameraOff, Mic, MicOff, RefreshCw } from "lucide-react";
import { readMediaPreferences, writeMediaPreferences } from "@/lib/media-preferences";
import styles from "./prejoin-media-preview.module.css";

type MediaState = "loading" | "ready" | "denied" | "unavailable" | "unsupported" | "error";

export type PrejoinMediaHandle = {
  getState: () => { cameraEnabled: boolean; microphoneEnabled: boolean };
  stop: () => void;
};

export const PrejoinMediaPreview = forwardRef<PrejoinMediaHandle, { displayName: string; meetingCode: string }>(function PrejoinMediaPreview({ displayName, meetingCode }, ref) {
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
      const preferences = readMediaPreferences(meetingCode);
      setCameraEnabled(preferences.cameraEnabled);
      setMicrophoneEnabled(preferences.microphoneEnabled);
      if (!navigator.mediaDevices?.getUserMedia) {
        setMediaState("unsupported");
        setMessage("Camera and microphone are not supported in this browser.");
        return;
      }

      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        if ((preferences.cameraEnabled && !devices.some((device) => device.kind === "videoinput")) ||
          (preferences.microphoneEnabled && !devices.some((device) => device.kind === "audioinput"))) {
          setMediaState("unavailable");
          setMessage("No camera or microphone was found.");
          return;
        }

        const nextStream = preferences.cameraEnabled || preferences.microphoneEnabled
          ? await navigator.mediaDevices.getUserMedia({ audio: preferences.microphoneEnabled, video: preferences.cameraEnabled })
          : new MediaStream();
        if (cancelled) {
          nextStream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = nextStream;
        setStream(nextStream);
        setMicrophoneEnabled(preferences.microphoneEnabled);
        setCameraEnabled(preferences.cameraEnabled);
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
  }, [meetingCode, retryKey]);

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

  async function toggleMicrophone() {
    const nextEnabled = !microphoneEnabled;
    const currentStream = streamRef.current;
    if (nextEnabled && currentStream && currentStream.getAudioTracks().length === 0) {
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        const audioTrack = audioStream.getAudioTracks()[0];
        if (!audioTrack) return;
        currentStream.addTrack(audioTrack);
        setStream(currentStream);
      } catch {
        return;
      }
    } else {
      currentStream?.getAudioTracks().forEach((track) => { track.enabled = nextEnabled; });
    }
    setMicrophoneEnabled(nextEnabled);
    writeMediaPreferences(meetingCode, { cameraEnabled, microphoneEnabled: nextEnabled });
  }

  async function toggleCamera() {
    if (cameraPending) return;

    if (cameraEnabled) {
      streamRef.current?.getVideoTracks().forEach((track) => {
        track.stop();
        streamRef.current?.removeTrack(track);
      });
      setCameraEnabled(false);
      writeMediaPreferences(meetingCode, { cameraEnabled: false, microphoneEnabled });
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
      writeMediaPreferences(meetingCode, { cameraEnabled: true, microphoneEnabled });
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
      <div className={styles.loadingPanel}>
        <div className={styles.loadingFrame}>
          {mediaState === "loading" ? "Starting camera and microphone..." : message}
        </div>
        {mediaState !== "loading" && <button type="button" onClick={retry} className={styles.retry}><RefreshCw aria-hidden="true" />Retry</button>}
      </div>
    );
  }

  return (
    <div className={styles.preview}>
      <div className={styles.videoFrame}>
        {cameraEnabled ? (
          <video ref={videoRef} autoPlay muted playsInline className={`${styles.video} mirror`} />
        ) : (
          <div className={styles.cameraOff}><div className={styles.avatar}>{initials}</div><p className={styles.cameraOffName}>{displayName}</p><p className={styles.cameraOffText}>Camera off</p>{cameraError && <><p className={styles.cameraError}>{cameraError}</p><button type="button" onClick={() => void toggleCamera()} disabled={cameraPending} className={styles.retrySmall}>{cameraPending ? "Retrying..." : "Retry camera"}</button></>}</div>
        )}
        {cameraEnabled && <span className={styles.namePill}>{displayName}</span>}
      </div>
      <div className={styles.controls}>
        <button type="button" onClick={() => void toggleMicrophone()} aria-label={microphoneEnabled ? "Turn microphone off" : "Turn microphone on"} className={`${styles.control} ${!microphoneEnabled ? styles.controlOff : ""}`}>{microphoneEnabled ? <Mic aria-hidden="true" /> : <MicOff aria-hidden="true" />}{microphoneEnabled ? "Mic on" : "Mic off"}</button>
        <button type="button" onClick={() => void toggleCamera()} disabled={cameraPending} aria-label={cameraEnabled ? "Turn camera off" : "Turn camera on"} className={`${styles.control} ${!cameraEnabled ? styles.controlOff : ""}`}>{cameraEnabled ? <Camera aria-hidden="true" /> : <CameraOff aria-hidden="true" />}{cameraPending ? "Starting camera..." : cameraEnabled ? "Camera on" : "Camera off"}</button>
      </div>
    </div>
  );
});
