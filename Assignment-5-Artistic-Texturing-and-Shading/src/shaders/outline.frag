#version 300 es

// CSCI 4611 Assignment 5: Artistic Rendering
// This shader colors each fragment using the material color
// without considering lighting. You do not need to modify it.

precision mediump float;

uniform vec4 materialColor;

out vec4 fragColor;

void main() 
{
    fragColor = materialColor;
}