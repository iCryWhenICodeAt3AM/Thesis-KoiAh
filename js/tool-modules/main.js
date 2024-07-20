// Global variable to store label counts / classes counts
let globalLabelCounts = {};
let resultJsonData = [];

// Function to check and filter annotations based on class limits
function checkMaxClasses(annotations, classLimit) {
    // Create a map to keep track of label totals across all annotations
    const labelTotals = {};

    // First pass: Count occurrences of each label across all annotations
    annotations.forEach(annotation => {
        const label = annotation.label;
        if (!labelTotals[label]) {
            labelTotals[label] = 0;
        }
        labelTotals[label] += 1;
    });

    // Remove annotations where label has reached the class limit
    return annotations.filter(annotation => {
        const label = annotation.label;
        if (globalLabelCounts[label] && globalLabelCounts[label][3] >= classLimit) {
            // Exclude annotations for labels that have reached the limit
            return false;
        }
        return true;
    });
}

async function startAnnotation() {
    if(resultJsonData.length!=0){
        globalLabelCounts = {};
        resultJsonData = [];
    }
    
    // Input Fields Collection
    const images = document.getElementById('images').files;
    const folder = document.getElementById('folder').files;
    const model = document.getElementById('model').value;
    const apiKey = document.getElementById('apiKey').value;
    const classLimit = parseInt(document.getElementById('classLimit').value);
    console.log("Class Limit: ", classLimit);

    // Interface actions
    const processStatus = document.getElementById('process-status');
    const pendingImages = document.getElementById('pending-images');
    const annotatedImages = document.getElementById('annotated-images');
    const previousImage = document.getElementById('previous-image');
    const currentImage = document.getElementById('current-image');
    const processingContainer = document.getElementById('processed-image-container');
    const classContainer = document.getElementById('classlist-container');
    const startButton = document.getElementById('start-button');
    const itemListContainer = document.getElementById('itemlist-container');
    const exportButton = document.getElementById('export-button');

    // Combine images and folder files into a single array and filter out exempted files
    const files = [...images, ...folder].filter(file => !exemptedFiles.has(file.name));

    // Filter out non-image files
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    // Dynamic Elements
    let pendingImagesCount = parseInt(imageFiles.length);
    let predictionCount = 0;

    // Status Actions
    processStatus.innerText = "Running...";
    pendingImages.innerText = pendingImagesCount;

    // Initial Processing
    reset(processStatus.innerText, pendingImages.innerText, annotatedImages.innerText, previousImage.innerText, classContainer); // Reset all status in the output
    jsonExemption(currentJsonData, annotatedImages);
    checkClassList(currentJsonData, classContainer);
    let annotatedImagesCount = parseInt(annotatedImages.innerText);
    startButton.disabled = true; // Disable start button

    const processImage = async (imageFile) => {
        currentImage.innerText = imageFile.name; // Set image name

        const reader = new FileReader();
        return new Promise((resolve, reject) => {
            reader.onload = async (event) => {
                const base64Image = event.target.result.split(',')[1];
                const imageName = imageFile.name;

                // Display Image
                const img = `
                    <div class="col-12">
                        <img src="${event.target.result}" alt="Current Image" id="processing-image">
                    </div>
                `;
                processingContainer.innerHTML = img;

                try {
                    const response = await axios({
                        method: 'POST',
                        url: `https://detect.roboflow.com/${model}`,
                        params: {
                            api_key: apiKey
                        },
                        data: base64Image,
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        }
                    });

                    let formattedAnnotations = response.data.predictions.map(prediction => ({
                        label: prediction.class,
                        coordinates: {
                            x: prediction.x,
                            y: prediction.y,
                            width: prediction.width,
                            height: prediction.height
                        }
                    }));

                    console.log("Prediction Count: ", ++predictionCount);
                    console.log("Before: ", formattedAnnotations);

                    // Check and filter formattedAnnotations based on class limits
                    formattedAnnotations = checkMaxClasses(formattedAnnotations, classLimit);
                    console.log("After: ", formattedAnnotations);

                    processPrediction(formattedAnnotations, classContainer, annotatedImagesCount + 1, imageFile.name, itemListContainer, classLimit);

                    if (formattedAnnotations.length > 0) {
                        resultJsonData.push({
                            image: imageName,
                            annotations: formattedAnnotations
                        });
                    }

                    resolve();
                } catch (error) {
                    console.error(error.message);
                    reject(error);
                    startButton.disabled = false; // Enable start button
                    alert("Please input the model & version, or the API Key.");
                }
            };
            reader.readAsDataURL(imageFile);
        });
    };

    // Start of the annotation process
    for (const imageFile of imageFiles) {
        await processImage(imageFile);
        // await delay(1000); // 1 second delay
        pendingImagesCount -= 1;
        annotatedImagesCount++;
        pendingImages.innerText = pendingImagesCount;
        annotatedImages.innerText = annotatedImagesCount;
        currentImage.innerText = "-";
        processingContainer.innerHTML = "";
        previousImage.innerText = imageFile.name;
    }
    processStatus.innerText = "Completed";
    startButton.disabled = false; // Enable start button
    // Enable export button if there are results
    exportButton.disabled = resultJsonData.length === 0;
}

