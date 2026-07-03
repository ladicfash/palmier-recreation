"""
Scene Importance Scoring Module

Scores scenes based on:
1. Motion detection (frame-to-frame pixel changes)
2. Audio analysis (RMS energy)
3. Scene duration (dynamic pacing)
4. Temporal weighting (middle scenes higher score)

Time alignment: motion and audio scores are stored with their real timestamps
so scene timestamps can be mapped correctly regardless of sampling rates.
"""

import cv2
import numpy as np
import json
import os
import tempfile
import subprocess
from typing import List, Dict, Tuple

try:
    import librosa
    HAS_LIBROSA = True
except ImportError:
    HAS_LIBROSA = False


def extract_audio(video_path: str) -> str:
    """Extract audio from video to a unique temp WAV file. Returns path or None."""
    fd, output_audio_path = tempfile.mkstemp(suffix=".wav", prefix="pixelcraft_audio_")
    os.close(fd)
    try:
        result = subprocess.run(
            ["ffmpeg", "-y", "-i", video_path, "-vn", "-ac", "1", "-ar", "22050", output_audio_path],
            capture_output=True,
            timeout=120
        )
        if result.returncode != 0 or not os.path.exists(output_audio_path) or os.path.getsize(output_audio_path) == 0:
            if os.path.exists(output_audio_path):
                os.unlink(output_audio_path)
            return None
        return output_audio_path
    except Exception:
        if os.path.exists(output_audio_path):
            os.unlink(output_audio_path)
        return None


def detect_motion(video_path: str, sample_rate: int = 5) -> Tuple[List[float], List[float]]:
    """
    Detect motion via frame-to-frame pixel differences.

    Returns:
        (motion_scores, motion_timestamps) - parallel lists, timestamps in seconds
    """
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        return [], []

    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    motion_scores: List[float] = []
    motion_timestamps: List[float] = []
    prev_frame = None
    frame_idx = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break
        if frame_idx % sample_rate == 0:
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            gray = cv2.resize(gray, (320, 240))
            if prev_frame is not None:
                diff = cv2.absdiff(prev_frame, gray)
                score = float(np.sum(diff)) / (320 * 240 * 255)
                motion_scores.append(min(score, 1.0))
                motion_timestamps.append(frame_idx / fps)
            prev_frame = gray
        frame_idx += 1

    cap.release()
    return motion_scores, motion_timestamps


def analyze_audio(video_path: str) -> Tuple[List[float], List[float], float]:
    """
    Analyze audio RMS energy.

    Returns:
        (energy_scores, energy_timestamps, duration) - normalized 0-1 scores with real timestamps
    """
    if not HAS_LIBROSA:
        return [], [], 0.0

    audio_path = extract_audio(video_path)
    if not audio_path:
        return [], [], 0.0

    try:
        y, sr = librosa.load(audio_path, sr=22050)
        duration = float(librosa.get_duration(y=y, sr=sr))

        hop_length = 512
        energy = librosa.feature.rms(y=y, hop_length=hop_length)[0]
        timestamps = librosa.frames_to_time(np.arange(len(energy)), sr=sr, hop_length=hop_length)

        if len(energy) > 0:
            e_min, e_max = float(np.min(energy)), float(np.max(energy))
            if e_max > e_min:
                energy_norm = (energy - e_min) / (e_max - e_min)
            else:
                energy_norm = np.zeros_like(energy)
        else:
            energy_norm = np.array([])

        return energy_norm.tolist(), timestamps.tolist(), duration
    except Exception:
        return [], [], 0.0
    finally:
        if audio_path and os.path.exists(audio_path):
            os.unlink(audio_path)


def _avg_in_window(scores: List[float], timestamps: List[float], start: float, end: float, default: float = 0.5) -> float:
    """Average scores whose timestamps fall within [start, end)."""
    if not scores or not timestamps:
        return default
    vals = [s for s, t in zip(scores, timestamps) if start <= t < end]
    if not vals:
        # fall back to nearest sample
        nearest_idx = min(range(len(timestamps)), key=lambda i: abs(timestamps[i] - start))
        return scores[nearest_idx]
    return float(np.mean(vals))


def get_video_duration(video_path: str) -> float:
    """Get video duration in seconds via OpenCV."""
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        return 0.0
    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    frames = cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0
    cap.release()
    return frames / fps if fps > 0 else 0.0


