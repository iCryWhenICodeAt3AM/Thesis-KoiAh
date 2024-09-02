// Global variable to store label counts / classes counts
let globalLabelCounts = {};
let resultJsonData = [];
let filteredData = [];

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
    if(resultJsonData.length!=0 || globalLabelCounts.length!=0 || filteredData.length!=0){
        globalLabelCounts = {};
        resultJsonData = [];
        filteredData = [];
    }
    console.log("Uploaded Images: ", uploadedImages);
    console.log("Uploaded Images: ", uploadedImagesData);
    // Input Fields Collection
    const images = document.getElementById('images').files;
    const folder = document.getElementById('folder').files;
    const model = document.getElementById('model').value;
    const apiKey = document.getElementById('apiKey').value;
    const classLimit = parseInt(document.getElementById('classLimit').value);
    console.log("Class Limit: ", classLimit);

    // Interface actions
    const annotatedCount = document.getElementById('annotated-count');
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
    const files = uploadedImagesData.filter(file => !exemptedFiles.has(file.name));

    console.log("Files To Process: ", files);
    // Filter out non-image files
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    console.log("Image Files To Process: ", imageFiles);
    // Dynamic Elements
    let predictionCount = 0;

    // Status Actions
    // processStatus.innerText = "Running...";
    // pendingImages.innerText = pendingImagesCount;

    // Initial Processing
    // reset(processStatus.innerText, pendingImages.innerText, annotatedImages.innerText, previousImage.innerText, classContainer, itemListContainer); // Reset all status in the output
    processInitialData(currentJsonData, classContainer, classLimit);
    let annotatedImagesCount = exemptedFiles.size;
    // startButton.disabled = true;

    const processImage = async (imageFile) => {
        // currentImage.innerText = imageFile.name; 

        const reader = new FileReader();
        return new Promise((resolve, reject) => {
            reader.onload = async (event) => {
                const base64Image = event.target.result.split(',')[1];
                const imageName = imageFile.name;
                // console.log("Base 64: ", event.target.result.split(',')[1]);
                // Display Image
                // const img = `
                //     <div class="col-12">
                //         <img src="${event.target.result}" alt="Current Image" id="processing-image">
                //     </div>
                // `;
                // processingContainer.innerHTML = img;
                
                try {
                    const response = await axios({
                        method: 'POST',
                        url: `https://detect.roboflow.com/${model}`,
                        params: {
                            api_key: apiKey,
                        },
                        data: base64Image,
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        }
                    });

                    for (const prediction of response.data.predictions) {
                        console.log("Label: ", prediction.class, " Confidence: ", prediction.confidence);
                    }


                    console.log(response);
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

                    if (formattedAnnotations.length > 0) {
                        resultJsonData.push({
                            image: imageName,
                            annotations: formattedAnnotations
                        });
                    }

                    processPrediction(formattedAnnotations, classContainer, annotatedImagesCount + 1, imageFile.name, itemListContainer, classLimit);

                    resolve();
                } catch (error) {
                    console.error(error.message);
                    reject(error);
                    // startButton.disabled = false;
                    alert("Please input the model & version, or the API Key.");
                    active--;
                    updateProgress();
                    pageLoad();
                    // Complete the progress bar
                    // Optionally hide the overlay after processing is complete
                }
            };
            reader.readAsDataURL(imageFile);
        });
    };
    initialize1(existingFiles.size);
    let processedImages = 0;
    // Start of the annotation process
    for (const imageFile of imageFiles) {
        await processImage(imageFile);
        updateProgress1(++processedImages);
        // pendingImagesCount -= 1;
        // annotatedImagesCount++;
        // pendingImages.innerText = pendingImagesCount;
        // annotatedImages.innerText = annotatedImagesCount;
        // currentImage.innerText = "-";
        // processingContainer.innerHTML = "";
        // previousImage.innerText = imageFile.name;
    }
    // processStatus.innerText = "Completed";
    // startButton.disabled = false;
    // Complete the progress bar
    // completeProgressBar();
    active++;
    updateProgress();
    pageLoad();
    // Optionally hide the overlay after processing is complete
    // document.getElementById('overlay').style.display = 'none';
}

// Append item to item list container
// function appendItem(itemNumber, filename, container, objects, classes){
//     // Add the processed image information to the item list
//     const id = formatLabel(filename);
//     // document.getElementById("number-of-objects").innerText = objects;
//     // document.getElementById("number-of-classes").innerText = classes;
//     const itemHTML = `
//     <div class="cont-outer row p-1 mt-2 ${id}" id="${id}" onclick="showImageModal('${filename}')">
//         <div class="col-1">
//             <h6 class="m-0">${itemNumber}</h6>
//         </div>
//         <div class="col-6" id="filename-item">
//             <h6 class="m-0">${filename}</h6>
//         </div>
//         <div class="col-2">
//             <h6 class="m-0">${objects}</h6>
//         </div>
//         <div class="col-2">
//             <h6 class="m-0">${classes}</h6>
//         </div>
//     </div>
//     `;
//     container.innerHTML += itemHTML;
// }

// Set all output group to default
function reset(status, pending, annotated, previousImage, classes, items){
    status = "-";
    previousImage = "-";
    pending = "0";
    annotated = "0";
    classes.innerHTML = "";
    items.innerHTML = "";
}

