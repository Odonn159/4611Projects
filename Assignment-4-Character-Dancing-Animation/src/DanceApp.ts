/* Assignment 4: So You Think Ants Can Dance
 * UMN CSci-4611 Instructors 2012+
 * Significant changes by Prof. Dan Keefe, 2023 
 * Initial GopherGfx implementation by Evan Suma Rosenberg <suma@umn.edu> 2022
 * License: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * Please do not distribute beyond the CSci-4611 course
 */ 

import * as gfx from 'gophergfx'
import { GUI } from 'dat.gui'
import { AnimatedCharacter } from './AnimatedCharacter'
import { MotionClip } from './MotionClip';
import { BoneData } from './BoneData'
import { Pose } from './Pose'

import { BoneSpaceAxesCharacter } from './BoneSpaceAxesCharacter';
import { JointSpaceAxesCharacter } from './JointSpaceAxesCharacter';
import { SkeletonCharacter } from './SkeletonCharacter';
import { AntCharacter } from './AntCharacter';

enum AppState
{
    INITIALIZING,
    LOADING_SKELETONS,
    LOADING_MOTIONS,
    SHOWING_CALIBRATION_POSE,
    ANIMATING
}

/**
 * DanceApp extends GfxApp to implement the dancing ants assignment.
 */
export class DanceApp extends gfx.GfxApp
{    
    // Animated characters
    private salsaLeadCharacter: AnimatedCharacter;
    private salsaFollowCharacter: AnimatedCharacter;
    private balletCharacters: AnimatedCharacter[];
        
    // Bone data describe the hierarchy of the characters skeleton
    private salsaLeadBoneData: BoneData;
    private salsaFollowBoneData: BoneData;
    private balletBoneData: BoneData;

    // Motion clips
    private salsaLeadMotion: MotionClip;
    private salsaFollowMotion: MotionClip;
    private balletIdleMotionLoop: MotionClip;
    private balletDanceMotions: MotionClip[];

    // State variables
    private state: AppState;
    public balletCharacterOptions = ['Bone Space Axes', 'Joint Space Axes', 'Skeleton', 'Ant']
    public currentBalletCharacter: string;
    public sceneOptions = ['Ballet Studio', 'Salsa Class']
    public currentScene: string;

    constructor()
    {
        super();

        this.salsaLeadCharacter = new AnimatedCharacter();
        this.salsaFollowCharacter = new AnimatedCharacter();
        this.balletCharacters = [];

        this.salsaLeadBoneData = new BoneData();
        this.salsaFollowBoneData = new BoneData();
        this.balletBoneData = new BoneData();

        this.salsaLeadMotion = new MotionClip();
        this.salsaFollowMotion = new MotionClip();
        this.balletIdleMotionLoop = new MotionClip();
        this.balletDanceMotions = [];

        this.state = AppState.INITIALIZING;
        this.currentBalletCharacter = this.balletCharacterOptions[0];
        this.currentScene = this.sceneOptions[0];
    }

    createScene(): void 
    {
        // Setup camera
        this.camera.setPerspectiveCamera(60, 1920/1080, 0.1, 50)
        this.camera.position.set(0, 1.5, 3.5);
        this.camera.lookAt(new gfx.Vector3(0, 1, 0));

        // Create an ambient light
        const ambientLight = new gfx.AmbientLight(new gfx.Vector3(0.3, 0.3, 0.3));
        this.scene.add(ambientLight);

        // Create a directional light
        const directionalLight = new gfx.DirectionalLight(new gfx.Vector3(0.6, 0.6, 0.6));
        directionalLight.position.set(0, 2, 1);
        this.scene.add(directionalLight);

        // Set the background image
        const background = gfx.Geometry2Factory.createBox(2, 2);
        background.material.texture = new gfx.Texture('./assets/images/ants-dance.jpg');
        background.material.texture.setMinFilter(true, false);
        background.layer = 1;
        this.scene.add(background);
        
        // Create the wood floor material
        const floorMaterial = new gfx.GouraudMaterial();
        floorMaterial.texture = new gfx.Texture('assets/images/woodfloor.jpg');
        
        // Create the floor mesh
        const floorMesh = gfx.Geometry3Factory.createPlane(14, 6);
        floorMesh.material = floorMaterial;
        floorMesh.rotation.setRotationX(Math.PI / 2);
        this.scene.add(floorMesh);

        // Create the GUI
        const gui = new GUI();
        gui.width = 300;

        gui.add(this, 'onToggleAnimation').name("Play/Pause Animation");
        gui.add(this, 'currentScene', this.sceneOptions).name("Dance Scene");
        gui.add(this, 'currentBalletCharacter', this.balletCharacterOptions).name("Ballet Character");
        gui.add(this, 'onQueueMotion1').name('Ballet Motion 1');
        gui.add(this, 'onQueueMotion2').name('Ballet Motion 2');
        gui.add(this, 'onQueueMotion3').name('Ballet Motion 3');
        gui.add(this, 'onQueueMotion4').name('Ballet Motion 4');
        gui.add(this, 'onQueueMotion5').name('Ballet Motion 5');

        // Start loading the skeleton and motion from data files.
        // Note: This is asynchronous!  The skeletons are loaded first since they
        // are needed to correctly interpret the motion data.  Then, when the 
        // skeletons are done loading, the motions are loaded.  Finally, when
        // the motions are done loading, this.onSkeletonsAndMotionClipsLoaded() 
        // is called.
        this.loadSkeletons();
    }

