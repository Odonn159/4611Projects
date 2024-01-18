/* Assignment 6: Harold: A World Made of Drawings
 * UMN CSci-4611 Instructors 2018+
 * GopherGfx implementation by Evan Suma Rosenberg <suma@umn.edu> 2022
 * License: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * Refactoring by Prof. Dan Keefe, Fall 2023
 * Please do not distribute beyond the CSci-4611 course
 */ 

import * as gfx from 'gophergfx'
import { GUI } from 'dat.gui'
import { Billboard } from './Billboard';
import { Ground } from './Ground';
import { Stroke2D } from './Stroke2D';
import { Stroke3DFactory } from './Stroke3DFactory';
import { ToonMaterial } from './materials/ToonMaterial'
import { OutlineMaterial } from './materials/OutlineMaterial'

// This enumerator is used to keep track of the current drawing state
enum DrawState
{
    NO_DRAWING,
    DRAWING_GROUND_OR_NEW_BILLBOARD,
    DRAWING_ADDITION_TO_BILLBOARD,
    DRAWING_SKY,
}
/**
 * Main class for the Harold assignment.
 */
export class DrawingApp extends gfx.GfxApp
{
    // This radius should be as large as possible while staying within the view frustum.
    // If you change this value, you will probably also need to change the value for the
    // far clipping plane of the camera.
    private skySphereRadius = 225;

    // The ground mesh, which is wrapped in its own class since it requires some special functionality
    private ground: Ground;

    // Array to hold all the billboards that have been added to the scene so that they can
    // be rotated to face the camera whenever the camera moves.
    private billboards: Billboard[];

    // The current stroke that is being drawn or null if the user is not currently drawing.
    private currentStroke: Stroke2D | null;

    // If the user draws on top of an existing billboard, this variable will reference the
    // existing billboard so we know its anchor point.
    private targetBillboard: Billboard | null;

    // If the stroke starts on another piece of geometry (the ground or a billboard), then this
    // variable is set to the 3D point found by projecting the first point of the stroke onto
    // that geometry.
    private strokeStartPoint3D: gfx.Vector3;

    // Camera controller with for keyboard/mouse input
    private cameraControls: gfx.FirstPersonControls;

    // Parameter to determine the camera's height above the ground
    private cameraHeight: number;

    // State variable used to remember the current draw mode
    private drawState: DrawState;

    // GUI paremeters
    public groundColor: string;
    public skyColor: string;
    public crayonColor: string;
    public strokeWidth: number;

    constructor()
    {
        super();

        this.cameraControls = new gfx.FirstPersonControls(this.camera);
        this.cameraControls.mouseButton = 2;
        this.cameraControls.flyMode = false;
        this.cameraControls.translationSpeed = 5;
        this.cameraHeight = 2.0;

        this.drawState = DrawState.NO_DRAWING;

        this.ground = new Ground(100, 100);

        this.skyColor = '#bfeafc';
        this.groundColor = '#400040';
        this.crayonColor = '#219d20';
        this.strokeWidth = 0.02;

        this.billboards = [];
        this.currentStroke = null;
        this.targetBillboard = null;
        this.strokeStartPoint3D = new gfx.Vector3();
    }

