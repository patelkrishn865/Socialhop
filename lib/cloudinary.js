import cloudinary from 'cloudinary';

cloudinary.v2.config({
    cloud_name: "dbqqg1oae",
    api_key: "949454879438532",
    api_secret: "qn6iHgKwubFhJACa60pJg9jY2is"
})

export const cld = globalThis.cloudinary || cloudinary

if(process.env.NODE_ENV !== "production") globalThis.cloudinary = cld;