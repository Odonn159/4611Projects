#version 300 es

precision mediump float;


const int MAX_LIGHTS = 8;

uniform mat4 modelMatrix;
uniform mat4 normalModelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

uniform vec3 eyePositionWorld;

#define POINT_LIGHT 0
#define DIRECTIONAL_LIGHT 1

// properties of the lights in the scene
uniform int numLights;
uniform int lightTypes[MAX_LIGHTS];
uniform vec3 lightPositionsWorld[MAX_LIGHTS];
uniform vec3 ambientIntensities[MAX_LIGHTS];
uniform vec3 diffuseIntensities[MAX_LIGHTS];
uniform vec3 specularIntensities[MAX_LIGHTS];

// material properties: coeff. of reflection for the material
uniform vec3 kAmbient;
uniform vec3 kDiffuse;
uniform vec3 kSpecular;
uniform float shininess;

// per-vertex data
in vec3 position;
in vec3 normal;
in vec4 color;
in vec2 texCoord;

// data we want to send to the rasterizer and eventually the fragment shader
out vec4 vertColor;
out vec2 uv;

void main() 
{
    vec3 totalIllumination = vec3(0,0,0);
    for (int i=0; i<numLights; i++) {
        vec3 ambientComponent = kAmbient * ambientIntensities[i];
        
        // compute lighting in world space
        vec4 positionWorld = modelMatrix * vec4(position, 1);
        vec3 lWorld = normalize(lightPositionsWorld[i] - positionWorld.xyz);
        vec3 nWorld = normalize((normalModelMatrix * vec4(normal, 0))).xyz;

        vec3 diffuseComponent = kDiffuse * diffuseIntensities[i] * max(dot(nWorld, lWorld), 0.0);

        vec3 eWorld = normalize(eyePositionWorld - positionWorld.xyz);
        vec3 rWorld = normalize(reflect(-lWorld, nWorld));
        vec3 specularComponent = kSpecular * specularIntensities[i] * pow(max(0.0, dot(eWorld, rWorld)), shininess);

        totalIllumination += ambientComponent + diffuseComponent + specularComponent;
    }
    vertColor = vec4(totalIllumination, 1);

    // if model has per-vertex intrinsic colors, then combine those with the color for lighting
    vertColor *= color;

    // pass the uv texture coordinate from this vertex on to the rasterizer and frag shader
    uv = texCoord;

    //vec4 positionEye = viewMatrix * positionWorld;
    //vec4 positionScreen = projectionMatrix * positionEye;
    vec4 positionScreen = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1);

    // Required: compute the vertex position in clip coordinates
    gl_Position = positionScreen;
}