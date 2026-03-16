from fastapi import APIRouter, WebSocket

router = APIRouter()

clients = []

@router.websocket("/alerts")
async def websocket_endpoint(websocket: WebSocket):

    await websocket.accept()
    clients.append(websocket)

    try:
        while True:
            data = await websocket.receive_text()

            # broadcast message to all clients
            for client in clients:
                await client.send_text(data)

    except:
        clients.remove(websocket)