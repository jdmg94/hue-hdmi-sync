# Hue HDMI Sync

A Node.js CLI tool that uses OpenCV to match video input to Phillips Hue Entertainment API

## Run with docker

With version 1.2 the app has been dockerized to make the setup easier and provide a better developer experience

In order for the app to work correctly on docker we need to grant some access to the container.
First the app uses avahi to browse mdns, the easiest way to make this work is to pass along the hosts' network through option `--net host` however this will only work if the host is linux based.
OpenCV needs access to the video capture device,  you want to find your video input on `/dev/` and match it to `/dev/video0` on the container.
Lastly, you can should run the container interactively by adding options `--tty` and  `--input` (summarized as `-ti`)

> docker run -ti --net host --device /dev/video0:/dev/video0 superiortech/hue-hdmi-sync
