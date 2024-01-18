/* Assignment 4: So You Think Ants Can Dance
 * UMN CSci-4611 Instructors 2012+
 * Significant changes by Prof. Dan Keefe, 2023 
 * Initial GopherGfx implementation by Evan Suma Rosenberg <suma@umn.edu> 2022
 * License: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * Please do not distribute beyond the CSci-4611 course
 */ 

import * as gfx from 'gophergfx'
import { Pose } from './Pose'
import { BoneData } from './BoneData'


/** A MotionClip is a series of poses that can be applied to an animated character.
 In addition to loading that list from a file and storing it for later access, 
 this class provides some utility functions for editing the clip, including triming
 unwanted frames from the front or back or prepended or appending additional frames
to the clip.  You can also make the clip loop smoothly. */
export class MotionClip
{
    private static numLoading = 0;

    public static finishedLoading(): boolean
    {
        return MotionClip.numLoading == 0;
    }
    
    public frames: Pose[];

    constructor()
    {
        this.frames = [];
    }

    loadFromAMC(filename: string, skeleton: BoneData): void
    {
        console.log('Loading motion data from ' + filename + '...');

        MotionClip.numLoading++;
        gfx.TextFileLoader.load(filename, (loadedFile: gfx.TextFile) => {

            const parser = new gfx.StringParser(loadedFile.data);

            while(!parser.done())
            {
                // Consume the header
                while(parser.peek().charAt(0) == '#' || parser.peek().charAt(0) == ':')
                {
                    parser.consumeLine();
                }

                while(!parser.done())
                {
                    const pose = new Pose();
                    pose.frame = parser.readNumber();
        
                    // Loop until we encounter the next frame number
                    while(!parser.done() && isNaN(Number(parser.peek())))
                    {
                        const boneName = parser.readToken();
                        if(boneName == 'root')
                        {
                            // Convert from AMC mocap units to meters
                            pose.rootPosition.x = parser.readNumber() * 0.056444;
                            pose.rootPosition.y = parser.readNumber() * 0.056444;
                            pose.rootPosition.z = parser.readNumber() * 0.056444;
                        
                            // Convert from degrees to radians
                            const rootRotation = new gfx.Vector3();
                            rootRotation.x = parser.readNumber() * Math.PI / 180;
                            rootRotation.y = parser.readNumber() * Math.PI / 180;
                            rootRotation.z = parser.readNumber() * Math.PI / 180;

                            // AMC mocap data uses ZYX transformation order for Euler angles
                            pose.rootRotation = gfx.Quaternion.makeEulerAngles(rootRotation.x, rootRotation.y, rootRotation.z, 'ZYX');
                        }
                        else
                        {                            
                            const angles = new gfx.Vector3();
                            if (skeleton.canRotAroundX(boneName))
                                angles.x = parser.readNumber() * Math.PI / 180;
                            if (skeleton.canRotAroundY(boneName))
                                angles.y = parser.readNumber() * Math.PI / 180;
                            if (skeleton.canRotAroundZ(boneName))
                                angles.z = parser.readNumber() * Math.PI / 180;
 
                            // AMC mocap data uses ZYX transformation order for Euler angles
                            const jointRotation = gfx.Quaternion.makeEulerAngles(angles.x, angles.y, angles.z, 'ZYX');
                            pose.setJointRotation(boneName, jointRotation);
                        }
                    }

                    this.frames.push(pose);
                }
            }

            console.log('Motion data loaded from ' + filename + '.');
            MotionClip.numLoading--;
        });
    }

    trimFront(numFrames: number): void
    {
        this.frames.splice(0, numFrames);
    }

    trimBack(numFrames: number): void
    {
        this.frames.splice(this.frames.length-numFrames, numFrames);
    }

    prependPose(pose: Pose): void
    {
        this.frames.unshift(pose);
    }

    appendPose(pose: Pose): void
    {
        this.frames.push(pose);
    }
    
    makeLoop(numBlendFrames: number): void
    {
        const tempClip = new MotionClip();
        for(let i=0; i < numBlendFrames; i++)
        {
            tempClip.prependPose(this.frames.pop()!);
        }

        for(let i=0; i < numBlendFrames; i++)
        {
            const alpha = i / (tempClip.frames.length-1);
            tempClip.frames[i].lerp(this.frames[i], alpha);
            this.frames[i] = tempClip.frames[i];
        }
    }
}