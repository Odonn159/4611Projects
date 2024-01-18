/* Assignment 4: So You Think Ants Can Dance
 * UMN CSci-4611 Instructors 2012+
 * Significant changes by Prof. Dan Keefe, 2023 
 * Initial GopherGfx implementation by Evan Suma Rosenberg <suma@umn.edu> 2022
 * License: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * Please do not distribute beyond the CSci-4611 course
 */ 

import * as gfx from 'gophergfx'

import { Pose } from "./Pose";
import { AnimatedCharacter } from './AnimatedCharacter';


/**
 * This class is a node in the scene graph that represents a bone that is part of an
 * AnimatedCharacter.  It provides just a little bit of added functionality beyond
 * a standard Node3.  Specifally, it stores some data about the bone, and it includes
 * an applyPose routine that will update the node's localToParent transformation
 * matrix based on the current joint angles for the animation.
 */
export class AnimatedBone extends gfx.Node3
{
    // passed in when the bone is created
    public character: AnimatedCharacter;
    public name: string;
    public boneSpaceToParentBoneSpace: gfx.Matrix4;

    // can be accessed from the character's bone data, local copies saved for easy access
    public length: number;
    public direction: gfx.Vector3;
    public boneSpaceToJointSpace: gfx.Matrix4;
    public jointSpaceToBoneSpace: gfx.Matrix4;


    /**
     * The constructor saves some data about the bone in local member variables and calls the
     * character's addGeometryToAnimatedBone() function so subclasses can add some extra
     * geometry as children of this node in the scene graph.
     * 
     * @param character The AnimatedCharacter this bone belongs to.
     * @param boneName The unique name for this bone.
     * @param boneSpaceToParentBoneSpace A matrix that will transform points and vectors defined
     * in this bone's coordinate space to the coordinate space of this bone's parent.
     */
    constructor(character: AnimatedCharacter, boneName: string, boneSpaceToParentBoneSpace: gfx.Matrix4)
    {
        super();

        this.character = character;
        this.name = boneName;
        this.boneSpaceToParentBoneSpace = boneSpaceToParentBoneSpace;
        this.length = this.character.boneData.boneLength(boneName);
        this.direction = this.character.boneData.boneDirection(boneName);
        this.boneSpaceToJointSpace = this.character.boneData.boneSpaceToJointSpace(boneName);
        this.jointSpaceToBoneSpace = this.character.boneData.jointSpaceToBoneSpace(boneName);

        // whenever we create a bone, we call the character's addGeometryToAnimatedBone() function so
        // that subclasses of the character can easily customize the character's geometry.
        this.character.addGeometryToAnimatedBone(this);
    }


    /**
     * This function should call this.setLocalToParentMatrix(XXXX, false) where XXXX is the correct
     * matrix for the bone named this.name.
     * 
     * @param pose Contains all the joint angle and related data needed to make an animated character
     * pose match that of a single frame of motion capture data. 
     */
    applyPose(pose: Pose): void
    {

        // PART 1: Calculate and set an updated localToParentMatrix using the
        // boneSpaceToParentBoneSpace matrix.
        //
        // Once this part is complete, this should make your
        // BoneSpaceAxesCharacter display an upright X,Y,Z axes at each joint
        // that looks the same as the instructor's implementation when the "Bone
        // Space Axes" character is visible and the animation is paused.

        // this.setLocalToParentMatrix(this.boneSpaceToParentBoneSpace, false);


        // PART 4: Calculate and set an updated localToParentMatrix given the
        // current pose.
        //
        // Keep the following transformation matrices in mind as you complete
        // this section:
        // - this.boneSpaceToParentBoneSpace
        // - this.boneSpaceSpaceToJointSpace
        // - this.jointSpaceToBoneSpace
        //
        // Use `this.setLocalToParentMatrix(XXXX, false)`, where XXXX is the
        // correct matrix for the bone named `this.name`.
        //
        // Comment out (don't delete) the PART 1 code above once you've got this
        // working. Use your SkeletonCharacter and JointSpaceAxesCharacter to
        // verify that all the joint angles get applied correctly.
        let mastermatrix : gfx.Matrix4;
        let M1 = this.boneSpaceToParentBoneSpace;
        let M2 = this.boneSpaceToJointSpace;
        let M3 = this.jointSpaceToBoneSpace;
        mastermatrix = gfx.Matrix4.multiplyAll(M1, this.jointSpaceToBoneSpace, pose.getJointRotationMatrix(this.name), this.boneSpaceToJointSpace);
        this.setLocalToParentMatrix(mastermatrix, false);

        // You do not need to modify this code
        this.children.forEach((child: gfx.Node3) => {
            if (child instanceof AnimatedBone)
                child.applyPose(pose);
        });
    }
}
