import sys
import platform

version = sys.version.split()[0]
f"Python {version} on {platform.system()} ({platform.machine()}): 2 ** 100 = {2 ** 100}"
