import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, X } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import classNames from 'classnames';
import ImageComponent from './ImageComponent';

interface DragDropImageUploaderProps {
  images: (File | string)[];
  onImagesChange: (images: (File | string)[]) => void;
  maxImages?: number;
  className?: string;
}

interface SortableImageProps {
  image: File | string;
  index: number;
  onRemove: () => void;
}

function SortableImage({ image, index, onRemove }: SortableImageProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: typeof image === 'string' ? image : image.name });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
  };

  const imageUrl = typeof image === 'string' ? image : URL.createObjectURL(image);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={classNames(
        "relative aspect-square rounded-lg overflow-hidden bg-gray-100",
        isDragging && "shadow-lg"
      )}
    >
      <ImageComponent
        src={imageUrl}
        alt={`Image ${index + 1}`}
        className="w-full h-full object-cover"
      />
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-1 right-1 p-1.5 bg-white/90 rounded-full hover:bg-white transition-colors"
        aria-label="Remove image"
      >
        <X className="h-4 w-4 text-gray-600" />
      </button>
      {index === 0 && (
        <span className="absolute bottom-1 left-1 px-2 py-0.5 bg-black/50 text-white text-xs rounded">
          Cover
        </span>
      )}
    </div>
  );
}

function DragDropImageUploader({
  images,
  onImagesChange,
  maxImages = 5,
  className = ''
}: DragDropImageUploaderProps) {
  const { t } = useTranslation();
  const [isDragging, setIsDragging] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    const imageFiles = droppedFiles.filter(file => file.type.startsWith('image/'));

    if (images.length + imageFiles.length > maxImages) {
      toast.error(t('common.maxImagesError', { max: maxImages }));
      return;
    }

    onImagesChange([...images, ...imageFiles]);
  }, [images, maxImages, onImagesChange, t]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);

    if (images.length + selectedFiles.length > maxImages) {
      toast.error(t('common.maxImagesError', { max: maxImages }));
      return;
    }

    onImagesChange([...images, ...selectedFiles]);
    e.target.value = ''; // Reset input
  }, [images, maxImages, onImagesChange, t]);

  const handleRemoveImage = useCallback((index: number) => {
    onImagesChange(images.filter((_, i) => i !== index));
  }, [images, onImagesChange]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = images.findIndex(img => 
        (typeof img === 'string' ? img : img.name) === active.id
      );
      const newIndex = images.findIndex(img => 
        (typeof img === 'string' ? img : img.name) === over.id
      );

      onImagesChange(arrayMove(images, oldIndex, newIndex));
    }
  }, [images, onImagesChange]);

  return (
    <div className={className}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-3 md:grid-cols-5 gap-2 md:gap-4">
          <SortableContext
            items={images.map(img => typeof img === 'string' ? img : img.name)}
            strategy={horizontalListSortingStrategy}
          >
            {images.map((image, index) => (
              <SortableImage
                key={typeof image === 'string' ? image : image.name}
                image={image}
                index={index}
                onRemove={() => handleRemoveImage(index)}
              />
            ))}
          </SortableContext>

          {images.length < maxImages && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={classNames(
                "aspect-square rounded-lg border-2 border-dashed transition-colors",
                isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-500",
                "flex flex-col items-center justify-center cursor-pointer"
              )}
            >
              <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                <Upload className={classNames(
                  "h-6 w-6 transition-colors",
                  isDragging ? "text-blue-500" : "text-gray-400"
                )} />
                <span className={classNames(
                  "mt-2 text-sm transition-colors text-center px-2",
                  isDragging ? "text-blue-500" : "text-gray-500"
                )}>
                  {isDragging ? t('common.dropHere') : t('common.addImage')}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  multiple
                />
              </label>
            </div>
          )}
        </div>
      </DndContext>
      <p className="mt-2 text-sm text-gray-500">
        {t('common.dragDropHelp', { max: maxImages })}
      </p>
    </div>
  );
}

export default DragDropImageUploader;