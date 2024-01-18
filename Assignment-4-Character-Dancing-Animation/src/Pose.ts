/* Assignment 4: So You Think Ants Can Dance
 * UMN CSci-4611 Instructors 2012+
 * Significant changes by Prof. Dan Keefe, 2023 
 * Initial GopherGfx implementation by Evan Suma Rosenberg <suma@umn.edu> 2022
 * License: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * Please do not distribute beyond the CSci-4611 course
 */ 

import * as gfx from 'gophergfx'


/** This data structure holds the transformations for the root node and for each
 joint of a Skeleton that are needed to place the Skeleton in one specific pose
 (i.e., one frame of mocap data).  It is possible to linearly interpolate between
 poses using the Lerp command, treating this pose as one keyframe and a second
 pose as another keyframe.
 */
export class Pose
{
    public frame: number;
    public rootPosition: gfx.Vector3;
    public rootRotation: gfx.Quaternion;

    private jointRotations: Map<string, gfx.Quaternion>;

    constructor()
    {
        this.frame = 0;
        this.rootPosition = new gfx.Vector3();
        this.rootRotation = new gfx.Quaternion();

        this.jointRotations = new Map();
    }

    public getJointRotationMatrix(boneName: string): gfx.Matrix4
    {
        const jointRotation = this.jointRotations.get(boneName);

        if(jointRotation)
            return gfx.Matrix4.makeRotation(jointRotation);
        else
            return new gfx.Matrix4();
    }

    public getJointRotationQuaternion(boneName: string): gfx.Quaternion
    {
        const jointRotation = this.jointRotations.get(boneName);

        if(jointRotation)
            return jointRotation;
        else
            return new gfx.Quaternion();
    }

    public setJointRotation(boneName: string, rotation: gfx.Quaternion): void
    {
        this.jointRotations.set(boneName, rotation);
    }

    public lerp(pose: Pose, alpha: number): void
    {
        this.frame = Math.round(gfx.MathUtils.lerp(this.frame, pose.frame, alpha));
        this.rootPosition.lerp(this.rootPosition, pose.rootPosition, alpha);
        this.rootRotation.slerp(this.rootRotation, pose.rootRotation, alpha);

        this.jointRotations.forEach((value: gfx.Quaternion, key: string) => {
            value.slerp(value, pose.getJointRotationQuaternion(key), alpha);
        });
    }

    public clone(): Pose
    {
        const pose = new Pose();
        pose.frame = this.frame;
        pose.rootRotation.copy(this.rootRotation);
        pose.rootPosition.copy(this.rootPosition);
        
        this.jointRotations.forEach((value: gfx.Quaternion, key: string) => {
            pose.setJointRotation(key, value.clone());
        });

        return pose;
    }
}