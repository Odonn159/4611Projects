/* Assignment 2: Hole in the Ground
 * CSCI 4611, Spring 2023, University of Minnesota
 * Instructor: Evan Suma Rosenberg <suma@umn.edu>
 * License: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 */ 

import * as gfx from 'gophergfx'
import { RigidBody } from './RigidBody';

export class PhysicsGame extends gfx.GfxApp
{
    // State variable to store the current stage of the game
    private stage: number;

    // Current hole radius
    private holeRadius: number;

    // Mesh of a ground plane with a hole in it
    private hole: gfx.Mesh3;

    // Template mesh to create sphere instances
    private sphere: gfx.Mesh3;

    // Bounding box that defines the dimensions of the play area
    private playArea: gfx.BoundingBox3;

    // Group that will hold all the rigid bodies currently in the scene
    private rigidBodies: gfx.Node3;  

    // A plane mesh that will be used to display dynamic text
    private textPlane: gfx.Mesh3;

    // A dynamic texture that will be displayed on the plane mesh
    private text: gfx.Text;

    // A sound effect to play when an object falls inside the hole
    private holeSound: HTMLAudioElement;

    // A sound effect to play when the user wins the game
    private winSound: HTMLAudioElement;
    private collisionsound: HTMLAudioElement;

    // Vector used to store user input from keyboard or mouse
    private inputVector: gfx.Vector2;

    constructor()
    {
        super();

        this.stage = 0;

        this.holeRadius = 1;
        this.hole = gfx.MeshLoader.loadOBJ('./assets/hole.obj');
        this.sphere = gfx.Geometry3Factory.createSphere(1, 2);

        this.playArea = new gfx.BoundingBox3();
        this.rigidBodies = new gfx.Node3();
        
        this.textPlane = gfx.Geometry3Factory.createPlane();
        //Changed text to white
        this.text = new gfx.Text('press a button to start', 512, 256, '48px Helvetica', gfx.Color.WHITE);
        this.holeSound = new Audio('./assets/hole.mp3');
        this.collisionsound = new Audio('./assets/collision.mp3');
        this.winSound = new Audio('./assets/win.mp3');

        this.inputVector = new gfx.Vector2();
    }

    createScene(): void 
    {
        // Setup the camera projection matrix, position, and look direction.
        // We will learn more about camera models later in this course.
        this.camera.setPerspectiveCamera(60, 1920/1080, 0.1, 50)
        this.camera.position.set(0, 12, 12);
        this.camera.lookAt(gfx.Vector3.ZERO);

        // Create an ambient light that illuminates everything in the scene
        const ambientLight = new gfx.AmbientLight(new gfx.Color(0.3, 0.3, 0.3));
        this.scene.add(ambientLight);

        // Create a directional light that is infinitely far away (sunlight)
        const directionalLight = new gfx.DirectionalLight(new gfx.Color(0.6, 0.6, 0.6));
        directionalLight.position.set(0, 2, 1);
        this.scene.add(directionalLight);

        // Set the hole mesh material color to green
        this.hole.material.setColor(new gfx.Color(83/255, 209/255, 110/255));

        // Create a bounding box for the game
        this.playArea.min.set(-10, 0, -16);
        this.playArea.max.set(10, 30, 8);

        // Position the text plane mesh on the ground
        this.textPlane.position.set(0, 0.1, 4.5);
        this.textPlane.scale.set(16, 8, 1);
        this.textPlane.rotation.setEulerAngles(-Math.PI/2, 0, Math.PI);

        // Set up the dynamic texture for the text plane
        const textMaterial = new gfx.UnlitMaterial();
        textMaterial.texture = this.text;
        this.textPlane.material = textMaterial;

        // Draw lines for the bounding box
        const playBounds = new gfx.Line3();
        playBounds.createFromBox(this.playArea);
        playBounds.color.set(1, 1, 1);
        this.scene.add(playBounds);

        // Add the objects to the scene
        this.scene.add(this.hole);
        this.scene.add(this.textPlane);
        this.scene.add(this.rigidBodies);
    }

