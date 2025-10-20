from moviepy import VideoFileClip
import numpy as np

# Load the video
clip = VideoFileClip("vee01.webm")

def key_white(frame):
    # Convert RGB frame to RGBA with alpha based on distance from white
    h, w, _ = frame.shape
    rgba = np.zeros((h, w, 4), dtype=np.uint8)
    rgba[:, :, :3] = frame
    
    # Calculate Euclidean distance from white (255,255,255)
    dist = np.sqrt(np.sum((frame.astype(np.float32) - 255)**2, axis=2))
    
    # Set alpha: 0 for pixels close to white (background), 255 for others
    alpha = np.where(dist < 30, 0, 255).astype(np.uint8)  # Adjust threshold as needed
    rgba[:, :, 3] = alpha
    
    return rgba

# Apply the keying filter
clip_with_alpha = clip.image_transform(key_white)

# Write to WebM with alpha support
clip_with_alpha.write_videofile(
    "vee01_alpha.webm", 
    codec='libvpx', 
    ffmpeg_params=['-auto-alt-ref', '0', '-pix_fmt', 'yuva420p']
)

print("Processed video saved as vee01_alpha.webm")