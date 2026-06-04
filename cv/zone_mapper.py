import cv2
import json
import argparse

def get_zone_coordinates(video_path):
    # Read the first frame
    cap = cv2.VideoCapture(video_path)
    ret, frame = cap.read()
    cap.release()

    if not ret:
        print(f"Failed to open video: {video_path}")
        return

    # Resize for display if too large (1080p -> 720p)
    h, w = frame.shape[:2]
    if w > 1280:
        scale = 1280 / w
        frame = cv2.resize(frame, (int(w * scale), int(h * scale)))
    else:
        scale = 1.0

    points = []
    
    def mouse_callback(event, x, y, flags, param):
        if event == cv2.EVENT_LBUTTONDOWN:
            # Scale coordinates back to original video size
            orig_x, orig_y = int(x / scale), int(y / scale)
            points.append((orig_x, orig_y))
            
            # Draw on frame
            cv2.circle(frame, (x, y), 5, (0, 255, 0), -1)
            if len(points) > 1:
                # Draw line from previous point
                prev_x, prev_y = int(points[-2][0] * scale), int(points[-2][1] * scale)
                cv2.line(frame, (prev_x, prev_y), (x, y), (0, 255, 0), 2)
            cv2.imshow("Zone Mapper", frame)

    cv2.imshow("Zone Mapper", frame)
    cv2.setMouseCallback("Zone Mapper", mouse_callback)

    print("\n--- Zone Mapper Instructions ---")
    print("1. Click points on the image to draw a polygon.")
    print("2. Press 'c' to clear points.")
    print("3. Press 'Enter' or 'Space' to finish the zone and print coordinates.")
    print("4. Press 'q' or 'Esc' to exit.")

    while True:
        key = cv2.waitKey(1) & 0xFF
        if key == 27 or key == ord('q'): # Esc or q
            break
        elif key == ord('c'):
            points.clear()
            # Redraw original frame
            cap = cv2.VideoCapture(video_path)
            _, frame = cap.read()
            cap.release()
            if scale != 1.0:
                frame = cv2.resize(frame, (int(w * scale), int(h * scale)))
            cv2.imshow("Zone Mapper", frame)
            print("Points cleared.")
        elif key == 13 or key == 32: # Enter or Space
            print("\n✅ Final Polygon Coordinates (Copy this into your config):")
            print(json.dumps(points))
            print("\nYou can continue clicking to start a new zone, or press 'c' to clear the visual lines.")
            points.clear()

    cv2.destroyAllWindows()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Click on a video frame to map zone polygons.")
    parser.add_argument("video_path", help="Path to the video file")
    args = parser.parse_args()
    
    get_zone_coordinates(args.video_path)
