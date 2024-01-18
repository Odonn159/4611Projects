/* Assignment 6: Harold: A World Made of Drawings
 * UMN CSci-4611 Instructors 2018+
 * GopherGfx implementation by Evan Suma Rosenberg <suma@umn.edu> 2022
 * License: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * Please do not distribute beyond the CSci-4611 course
 */ 

// Note, the material classes in this assignment implement the same functionality
// as for Assignment 5, and you could plug in your own implementations if you prefer.
// We have just added an (obfuscated) instructors' implementation to the Assignment 6
// support code to make sure that everyone has a working implementation.

import * as gfx from 'gophergfx'
import { ArtisticRendering } from './ArtisticRendering';

export class ToonMaterial extends gfx.Material3
{
    public static shader = new gfx.ShaderProgram(
        ArtisticRendering.getToonVertexShader(), 
        ArtisticRendering.getToonFragmentShader()
    );

    public texture: gfx.Texture | null;
    public ambientColor: gfx.Color;
    public diffuseColor: gfx.Color;
    public specularColor: gfx.Color;
    public shininess: number;

    public diffuseRamp: gfx.Texture;
    public specularRamp: gfx.Texture;


    private kAmbientUniform: WebGLUniformLocation | null;
    private kDiffuseUniform: WebGLUniformLocation | null;
    private kSpecularUniform: WebGLUniformLocation | null;
    private shininessUniform: WebGLUniformLocation | null;
    
    private textureUniform: WebGLUniformLocation | null;
    private useTextureUniform: WebGLUniformLocation | null;

    private eyePositionUniform: WebGLUniformLocation | null;
    private modelUniform: WebGLUniformLocation | null;
    private viewUniform: WebGLUniformLocation | null;
    private projectionUniform: WebGLUniformLocation | null;
    private normalUniform: WebGLUniformLocation | null;

    private numLightsUniform: WebGLUniformLocation | null;
    private lightTypesUniform: WebGLUniformLocation | null;
    private lightPositionsUniform: WebGLUniformLocation | null;
    private ambientIntensitiesUniform: WebGLUniformLocation | null;
    private diffuseIntensitiesUniform: WebGLUniformLocation | null;
    private specularIntensitiesUniform: WebGLUniformLocation | null;
    
    private diffuseRampUniform: WebGLUniformLocation | null;
    private specularRampUniform: WebGLUniformLocation | null;

    private positionAttribute: number;
    private normalAttribute: number;
    private colorAttribute: number;
    private texCoordAttribute: number;

    constructor(diffuseRamp: gfx.Texture, specularRamp: gfx.Texture)
    {
        super();

        this.texture = null;
        this.ambientColor = new gfx.Color(1, 1, 1);
        this.diffuseColor = new gfx.Color(1, 1, 1);
        this.specularColor = new gfx.Color(0, 0, 0);
        this.shininess = 30;

        this.diffuseRamp = diffuseRamp;
        this.specularRamp = specularRamp;
 
        // Disable wrapping on the ramp textures
        this.diffuseRamp.setWrapping(false);
        this.specularRamp.setWrapping(false);

        ToonMaterial.shader.initialize(this.gl);

        this.kAmbientUniform = ToonMaterial.shader.getUniform(this.gl, 'kAmbient');
        this.kDiffuseUniform = ToonMaterial.shader.getUniform(this.gl, 'kDiffuse');
        this.kSpecularUniform = ToonMaterial.shader.getUniform(this.gl, 'kSpecular');
        this.shininessUniform = ToonMaterial.shader.getUniform(this.gl, 'shininess');

        this.textureUniform = ToonMaterial.shader.getUniform(this.gl, 'textureImage');
        this.useTextureUniform = ToonMaterial.shader.getUniform(this.gl, 'useTexture');

        this.eyePositionUniform = ToonMaterial.shader.getUniform(this.gl, 'eyePosition');
        this.viewUniform = ToonMaterial.shader.getUniform(this.gl, 'viewMatrix');
        this.modelUniform = ToonMaterial.shader.getUniform(this.gl, 'modelMatrix');
        this.projectionUniform = ToonMaterial.shader.getUniform(this.gl, 'projectionMatrix');
        this.normalUniform = ToonMaterial.shader.getUniform(this.gl, 'normalMatrix');

        this.numLightsUniform = ToonMaterial.shader.getUniform(this.gl, 'numLights');
        this.lightTypesUniform = ToonMaterial.shader.getUniform(this.gl, 'lightTypes');
        this.lightPositionsUniform = ToonMaterial.shader.getUniform(this.gl, 'lightPositions');
        this.ambientIntensitiesUniform = ToonMaterial.shader.getUniform(this.gl, 'ambientIntensities');
        this.diffuseIntensitiesUniform = ToonMaterial.shader.getUniform(this.gl, 'diffuseIntensities');
        this.specularIntensitiesUniform = ToonMaterial.shader.getUniform(this.gl, 'specularIntensities');

        this.diffuseRampUniform = ToonMaterial.shader.getUniform(this.gl, 'diffuseRamp');
        this.specularRampUniform = ToonMaterial.shader.getUniform(this.gl, 'specularRamp');

        this.positionAttribute = ToonMaterial.shader.getAttribute(this.gl, 'position');
        this.normalAttribute = ToonMaterial.shader.getAttribute(this.gl, 'normal');
        this.colorAttribute = ToonMaterial.shader.getAttribute(this.gl, 'color');
        this.texCoordAttribute = ToonMaterial.shader.getAttribute(this.gl, 'texCoord');   
    }

