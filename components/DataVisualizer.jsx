// components/DataVisualizer.js
'use client'; // 클라이언트 컴포넌트로 지정

import React, { useEffect, useState, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement, // 라인 차트용
  LineElement // 라인 차트용
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2'; // Bar와 Line 차트 모두 사용 가능하도록 임포트

// Chart.js 필수 스케일 및 요소 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
);

// 데이터 값의 타입을 추론하는 헬퍼 함수
const inferColumnType = (data, column) => {
  if (!data || data.length === 0 || !column) return 'unknown';

  let isNumeric = true;
  let isDate = true;

  for (let i = 0; i < Math.min(data.length, 100); i++) { // 샘플 100개만 확인
    const value = data[i][column];
    if (value === undefined || value === null || value === '') continue;

    // 숫자 타입 체크
    if (isNaN(parseFloat(value)) || !isFinite(value)) {
      isNumeric = false;
    }

    // 날짜 타입 체크 (간단한 ISO 8601 또는 일반 날짜 문자열)
    if (isNaN(new Date(value).getTime())) {
      isDate = false;
    }
    if (!isNumeric && !isDate) break; // 둘 다 아니면 더 이상 체크할 필요 없음
  }

  if (isNumeric) return 'numeric';
  if (isDate) return 'date';
  return 'categorical'; // 숫자도 날짜도 아니면 범주형
};


