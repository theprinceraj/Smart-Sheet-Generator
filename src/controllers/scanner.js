import { convertRomanNumeralToInteger } from "../utilities/extractRelevantInformation.js";
import { createRectangles } from "../utilities/tesseract/createRectangles.js";
import { getJobDone } from "../utilities/tesseract/getJobDone.js";
import { preProcessImage } from "../utilities/sharp/preProcessImage.js";
import { writeFileSync } from "fs";

export async function scan(req, res) {
  const base64versionImage = req.body.image;
  if (!base64versionImage)
    return res
      .status(400)
      .json({ error: "Image data is missing in the request body" });

  const preProcessedImage = await preProcessImage(base64versionImage);
  try {
    const currentSemesterNumber = convertRomanNumeralToInteger(
      (await getJobDone(preProcessedImage, createRectangles("semester")))[0]
    );
    const personalInfo = await getJobDone(
      preProcessedImage,
      createRectangles("personal-info")
    );
    const [registraionNumber, studentName, fatherName, motherName, courseName] =
      personalInfo;
    const gpa = await getJobDone(preProcessedImage, createRectangles("gpa"));

    const formatted = `${registraionNumber} | ${currentSemesterNumber} | ${studentName} |${fatherName} | ${motherName} | ${courseName} | ${gpa}`;
    console.log(formatted);

    res.json({
      ocrResponse: [registraionNumber, currentSemesterNumber],
      formattedString: formatted,
    });
  } catch (error) {
    console.error("Error processing OCR:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
