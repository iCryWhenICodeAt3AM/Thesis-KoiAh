let images = 0;

function initialize1(unprocessed){
    const progressText = document.getElementById('percent-num');
    const progressBar1 = document.getElementById('progress-bar');
    if (progressBar1) {
        progressText.innerHTML = '0%';
        progressBar1.style.width = '0%';
    }
    // Get the number of items
    images = unprocessed;
    console.log(images," Images");
}

// Update progress bar
function updateProgress1(completedItems) {
    const progressBar1 = document.getElementById('progress-bar');
    const progressText = document.getElementById('percent-num');
    if (progressBar1) {
        console.log()
        const percentage = Math.round((completedItems / images) * 100);
        console.log(percentage, "percentage");

        if (progressText) {
            progressText.innerHTML = `${percentage}%`;
            progressBar1.style.width = `${percentage}%`; // Set the width of the progress bar
        }
    }
}
