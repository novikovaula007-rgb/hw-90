import express from 'express';
import expressWs from 'express-ws';
import cors from 'cors';
import createCanvasRouter from "./routes/canvas";

const port = 8008;
const baseApp = express();

const wsInstance = expressWs(baseApp);
const {app} = wsInstance;
const canvasRouter = createCanvasRouter(wsInstance);

app.use(cors());
app.use(express.json());
app.use('/draw', canvasRouter)

const run = async () => {
    app.listen(port, () => {
        console.log('Server running on port ' + port);
    })
}

run().catch((e) => console.error(e));