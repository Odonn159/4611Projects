/* Assignment 4: So You Think Ants Can Dance
 * UMN CSci-4611 Instructors 2012+
 * Significant changes by Prof. Dan Keefe, 2023 
 * Initial GopherGfx implementation by Evan Suma Rosenberg <suma@umn.edu> 2022
 * License: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * Please do not distribute beyond the CSci-4611 course
 */ 

import * as gfx from 'gophergfx'
import { AnimatedBone } from './AnimatedBone';
import { AnimatedCharacter } from './AnimatedCharacter'


/**
 * This character should draw an Ant or some other interesting custom 3D character by
 * adding geometry to the bones of the character.  We will assume the character's
 * skeleton is a humanoid skeleton in the CMU MoCap database format.  So, you can
 * selectively add geometry to the bone by checking the name of the bone using an
 * "if" statement as demonstrated in the support code.
 */
export class AntCharacter extends AnimatedCharacter
{
    private blackMaterial: gfx.UnlitMaterial;
    private antMaterial: gfx.PhongMaterial;

    constructor() {
        super();

        this.blackMaterial = new gfx.UnlitMaterial();
        this.blackMaterial.setColor(gfx.Color.BLACK);

        this.antMaterial = new gfx.PhongMaterial();
        this.antMaterial.ambientColor.set(0.7, 0, 0);
        this.antMaterial.diffuseColor.set(0.7, 0, 0);
        this.antMaterial.specularColor.set(0.7, 0.7, 0.7);
        this.antMaterial.shininess = 50;
    }


