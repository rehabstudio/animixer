on run argv
    set scriptFile to (POSIX file (item 1 of argv))
    tell application "Adobe After Effects CC 2018"
        DoScriptFile scriptFile
        DoScript item 2 of argv
   end tell
end run
