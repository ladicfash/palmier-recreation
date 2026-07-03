"""End-to-end test for scene_importance module using a generated test video."""

import subprocess
import os
import json
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from scene_importance import score_scenes, extract_smart_clips, detect_motion, analyze_audio


def make_test_video(path: str, duration: int = 20):
    """Generate a test video with varying scenes (color bars + tone) via ffmpeg."""
    subprocess.run([
        "ffmpeg", "-y",
        "-f", "lavfi", "-i", f"testsrc=duration={duration}:size=320x240:rate=15",
        "-f", "lavfi", "-i", f"sine=frequency=440:duration={duration}",
        "-c:v", "libx264", "-preset", "ultrafast", "-c:a", "aac",
        path
    ], capture_output=True, timeout=60)
    return os.path.exists(path)


def main():
    video_path = "/tmp/test_smart_cut.mp4"
    print("1. Generating test video...")
    assert make_test_video(video_path), "Failed to generate test video"
    print("   OK")

    print("2. Testing motion detection...")
    motion, motion_ts = detect_motion(video_path)
    assert len(motion) > 0, "No motion scores"
    assert len(motion) == len(motion_ts), "Motion scores/timestamps mismatch"
    print(f"   OK: {len(motion)} samples, ts range {motion_ts[0]:.1f}-{motion_ts[-1]:.1f}s")

    print("3. Testing audio analysis...")
    audio, audio_ts, dur = analyze_audio(video_path)
    assert len(audio) > 0, "No audio scores"
    assert dur > 15, f"Duration wrong: {dur}"
    print(f"   OK: {len(audio)} samples, duration {dur:.1f}s")

    print("4. Testing scene scoring...")
    scenes = [{"id": i, "timestamp": i * 4.0, "confidence": 0.9} for i in range(5)]
    scored = score_scenes(video_path, scenes)
    assert len(scored) == 5
    for s in scored:
        assert 0 <= s["importance_score"] <= 100
        assert s["end"] > s["start"]
    print(f"   OK: scores = {[s['importance_score'] for s in scored]}")

    print("5. Testing smart clip extraction (target 10s)...")
    clips = extract_smart_clips(scored, 10)
    total = sum(c["clip_end"] - c["clip_start"] for c in clips)
    assert len(clips) > 0, "No clips selected"
    assert total <= 12, f"Total duration {total} exceeds target+tolerance"
    # Verify temporal order preserved
    starts = [c["clip_start"] for c in clips]
    assert starts == sorted(starts), "Clips not in temporal order"
    print(f"   OK: {len(clips)} clips, total {total:.1f}s, temporal order preserved")

    os.unlink(video_path)
    print("\nALL TESTS PASSED")


if __name__ == "__main__":
    main()
