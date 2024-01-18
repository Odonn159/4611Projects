/* Assignment 6: Harold: A World Made of Drawings
 * UMN CSci-4611 Instructors 2018+
 * Billboard class rewritten by Prof. Dan Keefe, Fall 2023
 * Please do not distribute beyond the CSci-4611 course
 */ 

import * as gfx from 'gophergfx'

/**
 * In computer graphics, "billboards" are typically flat rectangles with a texture on them that
 * are a standin for a more complex geometry, like a photo of a tree instead of a detailed 3D
 * model of the tree.  Since they are approximations in this way, billboards are usually only
 * used for objects that are in the distance, far from the camera.  And, since they are flat, 
 * billboards are typically rotated to face the camera.
 * 
 * Harold is a little different because the billboards are drawn dynamically.  So, instead of
 * a texture on a rectangle, billboards in Harold are triangle meshes.  But, Harold billboards
 * are still flat and they can automatically rotate to face the camera.
 * 
 * This class provides a small wrapper around the flat 3D mesh for a billboard and includes
 * a routine to make the billboard face the camera.
 */
export class Billboard extends gfx.Node3
{
    public anchorPoint: gfx.Vector3;
    public normal: gfx.Vector3;
    public mesh: gfx.Mesh3;

    /**
     * Create a new billboard to treat a mesh as a billboard that is attached to a specific
     * 3D point on the ground and rotates to face the camera.
     * 
     * @param anchorPoint A 3D point on the ground that it the place the billboard "attaches"
     * to the ground. The billboard will rotate to face the camera around a vertical axis that
     * passes through this point.  
     * @param normal The billboard mesh should be flat, so it exists within a plane in the
     * 3D scene--this is the normal of that plane.
     * @param mesh The "flat" 3D mesh to use for the billboard.  The mesh should already be
     * created and then passed into the billboard constructor.  
     */
    constructor(anchorPoint: gfx.Vector3, normal: gfx.Vector3, mesh: gfx.Mesh3)
    {
        super();
        this.anchorPoint = anchorPoint;
        this.normal = normal;
        this.mesh = mesh;

        // add the mesh as a child
        this.add(mesh);
    }

    /**
     * This function should be called from the application's update() function each frame (or to
     * be slightly more efficient, whenever the camera is moved). It will rotate the billboard
     * to face the current position of the camera.  Note that the rotation will be about a
     * vertical axis that passes through the billboard's anchor point. Harold billboards do
     * not include any tilting up or down to face the camera.
     */
    public faceCamera(camera: gfx.Camera): void
    {
        const cameraPosWorld = camera.localToWorldMatrix.transformPoint(new gfx.Vector3(0,0,0));
        const toCamera = gfx.Vector3.subtract(cameraPosWorld, this.anchorPoint);
        const toCameraNoY = gfx.Vector3.normalize(new gfx.Vector3(toCamera.x, 0, toCamera.z));
        const normalNoY = gfx.Vector3.normalize(new gfx.Vector3(this.normal.x, 0, this.normal.z));
        const T1 = gfx.Matrix4.makeTranslation(gfx.Vector3.multiplyScalar(this.anchorPoint, -1));
        const R = gfx.Matrix4.makeAlign(normalNoY, toCameraNoY, gfx.Vector3.UP, gfx.Vector3.UP);
        const T2 = gfx.Matrix4.makeTranslation(this.anchorPoint);
        this.setLocalToParentMatrix(gfx.Matrix4.multiplyAll(T2, R, T1), false);
    }
}
