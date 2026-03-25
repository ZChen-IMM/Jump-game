import array
import board
import audiobusio
import time

mic = audiobusio.PDMIn(board.MICROPHONE_CLOCK, board.MICROPHONE_DATA,
                       sample_rate=16000, bit_depth=16)

samples = array.array('H', [0] * 32)

CLAP_THRESHOLD = 5000
CLAP_COOLDOWN = 0.05
last_jump_time = 0

while True:
    mic.record(samples, len(samples))
    peak = max(samples) - min(samples)

    now = time.monotonic()
    if peak > CLAP_THRESHOLD and (now - last_jump_time) > CLAP_COOLDOWN:
        print("jump")  # ← this is the only change that matters
        last_jump_time = now

    time.sleep(0.02)
