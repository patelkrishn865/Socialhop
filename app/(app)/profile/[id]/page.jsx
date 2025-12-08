import ProfileView from "@/sections/Profile/view/ProfileView"
import { notFound } from "next/navigation"


export default async function ProfilePage({ params, searchParams }) {
  const awaitedParams = await params
  const userId = awaitedParams.id

  if (!userId || userId === "undefined" || userId.includes("undefined")) {
    notFound()
  }

  return <ProfileView userId={userId} />
}