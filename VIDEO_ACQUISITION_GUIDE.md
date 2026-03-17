# Video Acquisition Guide for CCTV Footage

## Overview
To complete the Smart City Surveillance System, you need to obtain realistic CCTV-style footage for each camera location. The system is already configured to load these videos automatically.

## Required Videos

### File Structure
Place all videos in: `frontend/public/cctv/`

### File Names (EXACT MATCH REQUIRED)
- `cam1.mp4` - City Center
- `cam2.mp4` - Metro Station  
- `cam3.mp4` - Airport Gate
- `cam4.mp4` - Shopping Mall
- `cam5.mp4` - Park Entrance
- `cam6.mp4` - Highway Bridge

## Video Specifications

### Technical Requirements
- **Format**: MP4 (H.264 codec recommended)
- **Resolution**: 720p (1280x720) minimum, 1080p preferred
- **Duration**: 30-120 seconds (will loop continuously)
- **File Size**: Under 50MB each for optimal web performance
- **Frame Rate**: 24-30 fps
- **Audio**: Not required (videos will be muted)

### Content Requirements

#### CAM001 - City Center (`cam1.mp4`)
- Urban street scene with traffic
- Pedestrians crossing streets
- City buildings in background
- Daytime or evening lighting
- Fixed camera angle (surveillance perspective)

#### CAM002 - Metro Station (`cam2.mp4`)
- Subway/train station platform or corridor
- Passengers walking, waiting
- Transit environment
- Indoor lighting
- Overhead or side-angle view

#### CAM003 - Airport Gate (`cam3.mp4`)
- Airport terminal interior
- Passengers with luggage
- Gate area or terminal corridor
- Airport signage visible
- Wide-angle surveillance view

#### CAM004 - Shopping Mall (`cam4.mp4`)
- Mall corridor or atrium
- Shoppers walking with bags
- Retail storefronts visible
- Indoor mall lighting
- Elevated camera perspective

#### CAM005 - Park Entrance (`cam5.mp4`)
- Park pathway or entrance
- People walking, jogging, cycling
- Trees and outdoor environment
- Natural lighting
- Fixed surveillance angle

#### CAM006 - Highway Bridge (`cam6.mp4`)
- Highway or bridge traffic view
- Multiple vehicles moving
- Road infrastructure visible
- Traffic flow patterns
- Elevated traffic camera perspective

## Legal Video Sources

### Free Sources (with proper attribution)
1. **Pexels** (pexels.com)
   - Free for commercial use
   - Attribution appreciated but not required
   - High-quality stock footage

2. **Pixabay** (pixabay.com)
   - Free for commercial use
   - No attribution required
   - Various video qualities available

3. **Unsplash** (unsplash.com)
   - Free for commercial use
   - No attribution required
   - Limited video selection

### Paid Sources (with licensing)
1. **Shutterstock**
2. **Getty Images**
3. **Adobe Stock**
4. **Pond5**

## Acquisition Process

### Step 1: Download Videos
1. Visit your chosen source (e.g., Pexels)
2. Search for relevant terms:
   - "city traffic surveillance"
   - "metro station cctv"
   - "airport terminal crowd"
   - "shopping mall people"
   - "park walkway"
   - "highway traffic camera"

### Step 2: Download and Convert
1. Download videos in MP4 format
2. If needed, convert using tools like:
   - FFmpeg (free, command-line)
   - HandBrake (free, GUI)
   - Online converters

### Step 3: Optimize for Web
```bash
# Example FFmpeg command to optimize:
ffmpeg -i input.mp4 -vcodec h264 -acodec aac -vb 2M -maxrate 2M -bufsize 1M -vf scale=1280:720 -t 60 output.mp4
```

### Step 4: Rename and Place Files
1. Rename downloaded files to exact names:
   - `cam1.mp4`, `cam2.mp4`, etc.
2. Place in `frontend/public/cctv/` directory
3. Replace the placeholder files

## Testing

### After placing videos:
1. Start the development server
2. Navigate to Dashboard or Live CCTV Monitoring
3. Verify each camera shows appropriate footage
4. Check that videos loop continuously
5. Ensure all 6 cameras load properly

### Troubleshooting:
- **Video not loading**: Check file name spelling and format
- **Poor performance**: Reduce file size or resolution
- **Not looping**: Ensure MP4 format with proper encoding

## Legal Compliance

### Important Notes:
- Always verify licensing terms
- Keep records of video sources and licenses
- Ensure commercial use is permitted
- Provide attribution where required
- Respect copyright and usage restrictions

### Attribution Example (if required):
```
Video by [Creator Name] from Pexels
```

## Final Result

Once all videos are in place, your Smart City Surveillance System will display:
- Realistic CCTV footage for each location
- Continuous looping surveillance feeds
- Professional command center appearance
- Location-appropriate content for each camera

The system will automatically detect and load the new videos without any code changes needed.