// Append item to item list container
function appendItem(itemNumber, filename, container, objects, classes){
    // Add the processed image information to the item list
    const itemHTML = `
    <div class="cont-outer row p-1 mt-2">
        <div class="col-1">
            <h6 class="m-0">${itemNumber}</h6>
        </div>
        <div class="col-6" id="filename-item">
            <h6 class="m-0">${filename}</h6>
        </div>
        <div class="col-2">
            <h6 class="m-0">${objects}</h6>
        </div>
        <div class="col-2">
            <h6 class="m-0">${classes}</h6>
        </div>
    </div>
    `;
    container.innerHTML += itemHTML;
}

// Set all output group to default
function reset(status, pending, annotated, previousImage, classes){
    status, previousImage = "-";
    pending, annotated = "0";
    classes.innerHTML = "";
}

// Display the Initial Classes
function checkClassList(currentJsonData, container) {
    if (!currentJsonData || currentJsonData.length === 0) {
        console.log('No data found in currentJsonData.');
        return;
    }

    // Initialize an object to store label counts
    const labelCounts = {};

    // Iterate through each item in currentJsonData
    currentJsonData.forEach(item => {
        const labels = item.annotations.map(annotation => annotation.label);

        // Unique labels in the current item
        const uniqueLabels = new Set(labels);

        uniqueLabels.forEach(label => {
            if (!labelCounts[label]) {
                // Initialize counts for this label
                labelCounts[label] = [0, 0, 0, 0];
            }

            if (labels.length === 1 && uniqueLabels.size === 1) {
                // Single item with one label (Solo)
                labelCounts[label][0] += 1;
                labelCounts[label][3] += 1;
            } else if (labels.length > 1 && uniqueLabels.size === 1) {
                // Multiple items with one label (Group)
                labelCounts[label][1] += 1;
                labelCounts[label][3] += 1;
            } else if (uniqueLabels.size > 1) {
                // More than one label (Mixed)
                labelCounts[label][2] += 1;
                labelCounts[label][3] += 1;
            }
        });
    });

    // Update globalLabelCounts with the results
    Object.entries(labelCounts).forEach(([label, counts]) => {
        if (!globalLabelCounts[label]) {
            globalLabelCounts[label] = [0, 0, 0, 0];
        }

        const globalCounts = globalLabelCounts[label];
        globalCounts[0] += counts[0];
        globalCounts[1] += counts[1];
        globalCounts[2] += counts[2];
        globalCounts[3] += counts[3];
    });

    // Convert the object to an array if needed or display the results
    const resultArray = Object.entries(globalLabelCounts).map(([label, counts]) => ({ label, counts }));

    container.innerHTML = '';
    console.log('Updated globalLabelCounts:', resultArray);
    resultArray.forEach(element => {
        const item = `
            <div class="cont-outer p-1 mt-2 row img-1.jpg" id="img-1.jpg">
                <div class="col-3" id="filename-class"><h6 class="m-0">${element.label}</h6></div>
                <div class="col-6">
                    <div class="row">
                        <div class="col-4">
                            <h6 class="m-0">${element.counts[0]}</h6>
                        </div>
                        <div class="col-4">
                            <h6 class="m-0">${element.counts[1]}</h6>
                        </div>
                        <div class="col-4">
                            <h6 class="m-0">${element.counts[2]}</h6>
                        </div>
                    </div>
                </div>
                <div class="col-3"><h6 class="m-0">${element.counts[3]}</h6></div>
            </div>
        `;
        container.innerHTML += item;
    });
}

