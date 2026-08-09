import puppeteer from 'puppeteer-core';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FRAMES_DIR = path.join(__dirname, '../build/frames');
const OUTPUT_VIDEO = path.join(__dirname, '../build/rendered_video_720p_30fps.mp4');
const WIDTH = 1280;
const HEIGHT = 720;
const FPS = 30;

function findChromePath() {
  const possiblePaths = [
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    process.env.CHROME_BIN,
  ];

  for (const p of possiblePaths) {
    if (p && fs.existsSync(p)) {
      return p;
    }
  }
  return undefined;
}

async function renderVideo() {
  console.log('🚀 Starting 720p @ 30 FPS Headless 3D Video Render...');

  const executablePath = findChromePath();
  console.log(`🌐 Using Chrome Binary: ${executablePath || 'Default'}`);

  if (fs.existsSync(FRAMES_DIR)) {
    fs.rmSync(FRAMES_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(FRAMES_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--enable-webgl',
      '--use-gl=angle',
      '--ignore-gpu-blocklist',
      `--window-size=${WIDTH},${HEIGHT}`,
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT });

  console.log('🌐 Loading R3F + GSAP app on http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  await page.waitForSelector('canvas');
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const totalFrames = await page.evaluate(() => window.getTotalFrames ? window.getTotalFrames() : 300);
  console.log(`🎬 Capturing ${totalFrames} frames at 720p (1280x720) 30 FPS...`);

  for (let frame = 0; frame <= totalFrames; frame++) {
    await page.evaluate((f) => {
      if (window.seekFrame) {
        window.seekFrame(f);
      }
    }, frame);

    await new Promise((resolve) => setTimeout(resolve, 50));

    const frameName = `frame_${String(frame).padStart(4, '0')}.png`;
    const framePath = path.join(FRAMES_DIR, frameName);

    const canvasElement = await page.$('.video-frame-container canvas');
    if (canvasElement) {
      await canvasElement.screenshot({ path: framePath, type: 'png' });
    } else {
      await page.screenshot({ path: framePath, type: 'png' });
    }

    if (frame % 30 === 0 || frame === totalFrames) {
      const pct = Math.round((frame / totalFrames) * 100);
      console.log(`📸 Rendered frame ${frame}/${totalFrames} (${pct}%)`);
    }
  }

  await browser.close();
  console.log('✅ Frame capture complete! Encoding MP4 video with FFmpeg...');

  try {
    const ffmpegCmd = `ffmpeg -y -framerate ${FPS} -i "${FRAMES_DIR}/frame_%04d.png" -c:v libx264 -pix_fmt yuv420p -crf 18 "${OUTPUT_VIDEO}"`;
    execSync(ffmpegCmd, { stdio: 'inherit' });
    console.log(`🎉 3D Animated Video rendered successfully: ${OUTPUT_VIDEO}`);
  } catch (err) {
    console.warn('⚠️ FFmpeg encoding note:', err.message);
  }
}

renderVideo().catch(console.error);
