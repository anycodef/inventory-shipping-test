import fs from "fs";
import csv from "fast-csv";

export const parseCSV = (filePath, requiredHeaders = []) => {
    return new Promise((resolve, reject) => {
        const results = [];
        let isHeaderValidated = false;
        const stream = fs
            .createReadStream(filePath)
            .pipe(csv.parse({ headers: true, ignoreEmpty: true }))
            .on("error", (err) => reject(err))
            .on("headers", (headers) => {
                if (requiredHeaders.length > 0) {
                    const missing = requiredHeaders.filter(
                        (col) => !headers.includes(col)
                    );

                    if (missing.length > 0) {
                        stream.destroy();
                        return reject(
                            new Error(
                                `El archivo CSV no tiene las columnas requeridas: ${missing.join(", ")}`
                            )
                        );
                    }
                }
                isHeaderValidated = true;
            })
            .on("data", (row) => {
                if (isHeaderValidated) results.push(row);
            })
            .on("end", () => resolve(results));
    });
};
