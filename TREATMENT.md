# Tomorrow's News — Treatment

**Style:** 2.5D Pixel Art (`hd-2d`) · **Language:** English · **Format:** 1920×1080, 30 fps · **Length:** ~8 min (480 s) · **Tone:** dramatic

## Brief (summed up)

- Topic: *What if your phone showed tomorrow's news?* Told dramatically, with real facts (sources in `FACTS.md`).
- Second-person narration ("you"), English storybook narrator (Kokoro `bm_fable`, offline). In-world voices in dialogue boxes: you, a café owner, an emergency dispatcher.
- Original score. No storyboard stop. No user material. No voice-engine credit on the end card.
- Rendered on GitHub Actions (20 parallel chunks), like the last film.

## 1. Three candidate structures

1. **A list of headlines** (menu of places): an overhead city map; each headline dives into one district (weather, a match, a fire, a bank, a bridge), back to the map between. Clear, but episodic: it never asks what knowing *does* to you.
2. **A countdown**: one headline, "Bridge collapses 7:04 p.m.", and 8 minutes of the hero trying to stop it. Strong tension, but one note for 8 minutes, and no room for the real ideas (chaos, self-fulfilling prophecy).
3. **Three uses of the future, each going worse** (setup → escalation → reversal): first you only *watch* tomorrow (it is perfect); then you *change* a small thing (it works: the future is fragile); then you *broadcast* a big thing (you cause the disaster you warned of); finally, with nobody believing you, you change one thing with your own body. The phone's battery drains across the film and dies at the climax.

**Chosen: 3.** It has a real turn (the bank run you cause), an ending that answers the question the title asks, and it makes the three facts part of the plot: forecast limits (why this phone is impossible), Lorenz's butterfly (why the future changes when you read it), Merton's self-fulfilling prophecy (why warning everyone can be the disaster). Opening from the topic: the whole city asleep from very high, one lit window, one glowing phone. Ending from the topic: the phone shows *today*, and you are fine with that.

## 2. Logline and arc

A night courier's phone starts showing tomorrow's headlines; using them turns from a game into a disaster, and on the last night, with a dying battery and no one believing a word, the only way to change tomorrow is to stand in the road.

- **Setup (Ch. I):** midnight update; headlines come true to the minute (rain at 7:42).
- **Escalation (Ch. II):** a café fire at 2:10; you warn the owner; nothing burns; the headline rewrites itself. Lorenz, 1961.
- **Turn (Ch. III):** "Northgate Savings collapses." You warn the city. The warning spreads phone to phone; at dawn the queue *causes* the collapse. Merton, 1948; one bank, 2023.
- **Low point (Ch. IV):** "Old River Bridge falls 7:04 p.m." The dispatcher knows your name from the bank post and hangs up. Cassandra. Battery 9 %.
- **Climax (Ch. V):** storm; you block the bridge with your bike and the phone's light; the cars stop; at 7:04 the span falls into the river, empty. The phone dies.
- **Ending:** dawn; the phone restarts on today's date. "Nobody gets to read tomorrow. Everybody gets to write it."

## 3. Benchmark

- ***Run Lola Run* (Tykwer, 1998)** — learn: a clock-driven score whose pulse *is* the tension; time stamps as structure; the same street seen again, changed. Don't take: its music, characters, shots, the three-run device.
- **Pixel-diorama night cities in 2.5D indie games (e.g. *Eastward*, Pixpil 2021)** — learn: windows and screens as the story-carrying practicals in a cold city; small figures readable by one saturated colour. Don't take: any design, character, palette or music.

## 4. World, characters, light

The city is **Northgate**, invented: modern, rain-washed, tram lines, an old steel bridge over a wide river.

- **Set A — The window (night)**: very high over dark blocks; one top-floor window lit by a phone. Cutaway room: bed, desk, lamp, a wall clock, the window streaked with rain. Key: deep blue fog; the **phone** is the practical (cold white-cyan). Used: cold open, Ch. III start, Ch. IV call.
- **Set B — Tram Street**: a tram stop with a big flip clock, *Rosa's* corner café (glass front, old red heater inside), *Northgate Savings* (stone front, steel shutter), a newspaper kiosk, parked cars, lamp posts, a billboard screen. Keys: overcast dawn (Ch. I, rain sweeps in at 7:42), warm noon (Ch. II), cold dawn queue (Ch. III), storm-dusk (Ch. IV street).
- **Set C — The overhead map (night)**: straight top-down over a grid of blocks; tilt band as a strip. Thousands of windows/phones light up one by one as the warning spreads (signature shot).
- **Set D — Old River Bridge (storm night → dawn)**: a steel truss bridge on stone piers over a wide, quantized pixel river; rain, lightning flash curve; headlights as practicals. Dawn: the gap in the span, pale gold sky.

