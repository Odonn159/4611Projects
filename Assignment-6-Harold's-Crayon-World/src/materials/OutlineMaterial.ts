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

export class OutlineMaterial extends gfx.Material3
{
    public color: gfx.Color;
    public thickness: number;
    public baseMaterial: gfx.Material3;

    public static shader = new gfx.ShaderProgram(
        ArtisticRendering.getOutlineVertexShader(), 
        ArtisticRendering.getOutlineFragmentShader()
    );

    private modelUniform: WebGLUniformLocation | null;
    private viewUniform: WebGLUniformLocation | null;
    private projectionUniform: WebGLUniformLocation | null;
    private normalUniform: WebGLUniformLocation | null;
    private colorUniform: WebGLUniformLocation | null;
    private thicknessUniform: WebGLUniformLocation | null;

    private positionAttribute: number;
    private normalAttribute: number;

    constructor(baseMaterial: gfx.Material3)
    {
        super();

        this.baseMaterial = baseMaterial;
        this.color = new gfx.Color(0, 0, 0);
        this.thickness = 0.01;

        OutlineMaterial.shader.initialize(this.gl);
        
        this.viewUniform = OutlineMaterial.shader.getUniform(this.gl, 'viewMatrix');
        this.modelUniform = OutlineMaterial.shader.getUniform(this.gl, 'modelMatrix');
        this.projectionUniform = OutlineMaterial.shader.getUniform(this.gl, 'projectionMatrix');
        this.normalUniform = OutlineMaterial.shader.getUniform(this.gl, 'normalMatrix');
        this.colorUniform = OutlineMaterial.shader.getUniform(this.gl, 'materialColor');
        this.thicknessUniform = OutlineMaterial.shader.getUniform(this.gl, 'thickness');

        this.positionAttribute = OutlineMaterial.shader.getAttribute(this.gl, 'position');
        this.normalAttribute = OutlineMaterial.shader.getAttribute(this.gl, 'normal');
    }

    draw(mesh: gfx.Mesh3, camera: gfx.Camera, lightManager: gfx.LightManager): void
    {
        if(!this.visible || mesh.triangleCount == 0)
            return;

        // Enable the stencil test
        this.gl.enable(this.gl.STENCIL_TEST);

        // Clear the stencil buffer
        this.gl.clear(this.gl.STENCIL_BUFFER_BIT);

        // Setup the test so it always passes
        this.gl.stencilFunc(this.gl.ALWAYS, 1, 0xFF);

        // Set the stencil to the reference value when 
        // both the stencil and the depth tests pass
        this.gl.stencilOp(this.gl.KEEP, this.gl.KEEP, this.gl.REPLACE);

        // // Draw the base material
        this.baseMaterial.draw(mesh, camera, lightManager);

        // Now the stencil test will only pass if the reference value is 0
        this.gl.stencilFunc(this.gl.EQUAL, 0, 0xFF);

        // Don't update the stencil buffer when rendering the outline
        this.gl.stencilOp(this.gl.KEEP, this.gl.KEEP, this.gl.KEEP);

        // Now initialize the outline shader
        this.initialize();

        // Switch to this shader
        this.gl.useProgram(OutlineMaterial.shader.getProgram());

        // Set the camera uniforms
        this.gl.uniformMatrix4fv(this.modelUniform, false, mesh.localToWorldMatrix.mat);
        this.gl.uniformMatrix4fv(this.viewUniform, false, camera.viewMatrix.mat);
        this.gl.uniformMatrix4fv(this.projectionUniform, false, camera.projectionMatrix.mat);
        this.gl.uniformMatrix4fv(this.normalUniform, false, mesh.localToWorldMatrix.inverse().transpose().mat);

        // Set the material property uniforms
        this.gl.uniform4f(this.colorUniform, this.color.r, this.color.g, this.color.b, this.color.a);

        // Set the line thickness uniform
        this.gl.uniform1f(this.thicknessUniform, this.thickness);

        // Set the vertex positions
        this.gl.enableVertexAttribArray(this.positionAttribute);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, mesh.positionBuffer);
        this.gl.vertexAttribPointer(this.positionAttribute, 3, this.gl.FLOAT, false, 0, 0);

        // Set the vertex normals
        this.gl.enableVertexAttribArray(this.normalAttribute);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, mesh.normalBuffer);
        this.gl.vertexAttribPointer(this.normalAttribute, 3, this.gl.FLOAT, false, 0, 0);

        // Draw the triangles
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);
        this.gl.drawElements(this.gl.TRIANGLES, mesh.triangleCount*3, this.gl.UNSIGNED_SHORT, 0);

        // Disable the stencil test
        this.gl.disable(this.gl.STENCIL_TEST);
    }

    setColor(color: gfx.Color): void
    {
        this.color.copy(color);
    }

    getColor(): gfx.Color
    {
        return this.color;
    }
}