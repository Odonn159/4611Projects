/* Assignment 4: So You Think Ants Can Dance
 * UMN CSci-4611 Instructors 2012+
 * Significant changes by Prof. Dan Keefe, 2023 
 * Initial GopherGfx implementation by Evan Suma Rosenberg <suma@umn.edu> 2022
 * License: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * Please do not distribute beyond the CSci-4611 course
 */ 

import * as gfx from 'gophergfx'

/** This data structure describes a rigid body skeleton used to record and play
 back motion capture data.  Each skelton has a root node, which will have one or
 more child bones, each with an unique name.  Each of these bones can, in turn,
 have additional children with unique names.  The name of each bone is used to
 access relevant data, like the bone's length, direction, how many children
 it has, and the names of its children.

 You can loop through all of the bones attached to the root node using:
 ```
    for (let c=0; c < boneData.rootNodeNumChildren(); c++) {
        const boneName = boneData.rootNodeChildBoneName(c);

        // then, once you have the name of a bone, you can access all of its data, e.g.,
        const boneLength = boneData.boneLength(boneName);
        const boneDirection = boneData.boneDirection(boneName);
        const numChildren = boneData.numChildren(boneName);
        for (let d=0; d < numChildren; d++) {
            const nameOfChildBone = boneData.childBoneName(boneName, d);
            // and, once you have the name of a child bone, you can access all of its data, e.g.,
            const lengthOfChildBone = boneData.boneLength(nameOfChildBone);
        }
    }
 ```
 
 Note, the bone data does not itself include any motion data.  It just
 defines a hierarchy of bones and their lengths and directions as captured during
 the calibration step for each mocap actor.  For humanoid characters, the calibration
 pose is typically with arms outstretched like a "T".  Thus, if you draw the character
 using only the bone data (with no motion applied) it should look like it is standing
 in this calibration "T" pose.
 */
export class BoneData
{
    public static finishedLoading(): boolean
    {
        return BoneData.numLoading == 0;
    }

    /**
     * Creates an empty skeleton.  Initialize the bone data after creating it
     * by calling loadFromASF().
     */
    constructor()
    {        
    }

    /** The number of bones attached to the root node.  
     * This is just a shortcut to calling numChildren("root"). 
     */ 
    public rootNodeNumChildren() : number {
        return this.numChildren("root");
    }

    /** The name of the i-th bone attached to the root node.  
     * This is just a shortcut to calling childBoneName("root", i) 
     */
    public rootNodeChildBoneName(i: number) : string {
        return this.childBoneName("root", i);

    }

    /**
     * This position is an optional offset that may have been applied
     * to the skeleton geometry itself when it was captured during
     * calibration.  It is often zero, but not always.  When posing the
     * character, the root node should be translated to this position
     * before applying any transformations to account for motion.
     */
    public rootNodePosition() : gfx.Vector3 {
        return this.rootPosition;
    }

    /**
     * This rotation is an optional rotation that may have been applied
     * to the skeleton geometry itself when it was captured during
     * calibration.  It is often the identity, but not always.  When posing the
     * character, the root node should be rotated by this amount before
     * applying any transformations to account for motion.
     */
    public rootNodeRotation(): gfx.Quaternion {
        return this.rootRotation;
    }

    /** The number of children attached to the named parent bone */ 
    public numChildren(parentBoneName: string) : number {
        return this.childrenMap.get(parentBoneName)?.length ?? 0;
    }

    /** The name of the i-th child of the named parent bone */ 
    public childBoneName(parentBoneName: string, i: number): string {
        return this.childrenMap.get(parentBoneName)?.[i] ?? "";
    }

    /** The joint rotations that produce the animation are applied around
     a set of x,y,z axes that make sense for the joint (e.g., a joint with
     only 1 degree-of-freedom might setup a coordinate system where the X-axis
     is aligned along the hinge of that joint).  The following transform
     rotates the bone's local coordinate system into the joint angle coordinate
     system.  This must be done before the joint angles can be applied.  Then,
     after the joint angles are applied, we must rotate back before applying
     the to_parent transform.
    */
    public boneSpaceToJointSpace(boneName: string): gfx.Matrix4 {
        return this.boneToRotSpaceMap.get(boneName) ?? new gfx.Matrix4();
    }