Characters (pose-table pixel sprites, ~50 px tall):
- **You** — a bike courier: **safety-orange jacket** (the one saturated colour no set uses), dark trousers, courier bag, a bike. Your phone is a held light: its level is the battery (100 % → 0 %), driving the screen glow, the point light on your face and its glow sprite (**the carried light as a meter**).
- **Rosa** — café owner, sixties, apron, grey bun.
- **Dispatcher** — voice only, in a dialogue box ("DISPATCH").
- **Townsfolk** — 8 looks for the queue and the street; drivers as silhouettes behind headlights.

## 5. The phone screen (UI)

The phone's news feed is shown as a framed RPG-style window over the picture: dark plate, thin silver border with corner ornaments, a header line `NORTHGATE NEWS · WED 12 MAR` with battery %, then headlines in Cinzel caps, typed in with a soft chime. When a headline changes, the old text is struck out and retyped letter by letter (the future rewriting itself). The date line is the clue: one day ahead of the clock on the wall.

## 6. Shot list

Times are the plan; final cut is locked to voice and the bar grid (80 bpm, one bar = 3 s).

| # | Shot | Framing / angle | Move | Dur | Why |
|---|---|---|---|---|---|
| 1 | City, 23:59 | extreme wide, very high | slow push onto one lit window | 10 | Preciousness: one window in a whole city; the hook is the light in it |
| 2 | Room | medium-high 3/4, cutaway | dive low to the bed as the clock turns 00:00 | 9 | The toy world becomes personal at the exact minute |
| 3 | Phone UI | screen window over the room | locked, rack focus room → phone | 8 | Attention changes hands: the date is wrong |
| 4 | Title | high wide over the rainy city | slow lateral drift | 6 | Title card |
| 5 | Tram Street, 7:41 | medium-high 3/4 | near-static drift | 9 | Two subjects: you and the flip clock |
| 6 | 7:42 | same | locked; rain sweeps the diorama | 7 | The first proof, in weather |
| 7 | Forecast fact | high wide, rain | slow rising pull-back | 12 | Consequence: the whole street wet |
| 8 | Morning ride | lateral tracking, camera leading | passes stalled tram, dog, kiosk | 18 | A path through the day; headlines checked off one by one |
| 9 | Phone UI, noon | screen window over the street | locked | 7 | The fire headline |
| 10 | Café | medium-high 3/4 inside the cutaway | drift; dialogue | 26 | A conversation, two figures on one stage |
| 11 | 2:10 | close dive on the heater + wall clock | slow push | 9 | The near-silence before nothing happens |
| 12 | Rewrite | phone UI over the café | locked, headline retyped | 8 | The native rewrite |
| 13 | Lorenz | high wide, the street, rack focus | rising pull-back | 22 | The act spreads outward; one tiny change |
| 14 | Room, night | medium-high 3/4 | push | 12 | The worst headline; you decide to post |
| 15 | **The spread** | straight top-down, band as a strip | very slow push down; windows light one by one, faster and faster | 24 | **Signature**: a rumour seen as light across a city map |
| 16 | Dawn queue | lateral tracking along the queue | camera leading | 20 | A path along the people you warned |
| 17 | Merton / 2023 | high wide over the bank | slow push | 22 | Scale: a whole street of savers |
| 18 | Shutter | full, bank door | locked; steel shutter drops | 7 | Impact: the only thing that shakes |
| 19 | You | close dive on you | push | 12 | Guilt, personal |
| 20 | Storm-dusk, room | medium-high 3/4 | drift | 10 | The last headline |
| 21 | The call | room, dialogue boxes | slow push | 24 | No one believes you |
| 22 | Cassandra | very high wide, storm city | slow push to the river | 18 | Scale of the warning nobody hears |
| 23 | Ride | lateral tracking, rain, lightning | camera leading | 16 | The race to the bridge |
| 24 | Bridge head | medium-high 3/4 | near-static drift | 26 | You and the barrier, the cars arriving one by one |
| 25 | 7:03 | close dive on you holding up the phone | push | 10 | The carried light at 1 % |
| 26 | 7:04 | high wide | locked; lightning, the span falls | 8 | The climax, seen whole |
| 27 | Dark | black, rain only | — | 4 | The phone is dead; silence |
| 28 | Dawn after | very high wide, the gap in the bridge | slow push; band narrows onto you | 26 | Return to the opening framing, changed |
| 29 | End title | over the dawn wide | locked | 8 | |

## 7. Beat sheet and script

