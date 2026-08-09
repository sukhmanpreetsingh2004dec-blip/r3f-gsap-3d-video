import React from 'react';
import { Play, Pause, RotateCcw, Video, Camera, Sparkles, Monitor } from 'lucide-react';
import { TimelineState } from '../hooks/useGsapTimeline';

interface TimelineControlsProps {
  timelineState: TimelineState;
  onTogglePlayPause: () => void;
  onSeekProgress: (progress: number) => void;
  onRewind: () => void;
  onRecord: () => void;
  isRecording: boolean;
  cameraMode: 'cinematic' | 'front';
  setCameraMode: (mode: 'cinematic' | 'front') => void;
}

export function TimelineControls({
  timelineState,
  onTogglePlayPause,
  onSeekProgress,
  onRewind,
  onRecord,
  isRecording,
  cameraMode,
  setCameraMode,
}: TimelineControlsProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;
  };

  const handleScrubberClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newProgress = clickX / rect.width;
    onSeekProgress(newProgress);
  };

  return (
    <div className="controls-bar">
      {/* Scrubber Track */}
      <div className="scrubber-container">
        <div className="time-display">
          {formatTime(timelineState.currentTime)} / {formatTime(timelineState.totalDuration)}
        </div>

        <div className="scrubber-track" onClick={handleScrubberClick}>
          <div
            className="scrubber-progress"
            style={{ width: `${timelineState.progress * 100}%` }}
          />
        </div>

        <div className="time-display" style={{ textAlign: 'right', color: 'var(--text-muted)' }}>
          FRAME {String(timelineState.currentFrame).padStart(3, '0')} / {timelineState.totalFrames}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="controls-actions">
        <div className="btn-group">
          <button className="btn-icon" onClick={onRewind} title="Rewind to Start">
            <RotateCcw size={16} />
          </button>

          <button className="btn-icon btn-primary" onClick={onTogglePlayPause}>
            {timelineState.isPlaying ? <Pause size={18} /> : <Play size={18} />}
            <span>{timelineState.isPlaying ? 'PAUSE' : 'PLAY'}</span>
          </button>

          <button
            className={`btn-icon ${cameraMode === 'cinematic' ? 'btn-active' : ''}`}
            onClick={() => setCameraMode(cameraMode === 'cinematic' ? 'front' : 'cinematic')}
          >
            <Camera size={15} />
            <span>CAM: {cameraMode.toUpperCase()}</span>
          </button>
        </div>

        <div className="meta-stats">
          <div className="stat-item">
            <Monitor size={14} color="var(--accent-cyan)" />
            <span>RES:</span>
            <span className="stat-val">1280x720 (720p)</span>
          </div>

          <div className="stat-item">
            <Sparkles size={14} color="var(--accent-pink)" />
            <span>FPS:</span>
            <span className="stat-val">30 FPS</span>
          </div>
        </div>

        <div className="btn-group">
          <button
            className={`btn-icon btn-primary ${isRecording ? 'recording' : ''}`}
            onClick={onRecord}
            style={{
              background: isRecording
                ? 'linear-gradient(135deg, #ff0055, #ff5500)'
                : undefined,
            }}
          >
            <Video size={16} />
            <span>{isRecording ? 'RECORDING (720p)...' : 'EXPORT 3D VIDEO'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
