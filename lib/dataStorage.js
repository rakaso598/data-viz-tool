// lib/dataStorage.js

const DATA_STORAGE_KEY = 'user_uploaded_data'; // 로컬 스토리지 키

export const saveDataToLocalStorage = (data) => {
  try {
    localStorage.setItem(DATA_STORAGE_KEY, JSON.stringify(data));
    console.log("데이터가 로컬 스토리지에 저장되었습니다.");
  } catch (error) {
    console.error("로컬 스토리지 저장 오류:", error);
    alert("데이터 저장 공간이 부족하거나 오류가 발생했습니다.");
  }
};

export const loadDataFromLocalStorage = () => {
  try {
    const data = localStorage.getItem(DATA_STORAGE_KEY);
    if (data) {
      console.log("데이터가 로컬 스토리지에서 로드되었습니다.");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("로컬 스토리지 로드 오류:", error);
  }
  return null;
};

export const clearDataFromLocalStorage = () => {
  try {
    localStorage.removeItem(DATA_STORAGE_KEY);
    console.log("로컬 스토리지 데이터가 삭제되었습니다.");
  } catch (error) {
    console.error("로컬 스토리지 삭제 오류:", error);
  }
};

// 세션 스토리지를 사용하려면 위 함수들의 localStorage를 sessionStorage로만 변경하면 됩니다.
// 예: sessionStorage.setItem(...), sessionStorage.getItem(...)