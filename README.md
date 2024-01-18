# 4611Projects
A set of 6 graphics assignments I did as part of the UMN Course CSCI 4611: Interactive 3D Graphics. 

These were all programmed using the University of Minnesota GopherGFX Library, by Evan Suma Rosenberg. Documentation can be found at: <https://illusioneering.github.io/GopherGfx/>. The github can be found here: <https://github.com/illusioneering/GopherGfx>. 

This graphics library is designed to teach coders about graphics and design, but still be very similar to the libraries used in real world applications. 

## Assignment 1: Text Rain
You can see an example of this app running at <https://csci-4611-fall-2023.github.io/assignment-1-Odonn159/>. 
![Text Rain](/pictures/assignment1textrain.png "Text Rain")
This is a classic interactive graphic game/exhibit. The program takes in as input a video, either one of the provided downloads, or live camera, either of which can be selected in the top right corner. It then drops a bunch of raining characters, stopping and going up when interacting with darker pixels. This application works best with a light background and dark characters, like those seen in ./TextRainInput.mp4.

Primary learning objective: Working with live video feed, and being able to switch between multiple coordinate systems for graphics based logic.

## Assignment 2: Hole in the Ground
You can see this app running at <https://csci-4611-fall-2023.github.io/assignment-2-Odonn159/>

![Hole in the Ground](/pictures/assignment2Hole.png "Hole in the Ground")

This is a very simple example of a 3d game, involving colliding balls. The goal of the game is to get all of the balls into the hole. The hole can be controlled with the arrow of wasd keys. Once you get them all in, there is a second level, with more balls and a lot of different sizes. The hole gets bigger with every ball you collect, so you need to go after the smaller balls first. 

Primary learning objective: Working with 3d graphics and very basic simulation of collisions and physics. Balancing between realism and gameplay by simulating physics in a plausible but not necessarily realistic way.

## Assignment 3: Earthquake Visualization
You can see this app running at <https://csci-4611-fall-2023.github.io/assignment-3-Odonn159/>

![Earthquakes](/pictures/assignment3Earthquakes.png "Earthquakes")

This simulation shows over a hundred years of earthquakes across the globe. Each earthquake appears as a small sphere on the correct part of Earth where it's epicenter was measured. Earthquake severity is shown by size and color, being big and red at higher magnitudes. Over time, these orbs shrink and become more white, to show how long they have been around and to provide a more seemless transition. You can transition between a 3d globe and a 2d map using the drop-down menu in the top left, and adjust the speed of the simulation with the sliding bar.

Primary learning objective: Working with more complex transformations on objects and textures, and working with linear interpolation to create a smooth transition between 2d and 3d graphics. 


## Assignment 4: Dancing Animation
You can see this app running at <https://csci-4611-fall-2023.github.io/assignment-4-Odonn159/>

![Dancing Ants](/pictures/assignment4Dance.png "Dancing Ants")

This project uses Carnegie Melon Universities motion capture data to show a character dancing <http://mocap.cs.cmu.edu/>. This project uses skeleton 05.asf, and uses amc files 05_02, 05_10, 05_09, 05_20, 05_06, as dance motions 1-5 respectively. These files are trimmed down to more immediately show the intended motion, and as a result have some idle time taken off the front and back. 

You can play and pause the animation using the top most button in the top left dropdown menu. You can also choose the character model, either representing an "ant" which is the custom character designed, or a skeleton, or the actual joint and bonespaces (primarily for debugging). There are 2 different dance scenes, the Ballet Studio allows you to choose which moves you want the character to perform and in what order. The Salsa Class has two characters dancing together. However, you cannot choose their dances, and it will always be the custom character. 

Primary learning objective: Incorporating translation and reference matrices, hierarchical bone structures and how they change the final result (ie if the hand is connected to the forearm, to the arm to the shoulder, how does changing the shoulder cause a cascading effect on all objects). Working with motion capture data. Creating simple characters using only 3d geometry. 

## Assignment 5: Artistic Texturing and Shaders
You can see this app running at <https://csci-4611-fall-2023.github.io/assignment-5-Odonn159/>

This project involves the appliance of a variety of shaders onto stationary 3d objects. You can select the shading style, model object, texture and lighting in the drop down menu. You can rotate your view to see other parts of the models by clicking and dragging your mouse. You can also zoom in and out using scroll wheel.

Toon: 

![Toon Shader](/pictures/assignment5Toon.png "Toon Shader")
Phong and Gourad shaders are typical within the industry. The toon shader is meant to look like a cartoon by making the steps in the shader more discrete (less gradual), thus providing more simple looking lighting. It also adds a thick black outline to emphasize the shape. Normal map is a graphics strategy intended to add depth, making objects look like they have grooves or indents without spending the resources needed to actually model them. 

Normal Mapping: 

![Normal Map](/pictures/assignment5Normal.png "Normal Map")

Primary learning objective: Working with diffuse, ambient and specular lighting to show realistic lighting of 3d objects. Modifying geometry on the fly to create viewpoint-dependent effects such as silhouette outlines. Manipulating per-pixel normals to create the illusion of more complex surfaces.

## Assignment 6: Harold's Crayon World
You can see this app running at <https://csci-4611-fall-2023.github.io/assignment-6-Odonn159/>

This project involved creating a custom world based on the famous children's book "Harold and the Purple Crayon". You can draw clouds, billboards and even change the terrain you walk on. 

Billboards: 

![Billboard](/pictures/assignment6billboard.png "Billboard")

Controls. You can walk around with wasd. Turn the camera by right clicking and dragging. Left click with your mouse draws something, depending on where you draw it. If you start drawing in the sky, it creates a sky stroke. If you start drawing on the ground and end in the sky, you create a billboard. If you start drawing on a billboard, it will add on to the existing billboard. These structures will always turn to face you. Finally, if you start on the ground and end on the ground, you can change the shape of the ground you walk on, creating hills and valleys.

Sky Stroke:

![SkyStroke](/pictures/assignment6skystroke.png "SkyStroke")

The ground editing function uses a curve described in this research paper <https://dl.acm.org/doi/10.1145/340916.340927>. 

Ground:

![Ground](/pictures/assignment6ground.png "Ground")

Primary learning objective: Performing mesh-editing based on the users input. Using ray-tracing and intersection tests to be able to convert between 2d coordinates of the user and the 3d coordinates of the simulated world. 