// Process initial Data
function processInitialData(currentJsonData, classContainer, classLimit) {
    console.log("");
    console.log("currentJsonData: ", currentJsonData);
    currentJsonData.forEach(item => {
        const filteredAnnotations = [];
        const labelOccurrences = {};

        // Count occurrences of each label in the item
        item.annotations.forEach(annotation => {
            const label = annotation.label;

            if (!globalLabelCounts[label]) {
                globalLabelCounts[label] = [0, 0, 0, 0, 0]; // Solo, Group, Mixed, Total, Annotations
            }

            // Check if the total count of the label in globalLabelCounts is less than classLimit
            if (globalLabelCounts[label][3] < classLimit) {
                filteredAnnotations.push(annotation);

                if (!labelOccurrences[label]) {
                    labelOccurrences[label] = 0;
                }
                labelOccurrences[label]++;
            }
        });
        console.log("Before: Current Global Labels: ", globalLabelCounts);
        if (filteredAnnotations.length > 0) {
            // Determine the classification of the filtered annotations
            const uniqueLabels = Object.keys(labelOccurrences);
            const numLabels = uniqueLabels.length;
            console.log("Unique Labels: ", uniqueLabels, ". Number: ", numLabels);
            uniqueLabels.forEach(label => {
                const labelCounts = globalLabelCounts[label];
                const count = labelOccurrences[label];
                console.log("Unique Label: ", [label]);
                console.log("Label Count: ", count);
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
                labelCounts[4] += count;
            });

            filteredData.push({ image: item.image, annotations: filteredAnnotations });
        }
    });
    // Step 2: Update the class interface with the current labels and their counts
    classContainer.innerHTML = '';
    Object.entries(globalLabelCounts).forEach(([label, counts]) => {
        const isMaxedClass = counts[3] >= classLimit;
        const item = `
            <div class="row" ${isMaxedClass ? 'id="maxed-class"' : ''}>
                <div class="col-3 border" id="filename-class">
                    <span class="m-0">${label}</span>
                </div>
                <div class="col-6">
                    <div class="row">
                    <div class="col-3 border">
                        <span class="m-0">${counts[0]}</span>
                    </div>
                    <div class="col-3 border">
                        <span class="m-0">${counts[1]}</span>
                    </div>
                    <div class="col-3 border">
                        <span class="m-0">${counts[2]}</span>
                    </div>
                    <div class="col-3 border">
                        <span class="m-0">${counts[3]}</span>
                    </div>
                    </div>
                </div>
                <div class="col-3 border">
                    <span class="m-0">${counts[4]}</span>
                </div>
            </div>
        `;
        classContainer.innerHTML += item;
    });

    
    // Step 3: Post the processed items in the itemListContainer
    // const itemListContainer = document.getElementById('itemlist-container');
    // itemListContainer.innerHTML = '';

    // filteredData.forEach((item, index) => {
    //     const imageName = item.image;
    //     const annotations = item.annotations;
    
    //     const uniqueLabels = [...new Set(annotations.map(annotation => annotation.label))];
    
    //     htmlContent = `
    //         <div class="cont-outer row p-1 mt-2" onclick="showImageModal('${imageName}')">
    //             <div class="col-1">
    //                 <h6 class="m-0">${index + 1}</h6>
    //             </div>
    //             <div class="col-6" id="${formatLabel(imageName)}" style="white-space: nowrap; overflow-y: auto; scrollbar-width: none;">
    //                 <h6 class="m-0">${imageName}</h6>
    //             </div>
    //             <div class="col-2">
    //                 <h6 class="m-0">${annotations.length}</h6>
    //             </div>
    //             <div class="col-2">
    //                 <h6 class="m-0">${uniqueLabels.length}</h6>
    //             </div>
    //         </div>
    //     `;
    
    //     annotatedImages.innerText = (index + 1);
    //     itemListContainer.innerHTML += htmlContent;
    // });

    console.log('Filtered Data:', filteredData);
    console.log('Updated globalLabelCounts:', globalLabelCounts);
}

// formattng of label
function formatLabel(label) {
    // Replace periods with dashes
    let formatted = label.replace(/\./g, '-');

    // Replace whitespace with underscores
    formatted = formatted.replace(/\s+/g, '_');

    // Add "=" at the start if the label starts with a number
    if (/^\d/.test(formatted)) {
        formatted = '=' + formatted;
    }

    return formatted;
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
            globalLabelCounts[label] = [0, 0, 0, 0, 0]; // Solo, Group, Mixed, Total, Annotations
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
        labelCounts[4] += count;
    });

    // appendItem(count, filename, itemListContainer, objectCount, numLabels);
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
            <div class="row" ${isMaxedClass ? 'id="maxed-class"' : ''}>
                <div class="col-3 border" id="filename-class">
                    <span class="m-0">${label}</span>
                </div>
                <div class="col-6">
                    <div class="row">
                    <div class="col-3 border">
                        <span class="m-0">${counts[0]}</span>
                    </div>
                    <div class="col-3 border">
                        <span class="m-0">${counts[1]}</span>
                    </div>
                    <div class="col-3 border">
                        <span class="m-0">${counts[2]}</span>
                    </div>
                    <div class="col-3 border">
                        <span class="m-0">${counts[3]}</span>
                    </div>
                    </div>
                </div>
                <div class="col-3 border">
                    <span class="m-0">${counts[4]}</span>
                </div>
            </div>
        `;
    
        container.innerHTML += item;
    });
}