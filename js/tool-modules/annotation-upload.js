let currentJsonData = [];

function loadJson() {
    const jsonFileInput = document.getElementById('jsonFile');
    const jsonFile = jsonFileInput.files[0];
    
    if (!jsonFile) {
        console.error("No file selected.");
        return;
    }

    const reader = new FileReader();

    reader.onload = function(event) {
        try {
            const jsonFileData = JSON.parse(event.target.result);

            if (!Array.isArray(jsonFileData)) {
                throw new Error("JSON data is not an array.");
            }

            // Create a set of image names from uploaded images
            const uploadedImageNames = new Set(uploadedImages.map(image => image.name));

            // Add items from the JSON file that are in uploaded images and are not exempted
            jsonFileData.forEach(jsonItem => {
                if (jsonItem && jsonItem.image && uploadedImageNames.has(jsonItem.image) && !exemptedFiles.has(jsonItem.image)) {
                    // Check if the image already exists in currentJsonData
                    let existingItem = currentJsonData.find(item => item.image === jsonItem.image);
                    if (existingItem) {
                        // If it exists, update annotations if necessary
                        existingItem.annotations = jsonItem.annotations;
                    } else {
                        // If it does not exist, add new item
                        currentJsonData.push(jsonItem);
                    }
                    exemptedFiles.add(jsonItem.image);
                    existingFiles.delete(jsonItem.image);
                }
            });

            console.log("Combined JSON Data:", currentJsonData);
            console.log("Existing Files:", existingFiles);
            console.log("Exempted Files:", exemptedFiles);

            const annotationCount = document.getElementById('annotated-count');
            if (annotationCount) {
                annotationCount.innerText = exemptedFiles.size;
            }

            // Clear the file input value to allow re-uploading of the same file
            jsonFileInput.value = null;
        } catch (error) {
            console.error("Error processing JSON file:", error);
        }
    };

    reader.onerror = function(error) {
        console.error("Error reading file:", error);
    };

    reader.readAsText(jsonFile);
}