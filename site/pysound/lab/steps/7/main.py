# The library of lesson 11 is already loaded: Clock, Band, Loop, the parts of the tune, the instruments.
clock = Clock(100)
m = Band(clock)
out = stream_of(m)

drums = Loop(note("k") >> note("h") >> note("s") >> note("h"), drum, clock)
melody = Loop(call, played(pluck), clock)
m.sources = [drums, melody]
