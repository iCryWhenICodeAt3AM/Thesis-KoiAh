async function exportResults() {
    const zip = new JSZip();
    const jsonBlob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    zip.file('createml.json', jsonBlob);

    for (const img of uploadedImages) {
        const imageData = atob(img.data);
        const arrayBuffer = new Uint8Array(imageData.length);
        for (let i = 0; i < imageData.length; i++) {
            arrayBuffer[i] = imageData.charCodeAt(i);
        }
        zip.file(img.name, arrayBuffer);
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const zipUrl = URL.createObjectURL(zipBlob);

    const a = document.createElement('a');
    a.href = zipUrl;
    a.download = 'annotations.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}