    draw(mesh: gfx.Mesh3, camera: gfx.Camera, lightManager: gfx.LightManager): void
    {
        if(!this.visible || mesh.triangleCount == 0)
            return;

        this.initialize();

        // Switch to this shader
        this.gl.useProgram(ToonMaterial.shader.getProgram());

        // Set the camera uniforms
        const cameraPosition = new gfx.Vector3();
        cameraPosition.transformPoint(camera.localToWorldMatrix);
        this.gl.uniform3f(this.eyePositionUniform, cameraPosition.x, cameraPosition.y, cameraPosition.z);
        this.gl.uniformMatrix4fv(this.modelUniform, false, mesh.localToWorldMatrix.mat);
        this.gl.uniformMatrix4fv(this.viewUniform, false, camera.viewMatrix.mat);
        this.gl.uniformMatrix4fv(this.projectionUniform, false, camera.projectionMatrix.mat);
        this.gl.uniformMatrix4fv(this.normalUniform, false, mesh.localToWorldMatrix.inverse().transpose().mat);

        // Set the material property uniforms
        this.gl.uniform3f(this.kAmbientUniform, this.ambientColor.r, this.ambientColor.g, this.ambientColor.b);
        this.gl.uniform3f(this.kDiffuseUniform, this.diffuseColor.r, this.diffuseColor.g, this.diffuseColor.b);
        this.gl.uniform3f(this.kSpecularUniform,this.specularColor.r, this.specularColor.g, this.specularColor.b);
        this.gl.uniform1f(this.shininessUniform, this.shininess);

        // Set the light uniforms
        this.gl.uniform1i(this.numLightsUniform, lightManager.getNumLights());
        this.gl.uniform1iv(this.lightTypesUniform, lightManager.lightTypes);
        this.gl.uniform3fv(this.lightPositionsUniform, lightManager.lightPositions);
        this.gl.uniform3fv(this.ambientIntensitiesUniform, lightManager.ambientIntensities);
        this.gl.uniform3fv(this.diffuseIntensitiesUniform, lightManager.diffuseIntensities);
        this.gl.uniform3fv(this.specularIntensitiesUniform, lightManager.specularIntensities);

        // Set the diffuse and specular ramps
        this.gl.activeTexture(this.gl.TEXTURE0 + this.diffuseRamp.id)
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.diffuseRamp.texture);
        this.gl.uniform1i(this.diffuseRampUniform, this.diffuseRamp.id);
        
        this.gl.activeTexture(this.gl.TEXTURE0 + this.specularRamp.id)
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.specularRamp.texture);
        this.gl.uniform1i(this.specularRampUniform, this.specularRamp.id);
        
        // Set the vertex positions
        this.gl.enableVertexAttribArray(this.positionAttribute);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, mesh.positionBuffer);
        this.gl.vertexAttribPointer(this.positionAttribute, 3, this.gl.FLOAT, false, 0, 0);

        // Set the vertex normals
        this.gl.enableVertexAttribArray(this.normalAttribute);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, mesh.normalBuffer);
        this.gl.vertexAttribPointer(this.normalAttribute, 3, this.gl.FLOAT, false, 0, 0);

        // Set the vertex colors
        if(mesh.hasVertexColors)
        {
            this.gl.enableVertexAttribArray(this.colorAttribute);
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, mesh.colorBuffer);
            this.gl.vertexAttribPointer(this.colorAttribute, 4, this.gl.FLOAT, false, 0, 0);
        }
        else
        {
            this.gl.disableVertexAttribArray(this.colorAttribute);
            this.gl.vertexAttrib4f(this.colorAttribute, 1, 1, 1, 1);
        }

        if(this.texture)
        {
            // Activate the texture in the shader
            this.gl.uniform1i(this.useTextureUniform, 1);

            // Set the texture
            this.gl.activeTexture(this.gl.TEXTURE0 + this.texture.id)
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture.texture);
            this.gl.uniform1i(this.textureUniform, this.texture.id);

            // Set the texture coordinates
            this.gl.enableVertexAttribArray(this.texCoordAttribute);
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, mesh.texCoordBuffer);
            this.gl.vertexAttribPointer(this.texCoordAttribute, 2, this.gl.FLOAT, false, 0, 0);
        }
        else
        {
            // Disable the texture in the shader
            this.gl.uniform1i(this.useTextureUniform, 0);
            this.gl.disableVertexAttribArray(this.texCoordAttribute);
        }

        // Draw the triangles
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);
        this.gl.drawElements(this.gl.TRIANGLES, mesh.triangleCount*3, this.gl.UNSIGNED_SHORT, 0);
    }

    setColor(color: gfx.Color): void
    {
        this.ambientColor.copy(color);
        this.diffuseColor.copy(color);
        this.specularColor.copy(color);
    }

    getColor(): gfx.Color
    {
        return this.diffuseColor;
    }
}