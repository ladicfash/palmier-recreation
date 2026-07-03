#!/usr/bin/env python3

"""
Scene Detection Module for PixelCraft
Uses PySceneDetect to detect scene changes in videos
"""

import sys
import json
from pathlib import Path
from scenedetect import detect, ContentDetector, AdaptiveDetector, ThresholdDetector

def detect_scenes(video_path: str, threshold: float = 27.0, method: str = "content") -> dict:
    """
    Detect scenes in a video file.
    
    Args:
        video_path: Path to video file
        threshold: Detection threshold (higher = fewer detections)
        method: Detection method - "content", "adaptive", or "threshold"
    
    Returns:
        Dictionary with detected scenes and metadata
    """
    try:
        # Validate file exists
        if not Path(video_path).exists():
            return {
                "success": False,
                "error": f"Video file not found: {video_path}",
                "scenes": []
            }

        # Select detection method
        if method == "adaptive":
            detector = AdaptiveDetector()
        elif method == "threshold":
            detector = ThresholdDetector(threshold=threshold)
        else:  # content (default)
            detector = ContentDetector(threshold=threshold)

        # Detect scenes
        scenes = detect(video_path, detector)
        
        # Convert to JSON-serializable format
        # PySceneDetect returns (start_timecode, end_timecode) tuples per scene
        scene_list = []
        total_scenes = len(scenes)
        for i, scene in enumerate(scenes):
            start_tc = scene[0]
            start_time = start_tc.get_seconds() if hasattr(start_tc, 'get_seconds') else float(start_tc)
            # Estimate confidence: scenes at start/end are less reliable, middle scenes are more confident
            # Use a simple heuristic: confidence decays slightly for first/last 20% of scenes
            if total_scenes <= 1:
                confidence = 1.0
            else:
                relative_pos = i / (total_scenes - 1)  # 0.0 to 1.0
                # Bell curve: highest confidence in middle, slightly lower at edges
                confidence = round(0.7 + 0.3 * (1 - abs(relative_pos - 0.5) * 2), 3)
            scene_list.append({
                "id": i,
                "timestamp": round(start_time, 2),
                "frame": int(start_tc) if isinstance(start_tc, (int, float)) else 0,
                "confidence": confidence
            })

        return {
            "success": True,
            "scenes": scene_list,
            "scene_count": len(scene_list),
            "method": method,
            "threshold": threshold
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "scenes": []
        }


def main():
    """CLI interface for scene detection"""
    if len(sys.argv) < 2:
        print(json.dumps({
            "success": False,
            "error": "Usage: python scene_detection.py <video_path> [threshold] [method]"
        }))
        sys.exit(1)

    video_path = sys.argv[1]
    threshold = float(sys.argv[2]) if len(sys.argv) > 2 else 27.0
    method = sys.argv[3] if len(sys.argv) > 3 else "content"

    result = detect_scenes(video_path, threshold, method)
    print(json.dumps(result))


if __name__ == "__main__":
    main()
