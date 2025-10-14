import axios from "axios";
import { Alert } from "react-native";
import config from "react-native-config";

const CLOUDINARY_URL = config.CLOUDINARY_URL || "";
const UPLOAD_PRESET = config.CLOUDINARY_PRESET || "";
const BITLY_TOKEN = config.BITLY_API_KEY;

console.log(CLOUDINARY_URL, UPLOAD_PRESET, BITLY_TOKEN);

// Upload to Cloudinary
export const uploadToCloudinary = async (imageUri: string) => {
  try {
    const data = new FormData();
    const file = {
      uri: imageUri,
      type: "image/jpeg",
      name: "upload.jpg",
    } as any;

    data.append("file", file);
    data.append("upload_preset", UPLOAD_PRESET);

    const res = await axios.post(CLOUDINARY_URL, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    console.log("cloudinary url:", res.data.secure_url);

    return res.data.secure_url;
  } catch (error: any) {
    console.log("Error in uploading to cloudinary", error);
  }
};

// Shorten URL using Bitly
export const shortenURL = async (longUrl: string) => {
  try {
    const res = await axios.post(
      "https://api-ssl.bitly.com/v4/shorten",
      { long_url: longUrl },
      {
        headers: {
          Authorization: `${BITLY_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("bitly url:", res.data.link);

    return res.data.link;
  } catch (error: any) {
    console.log("Error in shortening the url", error);
  }
};

// Main upload handler
export const handleUpload = async (image: string) => {
  try {
    const cloudUrl = await uploadToCloudinary(image);
    const shortUrl = await shortenURL(cloudUrl);
    console.log("photo upload successful", shortUrl);
    return shortUrl;
  } catch (error) {
    console.error(error);
    Alert.alert("Error", "Something went wrong during upload");
  }
};
