import * as pdfjsLib from "pdfjs-dist";
import { GlobalWorkerOptions } from "pdfjs-dist/build/pdf";
import pdfWorker from "pdfjs-dist/build/pdf.worker?url";

GlobalWorkerOptions.workerSrc = pdfWorker;

export const extractTextFromPdf = async (file) => {
  const buffer = await file.arrayBuffer();
  const typedArray = new Uint8Array(buffer);
  const pdf = await pdfjsLib.getDocument(typedArray).promise;

  let textContent = "";

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const text = await page.getTextContent();
    textContent += `${text.items.map((item) => item.str).join(" ")}\n`;
  }

  return textContent.trim();
};
