"use client";
import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { FaPen, FaTrash } from "react-icons/fa";

interface ImageUploaderProps {
  onUploaded: (file: { url: string; publicId: string } | null) => void;
  folder?: string; // optional, defaults to "user_profiles"
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onUploaded, folder }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadToCloudinary = async (file: File) => {
    const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    if (!preset || !cloudName) {
      setError("Cloudinary config missing (.env)");
      onUploaded(null);
      return;
    }

    // sanitize folder name; fallback
    const folderName = (folder || "user_profiles").replace(/[^a-zA-Z0-9/_-]/g, "_");

    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", preset);
      formData.append("folder", folderName);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Cloudinary upload error:", data);
        setError(data?.error?.message || "Upload failed");
        onUploaded(null);
        return;
      }

      // You get a hosted image (URL) + public_id
      onUploaded({ url: data.secure_url, publicId: data.public_id });
    } catch (err) {
      console.error("Upload failed", err);
      setError("Upload failed");
      onUploaded(null);
    } finally {
      setUploading(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles?.[0];
    if (!file) return;

    // Instant preview
    const previewURL = URL.createObjectURL(file);
    setSelectedImage(previewURL);

    // Upload to Cloudinary
    await uploadToCloudinary(file);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "image/png": [".png"], "image/jpeg": [".jpg", ".jpeg"] },
    multiple: false,
  });

  const handleDelete = () => {
    setSelectedImage(null);
    onUploaded(null);
    setError(null);
  };

  return (
    <div className="img-component-sign">
      {selectedImage ? (
        <div className="img-component-1">
          <div className="img-wrapper" style={{ position: "relative", width: "100%", height: 220 }}>
            <Image
              src={selectedImage}
              alt="Uploaded"
              fill
              className="img-set"
              style={{ objectFit: "cover" }}
              sizes="(max-width: 768px) 100vw, 470px"
            />
          </div>

          <div className="delete-edit-img">
            <div {...getRootProps()} className="edit-container">
              <button type="button" className="edit" disabled={uploading}>
                <FaPen className="icon-edit" />
              </button>
              <input {...getInputProps()} />
            </div>
            <button type="button" onClick={handleDelete} disabled={uploading}>
              <FaTrash className="delete-icon" />
            </button>
          </div>

          {uploading && <p className="mt-2 text-sm">Uploading…</p>}
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </div>
      ) : (
        <div {...getRootProps({ className: "img-component-1" })}>
          <input {...getInputProps()} />
          <p>Click or drag to upload</p>
        </div>
      )}
      <h4 className="input-label">Upload Profile Picture</h4>
    </div>
  );
};

export default ImageUploader;
