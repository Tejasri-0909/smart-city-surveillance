# Media Files Required

To complete the Smart City Surveillance system, please add these files to the `frontend/public/` directory:

## Required Files:

1. **cctv-sample.mp4** - Sample CCTV footage for camera feeds
   - Place in: `frontend/public/cctv-sample.mp4`
   - Format: MP4 video file
   - Recommended: 30-60 seconds loop of surveillance footage

2. **alarm.mp3** - Alert sound for notifications
   - Place in: `frontend/public/alarm.mp3`
   - Format: MP3 audio file
   - Recommended: 2-3 second alert/alarm sound

## Usage:
- The video will be used in camera feeds across the dashboard and live monitoring
- The audio will play when alerts are triggered
- Both files are referenced in the code but need to be manually added

## Fallback:
- If video file is missing, camera placeholders will show
- If audio file is missing, alerts will work silently