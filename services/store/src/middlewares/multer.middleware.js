import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = "./uploads";

// Crear carpeta si no existe
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Configuración de Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const name = `${Date.now()}-${file.originalname}`;
        cb(null, name);
    },
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === "text/csv") cb(null, true);
    else cb(new Error("Solo se permiten archivos CSV"), false);
};

export const upload = multer({ storage, fileFilter });
