import { useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Papa from "papaparse";
import { Download, Upload, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";

function downloadTemplate() {
  const csv = `bank_name,url\nExample Bank,https://www.examplebank.com\nFirst Credit Union,https://www.firstcu.org\n`;
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "banktech_template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function CsvUploadSection() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(
    (file) => {
      if (!file) return;
      setError(null);

      if (!file.name.endsWith(".csv")) {
        setError("Please upload a .csv file.");
        return;
      }

      setFileName(file.name);

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete(results) {
          const fields = results.meta.fields || [];
          if (!fields.includes("url")) {
            setError(
              'CSV must contain a "url" column. Download the template for the expected format.',
            );
            setFileName(null);
            return;
          }

          const rows = results.data
            .filter((row) => row.url && row.url.trim())
            .map((row) => ({
              bank_name: row.bank_name?.trim() || "",
              url: row.url.trim(),
            }));

          if (rows.length === 0) {
            setError("CSV contains no rows with a valid URL.");
            setFileName(null);
            return;
          }

          navigate("/bulk", { state: { rows } });
        },
        error() {
          setError("Failed to parse CSV file.");
          setFileName(null);
        },
      });
    },
    [navigate],
  );

  function onFileChange(e) {
    handleFile(e.target.files?.[0]);
    e.target.value = "";
  }

  function onDrop(e) {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files?.[0]);
  }

  function onDragOver(e) {
    e.preventDefault();
    setDragOver(true);
  }

  function onDragLeave(e) {
    e.preventDefault();
    setDragOver(false);
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-primary">
          Bulk Lookup via CSV
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Upload a list of bank URLs to run in batch.
        </p>
      </div>

      <Button
        variant="outline"
        onClick={downloadTemplate}
        className="gap-2 text-gray-700 border-gray-300 hover:bg-gray-50"
      >
        <Download className="h-4 w-4" />
        Download Template
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={onFileChange}
        className="hidden"
      />

      <div
        role="button"
        tabIndex={0}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
        }}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`rounded-lg border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
          dragOver
            ? "border-emerald-400 bg-emerald-50"
            : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
        }`}
      >
        {fileName ? (
          <>
            <FileSpreadsheet className="mx-auto h-8 w-8 text-emerald-600 mb-2" />
            <p className="text-sm font-medium text-gray-700">{fileName}</p>
            <p className="text-xs text-gray-400 mt-1">
              Click or drop another file to replace
            </p>
          </>
        ) : (
          <>
            <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">
              <span className="font-medium text-emerald-700">
                Click to upload
              </span>{" "}
              or drag & drop a CSV file
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Must contain a "url" column
            </p>
          </>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
          {error}
        </p>
      )}
    </div>
  );
}
