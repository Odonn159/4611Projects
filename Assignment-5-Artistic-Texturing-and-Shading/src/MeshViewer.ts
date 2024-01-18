/* Assignment 5: Artistic Rendering
 * UMN CSci-4611 Instructors 2012+
 * GopherGfx implementation by Evan Suma Rosenberg <suma@umn.edu> 2022
 * License: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * Please do not distribute beyond the CSci-4611 course
 */ 

// You only need to modify the shaders for this assignment.
// You do not need to write any TypeScript code unless
// you are planning to add wizard functionality.

import * as gfx from 'gophergfx'
import { GUI } from 'dat.gui'
import { ToonMaterial } from './ToonMaterial';
import { OutlineMaterial } from './OutlineMaterial';
import { NormalMapMaterial } from './NormalMapMaterial';
import { MyGouraudMaterial } from './MyGouraudMaterial';
import { MyPhongMaterial } from './MyPhongMaterial';

export class MeshViewer extends gfx.GfxApp
{
    private cameraControls: gfx.OrbitControls;
    public renderStyle: string;
    public model: string;
    public texture: string;
    public lightType: string;

    private models: gfx.Mesh3[];

    private gouradMaterial: MyGouraudMaterial;
    private phongMaterial: MyPhongMaterial;
    private unlitMaterial: gfx.UnlitMaterial;
    private wireframeMaterial: gfx.WireframeMaterial;
    private toonMaterial: ToonMaterial;
    private outlineMaterial: OutlineMaterial;
    private normalMapMaterial: NormalMapMaterial;

    private gravelTexture: gfx.Texture;
    private gravelNormalMap: gfx.Texture;
    private barkTexture: gfx.Texture;
    private barkNormalMap: gfx.Texture;
    private glassTexture: gfx.Texture;
    private glassNormalMap: gfx.Texture;

    private pointLight: gfx.PointLight;
    private directionalLight: gfx.DirectionalLight;

    constructor()
    {
        // Enable the stencil buffer
        super(true);

        this.cameraControls = new gfx.OrbitControls(this.camera);

        this.renderStyle = 'Gouraud';
        this.model = 'bunny.obj';
        this.texture = 'None';
        this.lightType = 'Point Light';
        
        this.models = [];

        this.gouradMaterial = new MyGouraudMaterial();
        this.phongMaterial = new MyPhongMaterial();
        this.unlitMaterial = new gfx.UnlitMaterial();
        this.wireframeMaterial = new gfx.WireframeMaterial();
        this.normalMapMaterial = new NormalMapMaterial();

        // Toon shading mode actually uses two separate shaders, one for the 
        // the silhouette and one for the mesh. The toon material is wrapped 
        // within the outline material.
        this.toonMaterial = new ToonMaterial(
            new gfx.Texture('./assets/ramps/toonDiffuse.png'),
            new gfx.Texture('./assets/ramps/toonSpecular.png'),
        );
        this.outlineMaterial = new OutlineMaterial(this.toonMaterial);

        this.gravelTexture = new gfx.Texture('./assets/textures/Gravel_001_BaseColor.jpg');
        this.gravelNormalMap = new gfx.Texture('./assets/textures/Gravel_001_Normal.jpg');

        this.barkTexture = new gfx.Texture('./assets/textures/Bark_007_BaseColor.jpg');
        this.barkNormalMap = new gfx.Texture('./assets/textures/Bark_007_Normal.jpg');

        this.glassTexture = new gfx.Texture('./assets/textures/Glass_Stained_001_basecolor.jpg');
        this.glassNormalMap = new gfx.Texture('./assets/textures/Glass_Stained_001_normal.jpg');

        this.pointLight = new gfx.PointLight(gfx.Color.WHITE);
        this.directionalLight = new gfx.DirectionalLight(gfx.Color.WHITE);

        this.createGUI();
    }