    loadSkeletons(): void
    {
        this.state = AppState.LOADING_SKELETONS;

        this.salsaLeadBoneData.loadFromASF('./assets/data/60.asf');
        this.salsaFollowBoneData.loadFromASF('./assets/data/61.asf'); 
        this.balletBoneData.loadFromASF('./assets/data/61.asf');
    }

    loadMotionClips(): void
    {
        this.state = AppState.LOADING_MOTIONS;

        // Add the salsa dance motions
        this.salsaLeadMotion.loadFromAMC('./assets/data/60_12.amc', this.salsaLeadBoneData);
        this.salsaFollowMotion.loadFromAMC('./assets/data/61_12.amc', this.salsaFollowBoneData);

        // Add the ballet idle motion
        this.balletIdleMotionLoop.loadFromAMC('./assets/data/05_20.amc', this.balletBoneData);

        // Add the first ballet dance motion
        const motion1 = new MotionClip();
        motion1.loadFromAMC('./assets/data/05_02.amc', this.balletBoneData);
        this.balletDanceMotions.push(motion1);

        // PART 6.1: Add special motions 2-5 on your own.
        // You can pick your own motions from the CMU mocap database or you can use the same
        // dance moves that we did. These files are located in the public/assets/data folder.
        // We used 05_10.amc, 05_09.amc, 05_20.amc, and 05_06.amc.  However, note that there
        // are many other motions for this dancer in the CMU mocap database!  To download
        // other .amc files, go to http://mocap.cs.cmu.edu, enter the subject number, and
        // then click the search button.  For example, if you search for subject 05, you
        // will find that there are a total of 20 different motion clips to choose from.
        //
        // For this part, please do your best to ensure that the motions that
        // you pick keep the character within the bounds of the screen when the
        // animations are played in order 1-5.
        //
        // Don't forget to trim the motions below in the
        // `onSkeletonsAndMotionClipsLoaded()` method!
        const motion2 = new MotionClip();
        motion2.loadFromAMC('./assets/data/05_10.amc', this.balletBoneData);
        this.balletDanceMotions.push(motion2);
        const motion3 = new MotionClip();
        motion3.loadFromAMC('./assets/data/05_09.amc', this.balletBoneData);
        this.balletDanceMotions.push(motion3);
        const motion4 = new MotionClip();
        motion4.loadFromAMC('./assets/data/05_20.amc', this.balletBoneData);
        this.balletDanceMotions.push(motion4);
        const motion5 = new MotionClip();
        motion5.loadFromAMC('./assets/data/05_06.amc', this.balletBoneData);
        this.balletDanceMotions.push(motion5);

    }