    /** The inverse of boneSpaceToJointSpace().  Use this matrix to rotate 
     back to the bone's local coordinate system after applying joint angle 
     rotations. */
    public jointSpaceToBoneSpace(boneName: string): gfx.Matrix4 {
        return this.rotToBoneSpaceMap.get(boneName) ?? new gfx.Matrix4();
    }
    
    /** Returns the direction of the bone.  If you start from the bone's 
     * origin and translate along this vector by an amount equal to the bone's
     * length, you will reach the point that should be used as the origin for 
     * the bone's children. 
     */
    public boneDirection(boneName: string): gfx.Vector3 {
        return this.directionsMap.get(boneName) ?? new gfx.Vector3();
    }

    /** Returns the length of the bone.  If you start from the bone's 
     * origin and translate along the bone's direction by this length,
     * you will reach the point that should be used as the origin for 
     * the bone's children. 
     */
     public boneLength(boneName: string): number {
        return this.lengthsMap.get(boneName) ?? 0;
    }


    // raw data accessors

    // Most users will not need to access the routines below this line because
    // all of these properties are taken into account when calculating the
    // matrices above.


    /// True if the joint used to rotate boneName can rotate around the X axis.
    public canRotAroundX(boneName: string): boolean {
        return this.rxMap.get(boneName) ?? false;
    }

    /// Returns the valid range of X-axis joint angles for the joint used to rotate bone_name.
    public rotXLimits(boneName: string): gfx.Vector2 {
        return this.rxLimitsMap.get(boneName) ?? new gfx.Vector2();
    }

    /// True if the joint used to rotate bone_name can rotate around the Y axis.
    public canRotAroundY(boneName: string): boolean {
        return this.ryMap.get(boneName) ?? false;
    }

    /// Returns the valid range of Y-axis joint angles for the joint used to rotate bone_name.
    public rotYLimits(boneName: string): gfx.Vector2 {
        return this.ryLimitsMap.get(boneName) ?? new gfx.Vector2();
    }

    /// True if the joint used to rotate bone_name can rotate around the Z axis.
    public canRotAroundZ(boneName: string): boolean {
        return this.rzMap.get(boneName) ?? false;
    }

    /// Returns the valid range of Z-axis joint angles for the joint used to rotate bone_name.
    public rotZLimits(boneName: string): gfx.Vector2 {
        return this.rzLimitsMap.get(boneName) ?? new gfx.Vector2();
    }

    /// Returns 0, 1, 2 or 3 for the number of degrees of freedom of the joint
    /// used to rotate the named bone.
    public degreesOfFreedom(boneName: string): number {
        let n = 0;
        if (this.canRotAroundX(boneName)) n++;
        if (this.canRotAroundY(boneName)) n++;
        if (this.canRotAroundZ(boneName)) n++;
        return n;
    }

    /// Typically zero, and we can ignore this.
    public skeletonRootPosition(): gfx.Vector3 {
        return this.rootPosition;
    }

    /// Typically zero, and we can ignore this.
    public skeletonRootRotation(): gfx.Quaternion {
        return this.rootRotation;
    }


    public loadFromASF(filename: string): void
    {
        console.log('Loading skeleton data from ' + filename + '...');

        BoneData.numLoading++;

        gfx.TextFileLoader.load(filename, (loadedFile: gfx.TextFile) => {
            
            const parser = new gfx.StringParser(loadedFile.data);

            while(!parser.done())
            {
                const nextToken = parser.readToken();
                if (nextToken.charAt(0) == '#')
                    parser.consumeLine();
                else if(nextToken == ':units')
                    this.parseUnits(parser);
                else if(nextToken == ':root')
                    this.parseRoot(parser);
                else if(nextToken == ':bonedata')
                    this.parseBoneData(parser);
                else if(nextToken == ':hierarchy')
                    this.parseHierarchy(parser);
                else if(nextToken == ':version')
                    parser.consumeLine();
                else if(nextToken == ':name')
                    parser.consumeLine();
                else if(nextToken == ':documentation')
                {
                    while(!parser.done() && !(parser.peek().charAt(0) == ':'))
                        parser.consumeLine();
                }
                else
                {
                    console.error("Error: encountered unknown token: " + nextToken)
                    return;
                }
            }

            console.log('Skeleton data loaded from ' + filename + '.');
            BoneData.numLoading--;
        });
    }