    update(deltaTime: number): void 
    {
        // This code defines the gravity and friction parameters used in the
        // instructor's example implementation.  You can change them if you 
        // want to adjust your game mechanics and difficulty. 
        // However, note that the spheres in the initial scene are placed purposefully
        // to allow you to visually check that your physics code is working.

        // The movement speed of the hole in meters / sec
        const holeSpeed = 10;

        // The friction constant will cause physics objects to slow down upon collision
        const frictionSlowDown = 0.9;
        const frictionSlowDown2 = 0.98;

        // Hole radius scale factor
        const holeScaleFactor = 1.25;

        // Move hole based on the user input
        this.hole.position.x += this.inputVector.x * holeSpeed * deltaTime;
        this.hole.position.z -= this.inputVector.y * holeSpeed * deltaTime;



        //=========================================================================
        // PART 1: HOLE MOVEMENT
        // The code above allows the user to move the hole in the X and Z directions.
        // However, we want to add some boundary checks to prevent the hole from
        // leaving the boundaries, which are defined in the playArea member variable.
        
        if(this.hole.position.x>10){
            this.hole.position.x=10;
        }
        if(this.hole.position.x<-10){
            this.hole.position.x=-10;
        }
        if(this.hole.position.z>8){
            this.hole.position.z=8;
        }
        if(this.hole.position.z<-16){
            this.hole.position.z=-16;
        }
        //=========================================================================


        // Update rigid body physics
        // You do not need to modify this code
        this.rigidBodies.children.forEach((transform: gfx.Node3) => {
            const rb = transform as RigidBody;
            rb.update(deltaTime);
        });

        // Handle object-object collisions
        // You do not need to modify this code
        for(let i=0; i < this.rigidBodies.children.length; i++)
        {
            for(let j=i+1; j < this.rigidBodies.children.length; j++)
            {
                const rb1 = this.rigidBodies.children[i] as RigidBody;
                const rb2 = this.rigidBodies.children[j] as RigidBody;
                //Friction slow down is too severe in my game to be enjoyable...
                if(this.stage==0){
                    this.handleObjectCollision(rb1, rb2, frictionSlowDown)
                }
                else{
                    this.handleObjectCollision(rb1, rb2, frictionSlowDown2)
                }
            }
        }

        // Handle object-environment collisions
        // You do not need to modify this code
        this.rigidBodies.children.forEach((transform: gfx.Node3) => {
            const rb = transform as RigidBody;

            // The object has fallen far enough to score a point
            if(rb.position.y < -10)
            {
                this.holeSound.play(); 

                // Remove the object from the scene
                rb.remove();

                //Check if we captured the last sphere
                if(this.rigidBodies.children.length == 0)
                    this.startNextStage();
                else
                    this.setHoleRadius(this.holeRadius * holeScaleFactor);
            }
            // The object is within range of the hole and can fit inside
            else if(rb.getRadius() < this.holeRadius && rb.position.distanceTo(this.hole.position) < this.holeRadius)
            {
                this.handleRimCollision(rb, frictionSlowDown);
            }
            // The object has not fallen all the way into the hole yet
            else if(rb.position.y + rb.getRadius() > 0)
            {
                if(this.stage==0){
                    this.handleBoundaryCollision(rb, frictionSlowDown)
                }
                else{
                    this.handleBoundaryCollision(rb, frictionSlowDown2)
                }
            }
            
        });
    }

    handleBoundaryCollision(rb: RigidBody, frictionSlowDown: number): void
    {


        // PART 3: BOUNDARY COLLISIONS
        
        // As a first step, you should review the explanations about detecting collisions,
        // updating position after a collision, and updating velocity after a collision.
        // In this method, you will need to:
        // 1. Check if the sphere is intersecting each boundary of the play area. 
        // 2. Correct the intersection by adjusting the position of the sphere.
        // 3. Compute the reflected velocity after the collision. Note that because the ground
        // and walls are aligned with the XYZ axes, this is the simple case of negating one
        // dimension of the velocity vector.
        // 4. After a collision, slow down the velocity due to friction.

        if(rb.position.y<rb.getRadius()){
            rb.position.y = rb.getRadius();
            rb.velocity.y = -rb.velocity.y;
            rb.velocity.multiplyScalar(frictionSlowDown);
        }
        if(rb.position.x>10-rb.getRadius()){
            rb.position.x=10-rb.getRadius();
            rb.velocity.x = -rb.velocity.x;
            rb.velocity.multiplyScalar(frictionSlowDown);
        }
        if(rb.position.x<-10+rb.getRadius()){
            rb.position.x=-10+rb.getRadius();
            rb.velocity.x = -rb.velocity.x;
            rb.velocity.multiplyScalar(frictionSlowDown);
        }
        if(rb.position.z>-rb.getRadius()+8){
            rb.position.z=8-rb.getRadius();
            rb.velocity.z = -rb.velocity.z;
            rb.velocity.multiplyScalar(frictionSlowDown);
        }
        if(rb.position.z<-16+rb.getRadius()){
            rb.position.z=-16+rb.getRadius();
            rb.velocity.z = -rb.velocity.z;
            rb.velocity.multiplyScalar(frictionSlowDown);
        }


    }

