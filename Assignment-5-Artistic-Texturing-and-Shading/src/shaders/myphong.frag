#version 300 es

precision mediump float;

#define POINT_LIGHT 0
#define DIRECTIONAL_LIGHT 1

const int MAX_LIGHTS = 8;

uniform vec3 eyePositionWorld;

uniform int numLights;
uniform int lightTypes[MAX_LIGHTS];
uniform vec3 lightPositionsWorld[MAX_LIGHTS];
uniform vec3 ambientIntensities[MAX_LIGHTS];
uniform vec3 diffuseIntensities[MAX_LIGHTS];
uniform vec3 specularIntensities[MAX_LIGHTS];

uniform vec3 kAmbient;
uniform vec3 kDiffuse;
uniform vec3 kSpecular;
uniform float shininess;

uniform int useTexture;
uniform sampler2D textureImage;

in vec3 vertPositionWorld;
in vec3 vertNormalWorld;
in vec4 vertColor;
in vec2 uv;

out vec4 fragColor;

void main() 
{
    vec3 totalIllumination = vec3(0,0,0);
    for (int i=0; i<numLights; i++) {
        vec3 ambientComponent = kAmbient * ambientIntensities[i];
        
        // compute lighting in world space
        vec3 lWorld;
        if (lightTypes[i] == POINT_LIGHT) {
            lWorld = normalize(lightPositionsWorld[i] - vertPositionWorld.xyz);
        } else {
            lWorld = normalize(lightPositionsWorld[i]);
        }
        
        vec3 diffuseComponent = kDiffuse * diffuseIntensities[i] * max(dot(vertNormalWorld, lWorld), 0.0);

        vec3 eWorld = normalize(eyePositionWorld - vertPositionWorld.xyz);
        vec3 rWorld = normalize(reflect(-lWorld, vertNormalWorld));
        vec3 specularComponent = kSpecular * specularIntensities[i] * pow(max(dot(eWorld, rWorld), 0.0), shininess);

        totalIllumination += ambientComponent + diffuseComponent + specularComponent;
    }
    fragColor = vec4(totalIllumination, 1);
}