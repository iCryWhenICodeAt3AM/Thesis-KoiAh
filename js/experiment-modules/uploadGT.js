// For parsing the ground truth upload
function parseGroundTruth(event, category) {
    const inputElement = event.target;
    const file = inputElement.files[0];
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const json = JSON.parse(e.target.result);
            let groundTruthSet;
            let countElement;
            let imageUploads;

            // Determine the ground truth set, count element, and image uploads based on category
            switch (category) {
                case 'koi':
                    groundTruthSet = koiGT;
                    countElement = koiGroundTruthCount;
                    imageUploads = koiImageUploads;
                    break;
                case 'nonKoi':
                    groundTruthSet = nonKoiGT;
                    countElement = nonKoiGroundTruthCount;
                    imageUploads = nonKoiImageUploads;
                    break;
                case 'small':
                    groundTruthSet = smallGT;
                    countElement = smallGroundTruthCount;
                    imageUploads = smallImageUploads;
                    break;
                case 'medium':
                    groundTruthSet = mediumGT;
                    countElement = mediumGroundTruthCount;
                    imageUploads = mediumImageUploads;
                    break;
                case 'large':
                    groundTruthSet = largeGT;
                    countElement = largeGroundTruthCount;
                    imageUploads = largeImageUploads;
                    break;
                default:
                    console.error('Unknown category:', category);
                    return;
            }

            // Process and add the ground truth data to the respective set if the image is in the image uploads
            console.log(json, imageUploads);
            json.forEach(item => {
                const imageName = item.image;
                if (imageUploads.some(image => image.name === imageName)) {
                    const parsedAnnotations = item.annotations.map(annotation => ({
                        label: annotation.label,
                        bbox: [
                            annotation.coordinates.x - annotation.coordinates.width / 2,
                            annotation.coordinates.y - annotation.coordinates.height / 2,
                            annotation.coordinates.width,
                            annotation.coordinates.height
                        ]
                    }));

                    // Convert the item to a JSON string for proper comparison in the Set
                    const itemString = JSON.stringify({ image: imageName, annotations: parsedAnnotations });

                    // Add only if the item is not already present in the set
                    if (![...groundTruthSet].some(existingItem => JSON.stringify(existingItem) === itemString)) {
                        groundTruthSet.add({ image: imageName, annotations: parsedAnnotations });
                    }
                }
            });
            console.log(groundTruthSet.size);
            // Update the count element
            countElement.innerText = groundTruthSet.size;

            console.log("");
            console.log("Ground Truth Count: ", groundTruthSet.size);
            console.log("---");
            console.log("Koi Ground Truth: ", Array.from(koiGT));
            console.log("Non Koi Ground Truth: ", Array.from(nonKoiGT));
            console.log("---");
            console.log("Small Ground Truth: ", Array.from(smallGT));
            console.log("Medium Ground Truth: ", Array.from(mediumGT));
            console.log("Large Ground Truth: ", Array.from(largeGT));
        } catch (error) {
            console.error("Error parsing JSON file:", error);
        }

        // Reset the input element value to allow re-uploading the same file
        inputElement.value = '';
    };

    reader.readAsText(file);
}