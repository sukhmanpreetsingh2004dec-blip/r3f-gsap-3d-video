import React, { useState, useRef, useEffect } from 'react';
import { Scene3D } from './components/Scene3D';
import { TimelineControls } from './components/TimelineControls';
import { useGsapTimeline, TOTAL_FRAMES } from './hooks/useGsapTimeline';
import { CanvasVideoRecorder } from './utils/videoRecorder';
import { Sparkles, Video, Layers, Terminal } from 'lucide-react';

declare global {
  interface Window {
    seekFrame?: (frame: number) => void;
    getTotalFrames?: () => number;
    renderComplete?: boolean;
  }
}

export default function App() {
  const {
    masterTimeline,
    timelineState,
    play,
    pause,
    togglePlayPause,
    seekProgress,
    seekFrame,
  } = useGsapTimeline();

  const [cameraMode, setCameraMode] = useState<'cinematic' | 'front'>('cinematic');
  const [isRecording, setIsRecording] = useState(false);
  const recorderRef = useRef<CanvasVideoRecorder>(new CanvasVideoRecorder());

  // Expose headless render hooks for Puppeteer / GitHub Actions Runner
  useEffect(() => {
    window.seekFrame = (frame: number) => {
      seekFrame(frame);
    };
    window.getTotalFrames = () => TOTAL_FRAMES;

    return () => {
      delete window.seekFrame;
      delete window.getTotalFrames;
    };
  }, [seekFrame]);

  const handleRewind = () => {
    pause();
    seekProgress(0);
  };

  const handleRecord = async () => {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    if (!canvas) {
      alert('Canvas element not ready');
      return;
    }

    if (isRecording) {
      recorderRef.current.stopRecording();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      handleRewind();
      await recorderRef.current.startRecording(canvas, 30);
      play();

      // Automatically stop recording when timeline completes (10 seconds)
      setTimeout(() => {
        recorderRef.current.stopRecording();
        setIsRecording(false);
      }, 10500);
    }
  };

  return (
    <div className="app-container">
      {/* Top Studio Header */}
      <header className="header">
        <div className="logo-group">
          <div className="logo-badge">R3F</div>
          <div className="title-text">
            <span>React Three Fiber</span>
            <div className="pipeline-pills">
              <span className="pill pill-highlight">Three.js</span>
              <span className="arrow">→</span>
              <span className="pill pill-highlight">GSAP</span>
              <span className="arrow">→</span>
              <span className="pill pill-highlight">3D Video</span>
            </div>
          </div>
        </div>

        <div className="badge-resolution">
          <div className="dot-live" />
          <span>720p @ 30 FPS • HEADLESS READY</span>
        </div>
      </header>

      {/* 720p Viewport Canvas */}
      <main className="viewport-area">
        <div className="video-frame-container">
          <Scene3D masterTimeline={masterTimeline} cameraMode={cameraMode} />
        </div>
      </main>

      {/* Timeline Controls */}
      <TimelineControls
        timelineState={timelineState}
        onTogglePlayPause={togglePlayPause}
        onSeekProgress={seekProgress}
        onRewind={handleRewind}
        onRecord={handleRecord}
        isRecording={isRecording}
        cameraMode={cameraMode}
        setCameraMode={setCameraMode}
      />
    </div>
  );
}
