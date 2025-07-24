rm -rf videos/*

ffmpeg -loop 1 -i images/page-1.png -c:v libx264 -t 5 -pix_fmt yuv420p -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1" videos/video1.mp4
ffmpeg -loop 1 -i images/page-2.png -c:v libx264 -t 5 -pix_fmt yuv420p -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1" videos/video2.mp4
ffmpeg -loop 1 -i images/page-3.png -c:v libx264 -t 5 -pix_fmt yuv420p -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1" videos/video3.mp4

ffmpeg -i videos/video1.mp4 -i videos/video2.mp4 -i videos/video3.mp4 -filter_complex "[0:v][1:v]xfade=transition=fade:duration=1:offset=4[v12]; [v12][2:v]xfade=transition=fade:duration=1:offset=8" videos/final_video.mp4