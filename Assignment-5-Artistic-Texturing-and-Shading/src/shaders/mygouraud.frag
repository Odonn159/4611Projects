#version 300 es

precision mediump float;

uniform int useTexture;
uniform sampler2D textureImage;

in vec4 vertColor;
in vec2 uv;

out vec4 fragColor;

void main() 
{
    fragColor = vertColor;

    if (useTexture == 1) {
        vec4 colorFromTexture = texture(textureImage, uv);
        fragColor *= colorFromTexture;
    }

}