import express, { Application, Request, Response } from 'express'
import request from 'request'
import { config } from 'dotenv'

const app: Application = express()
config()
interface IFacebook_MSG {
    sender: {
        id: string
    }
    recipient: {
        id: string
    }
    timestamp: number
    message: {
        mid: string
        text: string
        nlp: [Object]
    }
}

// Set config server
app.set('port', process.env.PORT || 5000)
app.use(express.json())

// Routes
app.get("/", (req: Request, res: Response) => {
    return res.send("I'm a test fb chat bot")
})

app.get("/webhook", (req: Request, res: Response) => {
    if (req.query["hub.verify_token"] === process.env.VERIFY_TOKEN) {
        return res.send(req.query["hub.challenge"]);
    }
    return res.send("Wrong token");
})

app.post("/webhook", (req, res) => {
    let msg_event: IFacebook_MSG[] = req.body.entry[0].messaging;

    msg_event.forEach((event: IFacebook_MSG) => {
        let sender = event.sender.id;
        if (event.message && event.message.text) {
            let text = event.message.text;
            sendText(sender, text);
        }
    });
    return res.end();
});

function sendText(sender: string, text: string) {
    let messageData = { text };

    request(
        {
            url: "https://graph.facebook.com/v2.6/me/messages",
            qs: { access_token: process.env.FACEBOOK_TOKEN },
            method: "POST",
            json: {
                recipient: { id: sender },
                message: messageData,
            },
        },
        (err, res, body) => {
            if (err) {
                console.error("sending error");
            } else if (res.body.error) {
                console.error("response body error");
            }
        }
    );
}

app.listen(app.get("port"), () => console.log("Running on port 5000"));
