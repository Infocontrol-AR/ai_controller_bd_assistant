import { Injectable } from "@nestjs/common";
import { clear, log } from "console";
import fs from "fs";
import fetch from "node-fetch";
import OpenAI, { toFile } from "openai";



const client = new OpenAI({
  apiKey:
    "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",
});

// 2. Subir el archivo
async function uploadFile() {
  const fileResponse = await client.files.create({
    file: fs.createReadStream("data.jsonl"),
    purpose: "fine-tune",
  });

  log(`Archivo subido con ID: ${fileResponse.id}`);
  return fileResponse.id;
}

// 3. Crear el fine-tuning
async function createFineTune(fileId) {
  const fineTuneResponse = await client.fineTuning.jobs.create({
    training_file: fileId,
    model: "gpt-4o-mini-2024-07-18",
  });
  console.log(fineTuneResponse);
  log(`Fine-tuning creado con ID: ${fineTuneResponse.id}`);
  return fineTuneResponse.id;
}

// 4. Monitorear el progreso
async function monitorFineTune(fineTuneId) {
  let statusResponse = null;
  while (true) {
    statusResponse = await client.fineTuning.jobs.retrieve(fineTuneId);
    console.log(statusResponse);
    log(`Estado del fine-tuning: ${statusResponse.status}`);

    if (
      statusResponse.status === "succeeded" ||
      statusResponse.status === "failed"
    ) {
      break;
    }

    await new Promise((resolve) => setTimeout(resolve, 60000));
  }

  return statusResponse.fine_tuned_model;
}

// 5. Usar el modelo ajustado
async function useFineTunedModel(modelName, prompt) {
  const response = await client.chat.completions.create({
    model: modelName,
    messages: [{ role: "user", content: prompt }],
  });

  log("Respuesta del modelo ajustado:", response.choices[0].message.content);
}

// Ejecutar todo
const model = "ft:gpt-4o-mini-2024-07-18:personal::AL9JxT2W";
(async () => {
  try {
    // const fileId = await uploadFile();
    // const fineTuneId = await createFineTune(fileId);
    // const modelName = await monitorFineTune(fineTuneId);
    // console.log("Modelo ajustado:", modelName);
    await useFineTunedModel(model,'cuantos empleados tengo inactivos');
  } catch (error) {
    console.error("Error:", error);
  }
})();
