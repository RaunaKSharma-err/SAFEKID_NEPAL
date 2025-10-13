import axios from "axios";
import { Alert } from "react-native";
import config from "react-native-config";

const CLOUDINARY_URL = config.CLOUDINARY_URL;
const UPLOAD_PRESET = config.CLOUDINARY_PRESET;
const BITLY_TOKEN = config.BITLY_API_KEY;

// Upload to Cloudinary
export const uploadToCloudinary = async (imageUri: string) => {
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

  return res.data.secure_url;
};

// Shorten URL using Bitly
export const shortenURL = async (longUrl: string) => {
  const res = await axios.post(
    "https://api-ssl.bitly.com/v4/shorten",
    { long_url: longUrl },
    {
      headers: {
        Authorization: `Bearer ${BITLY_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );
  return res.data.link;
};

// Main upload handler
export const handleUpload = async (image: string) => {
  try {
    const cloudUrl = await uploadToCloudinary(image);
    const shortUrl = await shortenURL(cloudUrl);
    Alert.alert("Success", `Image uploaded & saved!\nShort URL: ${shortUrl}`);
  } catch (error) {
    console.error(error);
    Alert.alert("Error", "Something went wrong during upload");
  }
};