    private parseUnits(parser: gfx.StringParser): void
    {
        let done: boolean;
        do
        {
            done = true;
            if(parser.expect('mass') || parser.expect('length'))
            {
                done = false;
                parser.consumeLine();
            }
            else if(parser.expect('angle'))
            {
                done = false;
                this.usingDegrees = parser.readToken() == 'deg';
            }
        } while(!done);

    }

    private parseRoot(parser: gfx.StringParser): void
    {
        let done: boolean;
        do
        {
            done = true;
            if(parser.expect('order'))
            {
                done = false;
                if( !parser.expect('TX') || !parser.expect('TY') || !parser.expect('TZ') ||
                    !parser.expect('RX') || !parser.expect('RY') || !parser.expect('RZ'))
                {
                    console.error('Error: order not in the order expected');
                    return;
                }
            }
            else if(parser.expect('axis'))
            {
                done = false;
                if(!parser.expect('XYZ'))
                {
                    console.error('Error: axis not in the order expected');
                    return;
                }
            }
            else if(parser.expect('position'))
            {
                done = false;
                this.rootPosition.set(parser.readNumber(), parser.readNumber(), parser.readNumber());

                // Convert from AMC mocap units to meters
                this.rootPosition.multiplyScalar(0.056444);
            }
            else if(parser.expect('orientation'))
            {
                done = false;

                const angles = new gfx.Vector3(parser.readNumber(), parser.readNumber(), parser.readNumber());
                if(this.usingDegrees)
                    angles.multiplyScalar(Math.PI / 180);

                // AMC mocap data uses ZYX transformation order for Euler angles
                this.rootRotation = gfx.Quaternion.makeEulerAngles(angles.x, angles.y, angles.z, 'ZYX');
            }
        } while(!done);
    }

