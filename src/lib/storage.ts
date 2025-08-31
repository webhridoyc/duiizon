import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "./firebase";
import imageCompression from 'browser-image-compression';

const compressImage = async (file: File) => {
    const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
    };
    try {
        const compressedFile = await imageCompression(file, options);
        return compressedFile;
    } catch (error) {
        console.error("Image compression error:", error);
        return file; // Return original file if compression fails
    }
};

export const uploadImage = async (userId: string, file: File, type: 'posts' | 'stories' | 'avatars'): Promise<string> => {
    const compressedFile = await compressImage(file);
    const filePath = `${type}/${userId}/${Date.now()}_${compressedFile.name}`;
    const storageRef = ref(storage, filePath);
    
    await uploadBytes(storageRef, compressedFile);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
};

export const deleteImageByUrl = async (imageUrl: string): Promise<void> => {
    if (!imageUrl.includes('firebase')) return;
    try {
        const storageRef = ref(storage, imageUrl);
        await deleteObject(storageRef);
    } catch (error) {
        console.error("Error deleting image:", error);
    }
};
