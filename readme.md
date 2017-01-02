Simple game for Muse EEG headband which helps you to move mouse horizontally.
It has 3 parts: 
1. Train SVM to separate left and right side
2. Control mouse
3. Has interface in browser to see all process in graphs

# Running

* Get the [muse headband](http://www.choosemuse.com/)
* Get the [muse sdk](https://sites.google.com/a/interaxon.ca/muse-developer-site/download/macos-install---sdk-v2-2)
* Pair your device
* Run [muse-io](https://sites.google.com/a/interaxon.ca/muse-developer-site/museio/tutorial). 
  * For example: `muse-io --preset 14 --device Muse --osc osc.udp://localhost:5000` 
  * You should be seeing something like ![image](https://cloud.githubusercontent.com/assets/39191/4486860/32465e9c-49ee-11e4-83ee-13d7e8611cf7.png)
* You might have to reinstall the node-serialport package to get a binary built for your machine. This repo right now handles mac only. 
  * You'll get an error from the next step if you do. :)
* Run `node server.js`
* Serve the public folder
* You should be getting a live D3 visual of your brainwave EEG.

# Game examples
I enjoyed play with mouse movements these simple games: 
http://minimouse.us/index.html

# TODO
1. Live second graph update
2. Pause for Mouse moving functionality
3. Draw SVM boundary
4. Implement non linear classificator
5. Show which electrode signal is bad
6. Use TP9, TP10 electrodes when they are good
7. Make code more object orientated
8. Add tutorial and articles


# Forked from

- Inital app work: [bobi-rakova](https://github.com/bobi-rakova/muse)
- Readme updates: [paulirish](https://github.com/paulirish/muse-node)
- Animated GIF: [derekbreden](https://github.com/derekbreden/muse-node)
- Updates to structure [JamesHagerman](https://github.com/JamesHagerman/muse-node)
