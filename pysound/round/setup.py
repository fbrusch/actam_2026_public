clock = Clock(100)
m = Band(clock)
out = stream_of(m)
out.start()                                  # it waits for the audio button

melody = Loop(fm, played(pluck), clock, bar=8)

kicks = Steps("................", "k")
snares = Steps("................", "s")
hats = Steps("................", "h")

m.sources = [melody, Loop(kicks, drum, clock), Loop(snares, drum, clock), Loop(hats, drum, clock)]
