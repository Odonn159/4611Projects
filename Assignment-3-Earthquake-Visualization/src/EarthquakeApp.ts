/* Assignment 3: Earthquake Visualization Support Code
 * UMN CSci-4611 Instructors 2012+
 * GopherGfx implementation by Evan Suma Rosenberg <suma@umn.edu> 2022
 * License: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * Please do not distribute beyond the CSci-4611 course
 */  

import * as gfx from 'gophergfx'
import { GUI } from 'dat.gui'
import { Earth } from './Earth';
import { EarthquakeDatabase } from './EarthquakeDatabase';

export class EarthquakeApp extends gfx.GfxApp
{
    private earth: Earth;
    private earthquakeDB: EarthquakeDatabase;

    // State variables
    private currentTime : number;

    // GUI variables
    public gui : GUI;
    public date : string;
    public viewMode : string;
    public playbackSpeed : number;
    public debugMode : boolean;
    
    constructor()
    {
        super();

        this.earth = new Earth();
        this.earthquakeDB = new EarthquakeDatabase('./assets/earthquakes.txt');

        this.currentTime = Infinity;

        this.gui = new GUI();
        this.date = '';
        this.viewMode = 'Map';
        this.playbackSpeed = 0.5;
        this.debugMode = false;
    }

    createScene(): void 
    {
        // Setup camera
        this.camera.setPerspectiveCamera(60, 2, 0.1, 50)
        this.camera.position.set(0, 0, 3.25);
        this.camera.lookAt(gfx.Vector3.ZERO);


        // Create a directional light
        const directionalLight = new gfx.DirectionalLight(new gfx.Vector3(1.5, 1.5, 1.5));
        directionalLight.position.set(10, 10, 15);
        this.scene.add(directionalLight);

        // Set the background image
        const background = gfx.Geometry2Factory.createBox(2, 2);
        background.material.texture = new gfx.Texture('./assets/stars.png');
        background.layer = 1;
        this.scene.add(background);

        // Create the earth mesh and add it to the scene
        this.earth.createMesh();
        this.scene.add(this.earth);

        // Create a new GUI folder to hold earthquake controls
        const controls = this.gui.addFolder('Earthquake Controls');

        // Create a GUI control to show the current date and make it listen for changes
        const dateController = controls.add(this, 'date');
        dateController.name('Current Date');
        dateController.listen();

        // Create a GUI control for the view mode and add a change event handler
        const viewController = controls.add(this, 'viewMode', {Map: 'Map', Globe: 'Globe'});
        viewController.name('View Mode');
        viewController.onChange((value: string) => { this.earth.globeMode = value == 'Globe' });
        
        // Create a GUI control for the playback speed and add a change event handler
        const playbackController = controls.add(this, 'playbackSpeed', 0, 10);
        playbackController.name('Playback Speed');

        // Create a GUI control for the debug mode and add a change event handler
        const debugController = controls.add(this, 'debugMode');
        debugController.name('Debug Mode');
        debugController.onChange((value: boolean) => { this.earth.toggleDebugMode(value) });

        // Make the GUI controls wider and open by default
        this.gui.width = 300;
        controls.open();
    }

    update(deltaTime: number): void 
    {
        // Scale factor for time progression
        const playbackScale = 30000000000;

        // Advance current time in milliseconds
        this.currentTime += playbackScale * this.playbackSpeed * deltaTime;

        // If we are beyond the max time, loop back to the beginning
        if(this.currentTime > this.earthquakeDB.getMaxTime())
        {
            this.currentTime = this.earthquakeDB.getMinTime();
            this.earthquakeDB.reset();
        }

        // Update the current date
        const currentDate = new Date();
        currentDate.setTime(this.currentTime);
        this.date = currentDate.getUTCMonth() + "/" + currentDate.getUTCDate() + "/" + currentDate.getUTCFullYear();

        let quake = this.earthquakeDB.getNextQuake(currentDate);
        while(quake)
        {
            // Create the earthquake marker
            this.earth.createEarthquake(quake);

            quake = this.earthquakeDB.getNextQuake(currentDate);
        }

        // Update the earth animations
        this.earth.update(deltaTime);

        // Animate the earthquakes and remove old ones
        this.earth.animateEarthquakes(this.currentTime);
    }
}