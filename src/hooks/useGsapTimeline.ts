import { useRef, useState, useEffect, useCallback } from 'react';
import gsap from 'gsap';

export interface TimelineState {
  isPlaying: boolean;
  currentTime: number; // in seconds
  currentFrame: number;
  totalDuration: number; // in seconds
  totalFrames: number;
  progress: number; // 0 to 1
  fps: number;
}

export const DURATION_SECONDS = 10;
export const TARGET_FPS = 30;
export const TOTAL_FRAMES = DURATION_SECONDS * TARGET_FPS;

export function useGsapTimeline() {
  const masterTimeline = useRef<gsap.core.Timeline | null>(null);
  const [timelineState, setTimelineState] = useState<TimelineState>({
    isPlaying: false,
    currentTime: 0,
    currentFrame: 0,
    totalDuration: DURATION_SECONDS,
    totalFrames: TOTAL_FRAMES,
    progress: 0,
    fps: TARGET_FPS,
  });

  const requestRef = useRef<number | null>(null);

  // Initialize GSAP Timeline
  useEffect(() => {
    const tl = gsap.timeline({
      paused: true,
      defaults: { ease: 'power2.inOut' },
      onUpdate: () => {
        if (!masterTimeline.current) return;
        const prog = masterTimeline.current.progress();
        const time = masterTimeline.current.time();
        const frame = Math.floor(prog * TOTAL_FRAMES);

        setTimelineState((prev) => ({
          ...prev,
          currentTime: time,
          currentFrame: frame,
          progress: prog,
        }));
      },
      onComplete: () => {
        setTimelineState((prev) => ({ ...prev, isPlaying: false }));
      },
    });

    masterTimeline.current = tl;

    return () => {
      tl.kill();
    };
  }, []);

  const play = useCallback(() => {
    if (!masterTimeline.current) return;
    if (masterTimeline.current.progress() >= 1) {
      masterTimeline.current.restart();
    } else {
      masterTimeline.current.play();
    }
    setTimelineState((prev) => ({ ...prev, isPlaying: true }));
  }, []);

  const pause = useCallback(() => {
    if (!masterTimeline.current) return;
    masterTimeline.current.pause();
    setTimelineState((prev) => ({ ...prev, isPlaying: false }));
  }, []);

  const togglePlayPause = useCallback(() => {
    if (timelineState.isPlaying) {
      pause();
    } else {
      play();
    }
  }, [timelineState.isPlaying, play, pause]);

  const seekProgress = useCallback((progress: number) => {
    if (!masterTimeline.current) return;
    const clampedProgress = Math.max(0, Math.min(1, progress));
    masterTimeline.current.progress(clampedProgress);
    const time = clampedProgress * DURATION_SECONDS;
    const frame = Math.floor(clampedProgress * TOTAL_FRAMES);

    setTimelineState((prev) => ({
      ...prev,
      currentTime: time,
      currentFrame: frame,
      progress: clampedProgress,
    }));
  }, []);

  const seekFrame = useCallback((frame: number) => {
    if (!masterTimeline.current) return;
    const clampedFrame = Math.max(0, Math.min(TOTAL_FRAMES, frame));
    const progress = clampedFrame / TOTAL_FRAMES;
    seekProgress(progress);
  }, [seekProgress]);

  return {
    masterTimeline,
    timelineState,
    play,
    pause,
    togglePlayPause,
    seekProgress,
    seekFrame,
  };
}