    private parseBoneData(parser: gfx.StringParser): void
    {
        while(parser.expect('begin'))
        {
            let id = -1;
            let name = "";
            let direction = new gfx.Vector3();
            let length = 0.0;
            const boneToRotSpace = new gfx.Matrix4();
            let rotToBoneSpace = new gfx.Matrix4();
            let canRotX = false;
            let canRotY = false;
            let canRotZ = false;
            let rxLimits = new gfx.Vector2();
            let ryLimits = new gfx.Vector2();
            let rzLimits = new gfx.Vector2();

            while(!parser.expect('end'))
            {
                if(parser.expect('id'))
                {
                    id = parser.readNumber();
                }
                else if(parser.expect('name'))
                {
                    name = parser.readToken();
                }
                else if(parser.expect('direction'))
                {
                    const x = parser.readNumber();
                    const y = parser.readNumber();
                    const z = parser.readNumber();
                    direction = new gfx.Vector3(x, y, z);
                }
                else if(parser.expect('length'))
                {
                    // Convert from AMC mocap units to meters
                    length = parser.readNumber() * 0.056444;
                }
                else if(parser.expect('axis'))
                {
                    const angles = new gfx.Vector3(parser.readNumber(), parser.readNumber(), parser.readNumber());
                    if (this.usingDegrees)
                        angles.multiplyScalar(Math.PI / 180);

                    if(parser.expect('XYZ')) {
                        // AMC mocap data uses ZYX transformation order for Euler angles
                        rotToBoneSpace = gfx.Matrix4.makeEulerAngles(angles.x, angles.y, angles.z, 'ZYX');
                        boneToRotSpace.copy(rotToBoneSpace);
                        boneToRotSpace.invert();
                    }
                    else {
                        console.error('Error: bone axis not in the order expected');
                        return;
                    }
                }
                else if(parser.expect('dof')) {
                    canRotX = parser.expect('rx');
                    canRotY = parser.expect('ry');
                    canRotZ = parser.expect('rz');
                }
                else if(parser.expect('limits')) {
                    let ndof = 0;
                    if (canRotX) ndof++;
                    if (canRotY) ndof++;
                    if (canRotZ) ndof++;
                    for (let dof=0; dof < ndof; dof++) {
                        parser.expect("("); 
                        const min = parser.readNumber();
                        const max = parser.readNumber();
                        parser.expect(")");

                        if (dof == 0) {
                            if (canRotX) rxLimits = new gfx.Vector2(min, max);
                            else if (canRotY) ryLimits = new gfx.Vector2(min, max);
                            else if (canRotZ) rzLimits = new gfx.Vector2(min, max);
                            else {
                                console.error('Problem parsing degrees of freedom.');
                                return;
                            }
                        }
                        else if (dof == 1) {
                            if (canRotX && canRotY) ryLimits = new gfx.Vector2(min, max);
                            else if (canRotX && canRotZ) rzLimits = new gfx.Vector2(min, max);
                            else if (canRotY && canRotZ) rzLimits = new gfx.Vector2(min, max);
                            else {
                                console.error('Problem parsing degrees of freedom.');
                                return;
                            }
                        }
                        else if (dof == 2) {
                            if (canRotX && canRotY && canRotZ) rzLimits = new gfx.Vector2(min, max);
                            else {
                                console.error('Problem parsing degrees of freedom.');
                                return;
                            }
                        }
                    }
                }
            }

            // save the bone to the skeleton data structure
            this.idMap.set(name, id);
            this.directionsMap.set(name, direction);
            this.lengthsMap.set(name, length);
            this.rxMap.set(name, canRotX);
            this.ryMap.set(name, canRotY);
            this.rzMap.set(name, canRotZ);
            this.rxLimitsMap.set(name, rxLimits);
            this.ryLimitsMap.set(name, ryLimits);
            this.rzLimitsMap.set(name, rzLimits);
            this.boneToRotSpaceMap.set(name, boneToRotSpace);
            this.rotToBoneSpaceMap.set(name, rotToBoneSpace);
        }
    }

    private parseHierarchy(parser: gfx.StringParser): void
    {
        if(parser.expect('begin'))
        {
            while(!parser.expect('end'))
            {
                const parent = parser.readToken();
                const children = parser.readLine();

                children.forEach((child: string) => {
                    let parentEntry = this.childrenMap.get(parent);
                    if (!Array.isArray(parentEntry)) {
                        // this is the first child for parent, create a new entry
                        this.childrenMap.set(parent, []);
                        parentEntry = this.childrenMap.get(parent);
                    }
                    parentEntry?.push(child);
                });
            }
        }
        else
        {
            console.error('Error: reading hierarchy, expected begin, found ' + parser.peek());
        }
    }

    // private member vars:

    private static numLoading = 0;

    private usingDegrees = false;
    private _loaded = false;
 
    // raw bone data indexed by the name of each bone
    private idMap: Map<string, number> = new Map();
    
    private childrenMap: Map<string, string[]> = new Map();
    private directionsMap: Map<string, gfx.Vector3> = new Map();

    private lengthsMap: Map<string, number> = new Map();
    
    private rxMap: Map<string, boolean> = new Map();
    private rxLimitsMap: Map<string, gfx.Vector2> = new Map();
    
    private ryMap: Map<string, boolean> = new Map();
    private ryLimitsMap: Map<string, gfx.Vector2> = new Map();
    
    private rzMap: Map<string, boolean> = new Map();
    private rzLimitsMap: Map<string, gfx.Vector2> = new Map();
    
    private boneToRotSpaceMap: Map<string, gfx.Matrix4> = new Map();
    private rotToBoneSpaceMap: Map<string, gfx.Matrix4> = new Map();

    // these are usually, but not always zero... it seems to be safe to ignore them
    private rootPosition: gfx.Vector3 = new gfx.Vector3();
    private rootRotation: gfx.Quaternion = new gfx.Quaternion();
    
}