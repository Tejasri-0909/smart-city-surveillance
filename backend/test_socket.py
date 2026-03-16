import asyncio
import websockets

async def test():
    uri = "ws://127.0.0.1:8000/realtime/alerts"

    async with websockets.connect(uri) as websocket:
        await websocket.send("Camera CAM001 detected suspicious activity")
        response = await websocket.recv()
        print("Server Response:", response)

asyncio.run(test())