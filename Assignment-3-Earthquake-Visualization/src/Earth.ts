/* Assignment 3: Earthquake Visualization Support Code
 * UMN CSci-4611 Instructors 2012+
 * GopherGfx implementation by Evan Suma Rosenberg <suma@umn.edu> 2022
 * License: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * Please do not distribute beyond the CSci-4611 course
 */ 

import * as gfx from 'gophergfx'
import { EarthquakeMarker } from './EarthquakeMarker';
import { EarthquakeRecord } from './EarthquakeRecord';

export class Earth extends gfx.Node3
{
    private earthMesh: gfx.MorphMesh3;

    public globeMode: boolean;

    constructor()
    {
        // Call the superclass constructor
        super();

        this.earthMesh = new gfx.MorphMesh3();

        this.globeMode = false;
    }

    public createMesh() : void
    {
        // Initialize texture: you can change to a lower-res texture here if needed
        // Note that this won't display properly until you assign texture coordinates to the mesh
        this.earthMesh.material.texture = new gfx.Texture('./assets/earth-2k.png');
        
        // This disables mipmapping, which makes the texture appear sharper
        this.earthMesh.material.texture.setMinFilter(true, false);   

        // You can use this variable to define the resolution of your flat map and globe map
        // using a nested loop. 20x20 is reasonable for a good looking sphere, and you don't
        // need to change this constant to complete the base assignment.
        const meshResolution = 20;
        
        // Precalculated vertices and normals for the earth plane mesh.
        // After we compute them, we can store them directly in the earthMesh,
        // so they don't need to be member variables.
        const mapVertices: gfx.Vector3[] = [];
        const mapNormals: gfx.Vector3[] = [];

        // Part 1: Creating the Flat Map Mesh
        // To demo, we'll add a rectangle with two triangles.
        // This defines four vertices at each corner in latitude and longitude 
        // and converts to the coordinates used for the flat map.
        //everytime move down 1/resolution
        for(let i=0;i<=meshResolution; i++){
            //every time, move left 1/resolution
            for(let j=0; j<=meshResolution; j++){
                mapVertices.push(this.convertLatLongToPlane(90 - 180*i/meshResolution, -180+360*j/meshResolution));
                
                mapNormals.push(gfx.Vector3.BACK);
                //same as 0,0,1, 
            }
        }
        const indices: number[] = [];
        //for triangle with flat top, index x, x+resolution, x+1
        //for triangle with flat bottom, index x, x+resolution, x+resolution+1
        
        for(let i=0;i<20; i++){
            for(let j=0; j<20; j++){
                indices.push((meshResolution+1)*i+j, (meshResolution+1)*(i+1)+j, (meshResolution+1)*i+j+1);
                indices.push((meshResolution+1)*i+j+1, (meshResolution+1)*(i+1)+j, (meshResolution+1) *(i+1)+j+1);
            }
        }

        // Part 2: Texturing the Mesh
        // You should replace the example code below with texture coordinates for the earth mesh.
        const texCoords: number[] = [];
        for(let i=0;i<=meshResolution; i++){
            for(let j=0; j<=meshResolution; j++){
                texCoords.push(j/20, i/20);
            }
        }

        // Set all the earth mesh data
        this.earthMesh.setVertices(mapVertices, true);
        this.earthMesh.setNormals(mapNormals, true);
        this.earthMesh.setIndices(indices);
        this.earthMesh.setTextureCoordinates(texCoords);

        // Part 3: Creating the Globe Mesh
        // You should compute a new set of vertices and normals
        // for the globe. You will need to also add code in
        // the convertLatLongToSphere() method below.
        const globeVertices: gfx.Vector3[] = [];
        const globeNormals: gfx.Vector3[] = [];

        // Part 1: Creating the Flat Map Mesh
        // To demo, we'll add a rectangle with two triangles.
        // This defines four vertices at each corner in latitude and longitude 
        // and converts to the coordinates used for the flat map.
        //everytime move down 1/resolution
        let tempvec : gfx.Vector3;
        for(let i=0;i<=meshResolution; i++){
            //every time, move left 1/resolution
            for(let j=0; j<=meshResolution; j++){
                tempvec = this.convertLatLongToSphere(90 - 180*i/meshResolution, -180+360*j/meshResolution);
                globeVertices.push(tempvec);
                tempvec.normalize();
                globeNormals.push(tempvec);
            }
        }
        this.earthMesh.setMorphTargetVertices(globeVertices);
        this.earthMesh.setMorphTargetNormals(globeNormals);
        // this.earthMesh.setVertices(globeVertices, true);
        // this.earthMesh.setNormals(globeNormals, true);
        // Add the mesh to this group
        this.add(this.earthMesh);
        
    }

