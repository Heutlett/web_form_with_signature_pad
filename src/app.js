const { degrees, PDFDocument, rgb, StandardFonts } = PDFLib;

const canvas = document.querySelector("canvas");
const form = document.querySelector(".signature-pad-form");
const clearButton = document.querySelector(".clear-button");
const ctx = canvas.getContext("2d");
let writingMode = false;

form.addEventListener("submit", (event) => {
    event.preventDefault();

    const imageURL = canvas.toDataURL();

    const image = document.createElement("img");
    image.src = imageURL;
    image.height = canvas.height;
    image.width = canvas.width;
    image.style.display = "block";

    modifyPdf(imageURL);
});

const clearPad = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
};

clearButton.addEventListener("click", (event) => {
    event.preventDefault();
    clearPad();
});

const getTargetPosition = (event) => {
    positionX = event.clientX - event.target.getBoundingClientRect().x;
    positionY = event.clientY - event.target.getBoundingClientRect().y;

    return [positionX, positionY];
};

const handlePointerMove = (event) => {
    if (!writingMode) return;

    const [positionX, positionY] = getTargetPosition(event);
    ctx.lineTo(positionX, positionY);
    ctx.stroke();
};

const handlePointerUp = () => {
    writingMode = false;
};

const handlePointerDown = (event) => {
    writingMode = true;
    ctx.beginPath();

    const [positionX, positionY] = getTargetPosition(event);
    ctx.moveTo(positionX, positionY);
};

ctx.lineWidth = 2;
ctx.lineJoin = ctx.lineCap = "round";

canvas.addEventListener("pointerdown", handlePointerDown, { passive: true });
canvas.addEventListener("pointerup", handlePointerUp, { passive: true });
canvas.addEventListener("pointermove", handlePointerMove, { passive: true });

async function modifyPdf(pngUrl) {
    const apellido1 = document.getElementById("apellido1");
    const apellido2 = document.getElementById("apellido2");
    const nombre = document.getElementById("nombre");

    // Fetch an existing PDF document
    const url = "boleta_estudiantes.pdf";
    const existingPdfBytes = await fetch(url).then((res) => res.arrayBuffer());

    // Load a PDFDocument from the existing PDF bytes
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    // Embed the Helvetica font
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Prepara la imagen de la firma
    const pngImageBytes = await fetch(pngUrl).then((res) => res.arrayBuffer());
    const pngImage = await pdfDoc.embedPng(pngImageBytes);
    const pngDims = pngImage.scale(0.5);

    // Get the first page of the document
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    // Dibuja el primer apellido
    firstPage.drawText(apellido1.value, {
        x: 55,
        y: 630,
        size: 12,
        font: helveticaFont,
        color: rgb(0, 0, 0.8),
    });

    // Dibuja el segundo apellido
    firstPage.drawText(apellido2.value, {
        x: 220,
        y: 630,
        size: 12,
        font: helveticaFont,
        color: rgb(0, 0, 0.8),
    });

    // Dibuja el nombre
    firstPage.drawText(nombre.value, {
        x: 388,
        y: 630,
        size: 12,
        font: helveticaFont,
        color: rgb(0, 0, 0.8),
    });

    // Dibuja la imagen de la firma
    firstPage.drawImage(pngImage, {
        x: 120,
        y: 150,
        width: pngDims.width,
        height: pngDims.height,
    });

    // Serialize the PDFDocument to bytes (a Uint8Array)
    const pdfBytes = await pdfDoc.save();

    // Trigger the browser to download the PDF document
    download(pdfBytes, "boleta-estudiate-" + apellido1.value + "-" + apellido2.value + "-" + nombre.value +".pdf", "application/pdf");
}
