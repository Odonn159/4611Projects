#version 300 es

// CSCI 4611 Assignment 5: Artistic Rendering
// You should modify this fragment shader to implement a toon shading model
// As a starting point, you should copy and paste the shader code from
// phong.frag into this file. You can find it in the GopherGfx library.
// You can then modify it to use the diffuse and specular ramps. 

precision mediump float;

#define POINT_LIGHT 0
#define DIRECTIONAL_LIGHT 1

const int MAX_LIGHTS = 8;

uniform vec3 eyePosition;

uniform int numLights;
uniform int lightTypes[MAX_LIGHTS];
uniform vec3 lightPositions[MAX_LIGHTS];
uniform vec3 ambientIntensities[MAX_LIGHTS];
uniform vec3 diffuseIntensities[MAX_LIGHTS];
uniform vec3 specularIntensities[MAX_LIGHTS];

uniform vec3 kAmbient;
uniform vec3 kDiffuse;
uniform vec3 kSpecular;
uniform float shininess;

uniform int useTexture;
uniform sampler2D textureImage;

uniform sampler2D diffuseRamp;
uniform sampler2D specularRamp;

in vec3 vertPosition;
in vec3 vertNormal;
in vec4 vertColor;
in vec2 uv;

out vec4 fragColor;

void main() 
{
    vec3 totalIllumination = vec3(0,0,0);
    for (int i=0; i<numLights; i++) {
        vec3 ambientComponent = kAmbient * ambientIntensities[i];
        
        // compute lighting in world space
        vec3 lworld;
        if (lightTypes[i] == POINT_LIGHT) {
            lworld = normalize(lightPositions[i] - vertPosition.xyz);
        } else {
            lworld = normalize(lightPositions[i]);
        }
        // Texture cords either max or prefer (dotproduct +1)/2
        vec3 n = normalize(vertNormal);
        float x = 0.5*(1.0+(dot(n, lworld)));
        vec4 TextureValuediff = texture(diffuseRamp, vec2(x,x)); 
        vec3 diffuseComponent = kDiffuse * diffuseIntensities[i]*TextureValuediff.x;
        vec3 e = normalize(eyePosition - vertPosition.xyz);
        vec3 r = normalize(reflect(-lworld, vertNormal));
        float y = pow(max(dot(e, r), 0.0), shininess);
        vec4 TextureValuespec = texture(specularRamp, vec2(y,y));
        vec3 specularComponent = kSpecular * specularIntensities[i] * TextureValuespec.x;

        totalIllumination += ambientComponent + diffuseComponent+specularComponent;
    }
    fragColor = vec4(totalIllumination, 1);
}