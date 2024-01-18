/* Assignment 5: Artistic Rendering
 * UMN CSci-4611 Instructors 2012+
 * GopherGfx implementation by Evan Suma Rosenberg <suma@umn.edu> 2022
 * License: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * Please do not distribute beyond the CSci-4611 course
 */ 

// You only need to modify the shaders for this assignment.
// You do not need to write any TypeScript code unless
// you are planning to add wizard functionality.

// @ts-ignore
import normalMapVertexShader from './shaders/normal.vert'
// @ts-ignore
import normalMapFragmentShader from './shaders/normal.frag'

import * as gfx from 'gophergfx'

export class NormalMapMaterial extends gfx.Material3
{
    public static shader = new gfx.ShaderProgram(normalMapVertexShader, normalMapFragmentShader);
    public static tangentBuffers: Map<gfx.Mesh3, WebGLBuffer> = new Map();

    public texture: gfx.Texture | null;
    public normalMap: gfx.Texture | null;
    public ambientColor: gfx.Color;
    public diffuseColor: gfx.Color;
    public specularColor: gfx.Color;
    public shininess: number;

    private kAmbientUniform: WebGLUniformLocation | null;
    private kDiffuseUniform: WebGLUniformLocation | null;
    private kSpecularUniform: WebGLUniformLocation | null;
    private shininessUniform: WebGLUniformLocation | null;
    
    private textureUniform: WebGLUniformLocation | null;
    private useTextureUniform: WebGLUniformLocation | null;

    private normalMapUniform: WebGLUniformLocation | null;
    private useNormalMapUnifirom: WebGLUniformLocation | null;

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

    private positionAttribute: number;
    private normalAttribute: number;
    private tangentAttribute: number;
    private colorAttribute: number;
    private texCoordAttribute: number;

    constructor()
    {
        super();

        this.texture = null;
        this.normalMap = null;
        this.ambientColor = new gfx.Color(1, 1, 1);
        this.diffuseColor = new gfx.Color(1, 1, 1);
        this.specularColor = new gfx.Color(0, 0, 0);
        this.shininess = 30;

        NormalMapMaterial.shader.initialize(this.gl);

        this.kAmbientUniform = NormalMapMaterial.shader.getUniform(this.gl, 'kAmbient');
        this.kDiffuseUniform = NormalMapMaterial.shader.getUniform(this.gl, 'kDiffuse');
        this.kSpecularUniform = NormalMapMaterial.shader.getUniform(this.gl, 'kSpecular');
        this.shininessUniform = NormalMapMaterial.shader.getUniform(this.gl, 'shininess');

        this.textureUniform = NormalMapMaterial.shader.getUniform(this.gl, 'textureImage');
        this.useTextureUniform = NormalMapMaterial.shader.getUniform(this.gl, 'useTexture');

        this.normalMapUniform = NormalMapMaterial.shader.getUniform(this.gl, 'normalMap');
        this.useNormalMapUnifirom = NormalMapMaterial.shader.getUniform(this.gl, 'useNormalMap');

        this.eyePositionUniform = NormalMapMaterial.shader.getUniform(this.gl, 'eyePosition');
        this.viewUniform = NormalMapMaterial.shader.getUniform(this.gl, 'viewMatrix');
        this.modelUniform = NormalMapMaterial.shader.getUniform(this.gl, 'modelMatrix');
        this.projectionUniform = NormalMapMaterial.shader.getUniform(this.gl, 'projectionMatrix');
        this.normalUniform = NormalMapMaterial.shader.getUniform(this.gl, 'normalMatrix');

        this.numLightsUniform = NormalMapMaterial.shader.getUniform(this.gl, 'numLights');
        this.lightTypesUniform = NormalMapMaterial.shader.getUniform(this.gl, 'lightTypes');
        this.lightPositionsUniform = NormalMapMaterial.shader.getUniform(this.gl, 'lightPositions');
        this.ambientIntensitiesUniform = NormalMapMaterial.shader.getUniform(this.gl, 'ambientIntensities');
        this.diffuseIntensitiesUniform = NormalMapMaterial.shader.getUniform(this.gl, 'diffuseIntensities');
        this.specularIntensitiesUniform = NormalMapMaterial.shader.getUniform(this.gl, 'specularIntensities');

        this.positionAttribute = NormalMapMaterial.shader.getAttribute(this.gl, 'position');
        this.normalAttribute = NormalMapMaterial.shader.getAttribute(this.gl, 'normal');
        this.tangentAttribute = NormalMapMaterial.shader.getAttribute(this.gl, 'tangent');
        this.colorAttribute = NormalMapMaterial.shader.getAttribute(this.gl, 'color');
        this.texCoordAttribute = NormalMapMaterial.shader.getAttribute(this.gl, 'texCoord');   
    }

    draw(mesh: gfx.Mesh3, camera: gfx.Camera, lightManager: gfx.LightManager): void
    {
        if(!this.visible || mesh.triangleCount == 0)
            return;

        this.initialize();

        // Switch to this shader
        this.gl.useProgram(NormalMapMaterial.shader.getProgram());

        // If we don't have a tbm matrix for this mesh yet, then compute it
        if(!NormalMapMaterial.tangentBuffers.get(mesh))
        {
            this.updateTangentBuffers(mesh);
        }

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

        // Set the vertex positions
        this.gl.enableVertexAttribArray(this.positionAttribute);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, mesh.positionBuffer);
        this.gl.vertexAttribPointer(this.positionAttribute, 3, this.gl.FLOAT, false, 0, 0);

