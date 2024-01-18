/* Assignment 3: Earthquake Visualization Support Code
 * UMN CSci-4611 Instructors 2012+
 * GopherGfx implementation by Evan Suma Rosenberg <suma@umn.edu> 2022
 * License: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * Please do not distribute beyond the CSci-4611 course
 */ 

// You do not need to change existing code in this class.

import * as gfx from 'gophergfx'
import { EarthquakeRecord } from './EarthquakeRecord'

export class EarthquakeDatabase
{
    public earthquakes : EarthquakeRecord[];
    public loaded : boolean;

    public maxMagnitude : number;
    public minMagnitude : number;

    private nextIndex : number;

    constructor(filename : string)
    {
        this.earthquakes = [];
        this.loaded = false;
        this.maxMagnitude = 0;
        this.minMagnitude = Infinity;
        this.nextIndex = 0;

        gfx.TextFileLoader.load(filename, (loadedFile: gfx.TextFile) => {
            const lines = loadedFile.data.toString().split('\n');
            lines.forEach((line: string) => {
                if(line.length > 30)
                {
                    const quake = new EarthquakeRecord(line);
                    this.earthquakes.push(quake)

                    if(quake.magnitude > this.maxMagnitude)
                        this.maxMagnitude = quake.magnitude;
                    else if(quake.magnitude < this.minMagnitude)
                        this.minMagnitude = quake.magnitude;
                }
            });

            // Go through all the quakes and compute the normalized magnitude between 0 and 1
            this.earthquakes.forEach((quake: EarthquakeRecord) => {
                quake.normalizedMagnitude = (quake.magnitude - this.minMagnitude) / (this.maxMagnitude - this.minMagnitude);
            });
            
            this.loaded = true;
        });
    }

    public reset() : void
    {
        this.nextIndex = 0;
    }

    public getNextQuake(date: Date) : EarthquakeRecord | null
    {
        const targetTime = date.getTime();

        while(this.nextIndex < this.earthquakes.length)
        {
            if(this.earthquakes[this.nextIndex].date.getTime() < targetTime)
            {
                this.nextIndex++;
                return this.earthquakes[this.nextIndex - 1];
            }
            else
            {
                return null;
            }
        }

        return null;
    }

    public getMaxTime() : number
    {
        // Convert from milliseconds to seconds
        return this.earthquakes[this.earthquakes.length-1].date.getTime();
    }

    public getMinTime() : number
    {
        // Convert from milliseconds to seconds
        return this.earthquakes[0].date.getTime();
    }
}