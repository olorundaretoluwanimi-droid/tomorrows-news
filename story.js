// Timeline (seconds): the single source of truth for shots, events, voice, phone screens and chapter cards.
// 80 bpm, 4/4: one bar = 3 s; the downbeat of bar n is at (n-1)*3.
export const BPM = 80, BAR = 240 / BPM;
export const bar = n => (n - 1) * BAR;
export const DUR = 480;   // the story; the finished film is COLD + DUR long
// Cold open: COLD seconds before the story's 0 — the bridge headline over the intact bridge in the storm.
// Every time below is story time; the film's clock is story time + COLD (main.js adds it).
export const COLD = 7;
export const COLD_SCENE = 357.2;   // scene clock used for the cold open's picture: storm, bridge still standing, a flash at 1.2 s
export const COLD_PHONE = { a: 1.0, b: 6.3, date: 'SUN 16 MAR', tag: 'TOMORROW', time: '18:31', bat: 11, items: [[1.4, 'OLD RIVER BRIDGE FALLS IN STORM'], [2.6, '7:04 P.M. — 12 CARS LOST']] };
export const SHOTS = [
  { id: 'city0', a: 0, b: 12 },
  { id: 'room0', a: 12, b: 21 },
  { id: 'ui0', a: 21, b: 30 },
  { id: 'title', a: 30, b: 36 },
  { id: 'stop741', a: 36, b: 45 },
  { id: 'rain742', a: 45, b: 51 },
  { id: 'pullback', a: 51, b: 66 },
  { id: 'ride', a: 66, b: 90 },
  { id: 'noonUI', a: 90, b: 102 },
  { id: 'cafe', a: 102, b: 123 },
  { id: 'heater', a: 123, b: 132 },
  { id: 'rewrite', a: 132, b: 141 },
  { id: 'lorenz', a: 141, b: 171 },
  { id: 'room1', a: 171, b: 189 },
  { id: 'spread', a: 189, b: 216 },
  { id: 'queue', a: 216, b: 237 },
  { id: 'bankwide', a: 237, b: 264 },
  { id: 'shutter', a: 264, b: 270 },
  { id: 'guilt', a: 270, b: 288 },
  { id: 'room2', a: 288, b: 303 },
  { id: 'call', a: 303, b: 330 },
  { id: 'cassandra', a: 330, b: 354 },
  { id: 'rideStorm', a: 354, b: 375 },
  { id: 'bridgehead', a: 375, b: 414 },
  { id: 'seven03', a: 414, b: 423 },
  { id: 'fall', a: 423, b: 426.3 },
  { id: 'fallClose', a: 426.3, b: 435 },   // the collapse up close: the span drops, hits the river, sinks (was 3 s of black)
  { id: 'aftermath', a: 435, b: 453 },
  { id: 'dawnAfter', a: 453, b: 480 },
];
export const T = {
  midnight: 15.0, titleIn: 30.3, titleOut: 35.8,
  flip742: 45.0,
  cafeIn: 102.0, unplug: 119.3, heaterOff: 120.0, twoTen: 126.0,
  strike: 136.4, retype: 137.1,
  typeA: 183.0, send: 186.0, spread0: 189.5, spreadEnd: 212.0,
  shutter: 267.0,
  hangup: 325.1,
  flashes: [358.4, 366.1, 371.3, 388.2, 402.6, 419.0, 426.0],
  arrive: 375.5, drag: 378.0, dragEnd: 383.0, stand: 383.6,
  cars: [[384.0, 392.0], [393.5, 399.0], [402.5, 408.0], [405.5, 411.0]],
  horn: [394.3, 402.2, 408.3],
  fall: 426.0, splash: 428.6, dead: 430.5,
  endTitle: 473.0,
};
// Chapter cards (overlay)
export const CHAPTERS = [
  { t: 36.2, n: 'I', name: 'The First Headline' },
  { t: 90.2, n: 'II', name: 'Small Change' },
  { t: 171.2, n: 'III', name: 'The Run' },
  { t: 288.2, n: 'IV', name: 'Cassandra' },
  { t: 354.2, n: 'V', name: 'Seven Oh Four' },
];
// Voice: t = start; dur from voices/dur.json. dlg = dialogue box (who = name plate). sub = on-screen text.
export const VO = [
  { id: 'n01', t: 1.5, sub: 'Eleven fifty-nine. The city is asleep. Your phone isn’t.' },
  { id: 'n02', t: 12.6, sub: 'At midnight, it updates, like it always does.' },
  { id: 'n03', t: 16.5, sub: 'Except tonight, the news is dated tomorrow.' },
  { id: 'n04', t: 21.8, sub: 'Most of it is ordinary. The weather. The trams. A lost dog.' },
  { id: 'n05', t: 27.0, sub: 'You laugh, and go to sleep.' },
  { id: 'n06', t: 41.8, sub: 'Seven forty-one. The sky is dry.' },
  { id: 'n07', t: 45.4, sub: 'Seven forty-two.' },
  { id: 'n08', t: 52.0, sub: 'Real forecasters can’t do this. Even with supercomputers, their forecasts gain only about one day of accuracy every ten years.' },
  { id: 'n09', t: 61.0, sub: 'Yours is perfect. Down to the minute.' },
  { id: 'n10', t: 67.5, sub: 'Every headline comes true. The late tram. The lost dog on Mill Street. The final score.' },
  { id: 'n11', t: 78.0, sub: 'For one whole morning, you know everything a day early.' },
  { id: 'n12', t: 94.6, sub: 'Then, at noon, a new headline.' },
  { id: 'y01', t: 103.0, dlg: true, who: 'You', sub: 'Rosa. Your heater. Unplug it. Please.' },
  { id: 'r01', t: 107.6, dlg: true, who: 'Rosa', sub: 'That old thing? It’s kept me warm for twenty years.' },
  { id: 'y02', t: 113.3, dlg: true, who: 'You', sub: 'Not past ten past two.' },
  { id: 'r02', t: 117.1, dlg: true, who: 'Rosa', sub: 'All right. For you.' },
  { id: 'n13', t: 127.6, sub: 'Ten past two. Nothing burns.' },
  { id: 'n14', t: 132.6, sub: 'And on your screen, the headline rewrites itself.' },
  { id: 'n15', t: 142.0, sub: 'In 1961, the meteorologist Edward Lorenz re-ran a weather simulation, but typed in one number rounded off.' },
  { id: 'n16', t: 151.0, sub: '0.506, instead of 0.506127.' },
  { id: 'n17', t: 157.5, sub: 'Within two simulated months, the forecast described a completely different sky.' },
  { id: 'n18', t: 164.0, sub: 'Tomorrow is not written in stone. It bends to the smallest touch. Even yours.' },
  { id: 'n19', t: 172.0, sub: 'That night, the worst headline yet.' },
  { id: 'n20', t: 175.2, sub: 'Northgate Savings Bank collapses. Thousands of families lose everything they have saved.' },
  { id: 'n21', t: 183.0, sub: 'So you warn them.' },
  { id: 'n22', t: 191.5, sub: 'Ten shares. Then a hundred. Then a thousand.' },
  { id: 'n23', t: 201.0, sub: 'By three in the morning, half the city has read your warning.' },
  { id: 'n24', t: 218.0, sub: 'At dawn, they come to take their money out. All of them. At once.' },
  { id: 'n25', t: 238.0, sub: 'In 1948, the sociologist Robert Merton gave this a name: the self-fulfilling prophecy.' },
  { id: 'n26', t: 245.4, sub: 'A false belief that makes itself come true.' },
  { id: 'n27', t: 249.5, sub: 'A bank never keeps all its savers’ money in cash. If everyone asks on the same day, it cannot pay.' },
  { id: 'n28', t: 256.5, sub: 'In March 2023, customers of one American bank tried to withdraw $42 billion in a single day.' },
  { id: 'n29', t: 264.4, sub: 'By the next morning, its doors were closed.' },
  { id: 'n30', t: 279.5, sub: 'The bank was never going to fail.' },
  { id: 'n31', t: 283.0, sub: 'Until you told everyone it would.' },
  { id: 'n32', t: 289.0, sub: 'Two days later, the one headline you cannot ignore.' },
  { id: 'd01', t: 304.0, dlg: true, who: 'Dispatch', sub: 'Emergency services. What’s your emergency?' },
  { id: 'y03', t: 309.1, dlg: true, who: 'You', sub: 'The Old River Bridge. It’s going to collapse at 7:04. Close it!' },
  { id: 'd02', t: 315.2, dlg: true, who: 'Dispatch', sub: 'Wait. You’re the courier. The one from the bank post.' },
  { id: 'd03', t: 320.7, dlg: true, who: 'Dispatch', sub: 'Do you know how many people lost their jobs this week? Get off this line.' },
  { id: 'n33', t: 331.0, sub: 'The Greeks told of Cassandra, a princess who could see the future, cursed so that no one would ever believe her.' },
  { id: 'n34', t: 340.0, sub: 'Tonight, that’s you.' },
  { id: 'n35', t: 345.0, sub: 'Twenty-four minutes. Nine percent battery.' },
  { id: 'n36', t: 386.0, sub: 'Nobody believes a warning from a stranger.' },
  { id: 'n37', t: 390.5, sub: 'But almost everyone stops for a person standing in the road.' },
  { id: 'y04', t: 399.5, dlg: true, who: 'You', sub: 'Stay back! Please! Stay back!' },
  { id: 'n38', t: 415.0, sub: 'Seven oh three.' },
  { id: 'v01', t: 441.0, dlg: true, who: 'Driver', sub: 'You were standing right in the road. You stopped all of us.' },
  { id: 'n39', t: 455.0, sub: 'In the morning, your phone shows today’s news. Only today’s.' },
  { id: 'n40', t: 467.0, sub: 'Nobody gets to read tomorrow.' },
  { id: 'n41', t: 470.5, sub: 'But everybody writes it.' },
];
// Phone screens (overlay window). items: [t, text] typed in at t; strike/re/alt: struck out and retyped.
export const PHONE = [
  { a: 21.3, b: 29.7, date: 'THU 13 MAR', tag: 'TOMORROW', time: '00:00', bat: 62, items: [[22.3, 'RAIN RETURNS AT 7:42 A.M.'], [23.8, 'TRAM 9 DELAYED 40 MINUTES'], [25.1, 'LOST DOG FOUND ON MILL STREET']] },
  { a: 95.4, b: 101.6, date: 'THU 13 MAR', tag: 'TOMORROW', time: '12:00', bat: 48, items: [[96.0, 'FIRE GUTS ROSA’S CORNER CAFÉ, 2:10 P.M.']] },
  { a: 132.4, b: 141.4, date: 'THU 13 MAR', tag: 'TOMORROW', time: '14:10', bat: 41, items: [[132.5, 'FIRE GUTS ROSA’S CORNER CAFÉ, 2:10 P.M.', 136.4, 137.1, 'CAFÉ OWNER THANKS MYSTERY COURIER']] },
  { a: 174.6, b: 182.6, date: 'FRI 14 MAR', tag: 'TOMORROW', time: '23:48', bat: 23, items: [[175.0, 'NORTHGATE SAVINGS BANK COLLAPSES'], [176.8, 'THOUSANDS LOSE THEIR SAVINGS']] },
  { a: 271.0, b: 280.6, date: 'FRI 14 MAR', tag: 'TOMORROW', time: '09:02', bat: 17, items: [[271.2, 'NORTHGATE SAVINGS BANK COLLAPSES', 274.6, 275.3, 'BANK COLLAPSES AFTER VIRAL WARNING']] },
  { a: 292.6, b: 301.2, date: 'SUN 16 MAR', tag: 'TOMORROW', time: '18:31', bat: 11, items: [[293.0, 'OLD RIVER BRIDGE FALLS IN STORM'], [294.8, '7:04 P.M. — 12 CARS LOST']] },
  { a: 459.4, b: 466.6, date: 'SUN 16 MAR', tag: 'TODAY', time: '06:12', bat: 4, items: [[459.8, 'OLD RIVER BRIDGE FALLS IN STORM'], [461.6, 'NO ONE WAS ON IT']] },
];
// Small status chips (time + battery) at moments that count down
export const CHIPS = [
  { a: 344.6, b: 352.6, time: '18:40', bat: 9 },
  { a: 414.2, b: 422.4, time: '19:03', bat: 1 },
];
// The carried light: phone battery 0..1 drives the screen glow and the light on your face
export function battery(t) {
  if (t >= T.dead) return t > 458 ? .35 : 0;   // dead, then charged from a driver's power bank at dawn
  const K = [[0, .62], [100, .48], [140, .41], [180, .23], [280, .17], [300, .11], [345, .09], [414, .02], [T.dead - .01, .012]];
  for (let i = 1; i < K.length; i++) if (t < K[i][0]) { const [a, va] = K[i - 1], [b, vb] = K[i]; return va + (vb - va) * (t - a) / (b - a); }
  return .012;
}
export const shotAt = t => SHOTS.find(s => t >= s.a && t < s.b) || SHOTS[SHOTS.length - 1];
