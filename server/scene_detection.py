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
        scene_list = []
        for i, scene in enumerate(scenes):
            # scene is a tuple of (start_frame, start_time)
            start_time = scene[0].get_seconds() if hasattr(scene[0], 'get_seconds') else float(scene[0])
            scene_list.append({
                "id": i,
                "timestamp": round(start_time, 2),
                "frame": int(scene[0]) if isinstance(scene[0], (int, float)) else 0,
                "confidence": 1.0  # PySceneDetect doesn't return confidence, default to 1.0
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
