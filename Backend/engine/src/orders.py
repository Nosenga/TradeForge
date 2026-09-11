"""
Order Management System
Handles placing, tracking, and managing orders and positions.
"""

import uuid
from datetime import datetime
from typing import Optional, List, Dict
from database import db_connection


class Order:
    """Order model."""
    def __init__(self, user_id, symbol, action, lot_size, order_type="MARKET",
                 entry_price=None, stop_loss=None, take_profit=None):
        self.order_id = str(uuid.uuid4())
        self.user_id = user_id
        self.symbol = symbol
        self.action = action
        self.lot_size = lot_size
        self.order_type = order_type
        self.entry_price = entry_price
        self.stop_loss = stop_loss
        self.take_profit = take_profit
        self.status = "PENDING"
        self.created_at = datetime.utcnow().isoformat()
        self.filled_at = None
        self.filled_price = None


class Position:
    """Position model."""
    def __init__(self, order_id, user_id, symbol, action, lots, entry_price,
                 stop_loss=None, take_profit=None):
        self.position_id = str(uuid.uuid4())
        self.order_id = order_id
        self.user_id = user_id
        self.symbol = symbol
        self.action = action
        self.lots = lots
        self.entry_price = entry_price
        self.stop_loss = stop_loss
        self.take_profit = take_profit
        self.current_price = entry_price
        self.pnl = 0.0
        self.open_time = datetime.utcnow().isoformat()
        self.close_time = None
        self.status = "OPEN"


