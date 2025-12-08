'use server'

import { cld } from "@/lib/cloudinary"

export const uploadFile = async (file, folder) => {
    try {
        const res = cld.v2.uploader.upload(file, {
            folder: `socialhop/${folder}`, resource_type: "auto"
        },
        (error, result) => {
            if(error) {
                console.log("Error while uploading");
            } else {
                console.log("File uploaded")
                return result
             }
        }
    )

    return res;
    } catch (e) {
        console.log(e)
        return {
            error: "Failed to upload"
        }
    }
}

export const deleteFile = async (public_id) => {
    try {
        const res = cld.v2.uploader.destroy(public_id, (error, result) => {
            if(error) {
                console.log("Error while deleting asset", public_id)
            } else {
                console.log("Asset deleted successfully")
                return;
            }
        })
    } catch (e) {
        console.log(e)
        return {
            error: "Failed to delete"
        }
    }
}