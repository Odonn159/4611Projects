// Note, the material classes in this assignment implement the same functionality
// as for Assignment 5, and you could plug in your own implementations if you prefer.
// We have just added an (obfuscated) instructors' implementation to the Assignment 6
// support code to make sure that everyone has a working implementation.

// This typescript declaration provides the entry point to the shader code in 
// ArtisticRendering.js, which we have piped through a obfuscator so that it is 
// not readable.  (Since some students may still be working on their own solutions 
// to Assignment 5.)
declare class ArtisticRendering {
    static getToonVertexShader(): string;
    static getToonFragmentShader(): string;
    static getOutlineVertexShader(): string;
    static getOutlineFragmentShader(): string;
}

export { ArtisticRendering };
