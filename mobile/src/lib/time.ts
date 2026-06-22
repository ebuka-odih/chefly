// Time-of-day awareness — Chefly's core differentiator.
export type DayContext = {
  period: string;
  greeting: string;
  line: string;
  meal: string;
  night: boolean;
  time: string;
};

export function getDayContext(date = new Date()): DayContext {
  const h = date.getHours();
  const time = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  if (h < 11) return { period: 'morning', greeting: 'Good morning', line: "Let's start the day with something good", meal: 'Breakfast', night: false, time };
  if (h < 15) return { period: 'midday', greeting: 'Good afternoon', line: "Let's find a fresh, easy lunch", meal: 'Lunch', night: false, time };
  if (h < 18) return { period: 'afternoon', greeting: 'Good afternoon', line: 'A light bite before dinner?', meal: 'Snack', night: false, time };
  return { period: 'evening', greeting: 'Good evening', line: "Let's find a quick weeknight dinner", meal: 'Dinner', night: true, time };
}
