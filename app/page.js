// app/page.js
// 여러 데이터셋을 관리하고, 선택된 데이터셋을 DataVisualizer에 전달하는 로직이 추가됩니다.

'use client';

import { useState, useEffect, useCallback } from 'react';
import FileUploader from '../components/FileUploader';
import DataVisualizer from '../components/DataVisualizer';
import { addDataset, loadDatasetList, loadDataset, deleteDataset } from '../lib/localStorageUtils';
import { format, parseISO } from 'date-fns';

export default function HomePage() {
  const [currentDatasetId, setCurrentDatasetId] = useState(null);
  const [currentData, setCurrentData] = useState(null);
  const [datasetList, setDatasetList] = useState([]);
  const [loading, setLoading] = useState(true);

  // 데이터셋 목록 로드
  useEffect(() => {
    const list = loadDatasetList();
    setDatasetList(list);
    setLoading(false);
  }, []);

  // 특정 데이터셋 로드
  const handleLoadDataset = useCallback((id) => {
    const data = loadDataset(id);
    if (data) {
      setCurrentData(data);
      setCurrentDatasetId(id);
    } else {
      alert("선택된 데이터셋을 불러올 수 없습니다.");
      setCurrentData(null);
      setCurrentDatasetId(null);
    }
  }, []);

  // 파일 업로드 및 새 데이터셋 추가
  const handleDataParsed = useCallback((data, fileName) => {
    const newId = addDataset(fileName, data);
    if (newId) {
      const updatedList = loadDatasetList(); // 목록 새로고침
      setDatasetList(updatedList);
      handleLoadDataset(newId); // 새로 추가된 데이터셋 로드
    }
  }, [handleLoadDataset]);

  // 데이터셋 삭제
  const handleDeleteDataset = useCallback((id) => {
    if (window.confirm("정말 이 데이터셋을 삭제하시겠습니까?")) { // 브라우저 confirm 대신 커스텀 모달 사용 권장
      const success = deleteDataset(id);
      if (success) {
        const updatedList = loadDatasetList();
        setDatasetList(updatedList);
        if (currentDatasetId === id) {
          setCurrentData(null);
          setCurrentDatasetId(null);
        }
      } else {
        alert("데이터셋 삭제 중 오류가 발생했습니다.");
      }
    }
  }, [currentDatasetId]);


  if (loading) {
    return <p style={{ textAlign: 'center', padding: '50px' }}>데이터셋 목록을 로딩 중입니다...</p>;
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', maxWidth: '1200px', margin: '50px auto', padding: '30px', backgroundColor: '#e9eff6', borderRadius: '12px', boxShadow: '0 8px 20px rgba(0,0,0,0.1)' }}>
      <h1 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '40px', fontSize: '2.5em', fontWeight: 'bold' }}>데이터 시각화 대시보드</h1>

      <FileUploader onDataParsed={handleDataParsed} />

      {/* --- 저장된 데이터셋 목록 --- */}
      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
        <h2 style={{ color: '#34495e', marginBottom: '20px', borderBottom: '1px solid #ecf0f1', paddingBottom: '10px' }}>저장된 데이터셋 ({datasetList.length}개)</h2>
        {datasetList.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#7f8c8d' }}>저장된 데이터셋이 없습니다. 파일을 업로드하여 시작해주세요.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {datasetList.map(dataset => (
              <li key={dataset.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px dashed #ecf0f1' }}>
                <span style={{ fontWeight: dataset.id === currentDatasetId ? 'bold' : 'normal', color: dataset.id === currentDatasetId ? '#2980b9' : '#34495e' }}>
                  {dataset.name} ({format(parseISO(dataset.timestamp), 'yyyy-MM-dd HH:mm')}) - {((dataset.size || 0) / 1024).toFixed(2)} KB
                </span>
                <div>
                  <button
                    onClick={() => handleLoadDataset(dataset.id)}
                    style={{ padding: '8px 15px', marginRight: '10px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', transition: 'background-color 0.2s' }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2980b9'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3498db'}
                  >
                    불러오기
                  </button>
                  <button
                    onClick={() => handleDeleteDataset(dataset.id)}
                    style={{ padding: '8px 15px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', transition: 'background-color 0.2s' }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#c0392b'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#e74c3c'}
                  >
                    삭제
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* --- 데이터 시각화 영역 --- */}
      {currentData && (
        <div style={{ marginTop: '40px', backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
          <DataVisualizer data={currentData} datasetId={currentDatasetId} />
        </div>
      )}

      {!currentData && !loading && datasetList.length > 0 && (
        <p style={{ textAlign: 'center', color: '#7f8c8d', marginTop: '40px' }}>
          저장된 데이터셋을 선택하거나 새로운 파일을 업로드하여 시각화를 시작하세요.
        </p>
      )}

      <div style={{ marginTop: '0px', borderTop: '1px solid #ecf0f1', paddingTop: '20px', fontSize: '0.8em', color: '#666', textAlign: 'center' }}>
        <p>
          <span style={{ fontWeight: 'bold', color: '#e67e22' }}>데이터 프라이버시 알림:</span> 이 서비스는 사용자의 데이터를 서버나 데이터베이스에 저장하지 않습니다.
          <br />모든 데이터 처리 및 저장은 사용자의 브라우저 로컬 스토리지에서 이루어집니다.
          <br />(브라우저 캐시를 지우거나, 다른 브라우저/기기를 사용하면 데이터가 사라질 수 있습니다.)
        </p>
        <p style={{ fontSize: '0.8em', color: '#95a5a6', marginTop: '10px' }}>
          <span style={{ fontWeight: 'bold' }}>보안 참고:</span> 업로드된 데이터는 JavaScript 객체로 파싱되어 차트 라이브러리에 전달되며, 직접적인 HTML 스크립트 실행 위험은 낮습니다. 하지만 일반적인 웹 개발 시, 사용자로부터 직접 입력받은 문자열을 HTML로 렌더링할 경우 XSS 공격 방지를 위해 반드시 콘텐츠 살균 처리를 해야 합니다.
        </p>
      </div>
    </div>
  );
}