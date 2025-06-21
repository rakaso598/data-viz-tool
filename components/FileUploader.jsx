// components/FileUploader.js
'use client'; // 클라이언트 컴포넌트로 지정

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
            onDataParsed(parsedData);
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
          parsedData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }); // 헤더 1로 설정하여 첫 행을 데이터로 처리 (나중에 가공)

          // 첫 행이 헤더인 경우 헤더 추출 및 데이터 정리
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
          onDataParsed(parsedData);
        } catch (error) {
          console.error("XLSX parsing error:", error);
          alert("XLSX 파일 파싱 중 오류가 발생했습니다.");
        }
      } else {
        alert("지원하지 않는 파일 형식입니다. CSV 또는 XLSX 파일을 업로드해주세요.");
      }
    };

    if (file.name.endsWith('.csv')) {
      reader.readAsText(file); // CSV는 텍스트로 읽기
    } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      reader.readAsArrayBuffer(file); // XLSX는 ArrayBuffer로 읽기
    }
  }, [onDataParsed]);

  return (
    <div style={{ marginBottom: '20px' }}>
      <input
        type="file"
        accept=".csv, .xlsx, .xls"
        onChange={handleFileChange}
      />
      <p>CSV 또는 XLSX 파일을 업로드해주세요.</p>
    </div>
  );
}