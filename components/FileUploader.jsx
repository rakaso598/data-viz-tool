// components/FileUploader.js
// 파일 파싱 후 onDataParsed 콜백에 파일 이름도 함께 전달합니다.

'use client';

import React, { useCallback } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export default function FileUploader({ onDataParsed }) {
  const handleFileChange = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      const data = e.target.result;
      let parsedData = [];

      if (file.name.endsWith('.csv')) {
        Papa.parse(data, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            parsedData = results.data;
            onDataParsed(parsedData, file.name); // 파일 이름 추가 전달
          },
          error: (error) => {
            console.error("CSV parsing error:", error);
            alert("CSV 파일 파싱 중 오류가 발생했습니다.");
          }
        });
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        try {
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0]; // 첫 번째 시트 사용
          const worksheet = workbook.Sheets[sheetName];
          parsedData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          if (parsedData.length > 0) {
            const headers = parsedData[0];
            const dataRows = parsedData.slice(1);
            parsedData = dataRows.map(row => {
              const obj = {};
              headers.forEach((header, index) => {
                obj[header] = row[index];
              });
              return obj;
            });
          }
          onDataParsed(parsedData, file.name); // 파일 이름 추가 전달
        } catch (error) {
          console.error("XLSX parsing error:", error);
          alert("XLSX 파일 파싱 중 오류가 발생했습니다.");
        }
      } else {
        alert("지원하지 않는 파일 형식입니다. CSV 또는 XLSX 파일을 업로드해주세요.");
      }
    };

    if (file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      reader.readAsArrayBuffer(file);
    }
  }, [onDataParsed]);

  return (
    <div style={{ marginBottom: '20px', padding: '15px', border: '2px dashed #ccc', borderRadius: '8px', textAlign: 'center' }}>
      <label htmlFor="file-upload" style={{ display: 'block', marginBottom: '10px', fontSize: '1.1em', fontWeight: 'bold' }}>
        데이터 파일 업로드
      </label>
      <input
        id="file-upload"
        type="file"
        accept=".csv, .xlsx, .xls"
        onChange={handleFileChange}
        style={{ padding: '8px', border: '2px solid #666', borderRadius: '4px' }}
      />
      <p style={{ marginTop: '10px', color: '#666' }}>위 버튼을 클릭하여 CSV 또는 XLSX 파일을 선택해주세요.</p>
    </div>
  );
}