    handleObjectCollision(rb1: RigidBody, rb2: RigidBody, frictionSlowDown: number): void
    {
        

        // PART 4: RIGID BODY COLLISIONS
        // This is the most challenging part of this assignment, so make sure to
        // read all the information described in the README.  If you are struggling 
        // with understanding the math or have questions about how to implement the 
        // equations, then you should seek help from the instructor or TA. 

        let difference = rb1.position.clone();
        difference.subtract(rb2.position);
        let normaldiff = difference.clone();
        normaldiff.normalize();//Normalized vector
        const inversenormal = gfx.Vector3.multiplyScalar(normaldiff, -1);
        if(difference.length()<=rb1.getRadius()+rb2.getRadius()){//Collision detected
            const reposition = 1/2 * (rb1.getRadius()+rb2.getRadius()-difference.length()); //We reposition by half the overlap, for each making them move apart
            normaldiff.multiplyScalar(reposition);//Reposition by normalized vector, times deposition.
            rb1.position.add(normaldiff);
            rb2.position.subtract(normaldiff);
            normaldiff.normalize();//Renormalize. By this point the velocities haven't changed but they are not overlapping
            const vrel1 = gfx.Vector3.subtract(rb1.velocity,rb2.velocity);
            const vrel2 = gfx.Vector3.subtract(rb2.velocity,rb1.velocity)
            rb1.velocity = gfx.Vector3.reflect(vrel1, normaldiff);
            rb2.velocity = gfx.Vector3.reflect(vrel2, inversenormal)
            rb1.velocity.multiplyScalar(frictionSlowDown/2); //Multiply by 1/2 to split velocity between two balls, and also reduce to friction
            rb2.velocity.multiplyScalar(frictionSlowDown/2);//Multiply by 1/2 to split velocity between two balls, and also reduce to friction
            this.collisionsound.play();
        }

    }

    // This method handles collisions between the rigid body and the rim
    // of the hole. You do not need to modify this code
    handleRimCollision(rb: RigidBody, frictionSlowDown: number): void
    {
        // Compute the rigid body's position, ignoring any vertical displacement
        const rbOnGround = new gfx.Vector3(rb.position.x, 0, rb.position.z);

        // Find the closest point along the rim of the hole
        const rimPoint = gfx.Vector3.subtract(rbOnGround, this.hole.position);
        rimPoint.normalize();
        rimPoint.multiplyScalar(this.holeRadius);
        rimPoint.add(this.hole.position.clone());

        // If the rigid body is colliding with the point on the rim
        if(rb.position.distanceTo(rimPoint) < rb.getRadius())
        {
            // Correct the position of the rigid body so that it is no longer intersecting
            const correctionDistance = rb.getRadius() - rb.position.distanceTo(rimPoint) ;
            const correctionMovement = gfx.Vector3.subtract(rb.position, rimPoint);
            correctionMovement.normalize();
            correctionMovement.multiplyScalar(correctionDistance);
            rb.position.add(correctionMovement);

            // Compute the collision normal
            const rimNormal = gfx.Vector3.subtract(this.hole.position, rimPoint);
            rimNormal.normalize();

            // Reflect the velocity about the collision normal
            rb.velocity.reflect(rimNormal);

            // Slow down the velocity due to friction
            rb.velocity.multiplyScalar(frictionSlowDown);
        }
    }

