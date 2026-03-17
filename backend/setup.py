from setuptools import setup, find_packages

setup(
    name="smart-city-surveillance-backend",
    version="1.0.0",
    description="Smart City Surveillance Backend API",
    packages=find_packages(),
    python_requires=">=3.8",
    install_requires=[
        "fastapi==0.104.1",
        "uvicorn[standard]==0.24.0",
        "motor==3.3.2",
        "python-dotenv==1.0.0",
        "python-multipart==0.0.6",
        "pydantic==2.5.0",
        "ultralytics==8.0.196",
        "opencv-python-headless==4.8.1.78",
        "numpy==1.24.3",
        "Pillow==10.1.0",
        "websockets==12.0",
        "python-jose[cryptography]==3.3.0",
        "passlib[bcrypt]==1.7.4",
    ],
)