    createGUI(): void
    {
        // Create the GUI
        const gui = new GUI();
        gui.width = 200;

        const renderControls = gui.addFolder('Shading Model');
        renderControls.open();

        const renderStyleController = renderControls.add(this, 'renderStyle', [
            'Gouraud', 
            'Phong', 
            'Toon',
            'Normal Map',
            'Unlit',
            'Wireframe'
        ]);
        renderStyleController.name('');
        renderStyleController.onChange(()=>{this.changeRenderStyle()});

        const modelControls = gui.addFolder('Model');
        modelControls.open();

        const modelController = modelControls.add(this, 'model', [
            'bunny.obj', 
            'cow.obj',
            'cube.obj', 
            'head.obj',
            'hippo.obj',
            'sphere.obj',
            'teapot.obj'
        ]);
        modelController.name('');
        modelController.onChange(()=>{this.changeModel()});     

        const textureControls = gui.addFolder('Texture');
        textureControls.open();

        const textureController = textureControls.add(this, 'texture', [
            'None',
            'Gravel',
            'Bark',
            'Stained Glass'
        ]);
        textureController.name('');
        textureController.onChange(()=>{this.changeTexture()});  

        const lightControls = gui.addFolder('Light');
        lightControls.open();

        const lightController = lightControls.add(this, 'lightType', [
            'Point Light',
            'Directional Light',
            'Ambient Only'
        ]);
        lightController.name('');
        lightController.onChange(()=>{this.changeLight()});
    }

    createScene(): void 
    {
        // Setup camera
        this.renderer.viewport = gfx.Viewport.CROP;
        this.camera.setPerspectiveCamera(60, 1920/1080, 0.1, 10);
        this.cameraControls.setDistance(2);
        this.cameraControls.zoomSpeed = 0.1;
        this.cameraControls.setOrbit(-30 * Math.PI / 180, 15 * Math.PI / 180);

        this.renderer.background.set(0.7, 0.7, 0.7);
        
        // Create an ambient light
        const ambientLight = new gfx.AmbientLight(new gfx.Vector3(0.2, 0.2, 0.2));
        this.scene.add(ambientLight);

        this.pointLight.position.set(.75, 1.1, 1);
        this.scene.add(this.pointLight);

        this.directionalLight.position.set(.75, 1.1, 1)
        this.directionalLight.visible = false;
        this.scene.add(this.directionalLight);

        const lightSphere = gfx.Geometry3Factory.createSphere();
        lightSphere.scale.set(0.05, 0.05, 0.05);
        lightSphere.position.set(.75, 1.1, 1);
        this.scene.add(lightSphere);

        const lightSphereMaterial = new gfx.UnlitMaterial();
        lightSphereMaterial.color.set(1, 1, 0);
        lightSphere.material = lightSphereMaterial;

        // Set the initial material colors and texture
        this.changeTexture();

        this.outlineMaterial.thickness = 0.02;
        this.outlineMaterial.color.set(0, 0, 0);

        this.models.push(gfx.MeshLoader.loadOBJ('./assets/models/bunny.obj'));
        this.models.push(gfx.MeshLoader.loadOBJ('./assets/models/cow.obj'));
        this.models.push(gfx.MeshLoader.loadOBJ('./assets/models/cube.obj'));
        this.models.push(gfx.MeshLoader.loadOBJ('./assets/models/head.obj'));
        this.models.push(gfx.MeshLoader.loadOBJ('./assets/models/hippo.obj'));
        this.models.push(gfx.MeshLoader.loadOBJ('./assets/models/sphere.obj'));
        this.models.push(gfx.MeshLoader.loadOBJ('./assets/models/teapot.obj'));

        this.models.forEach((model: gfx.Mesh3) => {
            model.material = this.gouradMaterial;
            model.visible = false;
            this.scene.add(model);
        });

        this.models[0].visible = true;
    }
    update(deltaTime: number): void 
    {
        // Nothing to implement here for this assignment
        this.cameraControls.update(deltaTime);
    }

    private changeRenderStyle(): void
    {
       if(this.renderStyle == 'Gouraud')
       {
            this.models.forEach((model: gfx.Mesh3) => {
                model.material = this.gouradMaterial;
            });
       }
       else if(this.renderStyle == 'Phong')
       {
            this.models.forEach((model: gfx.Mesh3) => {
                model.material = this.phongMaterial;
            });
       }
       else if(this.renderStyle == 'Toon')
       {
            this.models.forEach((model: gfx.Mesh3) => {
                model.material = this.outlineMaterial;
            });
       }
       else if(this.renderStyle == 'Wireframe')
       {
            this.models.forEach((model: gfx.Mesh3) => {
                model.material = this.wireframeMaterial;
            });
       }
       else if(this.renderStyle == 'Unlit')
       {
            this.models.forEach((model: gfx.Mesh3) => {
                model.material = this.unlitMaterial;
            });
       }
       else if(this.renderStyle == 'Normal Map')
       {
            this.models.forEach((model: gfx.Mesh3) => {
                model.material = this.normalMapMaterial;
            });
       }
    }

