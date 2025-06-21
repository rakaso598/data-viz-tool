// lib/localStorageUtils.js
// 로컬 스토리지에 여러 데이터셋과 차트 설정을 저장하고 로드하는 로직을 담습니다.

const DATASET_LIST_KEY = 'data_viz_datasets_list';
const DATA_PREFIX = 'data_viz_data_';
const SETTINGS_PREFIX = 'data_viz_settings_';

// 고유 ID 생성 (간단한 예시)
const generateUniqueId = () => {
  return 'dataset_' + Date.now() + Math.random().toString(36).substring(2, 9);
};

// -------------------- 데이터셋 관리 --------------------

// 모든 데이터셋 목록 불러오기
export const loadDatasetList = () => {
  try {
    const list = localStorage.getItem(DATASET_LIST_KEY);
    return list ? JSON.parse(list) : [];
  } catch (error) {
    console.error("데이터셋 목록 로드 오류:", error);
    return [];
  }
};

// 데이터셋 목록 저장하기
const saveDatasetList = (list) => {
  try {
    localStorage.setItem(DATASET_LIST_KEY, JSON.stringify(list));
  } catch (error) {
    console.error("데이터셋 목록 저장 오류:", error);
    // 용량 초과 등 오류 처리
  }
};

// 새로운 데이터셋 추가 (ID 생성 및 rawData 저장)
export const addDataset = (fileName, rawData) => {
  const newId = generateUniqueId();
  const dataset = {
    id: newId,
    name: fileName || `Unnamed Data ${new Date().toLocaleString()}`,
    timestamp: new Date().toISOString(),
    size: new TextEncoder().encode(JSON.stringify(rawData)).length // 바이트 단위 크기 (대략적)
  };

  try {
    // 실제 데이터 저장
    localStorage.setItem(DATA_PREFIX + newId, JSON.stringify(rawData));

    // 목록에 추가
    const currentList = loadDatasetList();
    const updatedList = [...currentList, dataset];
    saveDatasetList(updatedList);
    console.log(`새로운 데이터셋 "${dataset.name}" (ID: ${newId}) 저장됨`);
    return newId; // 저장된 데이터셋의 ID 반환
  } catch (error) {
    console.error("데이터셋 추가 오류:", error);
    alert("데이터 저장 공간이 부족하거나 오류가 발생했습니다. (최대 5-10MB)");
    return null;
  }
};

// 특정 데이터셋 불러오기 (rawData)
export const loadDataset = (id) => {
  try {
    const data = localStorage.getItem(DATA_PREFIX + id);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`데이터셋 (ID: ${id}) 로드 오류:`, error);
    return null;
  }
};

// 특정 데이터셋 삭제
export const deleteDataset = (id) => {
  try {
    localStorage.removeItem(DATA_PREFIX + id); // 실제 데이터 삭제
    localStorage.removeItem(SETTINGS_PREFIX + id); // 연결된 설정도 삭제

    const currentList = loadDatasetList();
    const updatedList = currentList.filter(ds => ds.id !== id);
    saveDatasetList(updatedList); // 목록에서 삭제
    console.log(`데이터셋 (ID: ${id}) 및 설정 삭제됨`);
    return true;
  } catch (error) {
    console.error(`데이터셋 (ID: ${id}) 삭제 오류:`, error);
    return false;
  }
};

// -------------------- 차트 설정 관리 --------------------

// 특정 데이터셋의 차트 설정 불러오기
export const loadChartSettings = (datasetId) => {
  if (!datasetId) return null;
  try {
    const settings = localStorage.getItem(SETTINGS_PREFIX + datasetId);
    return settings ? JSON.parse(settings) : null;
  } catch (error) {
    console.error(`차트 설정 (ID: ${datasetId}) 로드 오류:`, error);
    return null;
  }
};

// 특정 데이터셋의 차트 설정 저장하기
export const saveChartSettings = (datasetId, settings) => {
  if (!datasetId || !settings) return;
  try {
    localStorage.setItem(SETTINGS_PREFIX + datasetId, JSON.stringify(settings));
    console.log(`차트 설정 (ID: ${datasetId}) 저장됨`);
  } catch (error) {
    console.error(`차트 설정 (ID: ${datasetId}) 저장 오류:`, error);
  }
};