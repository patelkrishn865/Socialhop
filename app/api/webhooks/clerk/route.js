// app/api/webhooks/clerk/route.js

import { headers } from "next/headers"
import { Webhook } from "svix"
import { createUser, updateUser, deleteUser } from "@/actions/user"  // ← your file

const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SIGNING_SECRET

export async function POST(req) {
  if (!WEBHOOK_SECRET) {
    return new Response("Missing secret", { status: 500 })
  }

  const headerPayload = await headers()
  const svix_id = headerPayload.get("svix-id")
  const svix_timestamp = headerPayload.get("svix-timestamp")
  const svix_signature = headerPayload.get("svix-signature")

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing svix headers", { status: 400 })
  }

  const payload = await req.text()

  let evt
  try {
    evt = new Webhook(WEBHOOK_SECRET).verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    })
    console.log("Webhook verified →", evt.type)
  } catch (err) {
    console.error("Verification failed:", err.message)
    return new Response("Invalid signature", { status: 400 })
  }

  const { type, data } = evt

  // ——————————————— USER.CREATED ———————————————
  if (type === "user.created") {
    const email_address = data.email_addresses?.[0]?.email_address || null

    await createUser({
      id: data.id,
      first_name: data.first_name ?? null,
      last_name: data.last_name ?? null,
      email_address,
      image_url: data.image_url ?? null,
      username: data.username ?? null,
    })

    console.log("user.created → synced:", data.id)
  }

  // ——————————————— USER.UPDATED ———————————————
  else if (type === "user.updated") {
    const email_address = data.email_addresses?.[0]?.email_address || null

    await updateUser({
      id: data.id,
      first_name: data.first_name ?? null,
      last_name: data.last_name ?? null,
      email_address,
      image_url: data.image_url ?? null,
      username: data.username ?? null,
    })

    console.log("user.updated → synced:", data.id)
  }

  // ——————————————— USER.DELETED ———————————————
  else if (type === "user.deleted") {
    if (data.id) {
      await deleteUser(data.id)
      console.log("user.deleted → removed from DB:", data.id)
    } else {
      console.log("user.deleted received but no ID — already gone")
    }
  }

  return new Response("OK", { status: 200 })
}