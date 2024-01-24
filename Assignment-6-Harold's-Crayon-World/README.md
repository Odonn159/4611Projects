## Assignment 6: Harold's Crayon World
You can see this app running at <https://csci-4611-fall-2023.github.io/assignment-6-Odonn159/>

This project involved creating a custom world based on the famous children's book "Harold and the Purple Crayon". You can draw pictures in the sky, billboards and even change the terrain you walk on. 

Billboards: 

![Billboard](/pictures/assignment6billboard.png "Billboard")

Controls. You can walk around with wasd. Turn the camera by right clicking and dragging. Left click with your mouse draws something, depending on where you draw it. If you start drawing in the sky, it creates a sky stroke. If you start drawing on the ground and end in the sky, you create a billboard. If you start drawing on a billboard, it will add on to the existing billboard. These structures will always turn to face you. Finally, if you start on the ground and end on the ground, you can change the shape of the ground you walk on, creating hills and valleys.

Sky Stroke:

![SkyStroke](/pictures/assignment6skystroke.png "SkyStroke")

The ground editing function uses a curve described in this research paper <https://dl.acm.org/doi/10.1145/340916.340927>. 

Ground:

![Ground](/pictures/assignment6ground.png "Ground")

Primary learning objective: Performing mesh-editing based on the users input. Using ray-tracing and intersection tests to be able to convert between 2d coordinates of the user and the 3d coordinates of the simulated world. 
