Simple game for Muse EEG headband which helps you to move mouse horizontally.
It has 3 parts: 
* Train SVM to separate left and right side
* Control mouse
* Has interface in browser to see all process in graphs

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
* You should be getting a live training and testing with normalized beta absolute power and after it move the mouse.
If the process stopped it is maybe due to the bad signal from one of the frontal electrodes  
* You can stop (and start) mouse control by typing "y" letter and enter
* You can start training by clicking button in browser or passing parameter - node server.js start_training
* You can run demo program without muse device by typing node server.js demo (it will be different from real training Muse EEG because you won't notice appearing instructions to look left or right
Demo looks like this:
![image](http://biophysical.eu/images/MindMouse.jpg)
Here you can find a mini demonstration
https://youtu.be/ZrI-5-QBG_g

# Game examples

I enjoyed play with mouse movements these simple games: 
http://minimouse.us/index.html

# TODO
1. Write tests
2. Let change boundary in window how much mouse can move
3. Compare SVM to other nonlinear classifier or model with more input parameters
4. Use TP9, TP10 electrodes when they are good
5. Add tutorial and articles
6. Send training data to database (personal classifiers)\
7. Button in interface to start or stop mouse control

If you have some questions just write to ieva.vaisnoraite2@gmail.com

# Forked from

- Inital app work: [bobi-rakova](https://github.com/bobi-rakova/muse)
- Readme updates: [paulirish](https://github.com/paulirish/muse-node)
- Animated GIF: [derekbreden](https://github.com/derekbreden/muse-node)
- Updates to structure [JamesHagerman](https://github.com/JamesHagerman/muse-node)


