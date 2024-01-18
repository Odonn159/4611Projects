/** CSci-4611 Assignment 1 Support Code
 * Assignment concept and support code by Prof. Daniel Keefe, 2023
 * Inspired by Camille Utterbeck's "Text Rain" installation, 2000+
 * Copyright Regents of the University of Minnesota
 * Please do not distribute beyond the CSci-4611 course
 */

import * as gfx from 'gophergfx'

/**
 * A collection of helper routines for working with images stored in ImageData objects.
 * Feel free to add additional routines (e.g., image filters) if you like.  (We did in
 * our implementation.)
 */
export class ImageUtils
{
    /**
     * Creates a new ImageData object of the specified width and height.  Every byte in the data array
     * will be be initialized to 0 (i.e., black completely transparent pixels).
     */
    public static createBlank(width: number, height: number): ImageData
    {
        const nBytes = width * height * 4;
        return new ImageData(new Uint8ClampedArray(nBytes), width, height);
    }

    /**
     * Checks the image variable to determine if has already been created, then checks to see if it has
     * the desired width and height.  If these checks pass, then the function returns the existing image.
     * If either check fails, then the function creates a new ImageData object of the desired width and 
     * height and returns it.  In this case, the image will be initialized using ImageUtils.createBlank().   
     * @param image Can be null, undefined, or an existing image
     * @param width The desired width of the image
     * @param height The desired height of the image
     * @returns The current image if it matches the desired width and height or a new image that matches
     */
    public static createOrResizeIfNeeded(image: ImageData | undefined | null, width: number, height: number): ImageData
    {
        if (!(image instanceof ImageData) || image.width != width || image.height != height) {
            return this.createBlank(width, height);
        } else {
            return image;
        }
    }

    /**
     * Returns a new ImageData object that is a deep copy of the source image provided.  This includes copying
     * all of the pixel data from the source to the new image object.
     */
    public static clone(source: ImageData): ImageData
    {
        const copyOfPixelData = new Uint8ClampedArray(source.data);
        return new ImageData(copyOfPixelData, source.width, source.height);
    }

    /**
     * Copies the pixel data from the source image into the pixels of the destination image. 
     * @param source An existing ImageData object that is the source for the pixel data.
     * @param dest An existing ImageData object that is the destination for the pixel data.
     */
    public static copyPixels(source: ImageData, dest: ImageData): void
    {
        for (let i=0; i<source.data.length; i++) {
            dest.data[i] = source.data[i];
        }
    }

    public static convertToGrayscale(source: ImageData, dest: ImageData): void
    {
        //=========================================================================
        //Part 2.1 Convert to Grayscale
        //Iterate through the pixels in the source image data 
        //Calculate the grayscale value for each pixel
        //Set the corresponding pixel values (r,g,b,a) in the destination image data to the grayscale value
        //When this is complete, uncomment the corresponding line in RainingApp.ts  
        //Provide the appropriate parameters to that function to view the effect
        //=========================================================================
        let j=0;
        let gval =0;
        for (let i = 0; i < source.height*source.width; i++) {
            j=i*4;
            gval = source.data[j]* 0.299+ 0.587*source.data[j+1] +0.114*source.data[j+2];
            dest.data[j]=gval;
            dest.data[j+1] = gval;
            dest.data[j+2] = gval;
            dest.data[j+3] = source.data[j+3]
          }
    }

    public static convertToGrayscaleInPlace(image: ImageData): void
    {
        return this.convertToGrayscale(image, image);
    }

    public static mirror(source: ImageData, dest: ImageData): void
    {
        //=========================================================================
        //Part 2.2 Mirror the Image
        //Iterate through the pixels in the source image data
        //Calculate the mirrored pixel location
        //Set the corresponding pixel values (r,g,b,a) in the destination image data to the mirrored value
        //When this is complete, uncomment the corresponding line in RainingApp.ts  
        //Provide the appropriate parameters to that function to view the effect
        //=========================================================================
        let pixnum =0;
        let lastinrow=0;
        for (let i = 0; i < source.height; i++) {
            lastinrow =(i+1)*source.width-1;
            for(let k=0;k<source.width;k++){
                pixnum = i*source.width +k;
                dest.data[(lastinrow-k)*4] = source.data[pixnum*4]
                dest.data[(lastinrow-k)*4+1] = source.data[pixnum*4+1]
                dest.data[(lastinrow-k)*4+2] = source.data[pixnum*4+2]
                dest.data[(lastinrow-k)*4+3] = source.data[pixnum*4+3]
            }
          }
    }


    public static threshold(source: ImageData, dest: ImageData, threshold: number): void
    {
        //=========================================================================
        //Part 2.3 Threshold the Image
        //Iterate through the pixels in the source image data 
        //Check if the pixel's color channel value is greater than or equal to the threshold
        //Set the corresponding pixel values (r,g,b,a) in the destination image data to the appropriate value
        //based on the threshold result
        //When this is complete, uncomment the corresponding line in RainingApp.ts  
        //Provide the appropriate parameters to that function to view the effect
        //=========================================================================
        let j=0;
        for (let i = 0; i < source.height*source.width; i++) {
            j=i*4;
            if(source.data[j]>255*threshold){
                dest.data[j]=255;
                dest.data[j+1]=255;
                dest.data[j+2]=255;
            }
            else{
                dest.data[j]=0;
                dest.data[j+1]=0;
                dest.data[j+2]=0;
            }
            dest.data[j+3]=255;
        }
    }

     // --- Additional Helper Functions ---
     // You may find it useful to complete these to assist with some calculations of RainingApp.ts
    
    public static getRed(image: ImageData, col: number, row: number)
    {
        //Use the code from your quiz response to complete this helper function
    }

    public static getGreen(image: ImageData, col: number, row: number)
    {
       //Use the code from your quiz response to complete this helper function
    }

    public static getBlue(image: ImageData, col: number, row: number)
    {
        //Use the code from your quiz response to complete this helper function
    }

    public static getAlpha(image: ImageData, col: number, row: number)
    {
       //Use the code from your quiz response to complete this helper function
    }
}