    /**
     * This function is called automatically after all of the skeleton and motion clip
     * data are loaded.  So, this is the right place to process those data in any
     * way and initialize AnimatedCharacters using the data.
     */
    onSkeletonsAndMotionClipsLoaded(): void
    {
        // BALLET CHARACTERS

        // For the ballet character, we want to be able to select one of four
        // possible characters.  They should all behave exactly the same way
        // in terms of their motion, but they will have a different appearance.
        // Our approach is simply to create four AnimatedCharacters with the
        // exact same settings, and show/hide them based on the current settings.

        const balletCharacter1 = new BoneSpaceAxesCharacter();
        balletCharacter1.createHierarchyFromBoneData(this.balletBoneData);
        this.scene.add(balletCharacter1);
        this.balletCharacters.push(balletCharacter1);

        const balletCharacter2 = new JointSpaceAxesCharacter();
        balletCharacter2.createHierarchyFromBoneData(this.balletBoneData);
        this.scene.add(balletCharacter2);
        this.balletCharacters.push(balletCharacter2);

        const balletCharacter3 = new SkeletonCharacter();
        balletCharacter3.createHierarchyFromBoneData(this.balletBoneData);
        this.scene.add(balletCharacter3);
        this.balletCharacters.push(balletCharacter3);

        const balletCharacter4 = new AntCharacter();
        balletCharacter4.createHierarchyFromBoneData(this.balletBoneData);
        this.scene.add(balletCharacter4);
        this.balletCharacters.push(balletCharacter4);

        
        // The ballet idle motion needs to be looped
        this.balletIdleMotionLoop.trimBack(600);
        this.balletIdleMotionLoop.makeLoop(50);

        // The ballet dance motions do not need to be looped, but they do need to be trimmed
        this.balletDanceMotions[0].trimFront(280);
        this.balletDanceMotions[0].trimBack(200);

        // PART 6.2: Trim the motion clips (like we did for clip 0).
        // Keep in mind that (at least for Subject 05), the motion clips are at
        // 120 frames per second. So, `clip.trimFront(120)` would start the clip
        // 1 second later, and `clip.trimBack(120)` would end the clip 1 second
        // earlier.
        //
        // When you're done, play each  clip and make sure:
        // - there is no "idle" time at the start or end of each clip
        // - the character stays on screen when you play each motion in sequence
        // 1. 2. 3. 4. 5.

        //10, 9, 20, 6
        this.balletDanceMotions[1].trimFront(0);
        this.balletDanceMotions[1].trimBack(360);
        this.balletDanceMotions[2].trimFront(420);
        this.balletDanceMotions[2].trimBack(0);
        this.balletDanceMotions[3].trimFront(360);
        this.balletDanceMotions[3].trimBack(0);
        this.balletDanceMotions[4].trimFront(280);
        this.balletDanceMotions[4].trimBack(200);






        
        // SALSA CHARACTERS

        // create the two salsa characters
        this.salsaLeadCharacter = new AntCharacter();
        this.salsaLeadCharacter.createHierarchyFromBoneData(this.salsaLeadBoneData);
        this.scene.add(this.salsaLeadCharacter);

        this.salsaFollowCharacter = new AntCharacter();
        this.salsaFollowCharacter.createHierarchyFromBoneData(this.salsaFollowBoneData);
        this.scene.add(this.salsaFollowCharacter);

        // do any processing of the motion files for the characters to trim any bad data from the
        // start and end and blend (interpolate) the starting and ending frames to make the motion
        // loop smoothly.
        this.salsaLeadMotion.trimFront(100);
        this.salsaLeadMotion.trimBack(150);
        this.salsaLeadMotion.makeLoop(100);
        
        this.salsaFollowMotion.trimFront(100);
        this.salsaFollowMotion.trimBack(150);
        this.salsaFollowMotion.makeLoop(100);

        // start off by showing the calibration pose, users can then start the animation by clicking
        // the "Play/Pause Animation" button in the GUI.
        this.state = AppState.SHOWING_CALIBRATION_POSE;
        this.applyCalibrationPose();
    }


    startAnimating(): void
    {
        // the two salsa motions were captured at 60Hz and can be played using absolute 
        // coordinates since the motions are centered around the origin and no blending 
        // between different motions is required.
        this.salsaLeadCharacter.play(this.salsaLeadMotion, 60, true);
        this.salsaFollowCharacter.play(this.salsaFollowMotion, 60, true);

        // the ballet motions were captured at 120Hz. they must be played using relative 
        // coordinates so that the motions are applied *relative to* wherever the character
        // is in the scene rather than setting the character's position to whatever its 
        // *absolute* coordinates were when the motion clip was captured.
        this.balletCharacters.forEach(character => {
            character.play(this.balletIdleMotionLoop, 120, false);
        });
    }

