set animixer to (read file "Macintosh HD:Users:noel.wilson:Projects:animixer:generateGif:animixer.jsx")
tell application "Adobe After Effects CC 2018"
	DoScript animixer
end tell
