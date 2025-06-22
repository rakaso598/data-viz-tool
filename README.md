# 📊 [데이터 시각화 대시보드 사이트](https://data-viz-tool-kappa.vercel.app/)

![Animation_csv_1](https://github.com/user-attachments/assets/de972f71-2129-4383-bfc1-5a3067abb6e4)

## 프로젝트 소개

이 프로젝트는 사용자가 자신의 CSV 또는 XLSX 파일을 브라우저에 직접 업로드하여 인터랙티브하게 데이터를 탐색하고 시각화할 수 있도록 돕는 오프라인 우선(Offline-first) 데이터 시각화 대시보드입니다.  

서버와의 통신 없이 모든 데이터 처리가 클라이언트(브라우저)에서 이루어지므로, 데이터를 빠르게 간이 분석해보고 싶은 사용자에게 최적화되어 있습니다. 직관적인 UI를 통해 복잡한 코드 없이도 데이터를 쉽게 이해하고 인사이트를 얻을 수 있습니다.  

아래 드롭다운에는 시연 이미지들이 정리되어 있습니다.  

<details>
<summary>접속 화면</summary>

![image](https://github.com/user-attachments/assets/ba2bb598-6d69-4e5b-b0db-43e92524f45f)

</details>
<details>
<summary>파일 선택</summary>

![image](https://github.com/user-attachments/assets/e2185590-381d-47b5-b616-d7aeb47be74f)

</details>
<details>
<summary>데이터셋 변경가능</summary>

![image](https://github.com/user-attachments/assets/252a07cf-91e8-431b-94a4-a765a9feca22)

</details>
<details>
<summary>데이터 시각화 설정</summary>

![image](https://github.com/user-attachments/assets/265586d2-43f5-44c3-9ba0-e63cc47c0e5a)

</details>
<details>
<summary>막대 차트 결과</summary>

![image](https://github.com/user-attachments/assets/fe16a1bb-9490-4747-a3e9-12d28577eb00)

</details>
<details>
<summary>선 차트 결과</summary>

![image](https://github.com/user-attachments/assets/ef0aad86-f767-49ec-8ba0-72fba37e27c6)

</details>
<details>
<summary>산점도 결과</summary>

![image](https://github.com/user-attachments/assets/205c57e5-aa7f-4165-b2ce-6c397bc69530)

</details>

**또한, 테스트를 위한 예제 CSV 데이터를 제공합니다.**

<details>
<summary>sales_data.csv</summary>

```
Date,Product,Region,SalesAmount,UnitsSold
2024-01-01,Laptop,North,1200000,10
2024-01-01,Mouse,North,25000,100
2024-01-02,Keyboard,South,50000,50
2024-01-02,Monitor,East,300000,5
2024-01-03,Laptop,West,1500000,12
2024-01-03,Mouse,South,28000,110
2024-01-04,Keyboard,East,55000,60
2024-01-04,Monitor,North,320000,6
2024-01-05,Laptop,South,1300000,11
2024-01-05,Mouse,West,27000,105
```

</details>

<details>
<summary>employee_performance.csv</summary>

```
EmployeeID,Name,Department,PerformanceScore,YearsOfService,ProjectCount,Salary(USD)
EMP001,Alice,Marketing,85,5,3,60000
EMP002,Bob,Sales,92,7,5,75000
EMP003,Charlie,HR,78,3,2,50000
EMP004,David,Engineering,95,10,8,90000
EMP005,Eve,Marketing,88,6,4,65000
EMP006,Frank,Sales,89,4,3,68000
EMP007,Grace,Engineering,91,8,6,82000
```

</details>

## 기술 스택

* **프론트엔드 프레임워크:** ![](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white), ![](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
* **데이터 시각화:** ![](https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chart.js&logoColor=white), ![](https://img.shields.io/badge/React--Chartjs--2-61DAFB?style=for-the-badge&logo=react&logoColor=black), ![](https://img.shields.io/badge/Chartjs--Adapter--Date--Fns-F0F0F0?style=for-the-badge&logoColor=black), ![](https://img.shields.io/badge/Chartjs--Plugin--Datalabels-F0F0F0?style=for-the-badge&logoColor=black)
* **데이터 파싱:** ![](https://img.shields.io/badge/PapaParse-F0F0F0?style=for-the-badge&logoColor=black), ![](https://img.shields.io/badge/XLSX-F0F0F0?style=for-the-badge&logoColor=black)
* **데이터 처리 및 통계:** ![](https://img.shields.io/badge/Simple--Statistics-F0F0F0?style=for-the-badge&logoColor=black), ![](https://img.shields.io/badge/Lodash-334052?style=for-the-badge&logo=lodash&logoColor=white), ![](https://img.shields.io/badge/Date--Fns-F0F0F0?style=for-the-badge&logoColor=black)
* **데이터 저장:** ![](https://img.shields.io/badge/localStorage%20API-F0F0F0?style=for-the-badge&logoColor=black)
* **스타일링:** ![](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)

## 주요 기능

* **데이터 업로드:** CSV 및 XLSX 파일 형식을 지원하며, 업로드된 데이터는 로컬 스토리지에 저장되어 브라우저를 닫아도 유지됩니다.
* **다양한 차트 유형:** 막대 차트, 선 차트, 산점도를 제공하여 데이터의 특성에 맞는 시각화를 선택할 수 있습니다.
* **유연한 시각화 설정:** 사용자가 X축과 Y축에 사용할 컬럼을 자유롭게 선택하고, 차트 유형을 변경할 수 있습니다.
* **강력한 데이터 필터링:** 특정 컬럼 값을 기준으로 데이터를 필터링할 수 있으며, 대소문자를 구분하지 않아 편리합니다.
* **데이터 그룹화 및 집계:** 범주형 데이터를 기준으로 숫자 데이터를 `합계`, `평균`, `개수` 등으로 집계하여 그룹별 통계를 시각화할 수 있습니다. (산점도 제외)
* **차트 커스터마이징:** 차트 제목, X/Y축 제목, 차트 색상, 데이터 라벨 표시 여부 등을 사용자가 직접 설정하여 맞춤형 시각화를 생성할 수 있습니다.
* **실시간 통계 분석:** 선택된 Y축 컬럼에 대한 총합, 평균, 중앙값, 최댓값, 최솟값, 표준편차 등 핵심 통계 정보를 즉시 확인할 수 있습니다.
* **상관계수 분석:** 산점도에서는 두 숫자 컬럼 간의 **상관계수**를 계산하고, 그 관계의 강도와 방향을 직관적으로 해석해 줍니다.
* **로컬 스토리지 기반 영속성:** 업로드된 데이터셋 목록과 마지막으로 설정했던 차트 옵션이 사용자의 브라우저 로컬 스토리지에 저장되어, 페이지를 새로고침하거나 다시 접속해도 이전 작업이 유지됩니다.

## 프로젝트 구조

<details>
<summary>클릭하여 열기</summary>

```
data-viz-tool/
├── public/
├── app/
│   ├── layout.js       # 전체 레이아웃
│   ├── page.js         # 메인 페이지 컴포넌트 (데이터셋 관리, 로드 등)
│   └── globals.css     # 전역 CSS
├── components/
│   ├── FileUploader.js     # 파일 업로드
│   └── DataVisualizer.js   # 핵심 시각화 및 설정 UI
├── lib/
│   ├── dataUtils.js        # 데이터 처리, 통계, 그룹화 로직
│   └── localStorageUtils.js # 로컬 스토리지 데이터셋 및 설정 관리
├── package.json
└── next.config.js
```

</details>

## 프로젝트 실행 방법

1.  **프로젝트 클론:**
    `git clone [프로젝트-저장소-URL]`
    `cd data-viz-tool`
2.  **라이브러리 설치:** 프로젝트 루트 디렉토리에서 다음 명령어를 실행하여 필요한 모든 라이브러리를 설치합니다.
    `npm install papaparse xlsx chart.js react-chartjs-2 chartjs-adapter-date-fns date-fns simple-statistics lodash chartjs-plugin-datalabels`
3.  **개발 서버 실행:**
    `npm run dev`
4.  **접속 및 테스트:** 웹 브라우저에서 `http://localhost:3000`에 접속합니다.

## 시각화 도구 테스트 방법

1.  csv 또는 xlsx 파일을 업로드합니다. (예시 파일은 아래에서 별도로 제공) 
2.  파일 업로드 후, 좌측 '저장된 데이터셋' 목록에 파일이 추가되고 로드되는지 확인합니다.
3.  **기본 시각화:** X축, Y축 컬럼과 차트 종류(막대, 선, 산점도)를 바꿔보며 시각화가 올바르게 작동하는지 확인합니다.
4.  **날짜 데이터 시각화:** 'Date' 컬럼을 X축으로, 'SalesAmount'와 같은 숫자 컬럼을 Y축으로 선택하고 '선 차트'로 변경하여 날짜별 추이가 잘 표시되는지 확인합니다.
5.  **데이터 필터링:** '데이터 필터링' 섹션에서 'Product' 컬럼을 선택하고 'Laptop'을 입력하여 데이터가 올바르게 필터링되는지 확인합니다. (총 항목 수 변화 확인)
6.  **데이터 그룹화 및 집계:** '데이터 그룹화' 섹션에서 체크박스를 활성화하고, 'Product' (그룹 기준), 'SalesAmount' (Y축 값), '합계' (집계 유형)를 선택하여 제품별 총 매출이 막대 차트로 정확히 표시되는지 확인합니다.
7.  **차트 커스터마이징:** '차트 커스터마이징' 섹션에서 차트 제목, X/Y축 제목, 차트 색상, 데이터 라벨 표시 등을 변경했을 때 실시간으로 차트에 적용되는지 확인합니다.
8.  **산점도 및 상관계수:** 두 개의 숫자 컬럼 (예: `employee_performance.csv`에서 'PerformanceScore'와 'Salary(USD)')을 X, Y축으로 선택하고 차트 종류를 '산점도'로 변경하여 산점도가 그려지고 상관계수 값이 표시되는지 확인합니다.
9.  **데이터 영속성:** 페이지를 새로고침하거나 브라우저를 닫았다가 다시 열었을 때, 로컬 스토리지에 저장된 데이터셋 목록과 마지막으로 선택했던 차트 설정이 그대로 유지되는지 확인합니다.
10. **데이터셋 삭제:** '저장된 데이터셋' 옆의 삭제 버튼을 눌러 목록에서 데이터셋이 올바르게 제거되는지 확인합니다.

## 보안 및 데이터 프라이버시 참고

이 서비스는 사용자의 데이터를 서버나 어떤 외부 데이터베이스에도 저장하지 않습니다. 모든 데이터 파싱, 처리 및 저장은 사용자의 **브라우저 로컬 스토리지**에서만 이루어집니다. 이는 사용자의 데이터 프라이버시를 최우선으로 보호하며, 민감한 정보를 외부로 노출할 걱정 없이 안심하고 데이터를 분석할 수 있게 합니다.

**보안 주의사항:** 업로드된 데이터는 JSON 객체로 파싱되어 차트 라이브러리에 안전하게 전달됩니다. 현재 구조에서는 직접적인 스크립트 실행 위험이 낮습니다. 그러나 `차트 제목`이나 `축 제목`과 같은 **사용자 입력 필드**에 악성 코드가 삽입되는 것을 방지하기 위한 추가적인 클라이언트 측 **입력 유효성 검증(Validation) 및 살균(Sanitization)**은 웹 애플리케이션 개발의 기본적인 보안 원칙이며, 향후 기능 확장을 고려하여 항상 염두에 두어야 합니다.
