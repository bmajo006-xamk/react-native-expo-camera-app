import express from 'express';
import path from 'path';
import multer from 'multer';
import fs from "fs/promises";

const portti : number = Number(process.env.PORT) || 3002;

const app: express.Application = express();

app.use(express.static(path.resolve(__dirname, "public")));

const uploadKasittelija : express.RequestHandler = multer({
    dest : path.resolve(__dirname, "tmp"),
    
}).single("file")

app.post('/', async(req: express.Request, res: express.Response) => {

    uploadKasittelija(req, res, async (err : any) => {

        if (req.file){

            let tiedostonimi : string = `${req.file?.originalname}`;

            let uusiTiedostoSijainti : string = path.resolve(__dirname, "public", "uploads", tiedostonimi);

            await fs.copyFile(path.resolve(__dirname, "tmp", `${req.file?.filename}`), uusiTiedostoSijainti );

            res.json({viesti: "onnistui"});

        } else {
            res.json({viesti: "tiedostoa ei saatu ladattua"});
        }

    })
});

app.listen(portti, () => {

    console.log(`Palvelin käynnistyi porttin ${portti}`);
})