set homePath to POSIX path of (path to home folder)
set launcherPath to homePath & ".codexskin/bin/launch-warm-meow.sh"
set logPath to homePath & ".codexskin/state/launcher.log"
do shell script quoted form of launcherPath & " >" & quoted form of logPath & " 2>&1 &"
