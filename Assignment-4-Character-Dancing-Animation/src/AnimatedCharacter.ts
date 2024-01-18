/* Assignment 4: So You Think Ants Can Dance
 * UMN CSci-4611 Instructors 2012+
 * Significant changes by Prof. Dan Keefe, 2023 
 * Initial GopherGfx implementation by Evan Suma Rosenberg <suma@umn.edu> 2022
 * License: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * Please do not distribute beyond the CSci-4611 course
 */ 

import * as gfx from 'gophergfx'
import { BoneData } from './BoneData'
import { MotionClip } from './MotionClip'
import { Pose } from './Pose';
import { AnimatedBone } from './AnimatedBone';


/**
 * Base class for characters animated using motion capture data in the acclaim motion data format.
 * The character is a Node3 so it can be added directly to the scene graph, and it contains a 
 * hierarchy of AnimatedBones, which are also Node3s and are added as children of character.
 * 
 * The bones are animated by asking the character to play a MotionClip, which is a series of
 * Poses over time.  MotionClips can be played in a loop, and there is also a capability to
 * "overlay" one motion on top of another.  So, a character can be playing an idle motion or
 * simple walking motion and then another motion (e.g., a kick or jump) can be "overlaid" on
 * top of the base motion.  In this case the overlaid motion is "faded-in" and "faded-out",
 * and the character will return to the original motion once the overlaid motion is complete.
 * Only one overlay motion can be active at a time.  If the character is asked to overlay
 * additional motions, they will go in a queue and be played automatically when the current
 * overlay motion completes.
 */
export class AnimatedCharacter extends gfx.Node3
{
    // access to the character's bone data
    public boneData: BoneData;

    // frames per second for the animation
    public fps: number;  
    // when true, the root position of the character is set using the root position data from the
    // animation.  set to false when the character will use multiple motion clips to avoid making
    // the character jump to a new position whenever a new motion clip starts.
    public useAbsolutePosition: boolean;

    // private member vars
    private characterRoot: AnimatedBone;
    private clip: MotionClip | null;
    private currentTime: number;
    private currentPose: Pose;
    private overlayQueue: MotionClip[];
    private overlayTransitionFrames: number[];
    private overlayTime: number;
    private overlayPose: Pose;


    /**
     * The constructor creates an "empty" animated character.  After constructing the character,
     * you must call createHierarchyFromBoneData() to build the character's scene graph of 
     * AnimatedBones.  
     */
    constructor() {
        super();

        this.boneData = new BoneData();
        this.characterRoot = new AnimatedBone(this, "tmp", new gfx.Matrix4());
        this.clip = null;

        this.fps = 60;
        this.useAbsolutePosition = true;
        this.currentTime = 0;
        this.currentPose = new Pose();
        this.overlayQueue = [];
        this.overlayTransitionFrames = [];
        this.overlayTime = 0;  
        this.overlayPose = new Pose();
    }

    /**
     * Creates a hierarchical scene graph of AnimatedBones for this character based on the
     * skeletal data passed into the function.
     * @param boneData Skeleton information for the character.
     */
    public createHierarchyFromBoneData(boneData: BoneData) {
        // save a reference to this character's bone data
        this.boneData = boneData;

        // Each bone of the hierarchy is represented as an "AnimatedBone", which
        // is a subclass of gfx.Node3, just like "AnimatedCharacter".
        // The hierarchy starts with a single root "bone" that is added as a
        // child of this AnimatedCharacter.
        this.characterRoot = new AnimatedBone(this, "root", new gfx.Matrix4());
        this.add(this.characterRoot);
                
        // Now, complete the hierarchy by calling the addBoneRecursively() function 
        // once for each child of the root node.  Note: because the root "bone" does
        // not have a parent bone, it is a special case where the boneSpaceToParentBoneSpace
        // transform is just the identity matrix.
        for (let i = 0; i < this.boneData.rootNodeNumChildren(); i++) {
            const childBoneName = this.boneData.rootNodeChildBoneName(i);
            this.addBoneRecursively(childBoneName, this.characterRoot, new gfx.Matrix4())
        }
    }