    // This method advances to the next stage of the game
    startNextStage(): void
    {
        // Create a test scene when the user presses start
        if(this.stage == 0)
        {
            this.textPlane.visible = false;
            
            const rb1 = new RigidBody(this.sphere);
            rb1.material = new gfx.GouraudMaterial();
            rb1.material.setColor(gfx.Color.RED);
            rb1.position.set(0, 0.25, 7.5);
            rb1.setRadius(0.25);
            rb1.velocity.set(0, 10, -4);
            this.rigidBodies.add(rb1);
    
            const rb2 = new RigidBody(this.sphere);
            rb2.material = new gfx.GouraudMaterial();
            rb2.material.setColor(gfx.Color.GREEN);
            rb2.position.set(-8, 1, -5);
            rb2.setRadius(0.5);
            rb2.velocity.set(4, 0, 0);
            this.rigidBodies.add(rb2);
    
            const rb3 = new RigidBody(this.sphere);
            rb3.material = new gfx.GouraudMaterial();
            rb3.material.setColor(gfx.Color.BLUE);
            rb3.position.set(8, 1, -4.5);
            rb3.setRadius(0.5);
            rb3.velocity.set(-9, 0, 0);
            this.rigidBodies.add(rb3);
    
            const rb4 = new RigidBody(this.sphere);
            rb4.material = new gfx.GouraudMaterial();
            rb4.material.setColor(gfx.Color.YELLOW);
            rb4.position.set(0, 0.25, -12);
            rb4.setRadius(0.5);
            rb4.velocity.set(15, 10, -20);
            this.rigidBodies.add(rb4);
        }
        // The user has finished the test scene
        else if(this.stage == 1)
        {
            this.setHoleRadius(0.5);
            let currentrb = new RigidBody(this.sphere);
            for(let i=0; i<15;i++){
                currentrb = new RigidBody(this.sphere);
                currentrb.material = new gfx.GouraudMaterial();
                currentrb.material.setColor(new gfx.Color(Math.random(), Math.random(), Math.random(), 0)); //Random Colors
                currentrb.position.set(Math.random()*20-10, Math.random()*3, Math.random()*24-16);//random x between 0 and 10, y between 0 and 3, and z between -16 and 8
                currentrb.setRadius(0.1*(Math.pow(1.25, i)));//Size is 1.25^i times larger than 0.3. increases at the same rate as the hole
                currentrb.velocity.set(Math.random()*24-12, Math.random()*24, Math.random()*24-12);//As the balls get larger, they get slower.
                this.rigidBodies.add(currentrb);
            }
            //I lowered the friction slowdown to .98 in stage 2 to make it slow down slower.
            //Things slow down too much, gets boring quick..., I am going to add move y velocity
            // PART 5: CREATE YOUR OWN GAME
            // In this part, you should create your own custom scene!  You should
            // refer the code above to see how rigid bodies were created for the
            // test scene. You have a lot of freedom to create your own game,
            // as long as it meets the minimum requirements in the rubric.  
            // Creativity is encouraged!

            // ADD YOUR CODE HERE


        }
        // The user has finished the game
        else
        {
            this.text.text = 'YOU WIN!';
            this.text.updateTextureImage();
            this.textPlane.visible = true;
            this.winSound.play();
        }

        this.stage++;
    }

    // Set the radius of the hole and update the scale of the
    // hole mesh so that it is displayed at the correct size.
    setHoleRadius(radius: number): void
    {
        this.holeRadius = radius;
        this.hole.scale.set(radius, 1, radius);
    }

    // Set the x or y components of the input vector when either
    // the WASD or arrow keys are pressed.
    onKeyDown(event: KeyboardEvent): void 
    {
        if(event.key == 'w' || event.key == 'ArrowUp')
            this.inputVector.y = 1;
        else if(event.key == 's' || event.key == 'ArrowDown')
            this.inputVector.y = -1;
        else if(event.key == 'a' || event.key == 'ArrowLeft')
            this.inputVector.x = -1;
        else if(event.key == 'd' || event.key == 'ArrowRight')
            this.inputVector.x = 1;
    }

    // Reset the x or y components of the input vector when either
    // the WASD or arrow keys are released.
    onKeyUp(event: KeyboardEvent): void 
    {
        if((event.key == 'w' || event.key == 'ArrowUp') && this.inputVector.y == 1)
            this.inputVector.y = 0;
        else if((event.key == 's' || event.key == 'ArrowDown') && this.inputVector.y == -1)
            this.inputVector.y = 0;
        else if((event.key == 'a' || event.key == 'ArrowLeft')  && this.inputVector.x == -1)
            this.inputVector.x = 0;
        else if((event.key == 'd' || event.key == 'ArrowRight')  && this.inputVector.x == 1)
            this.inputVector.x = 0;
    }

    // These mouse events are not necessary to play the game on a computer. However, they
    // are included so that the game is playable on touch screen devices without a keyboard.
    onMouseMove(event: MouseEvent): void 
    {
        // Only update the mouse position if only the left button is currently pressed down
        if(event.buttons == 1)
        {
            const mouseCoordinates = this.getNormalizedDeviceCoordinates(event.x, event.y);

            if(mouseCoordinates.x < -0.5)
                this.inputVector.x = -1;
            else if(mouseCoordinates.x > 0.5)
                this.inputVector.x = 1;

            if(mouseCoordinates.y < -0.5)
                this.inputVector.y = -1;
            else if(mouseCoordinates.y > 0.5)
                this.inputVector.y = 1;
        }
    }

    onMouseUp(event: MouseEvent): void
    {
        // Left mouse button
        if(event.button == 0)
            this.inputVector.set(0, 0);
    }

    onMouseDown(event: MouseEvent): void 
    {
        if(this.stage==0)
            this.startNextStage();
        else
            this.onMouseMove(event);
    }

}