N = narrator. Y = you. R = Rosa. D = dispatcher. Times approximate (locked in `story.js` from real voice lengths).

**Cold open (0–30)**
- 0–10 · rain, a city asleep, one lit window. N: *"Eleven fifty-nine. The city is asleep. Your phone isn't."*
- 10–19 · clock 23:59 → 00:00, phone buzzes. N: *"At midnight it updates, like it always does."* · *"Except tonight the news is dated tomorrow."*
- 19–24 · phone UI: `WED 12 MAR` (wall calendar: TUE 11). Headlines: RAIN RETURNS AT 7:42 A.M. · TRAM 9 DELAYED 40 MIN · LOST DOG FOUND ON PIER STREET.
- 24–30 · TITLE: *What If Your Phone Showed Tomorrow's News?*

**I · The First Headline (30–102)**
- N: *"Most of it is ordinary. Weather. Trams. A lost dog."* · *"You laugh, and go to sleep."*
- 7:41 at the tram stop, dry. N: *"Seven forty-one. The sky is dry."* — clock flips 7:42, rain sweeps in. N: *"Seven forty-two."*
- Pull-back. N: *"Real forecasters can't do this. Even with supercomputers, their forecasts gain only about one day of accuracy every ten years."* · *"Yours is perfect. Down to the minute."*
- Ride. N: *"Every headline comes true. The late tram. The lost dog on Pier Street. The final score."* · *"For a whole morning, you know everything a day early."*

**II · Small Change (102–192)**
- Phone UI at noon: FIRE GUTS ROSA'S CORNER CAFÉ, 2:10 P.M. N: *"Then, at noon, a new headline."*
- Café. Y: *"Rosa. Your heater. Unplug it. Please."* · R: *"That old thing? It's kept me warm for twenty years."* · Y: *"Not past ten past two."* · R: *"…Fine. For you."* — the heater's red glow goes out.
- 2:10, near-silence. N: *"Ten past two. Nothing burns."*
- Rewrite: ~~FIRE GUTS…~~ → CAFÉ OWNER THANKS MYSTERY COURIER. N: *"And on your screen, the headline rewrites itself."*
- Lorenz pull-back. N: *"In 1961, the meteorologist Edward Lorenz re-ran a weather simulation, but typed in one number rounded: point five oh six instead of point five oh six one two seven."* · *"Within weeks of simulated weather, the forecast described a different sky."* · *"Tomorrow is not written in stone. It bends to the smallest touch. Even yours."*

**III · The Run (192–300)**
- Room, night: NORTHGATE SAVINGS BANK COLLAPSES — THOUSANDS LOSE SAVINGS. N: *"That night, the worst headline yet."* · *"Thousands of families. Everything they have saved."* · *"So you warn them."* (you type, post; send chime)
- **The spread**, top-down. N: *"Ten shares. Then a thousand."* · *"By three in the morning, half the city has read your warning."* (windows light faster and faster; score accelerates)
- Dawn queue. N: *"At dawn they come to take their money out. All of them. At once."*
- High wide. N: *"In 1948, the sociologist Robert Merton gave this a name: the self-fulfilling prophecy. A belief that makes itself come true."* · *"A bank never holds all its savers' money in cash. If everyone asks on the same day, it cannot pay."* · *"In March 2023, customers of one American bank tried to withdraw forty-two billion dollars in a single day. By the next morning, it was shut."*
- Shutter slams. Silence. Phone: BANK COLLAPSES AFTER VIRAL WARNING. N: *"The bank was never going to fail."* · *"Until you told everyone it would."*

**IV · Cassandra (300–378)**
- Storm-dusk, room. Phone (battery 9 %): OLD RIVER BRIDGE FALLS IN STORM, 7:04 P.M. — 12 CARS LOST. N: *"Two days later, the one headline you cannot ignore."*
- Call. D: *"Emergency services. What's your emergency?"* · Y: *"The Old River Bridge. It's going to collapse at seven-oh-four. Close it."* · D: *"…Wait. You're the courier. The bank post."* · D: *"Do you know how many people lost their jobs this week? Get off this line."* — click.
- Very high wide, storm. N: *"The Greeks told of Cassandra, a princess who could see the future, cursed so that no one would ever believe her."* · *"Tonight, that's you."* · *"Twenty-four minutes. Nine percent battery."*

**V · Seven Oh Four (378–450)**
- Ride through the storm. (no narration: rain, thunder, tyres, the score)
- Bridge head: you drag the barrier across, stand in the lane, phone held high. N: *"Nobody believes a warning from a stranger."* · *"But almost everyone stops for a person standing in the road."* Cars stop one by one; horns. Y: *"Stay back! Please, stay back!"*
- 7:03, battery 1 %. Close dive. N: *"Seven oh three."*
- 7:04: lightning; the middle span tears loose and drops into the river. Empty. Deep boom.
- The phone dies; its light goes out. Black, rain only.

