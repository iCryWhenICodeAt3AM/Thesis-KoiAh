// For parsing the predictions upload
function parsePredictions(event, category) {
    const inputElement = event.target;
    const file = inputElement.files[0];
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const json = JSON.parse(e.target.result);
            let predictionSet;
            let countElement;
            let imageUploads;

            // Determine the prediction set, count element, and image uploads based on category
            switch (category) {
                case 'koi':
                    predictionSet = koiPB;
                    countElement = koiPredictionsCount;
                    imageUploads = koiImageUploads;
                    break;
                case 'nonKoi':
                    predictionSet = nonKoiPB;
                    countElement = nonKoiPredictionsCount;
                    imageUploads = nonKoiImageUploads;
                    break;
                case 'small':
                    predictionSet = smallPB;
                    countElement = smallPredictionsCount;
                    imageUploads = smallImageUploads;
                    break;
                case 'medium':
                    predictionSet = mediumPB;
                    countElement = mediumPredictionsCount;
                    imageUploads = mediumImageUploads;
                    break;
                case 'large':
                    predictionSet = largePB;
                    countElement = largePredictionsCount;
                    imageUploads = largeImageUploads;
                    break;
                default:
                    console.error('Unknown category:', category);
                    return;
            }

            // Process and add the prediction data to the respective set if the image is in the image uploads
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
                    if (![...predictionSet].some(existingItem => JSON.stringify(existingItem) === itemString)) {
                        predictionSet.add({ image: imageName, annotations: parsedAnnotations });
                    }
                }
            });

            // Update the count element
            countElement.innerText = predictionSet.size;

            console.log("");
            console.log("Prediction Boxes Count: ", predictionSet.size);
            console.log("---");
            console.log("Koi Prediction Boxes: ", Array.from(koiPB));
            console.log("Non Koi Prediction Boxes: ", Array.from(nonKoiPB));
            console.log("---");
            console.log("Small Prediction Boxes: ", Array.from(smallPB));
            console.log("Medium Prediction Boxes: ", Array.from(mediumPB));
            console.log("Large Prediction Boxes: ", Array.from(largePB));
        } catch (error) {
            console.error("Error parsing JSON file:", error);
        }

        // Reset the input element value to allow re-uploading the same file
        inputElement.value = '';
    };

    reader.readAsText(file);
}