    private changeModel(): void
    {
        if(this.model == 'bunny.obj')
        {
            this.models.forEach((model: gfx.Mesh3) => {
                model.visible = false;
            });
            this.models[0].visible = true;
            this.setMaterialSide(gfx.Side.FRONT);
        }
        else if(this.model == 'cow.obj')
        {
            this.models.forEach((model: gfx.Mesh3) => {
                model.visible = false;
            });
            this.models[1].visible = true;
            this.setMaterialSide(gfx.Side.FRONT);
        }
        else if(this.model == 'cube.obj')
        {
            this.models.forEach((model: gfx.Mesh3) => {
                model.visible = false;
            });
            this.models[2].visible = true;
            this.setMaterialSide(gfx.Side.FRONT);
        }
        else if(this.model == 'head.obj')
        {
            this.models.forEach((model: gfx.Mesh3) => {
                model.visible = false;
            });
            this.models[3].visible = true;
            this.setMaterialSide(gfx.Side.FRONT);
        }
        else if(this.model == 'hippo.obj')
        {
            this.models.forEach((model: gfx.Mesh3) => {
                model.visible = false;
            });
            this.models[4].visible = true;
            this.setMaterialSide(gfx.Side.FRONT);
        }
        else if(this.model == 'sphere.obj')
        {
            this.models.forEach((model: gfx.Mesh3) => {
                model.visible = false;
            });
            this.models[5].visible = true;
            this.setMaterialSide(gfx.Side.FRONT);
        }
        else if(this.model == 'teapot.obj')
        {
            this.models.forEach((model: gfx.Mesh3) => {
                model.visible = false;
            });
            this.models[6].visible = true;
            this.setMaterialSide(gfx.Side.DOUBLE);
        }
    }

