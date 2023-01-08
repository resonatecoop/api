# if you need to add execute privs for this file:
#   chmod +x copyAudioFiles.sh

rsync -av test/media/audio/ data/media/audio/ --exclude 'whiteNoise*.m4a'

# if rsync is not available, you can use cp below, but it will copy the whiteNoise*.m4a files.
# cp test/media/audio/*.m4a data/media/audio/