        // Set the vertex normals
        this.gl.enableVertexAttribArray(this.normalAttribute);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, mesh.normalBuffer);
        this.gl.vertexAttribPointer(this.normalAttribute, 3, this.gl.FLOAT, false, 0, 0);

        // Set the vertex tangents
        this.gl.enableVertexAttribArray(this.tangentAttribute);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, NormalMapMaterial.tangentBuffers.get(mesh) as WebGLBuffer);
        this.gl.vertexAttribPointer(this.tangentAttribute, 3, this.gl.FLOAT, false, 0, 0);

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
        }
        else
        {
            // Disable the texture in the shader
            this.gl.uniform1i(this.useTextureUniform, 0);
        }

        if(this.normalMap)
        {
            // Activate the normal map in the shader
            this.gl.uniform1i(this.useNormalMapUnifirom, 1);

            // Set the normal map
            this.gl.activeTexture(this.gl.TEXTURE0 + this.normalMap.id)
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.normalMap.texture);
            this.gl.uniform1i(this.normalMapUniform, this.normalMap.id);
        }
        else
        {
            // Disable the normal map in the shader
            this.gl.uniform1i(this.useNormalMapUnifirom, 0);
        }

        if(this.texture || this.normalMap)
        {
            // Set the texture coordinates
            this.gl.enableVertexAttribArray(this.texCoordAttribute);
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, mesh.texCoordBuffer);
            this.gl.vertexAttribPointer(this.texCoordAttribute, 2, this.gl.FLOAT, false, 0, 0);
        }
        else
        {
            
            this.gl.disableVertexAttribArray(this.texCoordAttribute);
        }

        // Draw the triangles
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);
        this.gl.drawElements(this.gl.TRIANGLES, mesh.triangleCount*3, this.gl.UNSIGNED_SHORT, 0);
    }

    // based on method described at: https://learnopengl.com/Advanced-Lighting/Normal-Mapping#:~:text=Advanced%2DLighting%2FNormal%2DMapping
    public updateTangentBuffers(mesh: gfx.Mesh3): void
    {
        const vertices = mesh.getVertices();
        const uvs = mesh.getTextureCoordinates();
        const indices = mesh.getIndices();

        // Create an array of vectors to hold the tangents
        const tangents: gfx.Vector3[] = [];
        for(let i=0; i < vertices.length/3; i++)
        {
            tangents.push(new gfx.Vector3(0, 0, 0));
        }

        // Compute tangents
        for(let i=0; i < indices.length; i+=3)
        {
            const v1 = indices[i];
            const v2 = indices[i+1];
            const v3 = indices[i+2];

            const pos1 = new gfx.Vector3(vertices[v1*3], vertices[v1*3+1], vertices[v1*3+2]);
            const pos2 = new gfx.Vector3(vertices[v2*3], vertices[v2*3+1], vertices[v2*3+2]);
            const pos3 = new gfx.Vector3(vertices[v3*3], vertices[v3*3+1], vertices[v3*3+2]);

            const uv1 = new gfx.Vector2(uvs[v1*2], uvs[v1*2+1]);
            const uv2 = new gfx.Vector2(uvs[v2*2], uvs[v2*2+1]);
            const uv3 = new gfx.Vector2(uvs[v3*2], uvs[v3*2+1]);


            const edge1 = gfx.Vector3.subtract(pos2, pos1);
            const edge2 = gfx.Vector3.subtract(pos3, pos1);

            const deltaUV1 = gfx.Vector2.subtract(uv2, uv1);
            const deltaUV2 = gfx.Vector2.subtract(uv3, uv1);

            const f = 1 / (deltaUV1.x * deltaUV2.y - deltaUV2.x * deltaUV1.y);

            const tangent = new gfx.Vector3();
            tangent.x = f * (deltaUV2.y * edge1.x - deltaUV1.y * edge2.x);
            tangent.y = f * (deltaUV2.y * edge1.y - deltaUV1.y * edge2.y);
            tangent.z = f * (deltaUV2.y * edge1.z - deltaUV1.y * edge2.z);
            tangent.normalize();

            tangents[v1].add(tangent);
            tangents[v2].add(tangent);
            tangents[v3].add(tangent);
        }

        // Create the tangent buffer if it does not already exist
        let tangentBuffer: WebGLBuffer | null | undefined;
        tangentBuffer = NormalMapMaterial.tangentBuffers.get(mesh);

        if(!tangentBuffer)
        {
            tangentBuffer = this.gl.createBuffer();
            
            if(tangentBuffer)
                NormalMapMaterial.tangentBuffers.set(mesh, tangentBuffer);
        }

        const tangentArray: number[] = [];
        tangents.forEach((elem: gfx.Vector3) =>
        {
            elem.normalize();
            tangentArray.push(elem.x, elem.y, elem.z);
        });
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, tangentBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(tangentArray), this.gl.STATIC_DRAW);
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