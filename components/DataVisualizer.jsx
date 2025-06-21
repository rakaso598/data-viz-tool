// components/DataVisualizer.js
// 모든 새로운 기능이 이 컴포넌트에 통합됩니다.

'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  TimeScale,
  ScatterController // 산점도용 컨트롤러
} from 'chart.js';
import { Bar, Line, Scatter } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import ChartDataLabels from 'chartjs-plugin-datalabels'; // 데이터 라벨 플러그인

import { parseISO, format, isValid, isDate } from 'date-fns';
import { inferColumnType, calculateDescriptiveStatistics, calculateCorrelation, groupAndAggregateData } from '../lib/dataUtils';
import { saveChartSettings, loadChartSettings } from '../lib/localStorageUtils'; // 차트 설정 로드/저장

// Chart.js 필수 스케일 및 요소 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  TimeScale,
  ScatterController, // 산점도 컨트롤러 등록
  ChartDataLabels // 데이터 라벨 플러그인 등록
);

export default function DataVisualizer({ data, datasetId }) {
  const [chartData, setChartData] = useState(null);
  const [chartOptions, setChartOptions] = useState(null);
  const [availableColumns, setAvailableColumns] = useState([]);
  const [xAxisColumn, setXAxisColumn] = useState('');
  const [yAxisColumn, setYAxisColumn] = useState('');
  const [chartType, setChartType] = useState('bar'); // bar, line, scatter
  const [stats, setStats] = useState(null); // 기술 통계량
  const [correlation, setCorrelation] = useState(null); // 상관계수 (산점도용)

  // Customization states
  const [customTitle, setCustomTitle] = useState('');
  const [customXAxisTitle, setCustomXAxisTitle] = useState('');
  const [customYAxisTitle, setCustomYAxisTitle] = useState('');
  const [chartColor, setChartColor] = useState('#4BC0C0'); // 기본 색상
  const [showDataLabels, setShowDataLabels] = useState(false); // 데이터 라벨 표시 여부

  // Grouping/Aggregation states
  const [groupByColumn, setGroupByColumn] = useState('');
  const [aggregateType, setAggregateType] = useState('sum'); // sum, mean, count
  const [isGroupedMode, setIsGroupedMode] = useState(false); // 그룹화 모드 활성화 여부

  // Filtering states
  const [filterColumn, setFilterColumn] = useState('');
  const [filterValue, setFilterValue] = useState('');
  const [filteredData, setFilteredData] = useState(data);

  // Initial data filtering
  useEffect(() => {
    let currentFilteredData = data;
    if (filterColumn && filterValue) {
      currentFilteredData = data.filter(row =>
        String(row[filterColumn]).toLowerCase().includes(String(filterValue).toLowerCase())
      );
    }
    setFilteredData(currentFilteredData);
  }, [data, filterColumn, filterValue]);

  // Load settings from Local Storage when datasetId changes
  useEffect(() => {
    if (datasetId) {
      const storedSettings = loadChartSettings(datasetId);
      if (storedSettings) {
        setXAxisColumn(storedSettings.xAxisColumn || '');
        setYAxisColumn(storedSettings.yAxisColumn || '');
        setChartType(storedSettings.chartType || 'bar');
        setCustomTitle(storedSettings.customTitle || '');
        setCustomXAxisTitle(storedSettings.customXAxisTitle || '');
        setCustomYAxisTitle(storedSettings.customYAxisTitle || '');
        setChartColor(storedSettings.chartColor || '#4BC0C0');
        setShowDataLabels(storedSettings.showDataLabels || false);
        setGroupByColumn(storedSettings.groupByColumn || '');
        setAggregateType(storedSettings.aggregateType || 'sum');
        setIsGroupedMode(storedSettings.isGroupedMode || false);
        setFilterColumn(storedSettings.filterColumn || '');
        setFilterValue(storedSettings.filterValue || '');
      }
    } else {
      // Reset settings when no dataset is selected
      setXAxisColumn('');
      setYAxisColumn('');
      setChartType('bar');
      setCustomTitle('');
      setCustomXAxisTitle('');
      setCustomYAxisTitle('');
      setChartColor('#4BC0C0');
      setShowDataLabels(false);
      setGroupByColumn('');
      setAggregateType('sum');
      setIsGroupedMode(false);
      setFilterColumn('');
      setFilterValue('');
    }
  }, [datasetId]);

  // Save settings to Local Storage when relevant states change
  useEffect(() => {
    if (datasetId && filteredData) { // Only save if a dataset is loaded
      const settingsToSave = {
        xAxisColumn, yAxisColumn, chartType, customTitle, customXAxisTitle,
        customYAxisTitle, chartColor, showDataLabels, groupByColumn,
        aggregateType, isGroupedMode, filterColumn, filterValue
      };
      saveChartSettings(datasetId, settingsToSave);
    }
  }, [datasetId, xAxisColumn, yAxisColumn, chartType, customTitle, customXAxisTitle,
    customYAxisTitle, chartColor, showDataLabels, groupByColumn, aggregateType,
    isGroupedMode, filterColumn, filterValue, filteredData]);


  // 1. 데이터가 로드되거나 변경될 때 컬럼들을 추출하고 타입 추론
  useEffect(() => {
    if (data && data.length > 0) {
      const firstRow = data[0];
      const columns = Object.keys(firstRow).map(col => ({
        name: col,
        type: inferColumnType(data, col)
      }));
      setAvailableColumns(columns);

      // 초기 X축/Y축 컬럼 자동 선택 (기존 로직 유지)
      if (!xAxisColumn && !yAxisColumn) {
        const initialX = columns.find(c => c.type === 'date')?.name ||
          columns.find(c => c.type === 'categorical')?.name ||
          columns[0]?.name;
        const initialY = columns.find(c => c.type === 'numeric')?.name || columns[1]?.name;
        setXAxisColumn(initialX || '');
        setYAxisColumn(initialY || '');
      }
      // Set initial group by column if exists and not set
      if (!groupByColumn && columns.some(c => c.type === 'categorical')) {
        setGroupByColumn(columns.find(c => c.type === 'categorical')?.name || '');
      }
      // Set initial filter column if exists and not set
      if (!filterColumn && columns.length > 0) {
        setFilterColumn(columns[0]?.name || '');
      }

    } else {
      setAvailableColumns([]);
      setXAxisColumn('');
      setYAxisColumn('');
      setChartData(null);
      setChartOptions(null);
      setStats(null);
      setCorrelation(null);
      setCustomTitle('');
      setCustomXAxisTitle('');
      setCustomYAxisTitle('');
      setChartColor('#4BC0C0');
      setShowDataLabels(false);
      setGroupByColumn('');
      setAggregateType('sum');
      setIsGroupedMode(false);
      setFilterColumn('');
      setFilterValue('');
      setFilteredData([]);
    }
  }, [data]); // Removed xAxisColumn, yAxisColumn from dependencies to avoid loop with loadSettings

  // 2. X축, Y축, 차트 타입, 그룹화/필터링 등 선택이 변경될 때 차트 데이터 및 통계 업데이트
  useEffect(() => {
    if (!filteredData || filteredData.length === 0 || !xAxisColumn || !yAxisColumn) {
      setChartData(null);
      setChartOptions(null);
      setStats(null);
      setCorrelation(null);
      return;
    }

    const yAxisColType = availableColumns.find(c => c.name === yAxisColumn)?.type;
    const xAxisColType = availableColumns.find(c => c.name === xAxisColumn)?.type;

    if (yAxisColType !== 'numeric' && chartType !== 'scatter') { // Y축은 숫자여야 함 (산점도 제외)
      setChartData(null);
      setChartOptions(null);
      setStats(null);
      setCorrelation(null);
      return;
    }

    let currentChartData = filteredData;
    let currentXAxisColumn = xAxisColumn;
    let currentYAxisColumn = yAxisColumn;

    // --- 그룹화 및 집계 처리 ---
    if (isGroupedMode && groupByColumn && yAxisColType === 'numeric') {
      const aggregatedResult = groupAndAggregateData(filteredData, groupByColumn, yAxisColumn, aggregateType);
      currentChartData = aggregatedResult.map(item => ({
        [groupByColumn]: item[groupByColumn],
        [yAxisColumn]: item.aggregatedValue // Use original Y-axis column name for consistency
      }));
      currentXAxisColumn = groupByColumn; // X축을 그룹화 컬럼으로 변경
      // currentYAxisColumn stays the same as it represents the aggregated value
      setCorrelation(null); // 그룹화 모드에서는 상관계수 무효화
    } else if (chartType === 'scatter') {
      // 산점도는 그룹화 모드를 무시하고 두 숫자 컬럼을 직접 사용
      // Y축과 X축 모두 숫자여야 함
      const xColScatterType = availableColumns.find(c => c.name === xAxisColumn)?.type;
      if (yAxisColType !== 'numeric' || xColScatterType !== 'numeric') {
        setChartData(null);
        setChartOptions(null);
        setStats(null);
        setCorrelation(null);
        return;
      }
      currentChartData = filteredData; // 산점도는 원본 데이터를 그대로 사용
      const xValuesForCorrelation = currentChartData.map(row => parseFloat(row[xAxisColumn])).filter(v => !isNaN(v));
      const yValuesForCorrelation = currentChartData.map(row => parseFloat(row[yAxisColumn])).filter(v => !isNaN(v));
      setCorrelation(calculateCorrelation(xValuesForCorrelation, yValuesForCorrelation));

    } else {
      setCorrelation(null);
    }

    // --- 차트 데이터 생성 ---
    const labels = currentChartData.map(row => {
      const val = row[currentXAxisColumn];
      if (xAxisColType === 'date') {
        const parsedDate = parseISO(String(val));
        if (isValid(parsedDate)) {
          return format(parsedDate, 'yyyy-MM-dd');
        }
      }
      // Script insertion prevention: Ensure values are treated as plain text.
      // Chart.js by default escapes HTML in labels, but for direct text display,
      // further sanitization (e.g., DOMPurify if rendering as innerHTML) would be needed
      // if this value were injected as raw HTML. Here, it's used as chart label/value.
      return String(val);
    });

    const values = currentChartData.map(row => {
      const value = row[currentYAxisColumn];
      return !isNaN(parseFloat(value)) && isFinite(value) ? parseFloat(value) : 0;
    });

    // --- 기술 통계량 계산 및 설정 ---
    setStats(calculateDescriptiveStatistics(values));

    const datasets = [];

    if (chartType === 'scatter') {
      datasets.push({
        label: `${yAxisColumn} vs ${xAxisColumn}`,
        data: currentChartData.map(row => ({
          x: parseFloat(row[xAxisColumn]),
          y: parseFloat(row[yAxisColumn])
        })).filter(point => !isNaN(point.x) && !isNaN(point.y)), // 유효한 숫자만 포함
        backgroundColor: chartColor,
        borderColor: chartColor,
        pointRadius: 5,
      });
    } else {
      datasets.push({
        label: `${currentYAxisColumn} (${currentXAxisColumn} 기준)`,
        data: values,
        backgroundColor: chartColor,
        borderColor: chartColor,
        borderWidth: 1,
        tension: 0.1,
        fill: false,
        datalabels: {
          display: showDataLabels,
          color: '#333',
          font: {
            weight: 'bold'
          },
          formatter: (value) => value.toLocaleString(), // 숫자 형식 지정
        }
      });
    }

    setChartData({ labels, datasets });

    setChartOptions({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: customTitle || `데이터 시각화: ${currentYAxisColumn} vs ${currentXAxisColumn}`,
        },
        datalabels: { // 데이터 라벨 플러그인 설정
          display: showDataLabels,
          // (formatter는 dataset에 설정되어 있음)
        }
      },
      scales: {
        x: {
          type: xAxisColType === 'date' && chartType !== 'scatter' ? 'time' : 'category',
          time: {
            unit: 'day',
            tooltipFormat: 'yyyy-MM-dd',
            displayFormats: {
              day: 'MMM dd',
              month: 'MMM',
            },
          },
          title: {
            display: true,
            text: customXAxisTitle || currentXAxisColumn,
          },
        },
        y: {
          title: {
            display: true,
            text: customYAxisTitle || currentYAxisColumn,
          },
          beginAtZero: true,
        },
      },
    });
  }, [filteredData, xAxisColumn, yAxisColumn, chartType, availableColumns, isGroupedMode,
    groupByColumn, aggregateType, customTitle, customXAxisTitle, customYAxisTitle,
    chartColor, showDataLabels]);


  const handleXAxisColumnChange = useCallback((event) => setXAxisColumn(event.target.value), []);
  const handleYAxisColumnChange = useCallback((event) => setYAxisColumn(event.target.value), []);
  const handleChartTypeChange = useCallback((event) => setChartType(event.target.value), []);
  const handleCustomTitleChange = useCallback((event) => setCustomTitle(event.target.value), []);
  const handleCustomXAxisTitleChange = useCallback((event) => setCustomXAxisTitle(event.target.value), []);
  const handleCustomYAxisTitleChange = useCallback((event) => setCustomYAxisTitle(event.target.value), []);
  const handleChartColorChange = useCallback((event) => setChartColor(event.target.value), []);
  const handleShowDataLabelsChange = useCallback((event) => setShowDataLabels(event.target.checked), []);
  const handleGroupByColumnChange = useCallback((event) => setGroupByColumn(event.target.value), []);
  const handleAggregateTypeChange = useCallback((event) => setAggregateType(event.target.value), []);
  const handleIsGroupedModeChange = useCallback((event) => setIsGroupedMode(event.target.checked), []);
  const handleFilterColumnChange = useCallback((event) => setFilterColumn(event.target.value), []);
  const handleFilterValueChange = useCallback((event) => setFilterValue(event.target.value), []);


  if (!data || data.length === 0) {
    return <p>업로드된 데이터가 없습니다. 파일을 업로드해주세요.</p>;
  }

  const numericColumns = availableColumns.filter(col => col.type === 'numeric');
  const nonNumericColumns = availableColumns.filter(col => col.type !== 'numeric');
  const categoricalColumns = availableColumns.filter(col => col.type === 'categorical');

  // 차트 컴포넌트 동적 선택
  const ChartComponent = useMemo(() => {
    switch (chartType) {
      case 'bar': return Bar;
      case 'line': return Line;
      case 'scatter': return Scatter;
      default: return Bar;
    }
  }, [chartType]);

  return (
    <div style={{ width: '100%', maxWidth: '900px', margin: '0 auto', padding: '20px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
      <h2 style={{ textAlign: 'center', color: '#333', marginBottom: '30px' }}>데이터 시각화 설정</h2>

      {/* --- 데이터 선택 및 차트 유형 --- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid #eee' }}>
        <div>
          <label htmlFor="x-axis-select" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>X축 (라벨):</label>
          <select id="x-axis-select" value={xAxisColumn} onChange={handleXAxisColumnChange}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '100%' }}>
            {availableColumns.map(col => <option key={col.name} value={col.name}>{col.name} ({col.type === 'date' ? '날짜' : (col.type === 'numeric' ? '숫자' : '텍스트')})</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="y-axis-select" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Y축 (값):</label>
          <select id="y-axis-select" value={yAxisColumn} onChange={handleYAxisColumnChange}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '100%' }}>
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
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '100%' }}>
            <option value="bar">막대 차트</option>
            <option value="line">선 차트</option>
            <option value="scatter">산점도</option>
          </select>
        </div>
      </div>

      {/* --- 필터링 섹션 --- */}
      <div style={{ marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid #eee' }}>
        <h3 style={{ marginBottom: '15px', color: '#555' }}>데이터 필터링</h3>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div>
            <label htmlFor="filter-column-select" style={{ display: 'block', marginBottom: '5px' }}>필터 컬럼:</label>
            <select id="filter-column-select" value={filterColumn} onChange={handleFilterColumnChange}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', minWidth: '150px' }}>
              {availableColumns.map(col => <option key={col.name} value={col.name}>{col.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="filter-value-input" style={{ display: 'block', marginBottom: '5px' }}>포함할 값:</label>
            <input id="filter-value-input" type="text" value={filterValue} onChange={handleFilterValueChange}
              placeholder="필터링할 값 입력 (대소문자 무시)"
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', minWidth: '150px' }} />
          </div>
          <p style={{ fontSize: '0.85em', color: '#777', flexBasis: '100%', marginTop: '10px' }}>
            <span style={{ fontWeight: 'bold', color: '#007bff' }}>{filteredData.length}</span> / {data.length} 개의 항목이 필터링되었습니다.
          </p>
        </div>
      </div>

      {/* --- 그룹화 및 집계 섹션 --- */}
      <div style={{ marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid #eee' }}>
        <h3 style={{ marginBottom: '15px', color: '#555' }}>데이터 그룹화 및 집계</h3>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <input type="checkbox" id="group-mode-toggle" checked={isGroupedMode} onChange={handleIsGroupedModeChange} />
            <label htmlFor="group-mode-toggle" style={{ marginLeft: '5px', fontWeight: 'bold' }}>그룹화 모드 활성화</label>
          </div>
          {isGroupedMode && chartType !== 'scatter' && (
            <>
              <div>
                <label htmlFor="group-by-select" style={{ display: 'block', marginBottom: '5px' }}>그룹 기준 컬럼:</label>
                <select id="group-by-select" value={groupByColumn} onChange={handleGroupByColumnChange}
                  style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', minWidth: '150px' }}>
                  {categoricalColumns.length > 0 ? (
                    categoricalColumns.map(col => <option key={col.name} value={col.name}>{col.name} (텍스트)</option>)
                  ) : (
                    <option value="">(범주형 컬럼 없음)</option>
                  )}
                </select>
              </div>
              <div>
                <label htmlFor="aggregate-type-select" style={{ display: 'block', marginBottom: '5px' }}>집계 유형:</label>
                <select id="aggregate-type-select" value={aggregateType} onChange={handleAggregateTypeChange}
                  style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', minWidth: '100px' }}>
                  <option value="sum">합계</option>
                  <option value="mean">평균</option>
                  <option value="count">개수</option>
                </select>
              </div>
              <p style={{ fontSize: '0.85em', color: '#777', flexBasis: '100%', marginTop: '10px' }}>
                그룹화 모드는 Y축 컬럼이 숫자 타입일 때만 작동합니다. 산점도에서는 그룹화가 비활성화됩니다.
              </p>
            </>
          )}
        </div>
      </div>


      {/* --- 차트 커스터마이징 --- */}
      <div style={{ marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid #eee' }}>
        <h3 style={{ marginBottom: '15px', color: '#555' }}>차트 커스터마이징</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div>
            <label htmlFor="custom-title-input" style={{ display: 'block', marginBottom: '5px' }}>차트 제목:</label>
            <input id="custom-title-input" type="text" value={customTitle} onChange={handleCustomTitleChange}
              placeholder="사용자 정의 차트 제목"
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '100%' }} />
          </div>
          <div>
            <label htmlFor="custom-xaxis-title-input" style={{ display: 'block', marginBottom: '5px' }}>X축 제목:</label>
            <input id="custom-xaxis-title-input" type="text" value={customXAxisTitle} onChange={handleCustomXAxisTitleChange}
              placeholder="사용자 정의 X축 제목"
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '100%' }} />
          </div>
          <div>
            <label htmlFor="custom-yaxis-title-input" style={{ display: 'block', marginBottom: '5px' }}>Y축 제목:</label>
            <input id="custom-yaxis-title-input" type="text" value={customYAxisTitle} onChange={handleCustomYAxisTitleChange}
              placeholder="사용자 정의 Y축 제목"
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '100%' }} />
          </div>
          <div>
            <label htmlFor="chart-color-picker" style={{ display: 'block', marginBottom: '5px' }}>차트 색상:</label>
            <input id="chart-color-picker" type="color" value={chartColor} onChange={handleChartColorChange}
              style={{ width: '100%', height: '40px', border: 'none', padding: 0, borderRadius: '4px', cursor: 'pointer' }} />
          </div>
          {chartType !== 'scatter' && ( // 산점도는 데이터 라벨이 기본적으로 없음
            <div>
              <label htmlFor="show-data-labels-checkbox" style={{ display: 'block', marginBottom: '5px' }}>
                <input type="checkbox" id="show-data-labels-checkbox" checked={showDataLabels} onChange={handleShowDataLabelsChange} />
                데이터 라벨 표시
              </label>
            </div>
          )}
        </div>
      </div>

      {/* --- 차트 렌더링 영역 --- */}
      {chartData && chartOptions && yAxisColumn ? (
        <div style={{ height: '400px', marginBottom: '30px' }}>
          <ChartComponent data={chartData} options={chartOptions} plugins={[ChartDataLabels]} />
        </div>
      ) : (
        <p style={{ textAlign: 'center', color: '#888', padding: '50px' }}>
          차트를 표시하려면 X축 (라벨)과 Y축 (값) 컬럼을 모두 선택해주세요.
          <br />
          Y축은 숫자 타입의 컬럼이어야 합니다.
        </p>
      )}

      {/* --- 통계 정보 표시 --- */}
      {stats && chartType !== 'scatter' && (
        <div style={{ marginTop: '30px', padding: '20px', borderTop: '1px solid #eee', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
          <h3 style={{ marginBottom: '15px', color: '#555' }}>선택된 '{yAxisColumn}' 컬럼 통계</h3>
          <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <li><strong>총합:</strong> {stats.sum !== null ? stats.sum.toLocaleString() : 'N/A'}</li>
            <li><strong>평균:</strong> {stats.mean !== null ? stats.mean.toLocaleString(undefined, { maximumFractionDigits: 2 }) : 'N/A'}</li>
            <li><strong>중앙값:</strong> {stats.median !== null ? stats.median.toLocaleString() : 'N/A'}</li>
            <li><strong>최댓값:</strong> {stats.max !== null ? stats.max.toLocaleString() : 'N/A'}</li>
            <li><strong>최솟값:</strong> {stats.min !== null ? stats.min.toLocaleString() : 'N/A'}</li>
            <li><strong>표준편차:</strong> {stats.stdDev !== null ? stats.stdDev.toLocaleString(undefined, { maximumFractionDigits: 2 }) : 'N/A'}</li>
          </ul>
        </div>
      )}

      {/* --- 상관계수 표시 (산점도 선택 시) --- */}
      {chartType === 'scatter' && correlation !== null && (
        <div style={{ marginTop: '30px', padding: '20px', borderTop: '1px solid #eee', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
          <h3 style={{ marginBottom: '15px', color: '#555' }}>상관계수 ({xAxisColumn} vs {yAxisColumn})</h3>
          <p style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#007bff' }}>
            {correlation.toLocaleString(undefined, { maximumFractionDigits: 4 })}
            <span style={{ fontSize: '0.8em', fontWeight: 'normal', marginLeft: '10px' }}>
              ({correlation > 0.7 ? '강한 양의 상관관계' : correlation < -0.7 ? '강한 음의 상관관계' : correlation > 0.3 ? '약한 양의 상관관계' : correlation < -0.3 ? '약한 음의 상관관계' : '매우 약한 상관관계'})
            </span>
          </p>
          <p style={{ fontSize: '0.9em', color: '#777', marginTop: '10px' }}>
            * 상관계수는 두 변수 간의 선형 관계 강도를 나타냅니다. 1에 가까울수록 강한 양의 관계, -1에 가까울수록 강한 음의 관계, 0에 가까울수록 관계가 약합니다.
          </p>
        </div>
      )}

      <p style={{ marginTop: '50px', borderTop: '1px solid #eee', paddingTop: '20px', fontSize: '0.9em', color: '#666', textAlign: 'center' }}>
        이 서비스는 사용자의 데이터를 서버나 데이터베이스에 저장하지 않습니다. 모든 데이터 처리 및 저장은 사용자의 브라우저 로컬 스토리지에서 이루어집니다.
        <br />
        <span style={{ fontWeight: 'bold' }}>보안 참고:</span> 업로드된 데이터는 JSON 객체로 파싱되어 차트 라이브러리에 전달됩니다. 직접적인 스크립트 실행 위험은 낮으나, 사용자 입력 필드에 악성 코드가 삽입되는 것을 방지하기 위한 추가적인 클라이언트 측 검증이 권장됩니다.
      </p>
    </div>
  );
}