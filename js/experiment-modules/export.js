function collectElementsForHypothesis(hypothesis) {
    let elements = [];
    let sheetTitles = [];
    if (hypothesis === '1') {
        elements = [
            document.getElementById('koi-table'),
            document.getElementById('non-koi-table'),
            document.getElementById('data-one'),
            document.getElementById('anova-one'),
            document.getElementById('one-confusion-matrix')
        ];
        sheetTitles = [
            "Koi Table",
            "Non Koi Table",
            "Data Summary",
            "ANOVA Result",
            "Multi-Class Confusion"
        ]
    } else if (hypothesis === '2') {
        elements = [
            document.getElementById('small-table'),
            document.getElementById('medium-table'),
            document.getElementById('large-table'),
            document.getElementById('data-two'),
            document.getElementById('anova-two'),
            document.getElementById('pairwise-anova'),
            document.getElementById('two-confusion-matrix')
        ];
        sheetTitles = [
            "Small Table",
            "Medium Table",
            "Large Table",
            "Data Summary",
            "ANOVA Result",
            "Pairwise ANOVA",
            "Multi-Class Confusion"
        ]
    }
    return { elements, sheetTitles };
}

function canvasToImageDataUrl(canvas) {
    return canvas.toDataURL('image/png');
}

function convertCanvasToSheet(canvas) {
    const sheet = XLSX.utils.aoa_to_sheet([[]]); // Create an empty sheet
    const imageDataUrl = canvasToImageDataUrl(canvas);

    // Add image URL to the sheet (the image won't be visible in Excel, but the URL will be there)
    const cellAddress = XLSX.utils.encode_cell({ c: 0, r: 0 }); // First cell (A1)
    sheet[cellAddress] = { t: 's', v: imageDataUrl };

    return sheet;
}

function convertElementsToBook(elements, sheetTitles) {
    const workbook = XLSX.utils.book_new();
    
    elements.forEach((element, index) => {
        const table = element.querySelector('table');
        const canvas = element.querySelector('canvas');
        
        if (table) {
            const sheet = XLSX.utils.table_to_book(table).Sheets.Sheet1;
            XLSX.utils.book_append_sheet(workbook, sheet, sheetTitles[index]);
        } else if (canvas) {
            const sheet = convertCanvasToSheet(canvas);
            XLSX.utils.book_append_sheet(workbook, sheet, sheetTitles[index]);
        }
    });

    return workbook;
}

function generateExcelForHypothesis() {
    const hypothesis = document.getElementById("hypothesis1").checked === true ? '1' : '2';
    const { elements, sheetTitles } = collectElementsForHypothesis(hypothesis);
    const workbook = convertElementsToBook(elements, sheetTitles);

    const fileName = `Hypothesis_${hypothesis}_Results.xlsx`;
    XLSX.writeFile(workbook, fileName);
}
