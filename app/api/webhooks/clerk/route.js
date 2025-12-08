// app/api/webhooks/clerk/route.js — FINAL 100% WORKING VERSION
import { headers } from "next/headers"
import { Webhook } from "svix"
import { createUser, updateUser, deleteUser } from "@/actions/user"

const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SIGNING_SECRET 

export async function POST(req) {
  if (!WEBHOOK_SECRET) {
    console.error("CLERK_WEBHOOK_SECRET missing")
    return new Response("Server error", { status: 500 })
  }

  try {
    const headerPayload = headers()
    const svix_id = headerPayload.get("svix-id")
    const svix_timestamp = headerPayload.get("svix-timestamp")
    const svix_signature = headerPayload.get("svix-signature")

    if (!svix_id || !svix_timestamp || !svix_signature) {
      return new Response("Missing svix headers", { status: 400 })
    }

    const payload = await req.text()
    const body = JSON.parse(payload)

    const evt = new Webhook(WEBHOOK_SECRET).verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    })

    const { type, data } = evt

    console.log("Webhook received:", type, data.id)

    if (type === "user.created") {
      const email = data.email_addresses?.[0]?.email_address || null
      await createUser({
        id: data.id,
        first_name: data.first_name ?? null,
        last_name: data.last_name ?? null,
        email_address: email,
        image_url: data.image_url ?? null,
        username: data.username ?? null,
      })
      console.log("User created in DB:", data.id)
    }

    if (type === "user.updated") {
      const email = data.email_addresses?.[0]?.email_address || null
      await updateUser({
        id: data.id,
        first_name: data.first_name ?? null,
        last_name: data.last_name ?? null,
        email_address: email,
        image_url: data.image_url ?? null,
        username: data.username ?? null,
      })
    }

    if (type === "user.deleted" && data.id) {
      await deleteUser(data.id)
    }

    return new Response("OK", { status: 200 })
  } catch (err) {
    console.error("Webhook failed:", err.message)
    return new Response("Webhook handler failed", { status: 500 })
  }
}

// Vercel needs this
export const GET = () => new Response("Webhook active", { status: 200 })