    public override addGeometryToAnimatedBone(bone: AnimatedBone): void
    {
        // PART 5: Create an character!
        //
        // For this part, create a convincing custom character out of basic
        // geometries. Start by creating a basic representation for *every* bone
        // (like you did in the SkeletonCharacter), and add additional
        // geometries for specific parts of the skeleton. We suggest drawing
        // geometries for at least the following parts (defined in the if
        // statement below):
        // - lowerback
        // - upperbackback
        // - thorax
        // - head
        //
        // A full list of available bones (and their hierarchical relationships)
        // can be seen in the skeleton files, for example /public/assets/data/05.asf.
        //
        // Lastly, add a face to the character! The character's face should
        // demonstrate your knowledge of composing transformations; at least one
        // part of the face should adjust the position, the rotation, and the
        // scale (like the antennae on the instructor solution).
        
        // PART 5.1: Draw specific parts of the character
        if (bone.name == 'lowerback')
        {
            //red ball
            let sphere = gfx.Geometry3Factory.createSphere(bone.length/2);
            let translate = gfx.Vector3.copy(bone.direction);        
            translate.multiplyScalar(bone.length/2);
            //const TY = gfx.Matrix4.makeTranslation(translate);
            
            sphere.setLocalToParentMatrix(gfx.Matrix4.makeScale(new gfx.Vector3(2,1,1)), false);
            sphere.material.setColor(gfx.Color.RED);
            sphere.position.add(translate);
            bone.add(sphere)
        }
        else if (bone.name == 'upperback')
        {
            //Weird Green Double Cone shape, overlapping. Kinda looks like a yoyo or a hourglass
            let Coneup = gfx.Geometry3Factory.createCone(bone.length/2, bone.length);
            let Conedown = gfx.Geometry3Factory.createCone(bone.length/2, bone.length);
            let translate = gfx.Vector3.copy(bone.direction);        
            translate.multiplyScalar(bone.length/2);
            //const TY = gfx.Matrix4.makeTranslation(translate);
            Coneup.position.add(translate);
            Coneup.setLocalToParentMatrix(bone.boneSpaceToParentBoneSpace, false);
            Coneup.material.setColor(gfx.Color.GREEN);
            Conedown.position.add(translate)
            Conedown.material.setColor(gfx.Color.GREEN);
            Conedown.lookAt(gfx.Vector3.FORWARD, gfx.Vector3.DOWN);
            Conedown.setLocalToParentMatrix(bone.boneSpaceToParentBoneSpace, false);
            //Conedown.position.subtract(translate);
            bone.add(Coneup);
            bone.add(Conedown);

        }
        else if (bone.name == 'thorax')
        {
            let thor = gfx.Geometry3Factory.createBox(bone.length, bone.length, bone.length);
            let translate = gfx.Vector3.copy(bone.direction);    
            thor.material.setColor(gfx.Color.PURPLE);   
            translate.multiplyScalar(bone.length/2);
            const TY = gfx.Matrix4.makeTranslation(translate);
            let rotation = gfx.Matrix4.makeRotationY(Math.PI/4);
            //const AlignWithAxis = gfx.Matrix4.makeAlign(new gfx.Vector3(0,1,0), bone.direction);
            let mul1 = gfx.Matrix4.multiplyAll(TY, rotation);
            thor.setLocalToParentMatrix(mul1, false);  
            bone.add(thor);
        }
        else if (bone.name == 'head')
        {
            //Robot Box head with Cones for antennas, a scaled cylinder for a mouth, and squares for eyes
            let headbox = gfx.Geometry3Factory.createBox(3*bone.length, 2*bone.length, 2*bone.length);
            headbox.setLocalToParentMatrix(bone.boneSpaceToParentBoneSpace, false);
            let lcone = gfx.Geometry3Factory.createCone(bone.length/6, bone.length);
            let lcone2 = gfx.Geometry3Factory.createCone(bone.length/6, bone.length);
            let rotation = gfx.Matrix4.makeRotation(gfx.Quaternion.makeRotationY(Math.PI/2));
            lcone.material.setColor(gfx.Color.YELLOW);
            lcone2.material.setColor(gfx.Color.YELLOW);
            let scale = gfx.Matrix4.makeScale(new gfx.Vector3(1/3, 1, 2));
            let translation = gfx.Matrix4.makeTranslation(new gfx.Vector3(-2*bone.length, 0, 0));
            let lookat = gfx.Matrix4.lookAt(gfx.Vector3.ZERO, gfx.Vector3.UP, gfx.Vector3.LEFT);
            let Mul1 = gfx.Matrix4.multiplyAll(translation, lookat, scale);
            lcone.setLocalToParentMatrix(Mul1, false);
            Mul1 = gfx.Matrix4.multiplyAll(translation, lookat, rotation, scale);
            lcone2.setLocalToParentMatrix(Mul1, false);
            headbox.add(lcone2);
            let rcone = gfx.Geometry3Factory.createCone(bone.length/6, bone.length);
            let rcone2 = gfx.Geometry3Factory.createCone(bone.length/6, bone.length);
            rcone.material.setColor(gfx.Color.YELLOW);
            rcone2.material.setColor(gfx.Color.YELLOW);
            translation = gfx.Matrix4.makeTranslation(new gfx.Vector3(2*bone.length, 0, 0));
            lookat = gfx.Matrix4.lookAt(gfx.Vector3.ZERO, gfx.Vector3.UP, gfx.Vector3.RIGHT);
            Mul1 = gfx.Matrix4.multiplyAll(translation, lookat, scale);
            rcone.setLocalToParentMatrix(Mul1, false);
            Mul1 = gfx.Matrix4.multiplyAll(translation, lookat, rotation, scale);
            rcone2.setLocalToParentMatrix(Mul1, false);
            headbox.add(rcone2);
            headbox.add(lcone);
            headbox.add(rcone);
            let leye = gfx.Geometry3Factory.createBox(bone.length/2, bone.length/4, bone.length/2);
            translation = gfx.Matrix4.makeTranslation(new gfx.Vector3(-1/2*bone.length, bone.length/4, bone.length));
            leye.setLocalToParentMatrix(translation, false);
            leye.material.setColor(gfx.Color.BLACK);
            headbox.add(leye);

            let reye = gfx.Geometry3Factory.createBox(bone.length/2, bone.length/4, bone.length/2);
            translation = gfx.Matrix4.makeTranslation(new gfx.Vector3(1/2*bone.length, bone.length/4, bone.length));
            reye.setLocalToParentMatrix(translation, false);
            reye.material.setColor(gfx.Color.BLACK);
            headbox.add(reye);
            let mouth = gfx.Geometry3Factory.createCylinder(50, bone.length/3, bone.length/2);
            translation = gfx.Matrix4.makeTranslation(new gfx.Vector3(0, -bone.length/4, bone.length));
            scale = gfx.Matrix4.makeScale(new gfx.Vector3(2,1/3, 1));
            lookat = gfx.Matrix4.lookAt(gfx.Vector3.ZERO, gfx.Vector3.DOWN, gfx.Vector3.FORWARD);
            Mul1 = gfx.Matrix4.multiplyAll(translation, lookat, scale);
            mouth.setLocalToParentMatrix(Mul1, false);
            mouth.material.setColor(gfx.Color.RED);
            headbox.add(mouth);
            bone.add(headbox);

        }
        else if(bone.name == "lhipjoint"){
            let sphere = gfx.Geometry3Factory.createSphere(bone.length/8);
                sphere.setLocalToParentMatrix(gfx.Matrix4.makeTranslation(gfx.Vector3.multiplyScalar(bone.direction, bone.length/8)), false);
                sphere.material.setColor(gfx.Color.BLACK);
                bone.add(sphere);
                let sphere2 = gfx.Geometry3Factory.createSphere(bone.length/8);
                sphere2.setLocalToParentMatrix(gfx.Matrix4.makeTranslation(gfx.Vector3.multiplyScalar(bone.direction, 3*bone.length/8)), false);
                sphere2.material.setColor(gfx.Color.BLACK);
                bone.add(sphere2);
                let sphere3 = gfx.Geometry3Factory.createSphere(bone.length/8);
                sphere3.setLocalToParentMatrix(gfx.Matrix4.makeTranslation(gfx.Vector3.multiplyScalar(bone.direction, 5*bone.length/8)), false);
                sphere3.material.setColor(gfx.Color.BLACK);
                bone.add(sphere3);
                let sphere4 = gfx.Geometry3Factory.createSphere(bone.length/8);
                sphere4.setLocalToParentMatrix(gfx.Matrix4.makeTranslation(gfx.Vector3.multiplyScalar(bone.direction, 7*bone.length/8)), false);
                sphere4.material.setColor(gfx.Color.BLACK);
                bone.add(sphere4);
            }
        else if(bone.name == "rhipjoint"){
                let sphere = gfx.Geometry3Factory.createSphere(bone.length/8);
                sphere.setLocalToParentMatrix(gfx.Matrix4.makeTranslation(gfx.Vector3.multiplyScalar(bone.direction, bone.length/8)), false);
                sphere.material.setColor(gfx.Color.BLACK);
                bone.add(sphere);
                let sphere2 = gfx.Geometry3Factory.createSphere(bone.length/8);
                sphere2.setLocalToParentMatrix(gfx.Matrix4.makeTranslation(gfx.Vector3.multiplyScalar(bone.direction, 3*bone.length/8)), false);
                sphere2.material.setColor(gfx.Color.BLACK);
                bone.add(sphere2);
                let sphere3 = gfx.Geometry3Factory.createSphere(bone.length/8);
                sphere3.setLocalToParentMatrix(gfx.Matrix4.makeTranslation(gfx.Vector3.multiplyScalar(bone.direction, 5*bone.length/8)), false);
                sphere3.material.setColor(gfx.Color.BLACK);
                bone.add(sphere3);
                let sphere4 = gfx.Geometry3Factory.createSphere(bone.length/8);
                sphere4.setLocalToParentMatrix(gfx.Matrix4.makeTranslation(gfx.Vector3.multiplyScalar(bone.direction, 7*bone.length/8)), false);
                sphere4.material.setColor(gfx.Color.BLACK);
                bone.add(sphere4);
        }
        else{
            let cyl = gfx.Geometry3Factory.createCylinder(50,0.01,bone.length);
            let translate = gfx.Vector3.copy(bone.direction);        
            translate.multiplyScalar(bone.length/2);
            //const TY = gfx.Matrix4.makeTranslation(translate);
            const AlignWithAxis = gfx.Matrix4.makeAlign(new gfx.Vector3(0,1,0), bone.direction);
            cyl.setLocalToParentMatrix(AlignWithAxis, false);
            cyl.position.add(translate);
            cyl.material.setColor(gfx.Color.BLACK);   

            bone.add(cyl);
        }
        
    }
}
