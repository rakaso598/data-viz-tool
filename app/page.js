// app/page.js
'use client'; // 클라이언트 컴포넌트로 지정

import { useState, useEffect, useCallback } from 'react';
import FileUploader from '@/components/FileUploader';
import DataVisualizer from '@/components/DataVisualizer';
import { saveDataToLocalStorage, loadDataFromLocalStorage, clearDataFromLocalStorage } from '@/lib/dataStorage';

export default function HomePage() {
  const [uploadedData, setUploadedData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 컴포넌트 마운트 시 로컬 스토리지에서 데이터 로드 시도
  useEffect(() => {
    const storedData = loadDataFromLocalStorage();
    if (storedData) {
      setUploadedData(storedData);
    }
    setLoading(false);
  }, []);

  // 파일 업로드 및 파싱 완료 시 호출될 콜백 함수
  const handleDataParsed = useCallback((data) => {
    setUploadedData(data);
    saveDataToLocalStorage(data); // 파싱된 데이터를 로컬 스토리지에 저장
  }, []);

  // 로컬 스토리지 데이터 삭제
  const handleClearData = useCallback(() => {
    clearDataFromLocalStorage();
    setUploadedData(null);
    alert("저장된 데이터가 삭제되었습니다.");
  }, []);

  if (loading) {
    return <p>데이터를 로딩 중입니다...</p>;
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '1000px', margin: '50px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>데이터 시각화 도구 (데이터 비저장)</h1>

      <FileUploader onDataParsed={handleDataParsed} />

      {uploadedData && (
        <div style={{ marginTop: '30px' }}>
          <h2 style={{ color: '#555' }}>시각화 결과</h2>
          <DataVisualizer data={uploadedData} />
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button
              onClick={handleClearData}
              style={{ padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
            >
              현재 데이터 삭제 (로컬 스토리지에서)
            </button>
          </div>
        </div>
      )}

      {!uploadedData && !loading && (
        <p style={{ textAlign: 'center', color: '#777' }}>파일을 업로드하면 여기에 데이터가 시각화됩니다.</p>
      )}

      <div style={{ marginTop: '50px', borderTop: '1px solid #eee', paddingTop: '20px', fontSize: '0.9em', color: '#666' }}>
        <p>참고: 이 서비스는 사용자의 데이터를 서버나 데이터베이스에 저장하지 않습니다. 모든 데이터 처리 및 저장은 사용자의 브라우저 로컬 스토리지에서 이루어집니다. 브라우저 캐시를 지우거나, 다른 브라우저/기기를 사용하면 데이터가 사라질 수 있습니다.</p>
      </div>
    </div>
  );
}