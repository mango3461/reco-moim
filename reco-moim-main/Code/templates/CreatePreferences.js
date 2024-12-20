// 카카오맵 장소 검색 객체 생성
const ps = new kakao.maps.services.Places();

// DOM 엘리먼트
const locationInput = document.getElementById('location');
const searchResults = document.getElementById('location-search-results');
const preferencesForm = document.getElementById('preferences-form');

// 디바운스 타이머
let debounceTimer;

// 위치 검색 입력 이벤트
locationInput.addEventListener('input', function() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        const keyword = this.value.trim();
        if (keyword.length >= 2) { // 2글자 이상일 때만 검색
            searchPlaces(keyword);
        } else {
            searchResults.style.display = 'none';
        }
    }, 300); // 300ms 디바운스
});

// 검색 결과 외부 클릭 시 결과창 닫기
document.addEventListener('click', function(e) {
    if (!locationInput.contains(e.target) && !searchResults.contains(e.target)) {
        searchResults.style.display = 'none';
    }
});

// 장소 검색 함수
function searchPlaces(keyword) {
    ps.keywordSearch(keyword, function(data, status) {
        if (status === kakao.maps.services.Status.OK) {
            displaySearchResults(data);
        } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
            searchResults.innerHTML = '<div class="search-result-item">검색 결과가 없습니다.</div>';
            searchResults.style.display = 'block';
        } else if (status === kakao.maps.services.Status.ERROR) {
            searchResults.innerHTML = '<div class="search-result-item">검색 중 오류가 발생했습니다.</div>';
            searchResults.style.display = 'block';
        }
    });
}

// 검색 결과 표시 함수
function displaySearchResults(places) {
    searchResults.innerHTML = '';
    
    places.forEach(place => {
        const item = document.createElement('div');
        item.className = 'search-result-item';
        
        const content = `
            <div class="place-name">${place.place_name}</div>
            <div class="place-address">${place.address_name}</div>
        `;
        
        item.innerHTML = content;
        
        // 결과 항목 클릭 이벤트
        item.addEventListener('click', function() {
            locationInput.value = `${place.place_name} (${place.address_name})`;
            searchResults.style.display = 'none';
        });
        
        searchResults.appendChild(item);
    });
    
    searchResults.style.display = 'block';
}

// 폼 제출 이벤트 처리
preferencesForm.addEventListener('submit', async function(event) {
    event.preventDefault();

    const name = document.getElementById('name').value.trim();
    const location = locationInput.value.trim();
    const positivePrompt = document.getElementById('positive-prompt').value.trim();
    const negativePrompt = document.getElementById('negative-prompt').value.trim();

    try {
        const response = await fetch('/save-preference', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: name,
                location: location,
                positivePrompt: positivePrompt,
                negativePrompt: negativePrompt,
            }),
        });

        const result = await response.json();

        if (response.ok) {
            alert(result.message);
            window.location.href = '/'; // 성공 시 메인 페이지로 이동
        } else {
            alert('오류: ' + result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('서버 오류가 발생했습니다. 다시 시도해주세요.');
    }
});

// 폼 초기화 이벤트 처리
preferencesForm.addEventListener('reset', function() {
    searchResults.style.display = 'none';
    alert('모든 입력이 초기화되었습니다.');
});

// 입력 필드 유효성 검사
function validateForm() {
    const name = document.getElementById('name').value.trim();
    const location = locationInput.value.trim();
    
    if (!name || !location) {
        return false;
    }
    return true;
}

// 에러 처리 함수
function handleError(error) {
    console.error('Error:', error);
    alert('오류가 발생했습니다. 다시 시도해주세요.');
}