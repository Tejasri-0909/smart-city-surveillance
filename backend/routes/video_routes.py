"""
Video Analysis API Routes
Handles video upload and real AI analysis using YOLO
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
import tempfile
import os
import logging
from pathlib import Path
import aiofiles
from typing import Dict, Any
import uuid
from datetime import datetime

from ai_video_analyzer import analyze_uploaded_video

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# Store analysis results temporarily (in production, use Redis or database)
analysis_results = {}

@router.post("/upload-and-analyze")
async def upload_and_analyze_video(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
) -> Dict[str, Any]:
    """
    Upload video file and perform real AI analysis
    
    Args:
        file: Uploaded video file
        
    Returns:
        Analysis job ID and status
    """
    
    # Validate file type
    allowed_types = ['video/mp4', 'video/avi', 'video/mov', 'video/webm', 'video/quicktime']
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported file type: {file.content_type}. Supported: {', '.join(allowed_types)}"
        )
    
    # Validate file size (max 100MB)
    max_size = 100 * 1024 * 1024  # 100MB
    file_size = 0
    
    try:
        # Generate unique job ID
        job_id = str(uuid.uuid4())
        
        # Create temporary file
        temp_dir = tempfile.gettempdir()
        file_extension = Path(file.filename).suffix
        temp_file_path = os.path.join(temp_dir, f"video_{job_id}{file_extension}")
        
        logger.info(f"📹 Uploading video: {file.filename} (Job ID: {job_id})")
        
        # Save uploaded file
        async with aiofiles.open(temp_file_path, 'wb') as temp_file:
            while chunk := await file.read(8192):  # Read in 8KB chunks
                file_size += len(chunk)
                
                # Check file size limit
                if file_size > max_size:
                    os.unlink(temp_file_path)  # Delete partial file
                    raise HTTPException(
                        status_code=413,
                        detail=f"File too large. Maximum size: {max_size // (1024*1024)}MB"
                    )
                
                await temp_file.write(chunk)
        
        logger.info(f"✅ Video uploaded successfully: {file_size / (1024*1024):.2f}MB")
        
        # Initialize analysis status
        analysis_results[job_id] = {
            'status': 'processing',
            'progress': 0,
            'message': 'Starting AI analysis...',
            'filename': file.filename,
            'file_size': file_size,
            'started_at': datetime.now().isoformat(),
            'results': None
        }
        
        # Start background analysis
        background_tasks.add_task(perform_analysis, job_id, temp_file_path)
        
        return {
            'job_id': job_id,
            'status': 'processing',
            'message': 'Video uploaded successfully. AI analysis started.',
            'filename': file.filename,
            'file_size_mb': round(file_size / (1024*1024), 2)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Video upload failed: {e}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@router.get("/analysis-status/{job_id}")
async def get_analysis_status(job_id: str) -> Dict[str, Any]:
    """
    Get analysis status and results
    
    Args:
        job_id: Analysis job ID
        
    Returns:
        Analysis status and results
    """
    
    if job_id not in analysis_results:
        raise HTTPException(status_code=404, detail="Analysis job not found")
    
    result = analysis_results[job_id]
    
    return {
        'job_id': job_id,
        'status': result['status'],
        'progress': result['progress'],
        'message': result['message'],
        'filename': result['filename'],
        'started_at': result['started_at'],
        'completed_at': result.get('completed_at'),
        'results': result['results']
    }

@router.post("/analyze-video")
async def analyze_video_direct(file: UploadFile = File(...)) -> Dict[str, Any]:
    """
    Direct video analysis (synchronous) - for smaller files
    
    Args:
        file: Uploaded video file
        
    Returns:
        Complete analysis results
    """
    
    # Validate file type and size
    allowed_types = ['video/mp4', 'video/avi', 'video/mov', 'video/webm']
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported file type: {file.content_type}"
        )
    
    # Size limit for direct analysis (25MB)
    max_size = 25 * 1024 * 1024
    
    try:
        # Create temporary file
        temp_dir = tempfile.gettempdir()
        file_extension = Path(file.filename).suffix
        temp_file_path = os.path.join(temp_dir, f"direct_analysis_{uuid.uuid4()}{file_extension}")
        
        logger.info(f"🔍 Direct analysis for: {file.filename}")
        
        # Save file
        file_size = 0
        async with aiofiles.open(temp_file_path, 'wb') as temp_file:
            while chunk := await file.read(8192):
                file_size += len(chunk)
                
                if file_size > max_size:
                    os.unlink(temp_file_path)
                    raise HTTPException(
                        status_code=413,
                        detail=f"File too large for direct analysis. Use /upload-and-analyze for files > 25MB"
                    )
                
                await temp_file.write(chunk)
        
        # Perform analysis
        results = await analyze_uploaded_video(temp_file_path)
        
        # Cleanup
        os.unlink(temp_file_path)
        
        logger.info(f"✅ Direct analysis complete: {len(results.get('detections', []))} detections")
        
        return {
            'status': 'completed',
            'filename': file.filename,
            'file_size_mb': round(file_size / (1024*1024), 2),
            'analysis_results': results
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Direct analysis failed: {e}")
        
        # Cleanup on error
        if 'temp_file_path' in locals() and os.path.exists(temp_file_path):
            os.unlink(temp_file_path)
        
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

async def perform_analysis(job_id: str, video_path: str):
    """
    Background task to perform video analysis
    
    Args:
        job_id: Analysis job ID
        video_path: Path to video file
    """
    
    try:
        logger.info(f"🤖 Starting AI analysis for job: {job_id}")
        
        # Update status
        analysis_results[job_id].update({
            'status': 'analyzing',
            'progress': 10,
            'message': 'Initializing AI models...'
        })
        
        # Perform real AI analysis
        results = await analyze_uploaded_video(video_path)
        
        # Update final results
        analysis_results[job_id].update({
            'status': 'completed',
            'progress': 100,
            'message': 'Analysis completed successfully',
            'completed_at': datetime.now().isoformat(),
            'results': results
        })
        
        logger.info(f"✅ Analysis completed for job: {job_id}")
        
    except Exception as e:
        logger.error(f"❌ Analysis failed for job {job_id}: {e}")
        
        # Update error status
        analysis_results[job_id].update({
            'status': 'failed',
            'progress': 0,
            'message': f'Analysis failed: {str(e)}',
            'completed_at': datetime.now().isoformat(),
            'error': str(e)
        })
    
    finally:
        # Cleanup temporary file
        if os.path.exists(video_path):
            os.unlink(video_path)
            logger.info(f"🗑️ Cleaned up temporary file: {video_path}")

@router.get("/supported-formats")
async def get_supported_formats():
    """Get list of supported video formats"""
    return {
        'supported_formats': [
            {
                'format': 'MP4',
                'mime_type': 'video/mp4',
                'description': 'Most common format, best compatibility'
            },
            {
                'format': 'AVI',
                'mime_type': 'video/avi',
                'description': 'Windows standard format'
            },
            {
                'format': 'MOV',
                'mime_type': 'video/mov',
                'description': 'Apple QuickTime format'
            },
            {
                'format': 'WebM',
                'mime_type': 'video/webm',
                'description': 'Web-optimized format'
            }
        ],
        'max_file_size': {
            'direct_analysis': '25MB',
            'background_analysis': '100MB'
        },
        'ai_models': [
            'YOLOv8 (Primary)',
            'OpenCV DNN (Fallback)',
            'Behavioral Analysis'
        ]
    }

@router.delete("/analysis/{job_id}")
async def delete_analysis(job_id: str):
    """Delete analysis results"""
    if job_id in analysis_results:
        del analysis_results[job_id]
        return {'message': 'Analysis results deleted'}
    else:
        raise HTTPException(status_code=404, detail="Analysis job not found")