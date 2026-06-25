"""Time-of-day awareness.

Chefly's headline differentiator (see docs/MIGRATION.md) is that suggestions are
ranked for the *current time of day* — "no one wants a 2-hour roast at 7pm on a
Tuesday". This module turns a clock time into a meal context the recipe prompt
can reason about.
"""
from dataclasses import dataclass
from datetime import datetime
from typing import Optional


@dataclass
class TimeContext:
    hour: int
    weekday: str
    period: str  # Breakfast | Brunch | Lunch | Snack | Dinner | Late night
    guidance: str  # one-line steer for the model

    def as_prompt(self) -> str:
        return (
            f"Current local time: {self.hour:02d}:00 on {self.weekday}. "
            f"Meal context: {self.period}. {self.guidance}"
        )


def _period_for_hour(hour: int) -> tuple[str, str]:
    if 5 <= hour < 10:
        return "Breakfast", "Favor quick, energising morning food (15–25 min)."
    if 10 <= hour < 12:
        return "Brunch", "Favor relaxed late-morning dishes, eggs and light plates."
    if 12 <= hour < 15:
        return "Lunch", "Favor satisfying but not-too-heavy midday meals (under ~30 min)."
    if 15 <= hour < 17:
        return "Snack", "Favor light bites, small plates or something to tide over until dinner."
    if 17 <= hour < 21:
        return "Dinner", "Favor a proper, hearty evening meal; a bit more cooking time is fine."
    return "Late night", "Favor fast, light, comforting food that won't sit heavy before bed."


def parse_time_context(local_time: Optional[str] = None, hour: Optional[int] = None) -> TimeContext:
    """Build a TimeContext from a client-provided ISO time or hour.

    Falls back to the server's current UTC time when nothing is supplied.
    """
    now: Optional[datetime] = None
    if local_time:
        try:
            now = datetime.fromisoformat(local_time.replace("Z", "+00:00"))
        except (ValueError, TypeError):
            now = None
    if now is None:
        now = datetime.utcnow()

    resolved_hour = hour if hour is not None else now.hour
    resolved_hour = max(0, min(23, int(resolved_hour)))
    weekday = now.strftime("%A")
    period, guidance = _period_for_hour(resolved_hour)
    return TimeContext(hour=resolved_hour, weekday=weekday, period=period, guidance=guidance)