**Epilogue · Tomorrow (450–480)**
- Dawn, the gap in the bridge, the stopped cars, you on the kerb. Phone restarts: `THU 13 MAR` = the real date. N: *"In the morning, your phone shows today's news. Only today's."* · *"Nobody gets to read tomorrow."* · *"But everybody writes it."*
- End title: *Tomorrow's News*.

## 8. Cue map (score)

80 bpm, 4/4, one bar = 3.0 s; 160 bars ≈ 480 s. Key: E minor → E major at the end. A three-note **notification motif** (glockenspiel B–E–F♯) = the phone; a pizzicato **clock tick** on every beat = time.

| Section | Bars | Music |
|---|---|---|
| Cold open | 1–10 | low string pad, harp ostinato, rain; motif on the 00:00 buzz (bar 6) |
| Title | 9–11 | horn statement of the motif, timpani roll |
| I | 11–34 | pizz clock tick enters at 7:41; **cut to rain on the 7:42 downbeat** with cello line; light, curious ride music (pizz + glock + recorder) |
| II | 34–64 | café: harp + recorder, warm; **near-silence at 2:10** (pad only, 2 bars); motif in minor when the headline rewrites; Lorenz: strings swell, motif inverted |
| III | 64–100 | night: low strings; **the spread: accelerando** (tick and harp ostinato double, timpani builds, ~bars 70–78); dawn queue: horns, tense; **hard stop on the shutter** (bar 92) into reverb, 1 bar silence |
| IV | 100–126 | storm: violin tremolo, slow clock tick (half time), low horn; Cassandra over cellos |
| V | 126–150 | full: timpani, tremolo, horns, tick at double time; **hard stop at 7:04** (bar 145) on the span drop, reverb tail, then rain only |
| Epilogue | 151–160 | harp + strings, the motif resolved in E major, a held chord under the end title |

Every cut lands on a bar line; key actions (00:00 buzz, 7:42 rain, heater out, send, shutter, 7:04) land on downbeats.

## 9. Sound design

| Section | Ambience bed | Main foley | Music |
|---|---|---|---|
| Cold open, room | rain on glass, distant traffic | phone buzz, clock tick, bed creak | pad, harp |
| Tram Street, dawn | city morning, birds; then rain | flip clock, tram bell, bike freewheel, dog bark | tick, curious |
| Café | room tone, espresso hiss | door bell, heater hum (stops), wall clock | warm harp |
| Overhead | wind high over the city | soft notification pings multiplying | accelerando |
| Dawn queue | crowd murmur, rising | footsteps, shutter clank (impact) | horns → stop |
| Call | storm on glass | dial tone, line click | tremolo |
| Bridge | storm, waves, wind | thunder after each flash, tyres, horns, barrier scrape, steel groan, the span's deep boom + splash | full → stop |
| Dawn after | gulls, calm river water | phone boot chime | resolution |

Silences: 2:10 (nothing burns), the shutter, 7:04 (the phone dies). J-cuts: the rain of shot 6 starts on the phone UI; the storm under the call scene runs into the bridge. L-cut: the queue murmur runs over the room shot.

## 10. Subtitles and titles

Cinzel (wide tracking) for chapter cards, the title and the phone's headlines; Cormorant Garamond italic for narration subtitles; dialogue boxes (silver border, name plate, typed text, chime) for you, Rosa and Dispatch. One language (English), one line per clip. `.srt` from the same data.

## 11. Compared with the library demo (read after this treatment was written)

| | Demo | This film | Differs? |
|---|---|---|---|
| Structure | a quest: a light carried through biomes to a landmark | three uses of the future, each worse; a turn caused by the hero | yes |
| Opening | wide harbour establishing, the landmark light fails | a sleeping city from very high, one phone-lit window, a clock turning midnight | yes (no landmark, a domestic hook) |
| Signature shot | the lighthouse relit, rising pull-back | the top-down map where a rumour spreads as thousands of lights | yes |
| Camera path | 6 shots, one set per chapter | 29 shots over 4 sets, sets revisited at different hours | yes |
| Score shape | a cut library track, drop at the ordeal | an original clock-driven score: accelerando, three hard stops | yes |
| Ending | the opening set transformed | a river bridge at dawn, the band narrowing onto you, the phone on today's date | partly (also an "aftermath" return) |

To stay clear of the demo's harbour and storm-at-sea: the climax is on a **river bridge inside the city**, not at the coast; the carried light is a phone, and it **dies** (the demo's lantern survives).