export default function DataVisualizer({ data }) {
  const [chartData, setChartData] = useState(null);
  const [chartOptions, setChartOptions] = useState(null);
  const [availableColumns, setAvailableColumns] = useState([]); // 모든 컬럼
  const [xAxisColumn, setXAxisColumn] = useState(''); // X축 라벨용 컬럼
  const [yAxisColumn, setYAxisColumn] = useState(''); // Y축 값용 컬럼
  const [chartType, setChartType] = useState('bar'); // 기본 차트 타입: bar, line

  // 1. 데이터가 로드되거나 변경될 때 컬럼들을 추출하고 타입 추론
  useEffect(() => {
    if (data && data.length > 0) {
      const firstRow = data[0];
      const columns = Object.keys(firstRow).map(col => ({
        name: col,
        type: inferColumnType(data, col)
      }));
      setAvailableColumns(columns);

      // 초기 X축/Y축 컬럼 자동 선택 (최대한 합리적으로)
      if (!xAxisColumn && !yAxisColumn) {
        const initialX = columns.find(c => c.type === 'categorical' || c.type === 'date')?.name || columns[0]?.name;
        const initialY = columns.find(c => c.type === 'numeric')?.name || columns[1]?.name;
        setXAxisColumn(initialX || '');
        setYAxisColumn(initialY || '');
      }
    } else {
      setAvailableColumns([]);
      setXAxisColumn('');
      setYAxisColumn('');
      setChartData(null);
      setChartOptions(null);
    }
  }, [data]);

  // 2. X축, Y축, 차트 타입 선택이 변경될 때 차트 데이터 업데이트
  useEffect(() => {
    if (data && data.length > 0 && xAxisColumn && yAxisColumn) {
      // Y축 컬럼이 숫자 타입이 아니면 차트 그리지 않음
      const yAxisColType = availableColumns.find(c => c.name === yAxisColumn)?.type;
      if (yAxisColType !== 'numeric') {
        setChartData(null);
        setChartOptions(null);
        return;
      }

      // 1. 라벨 생성: X축 컬럼 데이터 사용
      const labels = data.map(row => {
        const val = row[xAxisColumn];
        // X축이 날짜 타입이면 날짜 형식으로 변환 시도
        const xColType = availableColumns.find(c => c.name === xAxisColumn)?.type;
        if (xColType === 'date') {
          const dateObj = new Date(val);
          if (!isNaN(dateObj.getTime())) {
            return dateObj.toLocaleDateString(); // 또는 dateObj.toISOString().split('T')[0]
          }
        }
        return String(val); // 기본적으로 문자열로 변환
      });

      // 2. 값 생성: Y축 컬럼 데이터 사용 (숫자 변환)
      const values = data.map(row => {
        const value = row[yAxisColumn];
        return !isNaN(parseFloat(value)) && isFinite(value) ? parseFloat(value) : 0;
      });

      setChartData({
        labels,
        datasets: [
          {
            label: `${yAxisColumn} (${xAxisColumn} 기준)`, // 선택된 컬럼명으로 라벨 변경
            data: values,
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
            // 라인 차트용 설정
            tension: 0.1, // 라인 차트의 부드러움
            fill: false // 라인 차트 아래 영역 채우기
          },
        ],
      });

      setChartOptions({
        responsive: true,
        maintainAspectRatio: false, // 컨테이너에 맞춰 크기 조절
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: `데이터 시각화: ${yAxisColumn} vs ${xAxisColumn} (${chartType === 'bar' ? '막대' : '선'})`, // 제목에도 컬럼명 반영
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: xAxisColumn, // X축 제목
            },
            // 날짜 타입인 경우 Timescale 설정 가능 (Chart.js adapter 필요)
            // type: availableColumns.find(c => c.name === xAxisColumn)?.type === 'date' ? 'time' : 'category',
            // time: { unit: 'day' }
          },
          y: {
            title: {
              display: true,
              text: yAxisColumn, // Y축 제목
            },
            beginAtZero: true,
          }
        }
      });
    } else {
      setChartData(null);
      setChartOptions(null);
    }
  }, [data, xAxisColumn, yAxisColumn, chartType, availableColumns]); // 종속성 추가

  const handleXAxisColumnChange = (event) => {
    setXAxisColumn(event.target.value);
  };

  const handleYAxisColumnChange = (event) => {
    setYAxisColumn(event.target.value);
  };

  const handleChartTypeChange = (event) => {
    setChartType(event.target.value);
  };

  if (!data || data.length === 0) {
    return <p>업로드된 데이터가 없습니다. 파일을 업로드해주세요.</p>;
  }

  const numericColumns = availableColumns.filter(col => col.type === 'numeric');
  const nonNumericColumns = availableColumns.filter(col => col.type !== 'numeric'); // X축 라벨용 (날짜, 범주형)

  return (
    <div style={{ width: '100%', maxWidth: '900px', margin: '0 auto', padding: '20px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
      <div style={{ marginBottom: '30px', display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
        <div>
          <label htmlFor="x-axis-select" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>X축 (라벨):</label>
          <select id="x-axis-select" value={xAxisColumn} onChange={handleXAxisColumnChange}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', minWidth: '150px' }}>
            {nonNumericColumns.length > 0 ? (
              nonNumericColumns.map(col => <option key={col.name} value={col.name}>{col.name} ({col.type === 'date' ? '날짜' : '텍스트'})</option>)
            ) : (
              availableColumns.map(col => <option key={col.name} value={col.name}>{col.name} (모든 타입)</option>)
            )}
          </select>
        </div>

        <div>
          <label htmlFor="y-axis-select" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Y축 (값):</label>
          <select id="y-axis-select" value={yAxisColumn} onChange={handleYAxisColumnChange}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', minWidth: '150px' }}>
            {numericColumns.length > 0 ? (
              numericColumns.map(col => <option key={col.name} value={col.name}>{col.name} (숫자)</option>)
            ) : (
              <option value="">(숫자 컬럼 없음)</option>
            )}
          </select>
        </div>

        <div>
          <label htmlFor="chart-type-select" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>차트 종류:</label>
          <select id="chart-type-select" value={chartType} onChange={handleChartTypeChange}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', minWidth: '100px' }}>
            <option value="bar">막대 차트</option>
            <option value="line">선 차트</option>
            {/* 파이 차트 등 다른 차트 추가 가능 */}
          </select>
        </div>
      </div>

      {chartData && chartOptions && yAxisColumn ? (
        <div style={{ height: '400px' }}> {/* 차트 높이 지정 */}
          {chartType === 'bar' && <Bar data={chartData} options={chartOptions} />}
          {chartType === 'line' && <Line data={chartData} options={chartOptions} />}
        </div>
      ) : (
        <p style={{ textAlign: 'center', color: '#888', padding: '50px' }}>
          차트를 표시하려면 X축 (라벨)과 Y축 (값) 컬럼을 모두 선택해주세요.
          <br />
          Y축은 숫자 타입의 컬럼이어야 합니다.
        </p>
      )}
    </div>
  );
}