// Displays the Initial Annotated Images
function jsonExemption(currentJsonData, annotatedImages) {
    const itemListContainer = document.getElementById('itemlist-container');

    // Clear the container before appending new items
    itemListContainer.innerHTML = '';

    // Iterate through each item in currentJsonData
    currentJsonData.forEach((item, index) => {
        const imageName = item.image;
        const annotations = item.annotations;
        
        // Create a div element to hold item information
        const itemDiv = document.createElement('div');
        itemDiv.className = 'cont-outer row p-1 mt-2';

        // Add the image number
        const numberDiv = document.createElement('div');
        numberDiv.className = 'col-1';
        numberDiv.innerHTML = `<h6 class="m-0">${index + 1}</h6>`;
        itemDiv.appendChild(numberDiv);

        // Add the image name
        const nameDiv = document.createElement('div');
        nameDiv.className = 'col-6';
        nameDiv.style.whiteSpace = 'nowrap';
        nameDiv.style.overflowY = 'auto';
        nameDiv.style.scrollbarWidth = 'none';
        nameDiv.innerHTML = `<h6 class="m-0">${imageName}</h6>`;
        itemDiv.appendChild(nameDiv);

        // Get unique labels for this image
        const uniqueLabels = [...new Set(annotations.map(annotation => annotation.label))];
        
        // Add the count of labels
        const labelCountDiv = document.createElement('div');
        labelCountDiv.className = 'col-2';
        labelCountDiv.innerHTML = `<h6 class="m-0">${annotations.length}</h6>`;
        itemDiv.appendChild(labelCountDiv);

        // Add the total number of annotations
        const annotationCountDiv = document.createElement('div');
        annotationCountDiv.className = 'col-2';
        annotationCountDiv.innerHTML = `<h6 class="m-0">${uniqueLabels.length}</h6>`;
        itemDiv.appendChild(annotationCountDiv);

        // Append the itemDiv to the itemListContainer
        itemListContainer.appendChild(itemDiv);
        annotatedImages.innerText = (index + 1);
    });
}

// ---
// Function to process a single prediction instance
function processPrediction(prediction, container, count, filename, itemListContainer, classLimit) {
    // Count occurrences of each label
    const labelOccurrences = {};

    prediction.forEach(pred => {
        const label = pred.label;

        if (!labelOccurrences[label]) {
            labelOccurrences[label] = 0;
        }

        labelOccurrences[label] += 1;
    });

    // Determine the classification of the prediction
    const uniqueLabels = Object.keys(labelOccurrences);
    const numLabels = uniqueLabels.length;
    let objectCount = 0;

    uniqueLabels.forEach(label => {
        if (!globalLabelCounts[label]) {
            globalLabelCounts[label] = [0, 0, 0, 0]; // Solo, Group, Mixed, Total
        }

        const labelCounts = globalLabelCounts[label];
        const count = labelOccurrences[label];

        objectCount += count;
        if (numLabels === 1) {
            // Single label
            if (count === 1) {
                // Solo
                labelCounts[0] += 1;
            } else {
                // Group
                labelCounts[1] += 1;
            }
        } else {
            // More than one label (Mixed)
            labelCounts[2] += 1;
        }

        // Always increment total count
        labelCounts[3] += 1;
    });

    appendItem(count, filename, itemListContainer, objectCount, numLabels);
    updateClassInterface(container, classLimit);
    console.log('Updated globalLabelCounts:', globalLabelCounts);
}

