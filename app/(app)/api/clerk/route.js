import { headers } from "next/headers"
import { Webhook } from "svix";

export async function POST(req) {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SIGNING_SECRET

    if(!WEBHOOK_SECRET) {
        throw new Error('Webhook secret not found')
    }

    const headerPayload = headers()
    const svix_id = headerPayload.get("svix_id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    if(!svix_id || !svix_timestamp || !svix_signature) {
        return new Response("Missing Headers", { status:400 })
    }

    const payload = await req.json()
    const body = JSON.stringify(payload)

    const wh = new Webhook(WEBHOOK_SECRET) 

    let evt;

    try {
        evt = wh.verify(body, {
            "svix-id" : svix_id,
            "svix-timestamp": svix_timestamp,
            "svix-signature": svix_signature
        })
    } catch (err) {
        console.log('Error while verifying the webhook', err);
        return new Response("Error while verifying the webhook", { status:400 })
    }

    const eventType = evt.type

    console.log(`Received ${eventType} event`)

    const {id, first_name, last_name, email_addresses, image_url, username} = evt.data

    const email_address = email_addresses[0].email_address

    if(eventType === "user.created")
    {
        try {
            await createUser({ id, first_name, last_name, email_address , image_url, username})
        } catch (error) {
            throw new Error("Failed to save in db")
        }
    }
}

export async function GET() {
    return Response.json({ message: 'Hello World!'})
}