    createScene(): void 
    {
        // Set the background color to the sky color
        this.renderer.background = gfx.Color.createFromString(this.skyColor);

        // Setup camera
        this.camera.setPerspectiveCamera(60, 1920/1080, .1, 750)
        this.camera.position.set(0, this.cameraHeight, 3.5);
        this.camera.lookAt(new gfx.Vector3(0, this.cameraHeight, 0));

        // Create the scene lighting
        const sceneLight = new gfx.PointLight();
        sceneLight.ambientIntensity.set(0.75, 0.75, 0.75);
        sceneLight.diffuseIntensity.set(1, 1, 1);
        sceneLight.specularIntensity.set(1, 1, 1);
        sceneLight.position.set(10, 10, 10);
        this.scene.add(sceneLight);

        // Create a toon material for rendering the ground
        const toonMaterial = new ToonMaterial(
            new gfx.Texture('./assets/toonDiffuse.png'),
            new gfx.Texture('./assets/toonSpecular.png'),
        );
        toonMaterial.ambientColor.setFromString(this.groundColor);
        toonMaterial.diffuseColor.set(0.4, 0.4, 0.4);
        toonMaterial.specularColor.set(1, 1, 1);
        toonMaterial.shininess = 50;

        // Create an outline material that wraps the toon material
        // and then assign it to the ground mesh
        const outlineMaterial = new OutlineMaterial(toonMaterial);
        outlineMaterial.thickness = 0.2;
        this.ground.material = outlineMaterial;
       
        // Add the ground mesh to the scene
        this.scene.add(this.ground);
 
         // Create the GUI
         const gui = new GUI();
         gui.width = 250;
 
         // Setup the GUI controls
         const controls = gui.addFolder("Harold's Crayons");
         controls.open();
 
         const crayonColorController = controls.addColor(this, 'crayonColor');
         crayonColorController.name('Crayon Color');
 
         const skyColorController = controls.addColor(this, 'skyColor');
         skyColorController.name('Sky Color');
         skyColorController.onChange(() => { 
            this.renderer.background = gfx.Color.createFromString(this.skyColor);
          });
 
         const groundColorController = controls.addColor(this, 'groundColor');
         groundColorController.name('Ground Color');   
         groundColorController.onChange(() => { 
            toonMaterial.ambientColor.setFromString(this.groundColor);
         }); 
         
         const strokeWidthController = controls.add(this, 'strokeWidth', 0.01, 0.05);
         strokeWidthController.name('Stroke Width');   
    }

    update(deltaTime: number): void
    {
        // Rotate each billboard to face the camera.
        this.billboards.forEach((billboard: Billboard) => {
            billboard.faceCamera(this.camera);
        });

        // Only move the camera if not currently drawing on screen
        if (this.drawState == DrawState.NO_DRAWING) {
            this.cameraControls.update(deltaTime);

            if (this.cameraControls.hasMoved) {
                // TODO: Part 4: Walking on the Ground
                const ray = new gfx.Ray3();
                ray.set(this.camera.position, gfx.Vector3.DOWN);
                const groundIntersection = ray.intersectsTriangles(this.ground.vertices, this.ground.indices);
                if(groundIntersection){
                    this.camera.position.y=groundIntersection.y+this.cameraHeight;
                }
                
                // Hint: The ray you use to determine the height of the ground at the camera's new
                // position is not a pick ray (because it does not pass through a pixel on the 
                // screen).  So, you will want Ray.set(), not Ray.setPickRay().

                

            }
        }
    }