class OrderManager:
    """Manages orders and positions."""
    
    def __init__(self, user_id: int):
        self.user_id = user_id
        self.orders: Dict[str, Order] = {}
        self.positions: Dict[str, Position] = {}
        self.balance = 10000.0
    
    @staticmethod
    def save_order(order: Order):
        """Save order to database."""
        with db_connection() as conn:
            cur = conn.cursor()
            try:
                cur.execute("""
                    INSERT INTO orders (
                        order_id, user_id, symbol, action, lot_size,
                        order_type, entry_price, stop_loss, take_profit,
                        status, created_at
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    order.order_id, order.user_id, order.symbol, order.action,
                    order.lot_size, order.order_type, order.entry_price,
                    order.stop_loss, order.take_profit, order.status,
                    order.created_at
                ))
                conn.commit()
                return True
            except Exception as e:
                print(f"❌ Error saving order: {e}")
                conn.rollback()
                return False
            finally:
                cur.close()
    
    @staticmethod
    def get_orders(user_id: int, status: str = None) -> List[dict]:
        """Get orders for a user."""
        with db_connection() as conn:
            cur = conn.cursor()
            try:
                query = "SELECT * FROM orders WHERE user_id = %s"
                params = [user_id]
                
                if status:
                    query += " AND status = %s"
                    params.append(status)
                
                query += " ORDER BY created_at DESC"
                
                cur.execute(query, params)
                rows = cur.fetchall()
                
                return [{
                    'order_id': row[0],
                    'user_id': row[1],
                    'symbol': row[2],
                    'action': row[3],
                    'lot_size': row[4],
                    'order_type': row[5],
                    'entry_price': row[6],
                    'stop_loss': row[7],
                    'take_profit': row[8],
                    'status': row[9],
                    'created_at': row[10],
                    'filled_at': row[11],
                    'filled_price': row[12]
                } for row in rows]
            finally:
                cur.close()
    
    def place_order(self, symbol: str, action: str, lot_size: float,
                    stop_loss: float = None, take_profit: float = None,
                    order_type: str = "MARKET") -> Optional[Order]:
        """Place a market or limit order."""
        lot_size = float(lot_size)
        
        # Get current price
        from market_data import get_or_fetch_market_data
        data = get_or_fetch_market_data(symbol, "1h", 1)
        if not data:
            print(f"❌ Could not get price for {symbol}")
            return None
        
        current_price = float(data[0]['close'])
        entry_price = current_price if order_type == "MARKET" else None
        
        # Create order
        order = Order(
            user_id=self.user_id,
            symbol=symbol,
            action=action,
            lot_size=lot_size,
            order_type=order_type,
            entry_price=entry_price,
            stop_loss=stop_loss,
            take_profit=take_profit
        )
        
        self.save_order(order)
        self.orders[order.order_id] = order
        
        # For MARKET orders, simulate immediate fill
        if order_type == "MARKET":
            order.status = "FILLED"
            order.filled_at = datetime.utcnow().isoformat()
            order.filled_price = current_price

            self.update_order_status(
                order_id=order.order_id,
                status="FILLED",
                filled_at=order.filled_at,
                filled_price=order.filled_price
            )
            
            # Create position
            position = Position(
                order_id=order.order_id,
                user_id=self.user_id,
                symbol=symbol,
                action=action,
                lots=lot_size,
                entry_price=current_price,
                stop_loss=stop_loss,
                take_profit=take_profit
            )
            self.positions[position.position_id] = position
            self.save_position(position)
        
        return order
    
    @staticmethod
    def save_position(position: Position):
        """Save position to database."""
        with db_connection() as conn:
            cur = conn.cursor()
            try:
                cur.execute("""
                    INSERT INTO positions (
                        position_id, order_id, user_id, symbol, action,
                        lots, entry_price, stop_loss, take_profit,
                        current_price, pnl, open_time, status
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    position.position_id, position.order_id, position.user_id,
                    position.symbol, position.action, position.lots,
                    position.entry_price, position.stop_loss,
                    position.take_profit, position.current_price,
                    position.pnl, position.open_time, position.status
                ))
                conn.commit()
                return True
            except Exception as e:
                print(f"❌ Error saving position: {e}")
                conn.rollback()
                return False
            finally:
                cur.close()
    
    @staticmethod
    def get_positions(user_id: int) -> List[dict]:
        """Get open positions for a user."""
        with db_connection() as conn:
            cur = conn.cursor()
            try:
                cur.execute("""
                    SELECT * FROM positions 
                    WHERE user_id = %s AND status = 'OPEN'
                    ORDER BY open_time DESC
                """, (user_id,))
                rows = cur.fetchall()
                
                return [{
                    'position_id': row[0],
                    'order_id': row[1],
                    'user_id': row[2],
                    'symbol': row[3],
                    'action': row[4],
                    'lots': row[5],
                    'entry_price': row[6],
                    'stop_loss': row[7],
                    'take_profit': row[8],
                    'current_price': row[9],
                    'pnl': row[10],
                    'open_time': row[11],
                    'close_time': row[12],
                    'status': row[13]
                } for row in rows]
            finally:
                cur.close()

    @staticmethod
    def update_position(position_id: str, current_price: float):
        """Update position with current price and calculate PnL."""
        with db_connection() as conn:
            cur = conn.cursor()
        try:
            # Get position details
            cur.execute("""
                SELECT action, entry_price, lots 
                FROM positions WHERE position_id = %s
            """, (position_id,))
            row = cur.fetchone()
            
            if not row:
                print(f"❌ Position {position_id} not found")
                return False
            
            # ✅ Convert DECIMAL → float
            action = row[0]
            entry_price = float(row[1])
            lots = float(row[2])
            current_price = float(current_price)
            
            # Calculate PnL
            if action == "BUY":
                pnl = (current_price - entry_price) * lots * 100000
            else:
                pnl = (entry_price - current_price) * lots * 100000
            
            cur.execute("""
                UPDATE positions 
                SET current_price = %s, pnl = %s 
                WHERE position_id = %s
            """, (current_price, pnl, position_id))
            conn.commit()
            return True
        except Exception as e:
            print(f"❌ Error updating position: {e}")
            conn.rollback()
            return False
        finally:
            cur.close()

    @staticmethod
    def update_order_status(order_id: str, status: str, filled_at: str = None, filled_price: float = None):
        """Update order status in the database."""
        with db_connection() as conn:
            cur = conn.cursor()
            try:
                cur.execute("""
                    UPDATE orders 
                    SET status = %s, filled_at = %s, filled_price = %s 
                    WHERE order_id = %s
                """, (status, filled_at, filled_price, order_id))
                conn.commit()
                return True
            except Exception as e:
                print(f"❌ Error updating order status: {e}")
                conn.rollback()
                return False
            finally:
                cur.close()

    @staticmethod
    def close_position(position_id: str, exit_price: float, reason: str = "manual") -> bool:
        """Close a position and record final P&L."""
        with db_connection() as conn:
            cur = conn.cursor()
            try:
                # Get position details
                cur.execute("""
                    SELECT action, entry_price, lots 
                    FROM positions WHERE position_id = %s AND status = 'OPEN'
                """, (position_id,))
                row = cur.fetchone()
                
                if not row:
                    print(f"❌ Position {position_id} not found or already closed")
                    return False
                
                action, entry_price, lots = row
                entry_price = float(entry_price)
                lots = float(lots)
                
                # Calculate final P&L
                if action == "BUY":
                    pnl = (exit_price - entry_price) * lots * 100000
                else:
                    pnl = (entry_price - exit_price) * lots * 100000
                
                # Update position — mark as CLOSED
                cur.execute("""
                    UPDATE positions 
                    SET current_price = %s, pnl = %s, close_time = NOW(), status = 'CLOSED'
                    WHERE position_id = %s
                """, (exit_price, pnl, position_id))
                
                conn.commit()
                print(f"✅ Closed {position_id}: P&L = ${pnl:.2f} ({reason})")
                return True
            except Exception as e:
                print(f"❌ Error closing position: {e}")
                conn.rollback()
                return False
            finally:
                cur.close()