    private addBoneRecursively(boneName: string, parentNode: gfx.Node3, boneSpaceToParentBoneSpace: gfx.Matrix4): void
    {
        // TODO: Add the specified bone to the hierarchy, then call recursively to add its child bones, and so on.

        // ----
        // step 1 is similar to the function above, create a new AnimatedBone object for this particular
        // bone and add it to the hierarchy.
        const bone = new AnimatedBone(this, boneName, boneSpaceToParentBoneSpace);
        parentNode.add(bone);

        // step 2 is to call the function recursively for any child bones
        for (let c=0; c < this.boneData.numChildren(boneName); c++) {

            // we to calculate the matrix each child bone should use to transform from it's local
            // space to it's parent (i.e., this bone).  since we are not (yet) accounting for animation,
            // this matrix is actually the same for every child, so this calculation could be moved outside
            // the for loop to be slightly more efficient.
            const boneLength = this.boneData.boneLength(boneName);
            const boneDirection = this.boneData.boneDirection(boneName);
            const childBoneSpaceToBoneSpace = 
                gfx.Matrix4.makeTranslation(gfx.Vector3.multiplyScalar(boneDirection, boneLength));

            const childBoneName = this.boneData.childBoneName(boneName, c);
            this.addBoneRecursively(childBoneName, bone, childBoneSpaceToBoneSpace);
        }
        // ----
    }

    /**
     * This function is called automatically whenever a bone is added to the character.
     * The default implementation is empty.  The function provides a hook for subclasses
     * of AnimatedCharacter to customize the character by adding various geometry to the
     * scene graph as children of the bone.  Note, the function will be called once for
     * each of the character's bones.  You can check the current bone by accessing its
     * name (i.e., bone.name), and you can get data about the bone, like its length and
     * direction (e.g., bone.length, bone.direction).
     */
    public addGeometryToAnimatedBone(bone: AnimatedBone): void
    {
        // get the current bone by checking bone.name, e.g.:
        // if (bone.name == "root")
    }


    /**
     * Starts animating the character using the MotionClip provided.  The clip will automatically loop.
     * 
     * @param clip Defines the series of poses the character should take.
     * @param fps The frames-per-second for playing back the animation.
     * @param useAbsolutePosition If true, the root position of the character will be set using
     * the root position data from the MotionClip.  Set to false for characters that blend
     * between motion clips to avoid making the character jump to a new position when each
     * new clip is played.
     */
    public play(clip: MotionClip, fps: number, useAbsolutePosition: boolean): void
    {
        this.stop();

        this.fps = fps;
        this.useAbsolutePosition = useAbsolutePosition;
        this.clip = clip;
        this.currentPose = this.clip.frames[0];
    }

    /**
     * Stops playing the active motion clip and clears any motions in the overlay queue.
     */
    public stop(): void
    {
        this.clip = null;
        this.currentTime = 0;

        this.overlayQueue = [];
        this.overlayTransitionFrames = [];
        this.overlayTime = 0;
    }

    /** Assuming the character is currently in the middle of an animation, this
     function briefly interrupts that current motion in order to play a new 
     motion clip.  Use this to apply new behaviors on command.  In a game where
     you press the 'A' button to punch, you could call this function to overlay
     a punching motion clip on top of the current base motion of the character.
     We call this an "overlay" rather than simply "insert" because the function
     also interpolates between the current motion clip and the overlay clip so 
     that there is a smooth transition in the motion.  You can control how smooth
     the transition is by setting the num_transition_frames parameter.  A larger
     number will create a longer, smoother transition.  num_transition_frames are
     used both to "fade in" the overlay motion and to "fade it out".  If you have
     an overlay_clip that is 300 frames long and num_transition_frames=50, then
     the first 50 frames of the overlay_clip will be blended with the next 50
     frames of the motion clip that the character is currently using.  Then, the
     middle 200 frames of the overlay_clip will be played on their own.  Then,
     the final 50 frames of the overlay_clip will again be blended with the next
     50 frames of the character's current motion clip to "fade out" the overlay.
     */
    public overlay(clip: MotionClip, transitionFrames: number): void
    {
        this.overlayQueue.push(clip);
        this.overlayTransitionFrames.push(transitionFrames);
    }

    /**
     * Returns the current number of motions in the overlay queue.
     */
    public getQueueCount(): number
    {
        return this.overlayQueue.length;
    }

