// lib/dataUtils.js
// 데이터 처리, 타입 추론, 통계 계산, 그룹화 로직을 담습니다.

import { parseISO, isValid, isDate } from 'date-fns';
import * as ss from 'simple-statistics'; // 통계 라이브러리
import _ from 'lodash'; // 데이터 그룹화 및 집계용

// 데이터 값의 타입을 추론하는 헬퍼 함수
export const inferColumnType = (data, column) => {
  if (!data || data.length === 0 || !column) return 'unknown';

  let isNumeric = true;
  let isDateType = true;

  // 샘플 데이터만 확인하여 성능 최적화
  for (let i = 0; i < Math.min(data.length, 100); i++) {
    const value = data[i][column];
    if (value === undefined || value === null || value === '') continue;

    // 숫자 타입 체크
    if (isNaN(parseFloat(value)) || !isFinite(value)) {
      isNumeric = false;
    }

    // 날짜 타입 체크 (date-fns의 parseISO로 유효성 확인)
    const parsedDate = parseISO(String(value));
    if (!isValid(parsedDate) || !isDate(parsedDate)) {
      isDateType = false;
    }
    if (!isNumeric && !isDateType) break;
  }

  if (isNumeric) return 'numeric';
  if (isDateType) return 'date';
  return 'categorical'; // 숫자도 날짜도 아니면 범주형
};

// 숫자 컬럼에 대한 기술 통계량 계산
export const calculateDescriptiveStatistics = (values) => {
  if (!values || values.length === 0) {
    return { mean: null, median: null, min: null, max: null, stdDev: null, sum: null };
  }

  const numericValues = values.filter(v => !isNaN(parseFloat(v)) && isFinite(v)).map(parseFloat);

  if (numericValues.length === 0) {
    return { mean: null, median: null, min: null, max: null, stdDev: null, sum: null };
  }

  try {
    return {
      mean: ss.mean(numericValues),
      median: ss.median(numericValues),
      min: ss.min(numericValues),
      max: ss.max(numericValues),
      stdDev: ss.standardDeviation(numericValues),
      sum: ss.sum(numericValues)
    };
  } catch (e) {
    console.error("통계 계산 오류:", e);
    return { mean: null, median: null, min: null, max: null, stdDev: null, sum: null };
  }
};

// 두 숫자 컬럼 간의 상관계수 계산 (산점도용)
export const calculateCorrelation = (xValues, yValues) => {
  if (!xValues || !yValues || xValues.length === 0 || yValues.length === 0 || xValues.length !== yValues.length) {
    return null;
  }

  const numericX = xValues.filter(v => !isNaN(parseFloat(v)) && isFinite(v)).map(parseFloat);
  const numericY = yValues.filter(v => !isNaN(parseFloat(v)) && isFinite(v)).map(parseFloat);

  // 길이가 일치하지 않으면 null 반환 (오류 방지)
  if (numericX.length === 0 || numericY.length === 0 || numericX.length !== numericY.length) {
    return null;
  }

  try {
    return ss.sampleCorrelation(numericX, numericY);
  } catch (e) {
    console.error("상관계수 계산 오류:", e);
    return null;
  }
};


// 데이터 그룹화 및 집계
export const groupAndAggregateData = (data, groupByColumn, aggregateColumn, aggregateType = 'sum') => {
  if (!data || data.length === 0 || !groupByColumn || !aggregateColumn) {
    return [];
  }

  const grouped = _.groupBy(data, groupByColumn);
  const result = Object.keys(grouped).map(key => {
    const group = grouped[key];
    const valuesToAggregate = group.map(row => {
      const val = row[aggregateColumn];
      return !isNaN(parseFloat(val)) && isFinite(val) ? parseFloat(val) : 0;
    });

    let aggregatedValue;
    switch (aggregateType) {
      case 'sum':
        aggregatedValue = ss.sum(valuesToAggregate);
        break;
      case 'mean':
        aggregatedValue = ss.mean(valuesToAggregate);
        break;
      case 'count':
        aggregatedValue = valuesToAggregate.length;
        break;
      // 다른 집계 유형 추가 가능 (min, max 등)
      default:
        aggregatedValue = ss.sum(valuesToAggregate);
    }
    return { [groupByColumn]: key, aggregatedValue: aggregatedValue };
  });

  return result;
};