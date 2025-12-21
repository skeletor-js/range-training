import { useRef } from 'react';
import { Camera, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ImagePickerProps {
  onImageSelected: (dataUrl: string, width: number, height: number) => void;
}

export function ImagePicker({ onImageSelected }: ImagePickerProps) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;

      // Create an image to get dimensions
      const img = new window.Image();
      img.onload = () => {
        // Resize if too large (max 2000px on either dimension)
        const maxSize = 2000;
        let width = img.width;
        let height = img.height;

        if (width > maxSize || height > maxSize) {
          const ratio = Math.min(maxSize / width, maxSize / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);

          // Resize using canvas
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const resizedDataUrl = canvas.toDataURL('image/jpeg', 0.9);
            onImageSelected(resizedDataUrl, width, height);
          } else {
            onImageSelected(dataUrl, img.width, img.height);
          }
        } else {
          onImageSelected(dataUrl, width, height);
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);

    // Reset input so the same file can be selected again
    e.target.value = '';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
      <Card className="w-full max-w-sm">
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold text-center mb-2">
            Capture Target
          </h2>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Take a photo of your target or select from gallery. The image will
            not be saved - only shot positions are recorded.
          </p>

          <div className="space-y-3">
            <Button
              className="w-full"
              size="lg"
              onClick={() => cameraInputRef.current?.click()}
            >
              <Camera className="h-5 w-5 mr-2" />
              Take Photo
            </Button>

            <Button
              variant="outline"
              className="w-full"
              size="lg"
              onClick={() => galleryInputRef.current?.click()}
            >
              <ImageIcon className="h-5 w-5 mr-2" />
              Choose from Gallery
            </Button>
          </div>

          {/* Hidden file inputs */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </CardContent>
      </Card>
    </div>
  );
}
