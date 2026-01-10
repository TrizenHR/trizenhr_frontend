'use client';

import { useState, useRef } from 'react';
import { Upload, Download, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { holidayApi } from '@/lib/api';
import { parseHolidayCSV, generateHolidayTemplate, ParsedHoliday } from '@/lib/csv-parser';
import { HolidayType } from '@/lib/types';
import { format } from 'date-fns';

interface BulkUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function BulkUploadDialog({
  open,
  onOpenChange,
  onSuccess,
}: BulkUploadDialogProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsedHolidays, setParsedHolidays] = useState<ParsedHoliday[]>([]);
  const [parseErrors, setParseErrors] = useState<Array<{ row: number; error: string }>>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    successful: number;
    failed: number;
    errors: Array<{ row: number; error: string }>;
  } | null>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.csv')) {
      toast({
        title: 'Invalid File',
        description: 'Please upload a CSV file',
        variant: 'destructive',
      });
      return;
    }

    // Read file
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const result = parseHolidayCSV(content);
      setParsedHolidays(result.holidays);
      setParseErrors(result.errors);
      setUploadResult(null);

      if (result.errors.length > 0) {
        toast({
          title: 'Parsing Errors',
          description: `Found ${result.errors.length} error(s) in the CSV file. Please review and fix them.`,
          variant: 'destructive',
        });
      } else if (result.holidays.length === 0) {
        toast({
          title: 'No Data',
          description: 'No valid holidays found in the CSV file',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'File Parsed',
          description: `Successfully parsed ${result.holidays.length} holiday(s)`,
        });
      }
    };

    reader.readAsText(file);
  };

  const handleDownloadTemplate = () => {
    const template = generateHolidayTemplate();
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'holiday-template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'Template Downloaded',
      description: 'Holiday template CSV file has been downloaded',
    });
  };

  const handleUpload = async () => {
    if (parsedHolidays.length === 0) {
      toast({
        title: 'No Data',
        description: 'Please upload a valid CSV file first',
        variant: 'destructive',
      });
      return;
    }

    if (parseErrors.length > 0) {
      toast({
        title: 'Validation Errors',
        description: 'Please fix all errors before uploading',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsUploading(true);
      const result = await holidayApi.bulkCreate(parsedHolidays);
      setUploadResult({
        successful: result.summary.successful,
        failed: result.summary.failed,
        errors: result.errors,
      });

      if (result.summary.successful > 0) {
        toast({
          title: 'Success',
          description: `Successfully created ${result.summary.successful} holiday(s)`,
        });
        onSuccess();
      }

      if (result.summary.failed > 0) {
        toast({
          title: 'Partial Success',
          description: `${result.summary.failed} holiday(s) failed to create. Check errors below.`,
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Upload Failed',
        description: error.response?.data?.error || 'Failed to upload holidays',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setParsedHolidays([]);
    setParseErrors([]);
    setUploadResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onOpenChange(false);
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      national: 'bg-red-100 text-red-800',
      company: 'bg-blue-100 text-blue-800',
      optional: 'bg-yellow-100 text-yellow-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Upload Holidays</DialogTitle>
          <DialogDescription>
            Upload a CSV file to create multiple holidays at once
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Instructions:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
              <li>Download the template CSV file</li>
              <li>Fill in the holiday details (Date format: YYYY-MM-DD)</li>
              <li>Upload the CSV file</li>
              <li>Review the preview and fix any errors</li>
              <li>Click "Upload Holidays" to import</li>
            </ol>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDownloadTemplate}>
              <Download className="mr-2 h-4 w-4" />
              Download Template
            </Button>
            <div className="flex-1">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
                id="csv-upload"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                Choose CSV File
              </Button>
            </div>
          </div>

          {/* Parse Errors */}
          {parseErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <h4 className="font-semibold text-red-900">
                  Validation Errors ({parseErrors.length})
                </h4>
              </div>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {parseErrors.map((error, index) => (
                  <p key={index} className="text-sm text-red-800">
                    Row {error.row}: {error.error}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Preview Table */}
          {parsedHolidays.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">
                  Preview ({parsedHolidays.length} holiday(s))
                </h4>
                {parseErrors.length === 0 && (
                  <Badge variant="outline" className="bg-green-50 text-green-800">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Ready to upload
                  </Badge>
                )}
              </div>
              <div className="border rounded-lg max-h-64 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Recurring</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedHolidays.map((holiday, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {format(new Date(holiday.date), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell className="font-medium">{holiday.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getTypeColor(holiday.type)}>
                            {holiday.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {holiday.description || '-'}
                        </TableCell>
                        <TableCell>
                          {holiday.isRecurring ? (
                            <Badge variant="secondary">Yes</Badge>
                          ) : (
                            <span className="text-muted-foreground">No</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Upload Result */}
          {uploadResult && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Upload Results:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>Successfully created: {uploadResult.successful} holiday(s)</span>
                </div>
                {uploadResult.failed > 0 && (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span>Failed: {uploadResult.failed} holiday(s)</span>
                  </div>
                )}
                {uploadResult.errors.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {uploadResult.errors.map((error, index) => (
                      <p key={index} className="text-red-600 text-xs">
                        Row {error.row}: {error.error}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isUploading}>
            {uploadResult ? 'Close' : 'Cancel'}
          </Button>
          <Button
            onClick={handleUpload}
            disabled={parsedHolidays.length === 0 || parseErrors.length > 0 || isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Holidays
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
