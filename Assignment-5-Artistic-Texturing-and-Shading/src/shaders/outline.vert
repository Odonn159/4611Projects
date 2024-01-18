#version 300 es

// CSCI 4611 Assignment 5: Artistic Rendering
// You should modify this vertex shader to displace each vertex,
// making the drawn object slightly larger than the original object.

precision mediump float;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 normalMatrix;
uniform float thickness;

in vec3 position;
in vec3 normal;

void main() 
{
    // Compute the world space vertex position and normal
    vec3 worldPosition = (modelMatrix * vec4(position, 1)).xyz;
    vec3 worldNormal = normalize((normalMatrix * vec4(normal, 0)).xyz);

    // TO BE ADDED

    // The next line of code converts the world space position into view space,
    // and then projects it into screen coordinates. You will need to replace 
    // it with code that computes the vertex positions of the silhoutte outline.
    
    // First, you will need compute both the position and normal in view space.

    // Next, you should set the z-component of the view space normal to zero
    // and then normalize it. This represents the direction outward from the
    // vertex in XY coordinates relative to the camera.
    
    // The view space vertex position should then be translated in this direction
    // by correct distance, which is the thickness of the silhouette online.

    // Finally, you should project this position into screen coordinates and
    // assign it to the gl_Position variable, which will be passed to the 
    // fragment shader.
    vec4 viewspacenormal = viewMatrix * vec4(normal, 1);
    vec4 viewspaceposition = viewMatrix * vec4(worldPosition, 1);
    viewspacenormal.z = 0.0;
    normalize(viewspacenormal);
    viewspaceposition+=viewspacenormal*thickness;
    //Don't know how/if supposed to implement slider like instructor implementations
    gl_Position = projectionMatrix * viewspaceposition;
    //gl_Position = projectionMatrix * viewMatrix * vec4(worldPosition, 1);
}