    private changeTexture(): void
    {
        if(this.texture == 'None')
        {
            this.gouradMaterial.ambientColor.set(1, 0.4, 0.4);
            this.gouradMaterial.diffuseColor.set(1, 0.4, 0.4);
            this.gouradMaterial.specularColor.set(1, 1, 1);
            this.gouradMaterial.shininess = 50;
            this.gouradMaterial.texture = null;

            this.phongMaterial.ambientColor.set(1, 0.4, 0.4);
            this.phongMaterial.diffuseColor.set(1, 0.4, 0.4);
            this.phongMaterial.specularColor.set(1, 1, 1);
            this.phongMaterial.shininess = 50;
            this.phongMaterial.texture = null;

            this.unlitMaterial.color.set(1, 0.4, 0.4);
            this.unlitMaterial.texture = null;

            this.toonMaterial.ambientColor.set(1, 0.4, 0.4);
            this.toonMaterial.diffuseColor.set(1, 0.4, 0.4);
            this.toonMaterial.specularColor.set(1, 1, 1);
            this.toonMaterial.shininess = 50;
            this.toonMaterial.texture = null;

            this.normalMapMaterial.ambientColor.set(1, 0.4, 0.4);
            this.normalMapMaterial.diffuseColor.set(1, 0.4, 0.4);
            this.normalMapMaterial.specularColor.set(1, 1, 1);
            this.normalMapMaterial.shininess = 50;
            this.normalMapMaterial.texture = null;
            this.normalMapMaterial.normalMap = null;
        }
        else if(this.texture == 'Gravel')
        {
            this.gouradMaterial.ambientColor.set(1, 1, 1);
            this.gouradMaterial.diffuseColor.set(1, 1, 1);
            this.gouradMaterial.specularColor.set(1, 1, 1);
            this.gouradMaterial.shininess = 50;
            this.gouradMaterial.texture = this.gravelTexture;

            this.phongMaterial.ambientColor.set(1, 1, 1);
            this.phongMaterial.diffuseColor.set(1, 1, 1);
            this.phongMaterial.specularColor.set(1, 1, 1);
            this.phongMaterial.shininess = 50;
            this.phongMaterial.texture = this.gravelTexture;

            this.unlitMaterial.color.set(1, 1, 1);
            this.unlitMaterial.texture = this.gravelTexture;

            this.toonMaterial.ambientColor.set(1, 1, 1);
            this.toonMaterial.diffuseColor.set(1, 1, 1);
            this.toonMaterial.specularColor.set(1, 1, 1);
            this.toonMaterial.shininess = 50;
            this.toonMaterial.texture = this.gravelTexture;

            this.normalMapMaterial.ambientColor.set(1, 1, 1);
            this.normalMapMaterial.diffuseColor.set(1, 1, 1);
            this.normalMapMaterial.specularColor.set(1, 1, 1);
            this.normalMapMaterial.shininess = 50;
            this.normalMapMaterial.texture = this.gravelTexture;
            this.normalMapMaterial.normalMap = this.gravelNormalMap;
        }
        else if(this.texture == 'Bark')
        {
            this.gouradMaterial.ambientColor.set(1, 1, 1);
            this.gouradMaterial.diffuseColor.set(1, 1, 1);
            this.gouradMaterial.specularColor.set(0.5, 0.5, 0.5);
            this.gouradMaterial.shininess = 10;
            this.gouradMaterial.texture = this.barkTexture;

            this.phongMaterial.ambientColor.set(1, 1, 1);
            this.phongMaterial.diffuseColor.set(1, 1, 1);
            this.phongMaterial.specularColor.set(0.5, 0.5, 0.5);
            this.phongMaterial.shininess = 10;
            this.phongMaterial.texture = this.barkTexture;

            this.unlitMaterial.color.set(1, 1, 1);
            this.unlitMaterial.texture = this.barkTexture;

            this.toonMaterial.ambientColor.set(1, 1, 1);
            this.toonMaterial.diffuseColor.set(1, 1, 1);
            this.toonMaterial.specularColor.set(0.5, 0.5, 0.5);
            this.toonMaterial.shininess = 10;
            this.toonMaterial.texture = this.barkTexture;

            this.normalMapMaterial.ambientColor.set(1, 1, 1);
            this.normalMapMaterial.diffuseColor.set(1, 1, 1);
            this.normalMapMaterial.specularColor.set(0.5, 0.5, 0.5);
            this.normalMapMaterial.shininess = 10;
            this.normalMapMaterial.texture = this.barkTexture;
            this.normalMapMaterial.normalMap = this.barkNormalMap;
        }
        else if(this.texture == 'Stained Glass')
        {
            this.gouradMaterial.ambientColor.set(1, 1, 1);
            this.gouradMaterial.diffuseColor.set(1, 1, 1);
            this.gouradMaterial.specularColor.set(1, 1, 1);
            this.gouradMaterial.shininess = 50;
            this.gouradMaterial.texture = this.glassTexture;

            this.phongMaterial.ambientColor.set(1, 1, 1);
            this.phongMaterial.diffuseColor.set(1, 1, 1);
            this.phongMaterial.specularColor.set(1, 1, 1);
            this.phongMaterial.shininess = 50;
            this.phongMaterial.texture = this.glassTexture;

            this.unlitMaterial.color.set(1, 1, 1);
            this.unlitMaterial.texture = this.glassTexture;

            this.toonMaterial.ambientColor.set(1, 1, 1);
            this.toonMaterial.diffuseColor.set(1, 1, 1);
            this.toonMaterial.specularColor.set(1, 1, 1);
            this.toonMaterial.shininess = 50;
            this.toonMaterial.texture = this.glassTexture;

            this.normalMapMaterial.ambientColor.set(1, 1, 1);
            this.normalMapMaterial.diffuseColor.set(1, 1, 1);
            this.normalMapMaterial.specularColor.set(1, 1, 1);
            this.normalMapMaterial.shininess = 50;
            this.normalMapMaterial.texture = this.glassTexture;
            this.normalMapMaterial.normalMap = this.glassNormalMap;
        }
    }

    private setMaterialSide(side: gfx.Side): void
    {
        this.gouradMaterial.side = side;
        this.phongMaterial.side = side;
        this.unlitMaterial.side = side;
        this.toonMaterial.side = side;
        this.normalMapMaterial.side = side;
    }

    private changeLight(): void
    {
        if(this.lightType == 'Point Light')
        {
            this.pointLight.visible = true;
            this.directionalLight.visible = false;
        }
        else if(this.lightType == 'Directional Light')
        {
            this.pointLight.visible = false;
            this.directionalLight.visible = true;
        }
        else
        {
            this.pointLight.visible = false;
            this.directionalLight.visible = false;
        }
    }
}