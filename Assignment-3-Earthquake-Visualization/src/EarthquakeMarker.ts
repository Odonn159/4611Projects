/* Assignment 3: Earthquake Visualization Support Code
 * UMN CSci-4611 Instructors 2012+
 * GopherGfx implementation by Evan Suma Rosenberg <suma@umn.edu> 2022
 * License: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * Please do not distribute beyond the CSci-4611 course
 */ 

import * as gfx from 'gophergfx'
import { EarthquakeRecord } from './EarthquakeRecord';

export class EarthquakeMarker extends gfx.Mesh3
{
    private static baseMesh: gfx.Mesh3;

    public startTime : number;
    public duration : number;
    public magnitude : number;
    public mapPosition : gfx.Vector3;
    public globePosition : gfx.Vector3;

    constructor(mapPosition: gfx.Vector3, globePosition: gfx.Vector3, record: EarthquakeRecord, duration: number)
    {
        // Call the superclass constructor
        super();

        // If the static base mesh has not yet been created, then initialize it
        if(EarthquakeMarker.baseMesh == undefined)
        {
            // By default, the earthquake markers are instances of a sphere mesh.
            // You are free to leave them as spheres or come up with your own custom geometry.
            EarthquakeMarker.baseMesh = gfx.Geometry3Factory.createSphere(0.1, 2);
        }

        // Copy over all the mesh data from the base mesh
        this.positionBuffer = EarthquakeMarker.baseMesh.positionBuffer;
        this.normalBuffer = EarthquakeMarker.baseMesh.normalBuffer;
        this.colorBuffer = EarthquakeMarker.baseMesh.colorBuffer;
        this.indexBuffer = EarthquakeMarker.baseMesh.indexBuffer;
        this.texCoordBuffer = EarthquakeMarker.baseMesh.texCoordBuffer;
        this.vertexCount = EarthquakeMarker.baseMesh.vertexCount;
        this.hasVertexColors = EarthquakeMarker.baseMesh.hasVertexColors;
        this.triangleCount = EarthquakeMarker.baseMesh.triangleCount;
        this.material = EarthquakeMarker.baseMesh.material;
        this.boundingBox = EarthquakeMarker.baseMesh.boundingBox;
        this.boundingSphere = EarthquakeMarker.baseMesh.boundingSphere;
        this.visible = EarthquakeMarker.baseMesh.visible;

        this.startTime = record.date.getTime();
        this.magnitude = record.normalizedMagnitude;
        this.duration = duration;
        this.mapPosition = mapPosition;
        this.globePosition = globePosition;

        // Set the position to the plane by default
        this.position.copy(this.mapPosition);

        // Create a new material for this marker.
        this.material = new gfx.GouraudMaterial();
    }

    // This returns a number between 0 (start) and 1 (end)
    getPlaybackLife(currentTime: number) : number
    {
        return gfx.MathUtils.clamp(Math.abs(currentTime/1000 - this.startTime/1000) / this.duration, 0, 1);
    }
}