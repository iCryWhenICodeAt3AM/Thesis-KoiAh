
// Function to handle the image delete
async function deleteImage(index, imageName) {
    // Remove the image element from the DOM
    for (let i = 0; i < 2; i++) {
        let imgWrapper = document.getElementById(`${index}${i}`).remove();
        console.log("Deleted Image Wrapper: ", index, i);
        if (imgWrapper) {
            imgWrapper.remove();
        }
    }

    // Remove the image data from the global variables
    existingFiles.delete(imageName);
    exemptedFiles.delete(imageName);
    uploadedImages = uploadedImages.filter(img => img.name !== imageName);
    resultJsonData = resultJsonData.filter(json => json[0] !== imageName);
    console.log(`Uploaded Images: ${uploadedImages}, Results: ${resultJsonData}`);
    if (typeof currentJsonData !== 'undefined' && currentJsonData.length > 0) {
        currentJsonData = currentJsonData.filter(json => json.image !== imageName);
        document.getElementById("annotated-count").innerText = currentJsonData.length;
        console.log("JSON: ", currentJsonData);
    }
    if (typeof uploadedImagesData !== 'undefined' && uploadedImagesData.length > 0) {
        uploadedImagesData = uploadedImagesData.filter(json => json.name !== imageName);
        console.log("Image Data: ", uploadedImagesData);
        console.log("Images: ", uploadedImages);
    }
    // Check if plotAnnotations function exists and call it
    if (typeof plotAnnotations === 'function') {
        console.log("PLOT!!!", resultJsonData);
        await plotAnnotations(); // Update annotation counts
    }
    console.log("Deleted Image:", imageName);
    console.log("Files: ", existingFiles, "Images: ", uploadedImages);
}