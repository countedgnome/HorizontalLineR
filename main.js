// Works

// Run program using the command: node main.js NOT electron .

const Jimp = require('jimp');
//const electron = require('electron');
//const remote = require('electron').remote;
//const {app,BrowserWindow} = electron;

let zones = 2;

let imagePath = './images/own.jpg';
let greyPath = './images/Processing/greyCopy.jpg';
let resultPath = './images/Processing/result.jpg';

Jimp.read(imagePath, (err, image) =>{ // read input image

    if(err) throw err;

    image.greyscale();
    image.write(greyPath); // Write greyscaled copy

    Jimp.read(greyPath, (err, image) =>{ // read grescaled copy image

        let data = image.bitmap.data; // Bitmap data consists of : R,G,B,A
        let width = image.bitmap.width;
        let height = image.bitmap.height;
        let area = width * height;
    
        let array = zone(zones,image);

        generateResult(image,array);
   
    
    });

});

let zone = (zoneCount, image) => { // Higher number is lighter

    let zoneWidth = Math.floor(255 / (zoneCount+1)); // 255 is max RBG value for greyscaled image's R/G/B
    let zoneArray = [];

    for(let y = 0; y < image.bitmap.height; y++){

        for(let x = 0; x< image.bitmap.width; x++){

            let darkness = Jimp.intToRGBA(image.getPixelColor(x,y)).r;
            let zone = Math.floor(darkness/zoneWidth);

            if(zone > zoneCount){
                zone = zoneCount;
            }

            zoneArray[x + (y*image.bitmap.width)] = zone;

        }

    }

    return zoneArray;

}

let generateResult = (image, zoneArray) =>{

    Jimp.read(greyPath,(err,image) =>{

        let zoneSearchIndex = 0;
        let slashedArray = [];

        if(image.bitmap.data.length != zoneArray.length*4){ // For every pixel, 4 data points in bitmap present
            console.log("Zone array size mismatch!");
        }
        else{
            //console.log("Zone array size match");
        }

        while(zoneSearchIndex <= zones){

                for(let i = 0; i < zoneArray.length; i++){

                    if(zoneArray[i] === zoneSearchIndex){

                        let yLevel = Math.floor(i/image.bitmap.width); // What y coordiante is the index on

                        if( yLevel % (zoneSearchIndex+2) === 0){ // If the level is a multiple of the zone seach index. +2 adds at least a 2 pixel space

                            slashedArray[(i*4)-1] = 255; // Alpha
                            slashedArray[(i*4)-2] = 0; // B
                            slashedArray[(i*4)-3] = 0; // G
                            slashedArray[(i*4)-4] = 0; // R

                        }
                        else{

                            slashedArray[(i*4)-1] = 255; // Alpha
                            slashedArray[(i*4)-2] = 255; // B
                            slashedArray[(i*4)-3] = 255; // G
                            slashedArray[(i*4)-4] = 255; // R

                        }
                        
                    }

                }

                zoneSearchIndex++;

            }

        image.bitmap.data = slashedArray;

        image.write(resultPath);

    });

}