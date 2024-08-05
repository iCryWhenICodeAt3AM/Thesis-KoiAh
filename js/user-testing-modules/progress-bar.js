// Initialize progress bar
function initializeProgressBar(totalItems) {
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const progressNumber = document.getElementById('progress-number');
    
    if (progressBar) {
        progressBar.max = totalItems;
        progressBar.value = 0;
        if (progressText) {
            progressText.innerText = `Processing: 0%`;
            progressNumber.innerText = `Remaining Images: ${totalItems}`;
        }
    }
    // Optionally hide the overlay after processing is complete
    document.getElementById('overlay').style.display = 'block';
}

// Update progress bar
function updateProgress(completedItems) {
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const progressNumber = document.getElementById('progress-number');
    const remaining = parseInt(progressNumber.innerText.replace("Remaining Images: ", ""));
    if (progressBar) {
        progressBar.value = completedItems;
        const percentage = Math.round((completedItems / progressBar.max) * 100);
        if (progressText) {
            progressText.innerText = `Processing: ${percentage}%`;
            progressNumber.innerText = `Remaining Images: ${remaining - 1}`;
        }
    }
}

// Complete progress bar
function completeProgressBar() {
    const progressBar = document.getElementById('progress-bar');
    const progressNumber = document.getElementById('progress-number');
    if (progressBar) {
        progressBar.value = progressBar.max;
        const progressText = document.getElementById('progress-text');
        if (progressText) {
            progressText.innerText = `Processing: 100%`;
            progressNumber.innerText = `Remaining Images: 0`;
        }
    }
}