    /**
     * Must be called once each frame to advance the character's animation based on the elpased time
     * since the last call.  This updates the current frame of the MotionClip to display based on the
     * elapsed time and then calls calculatePose() and applyPose() to update the character's scene
     * graph.
     */
    public update(deltaTime: number): void
    {
        // If the motion queue is empty, then do nothing
        if(!this.clip)
            return;

        // Advance the time
        this.currentTime += deltaTime;

        // Set the next frame number
        let currentFrame = Math.floor(this.currentTime * this.fps);

        if(currentFrame >= this.clip.frames.length)
        {
            currentFrame = 0;
            this.currentTime = 0;   
            this.currentPose = this.clip.frames[0];
        }

        let overlayFrame = 0;

        // Advance the overlay clip if there is one
        if(this.overlayQueue.length > 0)
        {
            this.overlayTime += deltaTime;

            overlayFrame = Math.floor(this.overlayTime * this.fps);

            if(overlayFrame >= this.overlayQueue[0].frames.length)
            {
                this.overlayQueue.shift();
                this.overlayTransitionFrames.shift();
                this.overlayTime = 0;
                overlayFrame = 0;
            }
        }

        const pose = this.computePose(currentFrame, overlayFrame);
        this.applyPose(pose);
    }

    /**
     * Poses the character according to the joint angles defined by the pose and, if useAbsolutePosition
     * is true, also the root position defined in the pose. 
     */
    public applyPose(pose: Pose): void
    {
        // The root of the character requires some special treatment:
        // Reset the character to its base rotation
        this.characterRoot.rotation.copy(this.boneData.rootNodeRotation());
        // Combine this with the root rotation for this particular pose
        this.characterRoot.rotation.multiply(pose.rootRotation);

        // Only apply the translation if we are using absolute positions
        if (this.useAbsolutePosition) {
            this.characterRoot.position.copy(this.boneData.rootNodePosition());
            this.characterRoot.position.add(pose.rootPosition);
        }

        // Apply the pose to each bone, which should then recursively apply 
        // the current pose to all of its children
        this.characterRoot.children.forEach((child: gfx.Node3) => {
            if (child instanceof AnimatedBone)
                child.applyPose(pose);
        });
    }

    /**
     * Computes a pose by blending together the current frame of the main motion clip with
     * an overlay motion (if currently playing).
     */
    private computePose(currentFrame: number, overlayFrame: number): Pose
    {
        // If there is an active overlay track
        if(this.overlayQueue.length > 0)
        {
            // Start out with the unmodified overlay pose
            const overlayPose = this.overlayQueue[0].frames[overlayFrame].clone();

            let alpha = 0;

            // Fade in the overlay
            if(overlayFrame < this.overlayTransitionFrames[0])
            {
                alpha = 1 - overlayFrame / this.overlayTransitionFrames[0];
                overlayPose.lerp(this.clip!.frames[currentFrame], alpha);
            }
            // Fade out the overlay
            else if (overlayFrame > this.overlayQueue[0].frames.length - this.overlayTransitionFrames[0])
            {
                alpha = 1 - (this.overlayQueue[0].frames.length - overlayFrame) / this.overlayTransitionFrames[0];
                overlayPose.lerp(this.clip!.frames[currentFrame], alpha);
            }

            if(!this.useAbsolutePosition)
            {
                const relativeOverlayPosition = gfx.Vector3.copy(this.overlayQueue[0].frames[overlayFrame].rootPosition);
                relativeOverlayPosition.subtract(this.overlayPose.rootPosition);

                const relativePosition = gfx.Vector3.copy(this.clip!.frames[currentFrame].rootPosition);
                relativePosition.subtract(this.currentPose.rootPosition);

                relativeOverlayPosition.lerp(relativeOverlayPosition, relativePosition, alpha);
                this.characterRoot.position.add(relativeOverlayPosition);

                this.overlayPose = this.overlayQueue[0].frames[overlayFrame];
                this.currentPose = this.clip!.frames[currentFrame];
            }
            
            return overlayPose;
        }
        // Motion is entirely from the base track
        else
        {
            if(!this.useAbsolutePosition)
            {
                const relativePosition = gfx.Vector3.copy(this.clip!.frames[currentFrame].rootPosition);
                relativePosition.subtract(this.currentPose.rootPosition);
                this.characterRoot.position.add(relativePosition);
                this.currentPose = this.clip!.frames[currentFrame];
            }

            return this.clip!.frames[currentFrame];
        }
    }
}
