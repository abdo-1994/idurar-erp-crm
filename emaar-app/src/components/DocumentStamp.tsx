interface DocumentStampProps {
  documentName: string;
}

export default function DocumentStamp({ documentName }: DocumentStampProps) {
  const currentDateTime = new Date().toLocaleString('ar-EG');

  return (
    <div className="hidden print:block border-t border-gray-300 pt-3 mt-8 text-center text-xs text-gray-400">
      وثيقة رسمية — {documentName} · شركة إعمار ريدي ميكس للخرسانة الجاهزة
      · نظام Onyx Pro المالي · صدرت في {currentDateTime}
    </div>
  );
}