def score_scenes(video_path: str, scenes: List[Dict]) -> List[Dict]:
    """
    Score each scene using time-aligned motion and audio windows.

    Each scene gets real start/end boundaries: start = its timestamp,
    end = next scene's timestamp (or video duration for the last scene).

    Returns scenes with importance_score (0-100) and real start/end/duration.
    """
    motion_scores, motion_ts = detect_motion(video_path)
    audio_scores, audio_ts, audio_duration = analyze_audio(video_path)
    video_duration = get_video_duration(video_path) or audio_duration

    # Sort scenes by timestamp to compute real boundaries
    scenes_sorted = sorted(scenes, key=lambda s: s.get("timestamp", 0))
    total_scenes = len(scenes_sorted)
    scored_scenes = []

    for i, scene in enumerate(scenes_sorted):
        start = float(scene.get("timestamp", 0))
        if i < total_scenes - 1:
            end = float(scenes_sorted[i + 1].get("timestamp", video_duration))
        else:
            end = video_duration if video_duration > start else start + 3.0
        scene_duration = max(end - start, 0.1)

        # Motion score: average motion within the scene window (0-100)
        motion_score = _avg_in_window(motion_scores, motion_ts, start, end) * 100

        # Audio score: average RMS energy within the scene window (0-100)
        audio_score = _avg_in_window(audio_scores, audio_ts, start, end) * 100

        # Duration score: sweet spot 2-5 seconds
        if scene_duration < 0.5:
            duration_score = 30.0
        elif scene_duration > 10:
            duration_score = 40.0
        else:
            duration_score = 60 + max(0, 40 * (1 - abs(scene_duration - 3.5) / 3.5))

        # Temporal score: bell curve, middle scenes higher
        if total_scenes <= 1:
            temporal_score = 50.0
        else:
            rel = i / (total_scenes - 1)
            temporal_score = 50 + 50 * (1 - abs(rel - 0.5) * 2)

        importance = (
            motion_score * 0.3 +
            audio_score * 0.2 +
            duration_score * 0.25 +
            temporal_score * 0.25
        )

        scored_scenes.append({
            **scene,
            "start": round(start, 2),
            "end": round(end, 2),
            "duration": round(scene_duration, 2),
            "importance_score": round(importance, 2),
            "motion_score": round(motion_score, 2),
            "audio_score": round(audio_score, 2),
            "duration_score": round(duration_score, 2),
            "temporal_score": round(temporal_score, 2),
        })

    return scored_scenes


def extract_smart_clips(scenes: List[Dict], target_duration: float) -> List[Dict]:
    """
    Select the most important scenes to fit target duration, using REAL scene durations.

    Greedy selection by importance, but each scene contributes its actual duration
    (capped at 15s per scene so one long scene doesn't consume the whole budget).

    Returns selected scenes sorted by timestamp (narrative order preserved),
    each with clip_start / clip_end fields for exact cutting.
    """
    MAX_SCENE_CONTRIBUTION = 15.0

    sorted_by_importance = sorted(scenes, key=lambda s: s.get("importance_score", 0), reverse=True)

    selected = []
    total = 0.0

    for scene in sorted_by_importance:
        real_dur = float(scene.get("duration", 3.0))
        contribution = min(real_dur, MAX_SCENE_CONTRIBUTION)

        if total + contribution <= target_duration:
            start = float(scene.get("start", scene.get("timestamp", 0)))
            clip = {
                **scene,
                "clip_start": round(start, 2),
                "clip_end": round(start + contribution, 2),
            }
            selected.append(clip)
            total += contribution

        if total >= target_duration * 0.95:
            break

    # If we still have budget and skipped scenes, take partial cuts of remaining top scenes
    if total < target_duration * 0.8:
        for scene in sorted_by_importance:
            if any(s.get("id") == scene.get("id") for s in selected):
                continue
            remaining = target_duration - total
            if remaining < 1.0:
                break
            real_dur = float(scene.get("duration", 3.0))
            take = min(real_dur, remaining, MAX_SCENE_CONTRIBUTION)
            start = float(scene.get("start", scene.get("timestamp", 0)))
            selected.append({
                **scene,
                "clip_start": round(start, 2),
                "clip_end": round(start + take, 2),
            })
            total += take

    return sorted(selected, key=lambda s: s.get("clip_start", s.get("timestamp", 0)))
