"""
MetaTrader Bridge
WebSocket server that communicates with MT5 EA.
"""

import asyncio
import json
import uuid
import websockets
from datetime import datetime
from typing import Dict, Optional, Set


class MTBridge:
    """Manages WebSocket connection between Python and MT5 EA."""
    
    def __init__(self, host: str = "127.0.0.1", port: int = 8765):
        self.host = host
        self.port = port
        self.clients: Set = set()
        self.connected = False
        self.latest_balance = None
        self.latest_equity = None
        self.latest_positions = []
        self.latest_prices = {}
        
        # Pending request futures
        self.pending_requests: Dict[str, asyncio.Future] = {}
        
        self.server = None
    
    async def start(self):
        """Start the WebSocket server."""
        try:
            self.server = await websockets.serve(
                self.handle_client,
                self.host,
                self.port
            )
            print(f"🔌 MT Bridge listening on ws://{self.host}:{self.port}")
        except Exception as e:
            print(f"❌ Failed to start MT Bridge: {e}")
    
    async def stop(self):
        """Stop the WebSocket server."""
        if self.server:
            self.server.close()
            await self.server.wait_closed()
            print("🔌 MT Bridge stopped")
    
    async def handle_client(self, websocket):
        """Handle new EA connection."""
        self.clients.add(websocket)
        self.connected = True
        client_addr = websocket.remote_address
        print(f"✅ MT5 EA connected: {client_addr}")
        
        try:
            async for message in websocket:
                try:
                    data = json.loads(message)
                    await self.handle_message(data, websocket)
                except json.JSONDecodeError:
                    print(f"❌ Invalid JSON: {message[:100]}")
                except Exception as e:
                    print(f"❌ Error handling message: {e}")
        except websockets.exceptions.ConnectionClosed:
            print(f"🔌 MT5 EA disconnected: {client_addr}")
        finally:
            self.clients.discard(websocket)
            if not self.clients:
                self.connected = False
    
    async def handle_message(self, data: dict, websocket):
        """Handle incoming message from EA."""
        msg_type = data.get('type')
        request_id = data.get('request_id')
        
        if msg_type == 'heartbeat':
            pass  # EA is alive
        
        elif msg_type == 'account_info':
            self.latest_balance = data.get('balance')
            self.latest_equity = data.get('equity')
            print(f"💰 Balance: ${self.latest_balance} | Equity: ${self.latest_equity}")
        
        elif msg_type == 'positions':
            self.latest_positions = data.get('positions', [])
            print(f"📊 Positions: {len(self.latest_positions)}")
        
        elif msg_type == 'prices':
            self.latest_prices = data.get('prices', {})
        
        elif msg_type in ('order_result', 'close_result', 'account_response', 'positions_response'):
            if request_id and request_id in self.pending_requests:
                future = self.pending_requests.pop(request_id)
                if not future.done():
                    future.set_result(data)
            print(f"📩 {msg_type}: success={data.get('success')}")
        
        elif msg_type == 'error':
            print(f"❌ EA Error: {data.get('message')}")
            if request_id and request_id in self.pending_requests:
                future = self.pending_requests.pop(request_id)
                if not future.done():
                    future.set_result(data)
    
    async def send_command(self, command: dict, timeout: float = 15.0) -> Optional[dict]:
        """Send a command to the EA and wait for response."""
        if not self.clients:
            print("❌ No MT5 EA connected")
            return None
        
        request_id = str(uuid.uuid4())
        command['request_id'] = request_id
        
        future = asyncio.Future()
        self.pending_requests[request_id] = future
        
        message = json.dumps(command)
        for client in list(self.clients):
            try:
                await client.send(message)
            except Exception as e:
                print(f"❌ Failed to send: {e}")
                return None
        
        try:
            response = await asyncio.wait_for(future, timeout=timeout)
            return response
        except asyncio.TimeoutError:
            print(f"⏱️ Command timed out after {timeout}s")
            self.pending_requests.pop(request_id, None)
            return None
    
    async def place_order(self, symbol: str, action: str, lot_size: float,
                          stop_loss: float = None, take_profit: float = None) -> Optional[dict]:
        """Send order to MT5."""
        return await self.send_command({
            "type": "place_order",
            "symbol": symbol,
            "action": action,
            "lot_size": lot_size,
            "stop_loss": stop_loss,
            "take_profit": take_profit,
        })
    
    async def close_position(self, ticket: int) -> Optional[dict]:
        """Close a position by ticket."""
        return await self.send_command({
            "type": "close_position",
            "ticket": ticket,
        })
    
    async def get_account_info(self) -> Optional[dict]:
        """Request current account info."""
        return await self.send_command({"type": "get_account"})
    
    async def get_positions(self) -> Optional[dict]:
        """Request current positions."""
        return await self.send_command({"type": "get_positions"})


# Global bridge instance
mt_bridge = MTBridge()