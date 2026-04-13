import express from "express";
import cors from "cors"
import pg from "pg";
import bcrypt from "bcrypt";
import jsonwebstoken from "jsonwebtoken";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

const db = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

db.connect();

// Middleware
app.use(cors());
app.use(express.json());

const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, "../dist")));

function authenticate(req, res, next){

    const token = req.headers.authorisation;

    if(token == null){
        return res.status(401).json({error: "no token given"});
    }

    try{

        const decoded = jsonwebstoken.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();

    }
    catch (err){
        return res.status(403).json({error: "Invalid token or expired"});
    }

}

app.get("/authenticate", authenticate, (req, res) => {
    if (req.user.id == 0){
        res.status(200).json({ message: "Authorised" });
    }
    else{
        res.status(401).json({ message: "Not Authorised" });
        console.log("not authorised");
    }
});

app.post('/login', async (req, res) => {
    
    const { username, password} = req.body;

    try {

        const result = await db.query('SELECT id, password FROM users WHERE username = $1', [username]);
        const user = result.rows[0];

        if (!user) return res.status(401).json({ error: "Invalid Credentials" });
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(401).json({ error: "Invalid Credentials" });

        if (!validPassword){
            res.status(401).json({ error: "Invalid Credentials"});
        }

        const token = jsonwebstoken.sign({id: user.id}, process.env.JWT_SECRET, {expiresIn: '1d'});

        res.json({token});

    } catch(err){ 
        res.status(500).json({error: 'server error'});
    }

});

app.get("/getMap/:revisionMethod/:mapType", authenticate, (req, res) => {

    const { revisionMethod, mapType } = req.params;

    db.query('SELECT dataobj FROM filesystem WHERE revisionmethod = $1 AND maptype = $2', [revisionMethod, mapType], (err, result) => {
        if (err){
            console.error(err);
            res.status(500).json({error: "server error"});
        }

        res.status(200).json({data: result.rows[0].dataobj});
        
    });



})

app.post("/updateMaps/:revisionMethod", authenticate, async (req, res) => {  

    const { revisionMethod } = req.params;
    const { parent, newFile } = req.body;

    
    try {
        await db.query('BEGIN');

        // update the parent dr
        await db.query(
            `UPDATE filesystem SET dataobj = jsonb_set(dataobj, $2, $3)
            WHERE revisionmethod = $1 AND maptype = 'directory'`,
            [revisionMethod, `{${parent.fileNumber}}`, JSON.stringify(parent.fileDirectory)]
        );

        // add a dr for the new folder
        await db.query(
            `UPDATE filesystem SET dataobj = dataobj || $2
            WHERE revisionmethod = $1 and maptype = 'directory'`,
            [revisionMethod, JSON.stringify({[newFile.fileNumber] : [] })]
        )

        // update the file name system
        await db.query(
            `UPDATE filesystem SET dataobj = dataobj || $2
            WHERE revisionmethod = $1 AND maptype = 'names'`,
            [revisionMethod, JSON.stringify({ [newFile.fileNumber]: newFile.fileName })]
        );

        await db.query('COMMIT');
        res.status(200).json({ message: "Updated Successfully" });

    } catch (err) {
        await db.query('ROLLBACK');
        res.status(500).json({ error: err });
    }
    

});

app.get("/notes/:notesId", authenticate, async (req, res) => {

    const { notesId } = req.params;

    db.query( `SELECT content FROM notes WHERE id = $1 `, [notesId], 
        (err, dbRes) => {

            if (err){
                res.status(500).json({error:err});
            }
            else{
                res.status(200).json({notes: dbRes.rows[0].content})
            }
    })

})

app.post("/notes/:notesId", authenticate, async (req, res) => {

    const { notesId } = req.params;
    const { newNotes } = req.body;

    db.query( `UPDATE notes SET content = $1 WHERE id = $2`, [newNotes, notesId], 
        (err) => {
            if (err){
                res.status(500).json({error:err});
            }
            else{
                res.status(200).json({})
            }
    })

})

app.post("/newNotes/:notesId", authenticate, async (req, res) => {

    const { notesId } = req.params;

    db.query( `INSERT INTO notes(id, content) VALUES($1, '<p>Start Typing Here...</p>')`, [notesId], 
        (err) => {

            if (err){
                res.status(500).json({error:err});
            }
            else{
                res.status(200).json({})
            }
    })

})





app.post("/newCard/:fileId/:cardId", authenticate, async (req,res)=>{

    const {fileId, cardId} = req.params;

    db.query( `INSERT INTO cards(fileid, cardid, question, answer, wrongs, rights)
        VALUES($1,$2,'','', 0 , 0)`,
        [fileId, cardId],
        (err) => {
            if (err){
                res.status(500).json({error: err})
                console.log("Could Not Add New Card");
            }
            else{
                res.sendStatus(200) ;
        }
    })

})

app.get("/getCardsQA/:fileId", authenticate, (req,res) => {

    const { fileId } = req.params;

    db.query(`SELECT cardid, question, answer FROM cards WHERE fileid = $1`,
        [fileId],
        (err, dbRes) => {
            if (err){
                res.status(500).json({error: err})
            }
            else{
                res.status(200).json({
                    data: Object.fromEntries(
                        dbRes.rows.map(({ cardid, question, answer }) => [cardid, { question, answer }])
                    )
                })
            }
        }
    )

})

app.patch("/saveCard/:fileId/:cardId", authenticate, (req,res) => {

    const {fileId, cardId} = req.params;
    const {question, answer} = req.body;

    db.query( `UPDATE cards
                SET question = $1, answer = $2
                WHERE fileId = $3 AND cardid = $4`,
                [question, answer, fileId, cardId],
            (err) => {
    
                if (err){
                    res.sendStatus(500)
                }
                else{
                    res.sendStatus(200)
                }

    })

})

app.delete("/deleteCard/:fileId/:cardId", authenticate, (req, res) => {

    const {fileId, cardId} = req.params;

    db.query(`DELETE FROM cards WHERE fileid = $1 AND cardid = $2`,
        [fileId, cardId],
        (err) => {
            if (err){
                res.sendStatus(500);
            }
            else{
                res.sendStatus(200);
            }
        }
    )

})




const upload = multer({ storage: multer.memoryStorage() });

app.post('/uploadImage', authenticate, upload.single('image'), async (req, res) => {
    const { buffer, mimetype } = req.file;

    const result = await db.query(
        'INSERT INTO images (data, mimetype) VALUES ($1, $2) RETURNING id',
        [buffer, mimetype]
    );

    const id = result.rows[0].id;
    res.json({ url: `${process.env.API_URL}/getImage/${id}` });
});

app.get('/getImage/:id', async (req, res) => {
    const { id } = req.params;

    const result = await db.query(
        'SELECT data, mimetype FROM images WHERE id = $1',
        [id]
    );

    if (result.rows.length === 0) return res.sendStatus(404);

    const { data, mimetype } = result.rows[0];
    res.setHeader('Content-Type', mimetype);
    res.send(data);
});


app.get("/{*splat}", (req, res) => {
    res.sendFile(path.join(__dirname, "../dist/index.html"));
});



app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});