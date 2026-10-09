import express from "express";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.static(__dirname));
app.listen(process.env.PORT || 3000, () => console.log("Ashen Blade up"));
