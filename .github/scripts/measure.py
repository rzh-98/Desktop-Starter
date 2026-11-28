import os
import platform
import subprocess
import sys
import time
from pathlib import Path

import psutil

shell = sys.argv[1]
system = platform.system()
tauri = shell == 'tauri'
folder = Path('src-tauri/target/release' if tauri else 'release')
pattern = {
    'Darwin': 'bundle/macos/*.app/Contents/MacOS/*' if tauri else '*/mac*/*.app/Contents/MacOS/*',
    'Linux': 'desktop-starter-tauri' if tauri else '*/linux-unpacked/desktop-starter',
    'Windows': 'desktop-starter-tauri.exe' if tauri else '*/win-unpacked/Desktop Starter.exe',
}[system]
executable, = folder.glob(pattern)
extension = {'Darwin': 'dmg', 'Windows': 'exe', 'Linux': 'AppImage'}[system]
installers = folder.glob(f'bundle/*/*.{extension}' if tauri else f'*/*.{extension}')
installer, = installers
args = [str(executable.resolve())]
if tauri:
    subprocess.run([*args, '--check-renderer'], check=True, timeout=60)
if not tauri and system == 'Linux':
    args.append('--no-sandbox')
with subprocess.Popen(args) as app:
    try:
        time.sleep(8)
        if app.poll() is not None:
            raise RuntimeError(f'Application exited with {app.returncode}')
        parent = psutil.Process(app.pid)
        rss = sum(process.memory_info().rss for process in [parent, *parent.children(recursive=True)] if process.is_running())
        result = f'{shell} / {system}: {installer.stat().st_size / 2**20:.1f} MiB installer; {rss / 2**20:.1f} MiB process-tree RSS after 8 seconds.'
        print(result)
        if 'GITHUB_STEP_SUMMARY' in os.environ:
            with open(os.environ['GITHUB_STEP_SUMMARY'], 'a', encoding='utf8') as summary:
                print(result, file=summary)
        if tauri and os.getenv('GITHUB_ACTIONS') == 'true':
            from PIL import ImageGrab
            ImageGrab.grab().save('screenshot-Tauri.png')
    finally:
        app.terminate()