// Function to update the class interface
function updateClassInterface(container, classLimit) {
    if (!container) {
        console.log('Container is not provided.');
        return;
    }

    container.innerHTML = '';

    Object.entries(globalLabelCounts).forEach(([label, counts]) => {
        // Check if the total count of this label has reached the class limit
        const isMaxedClass = globalLabelCounts[label][3] === classLimit;
    
        const item = `
            <div class="cont-outer p-1 mt-2 row" ${isMaxedClass ? 'id="maxed-class"' : ''}>
                <div class="col-3" id="filename-class"><h6 class="m-0">${label}</h6></div>
                <div class="col-6">
                    <div class="row">
                        <div class="col-4">
                            <h6 class="m-0">${counts[0]}</h6>
                        </div>
                        <div class="col-4">
                            <h6 class="m-0">${counts[1]}</h6>
                        </div>
                        <div class="col-4">
                            <h6 class="m-0">${counts[2]}</h6>
                        </div>
                    </div>
                </div>
                <div class="col-3"><h6 class="m-0">${counts[3]}</h6></div>
            </div>
        `;
    
        container.innerHTML += item;
    });
}


// processPrediction(predictionData, document.getElementById("classlist-container"));

// Example usage
// const predictionData = {
//     "predictions": [
//         {
//             "x": 395,
//             "y": 315.5,
//             "width": 338,
//             "height": 197,
//             "confidence": 0.9266392588615417,
//             "class": "Kohaku",
//             "class_id": 3,
//             "detection_id": "e37ba14f-3392-4522-9f65-c85a3e3b2276"
//         },
//         {
//             "x": 117.5,
//             "y": 418.5,
//             "width": 235,
//             "height": 135,
//             "confidence": 0.8708662986755371,
//             "class": "Kohaku",
//             "class_id": 1,
//             "detection_id": "dc9c6b4a-915e-43f9-ab32-9a7316d840b2"
//         },
//         {
//             "x": 395,
//             "y": 315.5,
//             "width": 338,
//             "height": 197,
//             "confidence": 0.9266392588615417,
//             "class": "Kohaku",
//             "class_id": 3,
//             "detection_id": "e37ba14f-3392-4522-9f65-c85a3e3b2276"
//         },
//     ]
// };

// // Example currentJsonData
// const currentJsonData1 = [
//     {
//         "image": "koi-1.jpg",
//         "annotations": [
//             {
//                 "label": "Hikarimono",
//                 "coordinates": {
//                     "x": 353.5,
//                     "y": 305.5,
//                     "width": 323,
//                     "height": 139
//                 }
//             }
//         ]
//     },
//     {
//         "image": "koi-2.jpg",
//         "annotations": [
//             {
//                 "label": "Hikarimono",
//                 "coordinates": {
//                     "x": 265.5,
//                     "y": 360.5,
//                     "width": 337,
//                     "height": 219
//                 }
//             },
//             {
//                 "label": "Kohaku",
//                 "coordinates": {
//                     "x": 151,
//                     "y": 48,
//                     "width": 298,
//                     "height": 96
//                 }
//             },
//             {
//                 "label": "Kohaku",
//                 "coordinates": {
//                     "x": 702.5,
//                     "y": 318.5,
//                     "width": 193,
//                     "height": 129
//                 }
//             },
//             {
//                 "label": "Showa",
//                 "coordinates": {
//                     "x": 576.5,
//                     "y": 99,
//                     "width": 181,
//                     "height": 96
//                 }
//             },
//             {
//                 "label": "Kohaku",
//                 "coordinates": {
//                     "x": 54,
//                     "y": 223,
//                     "width": 108,
//                     "height": 100
//                 }
//             },
//             {
//                 "label": "Kohaku",
//                 "coordinates": {
//                     "x": 605,
//                     "y": 398,
//                     "width": 368,
//                     "height": 114
//                 }
//             },
//             {
//                 "label": "Hikarimono",
//                 "coordinates": {
//                     "x": 324.5,
//                     "y": 525.5,
//                     "width": 305,
//                     "height": 145
//                 }
//             },
//             {
//                 "label": "Showa",
//                 "coordinates": {
//                     "x": 588.5,
//                     "y": 260,
//                     "width": 177,
//                     "height": 62
//                 }
//             }
//         ]
//     }
// ];

// // Call the function
// checkClassList(currentJsonData1, document.getElementById('classlist-container'));
// jsonExemption(currentJsonData1, document.getElementById('annotated-images'));
