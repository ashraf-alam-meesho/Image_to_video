import axios from "axios";

export const uploadImageToCloudinary = (image: File[]) => {
    axios
        .post("https://api.cloudinary.com/v1_1/demo/image/upload", image)
        .then(() => {
            console.log("Images uploaded successfully");
        })
        .catch((err) => console.error(err));
};