    onMouseDown(event: MouseEvent): void 
    {
        // Left mouse button is pressed
        if (event.button == 0) {

            // Create a new stroke to store the mouse movements and add it to the scene
            this.currentStroke = new Stroke2D(this.camera, gfx.Color.createFromString(this.crayonColor), this.strokeWidth);
            this.scene.add(this.currentStroke);

            // Get the mouse position in normalized device coordinates, and add it to the stroke
            const screenPt = this.getNormalizedDeviceCoordinates(event.x, event.y);
            this.currentStroke.addPoint(screenPt);


            // Initialize the state to no drawing and determine what state we should be in by 
            // figuring out if the mouse is over an existing billboard, or over the ground, or in the sky. 
            this.drawState = DrawState.NO_DRAWING;

            // Create new pick ray
            const ray = new gfx.Ray3();
            ray.setPickRay(screenPt, this.camera);

            // CASE 1: See if we clicked on an existing billboard
            for (let i=0; i < this.billboards.length; i++) {
                const billboardIntersection = ray.intersectsMesh3(this.billboards[i].mesh);
                if (billboardIntersection) {
                    this.strokeStartPoint3D = billboardIntersection;
                    this.drawState = DrawState.DRAWING_ADDITION_TO_BILLBOARD;
                    // Save the target billboard
                    this.targetBillboard = this.billboards[i];
                }
            }

            // If state is still NO_DRAWING, then maybe we clicked on something else...
            // CASE 2: See if we clicked on the ground
            if (this.drawState == DrawState.NO_DRAWING) {

                // Because we have stored the vertices and indices of the ground object in CPU memory, we can
                // call the ray.intersectsTriangles() method directly instead of the intersectsMesh() method.
                // Both methods will accomplish the same result, but this is more computationally efficient
                // because it doesn't require copying data from the buffers in GPU memory.
                const groundIntersection = ray.intersectsTriangles(this.ground.vertices, this.ground.indices);
                if (groundIntersection) {
                    this.strokeStartPoint3D = groundIntersection;
                    // We don't know yet if this stroke should modify the ground or create a new billboard, we
                    // have to wait until mouseUp to see where the stroke ends.
                    this.drawState = DrawState.DRAWING_GROUND_OR_NEW_BILLBOARD;
                }
            }

            // If state is still NO_DRAWING, then the only choice left is that we clicked on the sky
            // CASE 3: We clicked on the sky
            if (this.drawState == DrawState.NO_DRAWING) {
                this.drawState = DrawState.DRAWING_SKY;
            }
        }
    }

    onMouseMove(event: MouseEvent): void 
    {
        // When the mouse moves while drawing, add another point to the stroke2D
        if (this.currentStroke && this.drawState != DrawState.NO_DRAWING) { 
            const screenPt = this.getNormalizedDeviceCoordinates(event.x, event.y);
            this.currentStroke.addPoint(screenPt);
        }        
    }

    onMouseUp(event: MouseEvent): void 
    {
        // Left mouse button is released
        if (event.button == 0 && this.currentStroke) {
            // CASE 1: Treat the stroke as an addition to an existing billboard
            if (this.drawState == DrawState.DRAWING_ADDITION_TO_BILLBOARD && this.targetBillboard) {
                const billboard3D = Stroke3DFactory.createBillboard(
                    this.currentStroke, this.camera, this.targetBillboard.anchorPoint
                );
                this.scene.add(billboard3D);
                this.billboards.push(billboard3D);
            }
            
            // CASE 2: Stroke started on the ground, we are either editing ground or creating a new billboard
            else if (this.drawState == DrawState.DRAWING_GROUND_OR_NEW_BILLBOARD) {                                
                const screenPt = this.getNormalizedDeviceCoordinates(event.x, event.y);
                const ray = new gfx.Ray3();
                ray.setPickRay(screenPt, this.camera);
                const groundIntersection = ray.intersectsTriangles(this.ground.vertices, this.ground.indices);

                // CASE 2a: Starts on the ground and ends on the ground => edit the ground
                if (groundIntersection) { 
                    if (this.currentStroke.path.length < 6) {
                        console.log("Path is too short to reshape ground.");
                    } else {
                        this.ground.reshapeGround(this.currentStroke, this.strokeStartPoint3D,
                            groundIntersection, this.camera);
                    }
                }

                // CASE 2b: Starts on the ground and ends in the air => create a new billboard
                else {
                    const billboard3D = Stroke3DFactory.createBillboard(
                        this.currentStroke, this.camera, this.strokeStartPoint3D
                    );
                    this.scene.add(billboard3D);
                    this.billboards.push(billboard3D);
                }
            }

            // CASE 3: Treat the stroke as a sky stroke
            else if (this.drawState == DrawState.DRAWING_SKY) {
                const newSkyStroke = Stroke3DFactory.createSkyStrokeMesh(
                    this.currentStroke, this.camera, this.skySphereRadius
                );
                this.scene.add(newSkyStroke);
            }

            // Reset the draw state and remove the 2D stroke from the scene
            this.drawState = DrawState.NO_DRAWING;
            this.currentStroke.remove();
            this.currentStroke = null;
        }
   }
    
}