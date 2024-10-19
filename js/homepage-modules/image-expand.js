function imageExpand(location) {
    const container = document.getElementById('image-expand-container');
    container.innerHTML = '';
    if (container) {
        const img = document.createElement('img');
        img.src = location;
        img.style.height = "auto";
        img.style.width = "100%";
        container.appendChild(img);
    }
}