    public update(deltaTime: number) : void
    {
        // Part 4: Morphing Between the Map and Globe
        // The value of this.globeMode will be changed whenever
        // the user selects flat map or globe mode in the GUI.
        // You should use this boolean to control the morphing
        // of the earth mesh, as described in the readme.
        if(this.globeMode==false){
            if(this.earthMesh.morphAlpha>0){
                this.earthMesh.morphAlpha -=deltaTime/1.5;
            }
            if(this.earthMesh.morphAlpha<0){
                this.earthMesh.morphAlpha=0;
            }
        }
        else{
            if(this.earthMesh.morphAlpha<1){
                this.earthMesh.morphAlpha +=deltaTime/1.5;
            }
            if(this.earthMesh.morphAlpha>1){
                this.earthMesh.morphAlpha=1;
            }
        }
    }

    public createEarthquake(record: EarthquakeRecord)
    {
        // Number of milliseconds in 1 year (approx.)
        const duration = 12 * 28 * 24 * 60 * 60;

        // Part 5: Creating the Earthquake Markers
        // Currently, the earthquakes are just placed randomly
        // on the plane. You will need to update this code to
        // correctly calculate both the map and globe positions of the markers.

        const mapPosition =this.convertLatLongToPlane(record.latitude, record.longitude);
        const globePosition = this.convertLatLongToSphere(record.latitude, record.longitude);

        const earthquake = new EarthquakeMarker(mapPosition, globePosition, record, duration);
        const factor1 =  gfx.MathUtils.rescale(record.magnitude, 0, 9.8, 0, 1);
        //Size scales with n^5, so larger earthquakes become much larger, (not quite the n^10 of displacement or n^32 power, but demonstrative nontheless)
        earthquake.scale.set(0.1+5*Math.pow(earthquake.magnitude, 5), 0.1+5*Math.pow(earthquake.magnitude, 5), 0.1+5*Math.pow(earthquake.magnitude, 5));
        earthquake.material.setColor(new gfx.Color(1,(1-2*Math.pow(factor1, 5)),(1-2*Math.pow(factor1, 5))));

        // Uncomment this line of code to active the earthquake markers
        this.add(earthquake);
    }

    public animateEarthquakes(currentTime : number)
    {
        // This code removes earthquake markers after their life has expired
        this.children.forEach((quake: gfx.Node3) => {
            if(quake instanceof EarthquakeMarker)
            {
                const playbackLife = (quake as EarthquakeMarker).getPlaybackLife(currentTime);

                // The earthquake has exceeded its lifespan and should be moved from the scene
                if(playbackLife >= 1)
                {
                    quake.remove();
                }
                // The earthquake positions should be updated
                else
                {
                    // Part 6: Morphing the Earthquake Positions
                    // If you have correctly computed the flat map and globe positions
                    // for each earthquake marker in part 5, then you can simply lerp
                    // between them using the same alpha as the earth mesh.
                
                    const scaleset = (1-2*playbackLife/3)*(0.2+5*Math.pow(quake.magnitude, 5));
                    //will never go below 1/3 of it's original size, 
                    quake.scale.set(scaleset, scaleset, scaleset);
                    quake.position = gfx.Vector3.lerp(quake.mapPosition, quake.globePosition, this.earthMesh.morphAlpha);
                }
            }
        });
    }

    // This convenience method converts from latitude and longitude (in degrees) to a Vector3 object
    // in the flat map coordinate system described in the readme.
    public convertLatLongToPlane(latitude: number, longitude: number): gfx.Vector3
    {
        return new gfx.Vector3(longitude * Math.PI / 180, latitude * Math.PI / 180, 0);
    }

    // This convenience method converts from latitude and longitude (in degrees) to a Vector3 object
    // in the globe mesh map coordinate system described in the readme.
    public convertLatLongToSphere(latitude: number, longitude: number): gfx.Vector3
    {
        return new gfx.Vector3(Math.cos(latitude*Math.PI / 180) * Math.sin(longitude*Math.PI / 180), Math.sin(latitude*Math.PI / 180), Math.cos(latitude*Math.PI / 180) * Math.cos(longitude*Math.PI / 180));
        
        // Part 3: Creating the Globe Mesh
        // Add code here to correctly compute the 3D sphere position
        // based on latitude and longitude.
        //return new gfx.Vector3();
    }

    // This function toggles the wireframe debug mode on and off
    public toggleDebugMode(debugMode : boolean)
    {
        this.earthMesh.material.wireframe = debugMode;
    }
}