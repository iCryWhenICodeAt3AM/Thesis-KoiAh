// Function to calculate dimensions based on volume and depth
function calculateDimensions(volumeCubicFeet, depth) {
    const width = Math.sqrt(volumeCubicFeet / (2 * depth));
    const length = 2 * width;
    return { length, width };
}

// Get pond recommendation
function recommendPondDimensions(rule) {
    const depth = 3;
    const averageKoiLength = document.getElementById("koi-size").value;
    let count = 0;

    resultJsonData.forEach((data) => {
        const annotations = data[1];
        annotations.forEach((annotation) => {
            if (["Sanke", "Showa", "Kohaku", "Asagi", "Bekko", "Hikarimono"].includes(annotation.label)) {
                count++;
            }
        });
    });

    console.log(count);
    const numKoi = count;
    // const numKoi = (document.getElementById("numberOfKoiFish").value) ? document.getElementById("numberOfKoiFish").value : null;
    const formulaCont = document.getElementById("ruleFormula");
    const outputCont = document.getElementById("ruleOutput");
    const lengthCont = document.getElementById("length");
    const widthCont = document.getElementById("width");
    const depthCont = document.getElementById("depth");
    const cubicFeetCont = document.getElementById("cubicFeet");
    const gallonsCont = document.getElementById("gallons");
    let volumeGallons;
    let size = 0;
    if (averageKoiLength == 'small') {
        size = 8;
    } else if (averageKoiLength == 'medium') {
        size = 14;
    } else {
        size = 24;
    }

    if (rule === 1) {
        // Rule 1: Based on average length of koi fish
        if (size === null || numKoi === null) {
            console.error("Both average koi length and number of koi must be provided for Rule 1.");
            return;
        }
        volumeGallons = size * 10 * numKoi;
        formulaCont.innerText = `(${size} * 10 * ${numKoi})`;
        outputCont.innerText = `${Math.ceil(volumeGallons)} gallons`;
    } else if (rule === 2) {
        // Rule 2: Based on number of koi fish
        if (numKoi === null) {
            console.error("Number of koi must be provided for Rule 2.");
            return;
        }
        volumeGallons = (numKoi / 4) * 1000;
        formulaCont.innerText = `( ${numKoi} / 4 ) * 1000`;
        outputCont.innerText = `${Math.ceil(volumeGallons)} gallons`;
    } else {
        console.error("Invalid rule specified.");
        return;
    }

    // Convert volume to cubic feet for calculation
    const volumeCubicFeet = volumeGallons * 0.133681;

    // Calculate dimensions
    const dimensions = calculateDimensions(volumeCubicFeet, depth);
    const actualVolumeCubicFeet = Math.ceil(dimensions.length) * Math.ceil(dimensions.width) * depth;
    const actualVolumeGallons = actualVolumeCubicFeet * 7.48052;
    lengthCont.innerHTML = `${Math.ceil(dimensions.length)} ft`;
    widthCont.innerHTML = `${Math.ceil(dimensions.width)} ft`;
    depthCont.innerHTML = `${depth} ft`;
    cubicFeetCont.innerHTML = `${actualVolumeCubicFeet} ft<sup>3</sup>`;
    gallonsCont.innerHTML = `${Math.ceil(actualVolumeGallons)} gal`;
    // Output the dimensions and calculated volume
    console.log(`Inputs: Rule = ${rule}, Ave Size = ${averageKoiLength}, Size = ${size}, number = ${numKoi}`);
    console.log(`Recommended: Volume in cubic feet = ${Math.ceil(volumeCubicFeet)} feet³. Volume in gallons = ${Math.ceil(volumeGallons)} gallons.`);
    console.log(`Recommended Pond Dimensions: Length = ${Math.ceil(dimensions.length)} feet, Width = ${Math.ceil(dimensions.width)} feet, Depth = ${depth} feet.`);
    console.log(`Actual: Volume in cubic feet = ${Math.ceil(actualVolumeCubicFeet)} feet³. Volume in gallons = ${Math.ceil(actualVolumeGallons)} gallons.`);
}

// Sample Run
// recommendPondDimensions(1); // Rule 1 - Default
