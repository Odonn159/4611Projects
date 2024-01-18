#version 300 es

// CSCI 4611 Assignment 5: Artistic Rendering
// Normal mapping is a complex effect that will involve changing
// both the vertex and fragment shader. This implementation is
// based on the approach described below, and you are encouraged
// to read this tutorial writeup for a deeper understanding.
// https://learnopengl.com/Advanced-Lighting/Normal-Mapping

// Most of the structure of this fragment shader has been implemented,
// but you will need to complete the code that computes the normal n.

// You should complete the vertex shader first, and then move on to
// this fragment shader only after you have verified that is correct.

precision mediump int;
precision mediump float;

#define POINT_LIGHT 0
#define DIRECTIONAL_LIGHT 1

const int MAX_LIGHTS = 8;

uniform int numLights;
uniform int lightTypes[MAX_LIGHTS];
uniform vec3 ambientIntensities[MAX_LIGHTS];
uniform vec3 diffuseIntensities[MAX_LIGHTS];
uniform vec3 specularIntensities[MAX_LIGHTS];

uniform vec3 kAmbient;
uniform vec3 kDiffuse;
uniform vec3 kSpecular;
uniform float shininess;

uniform int useTexture;
uniform sampler2D textureImage;

uniform int useNormalMap;
uniform sampler2D normalMap;

in vec4 vertColor;
in vec2 uv;
in vec3 tangentVertPosition;
in vec3 tangentEyePosition;
in vec3 tangentLightPositions[MAX_LIGHTS];

out vec4 fragColor;

void main() 
{
    vec3 n; 
    // If we have not loaded a normal map
    if(useNormalMap == 0)
    {
        // In tangent space, the surface normal of the triangle
        // is (0, 0, 1).  This will therefore produce the same
        // result as a Phong shader.
        n = vec3(0, 0, 1);
    }
    // If normal mapping has been activated
    else
    {
        // TO BE ADDED
        // You will need to replace this line of code.  First, you
        // should obtain the displaced normal from the normal map.
        // This normal will be in the range [0, 1].  You will then
        // need to convert it to be in the range [-1, 1].
        n = vec3(texture(normalMap, uv));
        n = normalize(n * 2.0 - 1.0); 
    }

    vec3 illumination = vec3(0, 0, 0);
    for(int i=0; i < numLights; i++)
    {
        // Ambient component
        illumination += kAmbient * ambientIntensities[i];

        // Compute the vector from the vertex position to the light
        vec3 l;
        if(lightTypes[i] == DIRECTIONAL_LIGHT)
            l = normalize(tangentLightPositions[i]);
        else
            l = normalize(tangentLightPositions[i] - tangentVertPosition);

        // Diffuse component
        float diffuseComponent = max(dot(n, l), 0.0);
        illumination += diffuseComponent * kDiffuse * diffuseIntensities[i];

        // Compute the vector from the vertex to the eye
        vec3 e = normalize(tangentEyePosition - tangentVertPosition);

        // Compute the light vector reflected about the normal
        vec3 r = reflect(-l, n);

        // Specular component
        float specularComponent = pow(max(dot(e, r), 0.0), shininess);
        illumination += specularComponent * kSpecular * specularIntensities[i];
    }

    fragColor = vertColor;
    fragColor.rgb *= illumination;

    if(useTexture != 0)
    {
        fragColor *= texture(textureImage, uv);
    }
}