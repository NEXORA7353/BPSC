import React, { useState, useRef } from 'react';
import { Upload, X, Copy, Check, Image as ImageIcon, Loader2, Sparkles, ExternalLink } from 'lucide-react';
import { uploadImageToImageKit, ImageKitUploadResult } from '../services/imageKitService';

interface ImageKitUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImageUploaded?: (markdownSnippet: string, result: ImageKitUploadResult) => void;
}

export const ImageKitUploadModal: React.FC<ImageKitUploadModalProps> = ({
  isOpen,
  onClose,
  onImageUploaded
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState('प्रश्न संबंधित आकृति (Diagram)');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<ImageKitUploadResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
      setUploadResult(null);
      const objUrl = URL.createObjectURL(file);
      setPreviewUrl(objUrl);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setError(null);

    try {
      const result = await uploadImageToImageKit(selectedFile);
      setUploadResult(result);
      const markdown = `![${caption || 'प्रश्न आकृति'}](${result.url})`;

      if (onImageUploaded) {
        onImageUploaded(markdown, result);
      }
    } catch (err: any) {
      setError(err?.message || 'इमेज अपलोड करने में त्रुटि हुई। कृपया दोबारा प्रयास करें।');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCopyMarkdown = () => {
    if (!uploadResult) return;
    const snippet = `![${caption || 'प्रश्न आकृति'}](${uploadResult.url})`;
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const resetAll = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-slate-900 dark:text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-lg flex items-center gap-2">
                <span>ImageKit Cloud Uploader</span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  Live CDN Active
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                डायग्राम या PNG अपलोड करें और तुरंत 1-क्लिक में प्रश्न में जोड़ें
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              resetAll();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Upload Zone */}
        {!uploadResult ? (
          <div className="space-y-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-amber-500 dark:hover:border-amber-400 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/30 flex flex-col items-center justify-center space-y-2"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*,.svg"
                className="hidden"
              />
              <Upload className="w-8 h-8 text-amber-500 mb-1" />
              <div className="text-sm font-bold text-slate-700 dark:text-slate-200">
                {selectedFile ? selectedFile.name : 'कंप्यूटर से इमेज चुनें या यहाँ ड्रैग करें'}
              </div>
              <div className="text-xs text-slate-400">
                समर्थित: PNG, JPG, JPEG, SVG, WebP (ImageKit CDN Auto-Optimized)
              </div>
            </div>

            {/* Preview Selected */}
            {previewUrl && (
              <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center gap-3">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-16 h-16 object-contain rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold truncate text-slate-800 dark:text-slate-200">
                    {selectedFile?.name}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {selectedFile ? (selectedFile.size / 1024).toFixed(1) + ' KB' : ''}
                  </div>
                </div>
              </div>
            )}

            {/* Caption Input */}
            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 block">
                आकृति का कैप्शन (Optional Caption)
              </label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="जैसे: वृत्त पर स्पर्श रेखा PT तथा छेदक रेखा PBA"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-amber-400 outline-hidden"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
                {error}
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="w-full py-3 rounded-2xl text-xs sm:text-sm font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>ImageKit CDN पर अपलोड हो रहा है...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Upload to ImageKit Cloud</span>
                </>
              )}
            </button>
          </div>
        ) : (
          /* Success Screen */
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-center space-y-2">
              <Check className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto" />
              <div className="font-black text-sm text-emerald-900 dark:text-emerald-200">
                सफलतापूर्वक ImageKit CDN पर अपलोड हो गया!
              </div>
              <div className="text-xs text-emerald-700 dark:text-emerald-300 truncate">
                {uploadResult.url}
              </div>
            </div>

            {/* Image Preview */}
            <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 flex justify-center">
              <img
                src={uploadResult.url}
                alt="Uploaded"
                className="max-h-44 object-contain rounded-xl shadow-xs"
              />
            </div>

            {/* Ready Markdown Code to Copy */}
            <div className="space-y-1.5">
              <div className="text-xs font-bold text-slate-500">
                प्रश्न में पेस्ट करने का कोड (Markdown Tag):
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 text-amber-300 font-mono text-xs break-all border border-slate-800">
                {`![${caption || 'प्रश्न आकृति'}](${uploadResult.url})`}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCopyMarkdown}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-all flex items-center justify-center gap-1.5"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'कॉपी हो गया (Copied)!' : 'Copy Markdown Snippet'}</span>
              </button>

              <a
                href={uploadResult.url}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-all flex items-center gap-1"
                title="Open CDN Image in New Tab"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={resetAll}
                className="px-3.5 py-2.5 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                Upload Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