    stopAnimating(): void
    {
        this.salsaLeadCharacter.stop();
        this.salsaFollowCharacter.stop();
        this.balletCharacters.forEach(character => {
            character.stop();
        });
    }

    applyCalibrationPose(): void
    {
        // the default pose has all joint angles equal to zero, so applying this pose
        // should show the skeleton in its default, calibration pose.
        const calibrationPose = new Pose();

        // apply this pose to each character.  the only change is to set the root position
        // to separate the two salsa characters and to set the height of the root node to
        // 1 meter off the ground so that the legs are visible above the ground.
        calibrationPose.rootPosition.set(1, 1, 0);
        this.salsaLeadCharacter.stop();
        this.salsaLeadCharacter.applyPose(calibrationPose);

        calibrationPose.rootPosition.set(-1, 1, 0);
        this.salsaFollowCharacter.stop();
        this.salsaFollowCharacter.applyPose(calibrationPose);

        calibrationPose.rootPosition.set(0, 1, 0);
        this.balletCharacters.forEach(character => {
            character.stop();
            character.useAbsolutePosition = true;
            character.applyPose(calibrationPose);
        });
    }

    onToggleAnimation(): void
    {
        if (this.state == AppState.SHOWING_CALIBRATION_POSE) {
            this.state = AppState.ANIMATING;
            this.startAnimating();
        } else if (this.state == AppState.ANIMATING) {
            this.state = AppState.SHOWING_CALIBRATION_POSE;
            this.stopAnimating();
            this.applyCalibrationPose();
        }
    }


    update(deltaTime: number) : void
    {
        if (this.state == AppState.LOADING_SKELETONS) {
            if (BoneData.finishedLoading()) {
                this.loadMotionClips();
            }
        } else if (this.state == AppState.LOADING_MOTIONS) {
            if (MotionClip.finishedLoading()) {
                this.onSkeletonsAndMotionClipsLoaded();
            }
        } else {
            
            // Update for the Ballet Studio Scene
            if (this.currentScene == this.sceneOptions[0]) {
                // show/update only the current ballet character 
                for (let i = 0; i < this.balletCharacterOptions.length; i++) {
                    if (this.currentBalletCharacter == this.balletCharacterOptions[i]) {
                        this.balletCharacters[i].visible = true;
                        this.balletCharacters[i].update(deltaTime);
                    } else {
                        this.balletCharacters[i].visible = false;
                    }
                }
                this.salsaLeadCharacter.visible = false;
                this.salsaFollowCharacter.visible = false;
            } 
            
            // Update for the Salsa Class Scene
            else if (this.currentScene == this.sceneOptions[1]) {
                // show/update only the two salsa characters
                this.salsaLeadCharacter.visible = true;
                this.salsaFollowCharacter.visible = true;
                this.salsaLeadCharacter.update(deltaTime);
                this.salsaFollowCharacter.update(deltaTime);
                for (let i = 0; i < this.balletCharacters.length; i++) {
                    this.balletCharacters[i].visible = false;
                }
            }

        }
    }


    onQueueMotion1(): void
    {
        this.balletCharacters.forEach(character => {
            if (character.visible) {
                character.overlay(this.balletDanceMotions[0], 100);
                console.log('Queueing motion 1; queue size is: ' + character.getQueueCount());
            }
        });
    }

    onQueueMotion2(): void
    {
        this.balletCharacters.forEach(character => {
            if (character.visible) {
                character.overlay(this.balletDanceMotions[1], 100);
                console.log('Queueing motion 2; queue size is: ' + character.getQueueCount());
            }
        });
    }

    onQueueMotion3(): void
    {
        this.balletCharacters.forEach(character => {
            if (character.visible) {
                character.overlay(this.balletDanceMotions[2], 100);
                console.log('Queueing motion 3; queue size is: ' + character.getQueueCount());
            }
        });
    }

    onQueueMotion4(): void
    {
        this.balletCharacters.forEach(character => {
            if (character.visible) {
                character.overlay(this.balletDanceMotions[3], 100);
                console.log('Queueing motion 4; queue size is: ' + character.getQueueCount());
            }
        });
    }

    onQueueMotion5(): void
    {
        this.balletCharacters.forEach(character => {
            if (character.visible) {
                character.overlay(this.balletDanceMotions[4], 100);
                console.log('Queueing motion 5; queue size is: ' + character.getQueueCount());
            }
        });
    }
}
