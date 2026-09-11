"""
Bot Scheduler
Runs trading bots automatically based on signals.
"""

import asyncio
from datetime import datetime
from typing import Dict, Optional
from database import db_connection
from orders import OrderManager
from strategies import analyze_symbol


class TradingBot:
    """Represents a single trading bot instance."""
    
    def __init__(self, bot_id: int, user_id: int, strategy_id: int, symbol: str,
                 timeframe: str, lot_size: float, risk_percent: float = 1.0,
                 stop_loss_pips: int = 50, take_profit_pips: int = 100,
                 min_confidence: float = 0.6):
        self.bot_id = bot_id
        self.user_id = user_id
        self.strategy_id = strategy_id
        self.symbol = symbol
        self.timeframe = timeframe
        self.lot_size = lot_size
        self.risk_percent = risk_percent
        self.stop_loss_pips = stop_loss_pips
        self.take_profit_pips = take_profit_pips
        self.min_confidence = min_confidence
        
        self.is_running = False
        self.last_signal_time = None
        self.last_signal_action = None
        self.trades_today = 0
        self.pnl_today = 0.0
        
        self.last_check = None
        self.status = "STOPPED"
        self.error = None


class BotScheduler:
    """Manages all trading bots."""
    
    def __init__(self):
        self.bots: Dict[int, TradingBot] = {}
        self.running = False
        self.task: Optional[asyncio.Task] = None
        self.check_interval = 60
    
    def create_bot(self, user_id: int, strategy_id: int, symbol: str,
                   timeframe: str = "1h", lot_size: float = 0.01,
                   risk_percent: float = 1.0, stop_loss_pips: int = 50,
                   take_profit_pips: int = 100, min_confidence: float = 0.6) -> dict:
        """Create and save a new bot."""
        with db_connection() as conn:
            cur = conn.cursor()
            try:
                cur.execute("""
                    INSERT INTO bots (
                        user_id, strategy_id, symbol, timeframe,
                        lot_size, risk_percent, stop_loss_pips,
                        take_profit_pips, min_confidence, status
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING id
                """, (
                    user_id, strategy_id, symbol, timeframe,
                    lot_size, risk_percent, stop_loss_pips,
                    take_profit_pips, min_confidence, "STOPPED"
                ))
                
                bot_id = cur.fetchone()[0]
                conn.commit()
                
                # Create in-memory instance
                bot = TradingBot(
                    bot_id=bot_id,
                    user_id=user_id,
                    strategy_id=strategy_id,
                    symbol=symbol,
                    timeframe=timeframe,
                    lot_size=lot_size,
                    risk_percent=risk_percent,
                    stop_loss_pips=stop_loss_pips,
                    take_profit_pips=take_profit_pips,
                    min_confidence=min_confidence
                )
                self.bots[bot_id] = bot
                
                return {
                    "bot_id": bot_id,
                    "status": "CREATED",
                    "symbol": symbol,
                    "strategy_id": strategy_id
                }
                
            except Exception as e:
                conn.rollback()
                return {"error": str(e)}
            finally:
                cur.close()
    
    def start_bot(self, bot_id: int) -> dict:
        """Start a bot."""
        if bot_id not in self.bots:
            return {"error": f"Bot {bot_id} not found"}
        
        bot = self.bots[bot_id]
        bot.is_running = True
        bot.status = "RUNNING"
        
        self._update_bot_status(bot_id, "RUNNING")
        
        # Ensure scheduler loop is running
        if not self.running:
            self.start_scheduler()
        
        return {
            "bot_id": bot_id,
            "status": "RUNNING",
            "symbol": bot.symbol
        }
    
    def stop_bot(self, bot_id: int) -> dict:
        """Stop a bot."""
        if bot_id not in self.bots:
            return {"error": f"Bot {bot_id} not found"}
        
        bot = self.bots[bot_id]
        bot.is_running = False
        bot.status = "STOPPED"
        
        self._update_bot_status(bot_id, "STOPPED")
        
        return {
            "bot_id": bot_id,
            "status": "STOPPED"
        }

    def delete_bot(self, bot_id: int, user_id: int) -> dict:
        """Delete a bot permanently."""
        # Stop it first if running
        if bot_id in self.bots:
            bot = self.bots[bot_id]
            # Verify ownership
            if bot.user_id != user_id:
                return {"error": "You don't have permission to delete this bot"}

            bot.is_running = False
            # Remove from memory
            del self.bots[bot_id]

        # Delete from database
        with db_connection() as conn:
            cur = conn.cursor()
            try:
                # Verify ownership in DB before deleting
                cur.execute("SELECT user_id FROM bots WHERE id = %s", (bot_id,))
                row = cur.fetchone()

                if not row:
                    return {"error": f"Bot {bot_id} not found"}

                if row[0] != user_id:
                    return {"error": "You don't have permission to delete this bot"}

                cur.execute("DELETE FROM bots WHERE id = %s", (bot_id,))
                conn.commit()

                return {
                    "bot_id": bot_id,
                    "status": "DELETED"
                }
            except Exception as e:
                conn.rollback()
                return {"error": str(e)}
            finally:
                cur.close()
    
    def _update_bot_status(self, bot_id: int, status: str):
        """Update bot status in database."""
        with db_connection() as conn:
            cur = conn.cursor()
            try:
                cur.execute("""
                    UPDATE bots SET status = %s, updated_at = NOW()
                    WHERE id = %s
                """, (status, bot_id))
                conn.commit()
            except Exception as e:
                print(f"❌ Error updating bot status: {e}")
                conn.rollback()
            finally:
                cur.close()
    
    def start_scheduler(self):
        """Start the scheduler background task."""
        if self.running:
            return

        # Load existing bots from database
        self.load_bots_from_db()
        
        self.running = True
        
        # ✅ Actually create the async task
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                self.task = loop.create_task(self.run_scheduler_loop())
            else:
                # Will be started by FastAPI's startup event
                pass
        except RuntimeError:
            # No event loop yet — startup event will handle it
            pass
        
        print("🤖 Bot Scheduler started")
    
    async def run_scheduler_loop(self):
        """Main scheduler loop - runs every 60 seconds."""
        print("🔄 Scheduler loop running")
        while self.running:
            try:
                await self._check_all_bots()
                await asyncio.sleep(self.check_interval)
            except Exception as e:
                print(f"❌ Scheduler error: {e}")
                await asyncio.sleep(self.check_interval)
    
    async def _check_all_bots(self):
        """Check all running bots and execute signals."""
        active_bots = [b for b in self.bots.values() if b.is_running]
        
        if not active_bots:
            return
        
        print(f"🔍 [{datetime.utcnow().strftime('%H:%M:%S')}] Checking {len(active_bots)} active bots...")
        
        for bot in active_bots:
            try:
                await self._process_bot(bot)
            except Exception as e:
                print(f"❌ Error processing bot {bot.bot_id}: {e}")
                bot.error = str(e)
    
    async def _process_bot(self, bot: TradingBot):
        """Process a single bot - check signal and manage positions."""
        bot.last_check = datetime.utcnow().isoformat()

        # Step 0: Manage open positions first
        await self._manage_open_positions(bot)
        
        # Step 1: Get current signal
        signal = analyze_symbol(bot.symbol, bot.timeframe, 100)
        
        if not signal or 'error' in signal:
            return
        
        action = signal.get('action', 'HOLD')
        confidence = signal.get('confidence', 0.0)
        
        # Step 2: Check if signal is actionable
        if action not in ['BUY', 'SELL']:
            return
        
        if confidence < bot.min_confidence:
            print(f"⚠️  Bot {bot.bot_id}: Signal {action} below confidence threshold ({confidence:.2f} < {bot.min_confidence})")
            return
        
        # Step 3: Check if we already have a position for this symbol
        positions = OrderManager.get_positions(bot.user_id)
        existing_position = next(
            (p for p in positions if p['symbol'] == bot.symbol and p['status'] == 'OPEN'),
            None
        )
        
        if existing_position:
            print(f"ℹ️  Bot {bot.bot_id}: Position already open for {bot.symbol}")
            return
        
        # Step 4: Place order
        order_manager = OrderManager(bot.user_id)
        
        current_price = signal.get('price', 0)
        if not current_price:
            return
        
        pip_value = 0.0001
        if 'JPY' in bot.symbol:
            pip_value = 0.01
        
        if action == 'BUY':
            stop_loss = current_price - (bot.stop_loss_pips * pip_value)
            take_profit = current_price + (bot.take_profit_pips * pip_value)
        else:
            stop_loss = current_price + (bot.stop_loss_pips * pip_value)
            take_profit = current_price - (bot.take_profit_pips * pip_value)
        
        order = order_manager.place_order(
            symbol=bot.symbol,
            action=action,
            lot_size=bot.lot_size,
            stop_loss=stop_loss,
            take_profit=take_profit
        )
        
        if order:
            bot.last_signal_time = datetime.utcnow().isoformat()
            bot.last_signal_action = action
            bot.trades_today += 1
            print(f"✅ Bot {bot.bot_id}: {action} {bot.symbol} @ {current_price}")
        else:
            print(f"❌ Bot {bot.bot_id}: Failed to place order")
    
    def get_all_bots(self, user_id: int = None) -> list:
        """Get all bots, optionally filtered by user."""
        with db_connection() as conn:
            cur = conn.cursor()
            try:
                if user_id:
                    cur.execute("SELECT * FROM bots WHERE user_id = %s ORDER BY created_at DESC", (user_id,))
                else:
                    cur.execute("SELECT * FROM bots ORDER BY created_at DESC")
                
                rows = cur.fetchall()
                return [{
                    'bot_id': row[0],
                    'user_id': row[1],
                    'strategy_id': row[2],
                    'symbol': row[3],
                    'timeframe': row[4],
                    'lot_size': float(row[5]),
                    'risk_percent': float(row[6]),
                    'stop_loss_pips': row[7],
                    'take_profit_pips': row[8],
                    'min_confidence': float(row[9]),
                    'status': row[10],
                    'created_at': row[11],
                    'updated_at': row[12]
                } for row in rows]
            except Exception as e:
                print(f"❌ Error getting bots: {e}")
                return []
            finally:
                cur.close()

    def load_bots_from_db(self):
        """Load existing bots from database into memory."""
        with db_connection() as conn:
            cur = conn.cursor()
            try:
                cur.execute("SELECT * FROM bots")
                rows = cur.fetchall()

                for row in rows:
                    bot = TradingBot(
                        bot_id=row[0],
                        user_id=row[1],
                        strategy_id=row[2],
                        symbol=row[3],
                        timeframe=row[4],
                        lot_size=float(row[5]),
                        risk_percent=float(row[6]),
                        stop_loss_pips=row[7],
                        take_profit_pips=row[8],
                        min_confidence=float(row[9])
                    )
                    bot.status = row[10]

                    # Only mark as running if it was RUNNING in DB
                    if row[10] == "RUNNING":
                        bot.is_running = True

                    self.bots[row[0]] = bot

                print(f"✅ Loaded {len(rows)} bots from database")
            except Exception as e:
                print(f"❌ Error loading bots: {e}")
            finally:
                cur.close()

    async def _manage_open_positions(self, bot: TradingBot):

        """Manage open positions for a bot - check SL/TP and update P&L."""
        from market_data import get_or_fetch_market_data
        
        positions = OrderManager.get_positions(bot.user_id)
        
        if not positions:
            return
        
        print(f"📊 Bot {bot.bot_id}: Managing {len(positions)} open positions")
        
        for position in positions:
            try:
                # Get current price
                data = get_or_fetch_market_data(position['symbol'], "1h", 1)
                if not data:
                    continue
                
                current_price = float(data[0]['close'])
                
                # ✅ Update P&L in DB
                OrderManager.update_position(position['position_id'], current_price)
                
                # Check SL/TP
                entry = float(position['entry_price'])
                sl = float(position['stop_loss']) if position['stop_loss'] else None
                tp = float(position['take_profit']) if position['take_profit'] else None
                action = position['action']
                
                should_close = False
                close_reason = ""
                
                if action == "BUY":
                    if sl and current_price <= sl:
                        should_close = True
                        close_reason = f"SL hit @ {current_price}"
                    elif tp and current_price >= tp:
                        should_close = True
                        close_reason = f"TP hit @ {current_price}"
                else:  # SELL
                    if sl and current_price >= sl:
                        should_close = True
                        close_reason = f"SL hit @ {current_price}"
                    elif tp and current_price <= tp:
                        should_close = True
                        close_reason = f"TP hit @ {current_price}"
                
                if should_close:
                    OrderManager.close_position(
                        position_id=position['position_id'],
                        exit_price=current_price,
                        reason=close_reason
                    )
                    print(f"💰 Bot {bot.bot_id}: Closed {position['symbol']} — {close_reason}")
        
            except Exception as e:
                print(f"❌ Error managing position {position['position_id']}: {e}")

    


# Global scheduler instance
bot_scheduler = BotScheduler()