<template>
  <div class="page-background">
    <div class="projects-container">
      <div v-if="loading" class="loading-overlay">
        <div class="spinner"></div>
        <p>読み込み中...</p>
      </div>

      <template v-else>
        <!-- ヘッダーと検索 -->
        <header class="page-header content-block">
          <h2>プロジェクト検索</h2>
          <!-- 検索非表示ボタン（スマホのみ） -->
          <div class="search-box">
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="キーワードで検索 (例: ダンス、カジノ)"
            >
          </div>
          <button 
            @click="toggleSearch" 
            class="search-toggle-btn"
            :class="{ 'hidden': !showSearch }"
          >
            {{ showSearch ? '検索テンプレートを非表示' : '検索テンプレートを表示' }}
          </button>    
          <div class="search-container" :class="{ 'hidden': !showSearch }">
            <div class="search-suggestions">
              <button @click="setSearchQuery('%RM')">教室企画</button>
              <button @click="setSearchQuery('%ST')">ステージ企画</button>
              <button @click="setSearchQuery('%1F')">1階</button>
              <button @click="setSearchQuery('%2F')">2階</button>
              <button @click="setSearchQuery('%3F')">3階</button>
            </div>
          </div>
        </header>

        <!-- プロジェクトリスト -->
        <main class="projects-list content-block">
          <div v-if="filteredProjects.length === 0" class="no-results">
            <p>一致するプロジェクトは見つかりませんでした。</p>
            <span>別のキーワードをお試しください。</span>
          </div>
          
          <div v-for="project in filteredProjects" :key="project.project_id" class="project-item" @click="openMapModal(project.project_id,project.room)" style="cursor: pointer;">
            <div class="project-image-wrapper">
              <img 
                v-if="getProjectImageUrl(project.project_id) && !failedImages.has(project.project_id)" 
                :src="getProjectImageUrl(project.project_id)" 
                alt="Project Image"
                @error="handleImageError(project.project_id)"
              >
              <div v-else class="no-image-placeholder">
                <span>No Image</span>
              </div>
            </div>
            <div class="project-details">
              <h2 class="project-title">{{ decode(project.title) }}</h2>
              <div class="project-meta">
                <span class="meta-tag room">{{ decode(project.room) }}</span>
                <span class="meta-tag author">{{ decode(project.author) }}</span>
                <span v-if="project.time" class="meta-tag time">{{ formatDateTime(project.time) }}</span>
                <span v-if="project.duration" class="meta-tag duration">所要時間: {{ project.duration }}分</span>
              </div>
              <p class="project-description">{{ decode(project.comment) }}</p>
            </div>
          </div>
        </main>
        <div class="end">
          <button @click="scrollToTop" class="project-button">ページの一番上にもどる</button>
        </div>
        <!-- 地図モーダル -->
        <Modal v-if="showMapModal" @close="closeMapModal">
          <template #default>
            <div class="map-modal-content">
              <div class="map-modal-buttons">
                <button class="map-modal-btn" @click="enterFullscreen">全画面</button>
                <button v-if="!isSchoolMap" class="map-modal-btn" @click="linkMapPage">校内マップ</button>
                <button v-else class="map-modal-btn" @click="backToClassroomMap">教室マップ</button>
                <button class="map-modal-btn" @click="closeMapModal">閉じる</button>
              </div>
              <img v-if="currentMapUrl" :src="currentMapUrl" alt="地図画像" ref="mapImgRef" />
            </div>
          </template>
        </Modal>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import Modal from '../components/Modal.vue'
import API_URL from '../api'

const allProjects = ref([])
const projects = ref([])
const loading = ref(true)
const searchQuery = ref('')
const showSearch = ref(true)
const privateBlobAccess = ref(null)
const router = useRouter()

// 地図モーダル用の状態
const showMapModal = ref(false)
const currentMapUrl = ref('')
const lastClassroomMapUrl = ref('') // 直前の教室マップURLを記憶
const isSchoolMap = ref(false) // 校内マップ表示中かどうか

// 画像読み込みエラーを追跡するための状態
const failedImages = ref(new Set())

const mapImgRef = ref(null)

function toggleSearch() {
  showSearch.value = !showSearch.value;
}

function linkMapPage() {
  const url = buildBlobUrl('map/map.jpg');
  if (url) {
    lastClassroomMapUrl.value = currentMapUrl.value; // 現在の教室マップURLを記憶
    currentMapUrl.value = url;
    isSchoolMap.value = true;
  } else {
    router.push('/error/401');
    return;
  }
}

function backToClassroomMap() {
  if (lastClassroomMapUrl.value) {
    currentMapUrl.value = lastClassroomMapUrl.value;
    isSchoolMap.value = false;
  }
}

function openMapModal(projectId, room) {
  let mapUrl = '';
  const id = Number(projectId);

  if (id >= 900) {
    if (room == '5Lit5bqt') {
      mapUrl = 'f1-gd.jpg';
    } else {
      mapUrl = 'f2-gy.jpg';
    }
  } else if (830 < id && id < 899) {
    mapUrl = '800-hl.jpg';
  } else {
    mapUrl = id.toString() + '-hl.jpg';
  }

  const url = buildBlobUrl(`map/${mapUrl}`);
  if (url) {
    currentMapUrl.value = url;
    lastClassroomMapUrl.value = url; // 教室マップURLを記憶
    isSchoolMap.value = false;
  } else {
    router.push('/error/401');
    return;
  }
  showMapModal.value = true;
}

function closeMapModal() {
  showMapModal.value = false
  currentMapUrl.value = ''
}

// SAS URLの有効期限をチェック
function isSasUrlExpired() {
  if (!privateBlobAccess.value || !privateBlobAccess.value.expiresAt) {
    return true;
  }
  const expiresAt = new Date(privateBlobAccess.value.expiresAt);
  const now = new Date();
  return now >= expiresAt;
}

// SAS URLが期限切れの場合の処理
function handleExpiredSasUrl() {
  if (isSasUrlExpired()) {
    router.push('/error/401')
  }
}

const filteredProjects = computed(() => {
  const query = searchQuery.value;
  if (!query) {
    return projects.value;
  }

  const sourceList = allProjects.value;

  if (query.startsWith('%')) {
    return sourceList.filter(project => {
      const id = Number(project.project_id);
      switch (query) {
        case '%RM':
          return id > 0 && id < 899;
        case '%ST':
          return id > 900 && id < 999;
        case '%1F':
          return (id > 0 && id < 899) && (id % 10 === 1);
        case '%2F':
          return (id > 0 && id < 899) && (id % 10 === 2);
        case '%3F':
          return (id > 0 && id < 899) && (id % 10 === 3);
        default:
          const lowerCaseQuery = query.toLowerCase();
          return Object.values(project).some(value => 
            typeof value === 'string' && decode(value).toLowerCase().includes(lowerCaseQuery)
          );
      }
    });
  }

  const lowerCaseQuery = query.toLowerCase();
  return sourceList.filter(project => 
    Object.values(project).some(value => 
      typeof value === 'string' && decode(value).toLowerCase().includes(lowerCaseQuery)
    )
  );
});

function setSearchQuery(query) {
  searchQuery.value = query;
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function decode(str) {
  if (!str) return '';
  try {
    if (/^[A-Za-z0-9+/=]+$/.test(str) && str.length % 4 === 0) {
      return decodeURIComponent(escape(window.atob(str)));
    }
    return str;
  } catch {
    return str;
  }
}

function formatDateTime(dateTimeStr) {
  if (!dateTimeStr) return '';
  const date = new Date(dateTimeStr);
  if (isNaN(date.getTime())) {
    return '';
  }
  return new Intl.DateTimeFormat('ja-JP', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(date);
}

function getProjectImageUrl(projectId) {
  // id-hl.png の形式で画像を取得
  return buildBlobUrl(`img/${projectId}-hd.png`);
}

function handleImageError(projectId) {
  failedImages.value.add(projectId);
}

// SAS URLからファイルURLを組み立てる共通関数
function buildBlobUrl(path) {
  if (!privateBlobAccess.value || !privateBlobAccess.value.sasUrl) return null;
  const [baseUrl, params] = privateBlobAccess.value.sasUrl.split('?');
  return `${baseUrl}/${path}?${params}`;
}

function enterFullscreen() {
  nextTick(() => {
    const img = mapImgRef.value;
    if (img && img.requestFullscreen) {
      img.requestFullscreen();
    } else if (img && img.webkitRequestFullscreen) {
      img.webkitRequestFullscreen();
    } else if (img && img.mozRequestFullScreen) {
      img.mozRequestFullScreen();
    } else if (img && img.msRequestFullscreen) {
      img.msRequestFullscreen();
    }
  });
}

onMounted(async () => {
  try {
    const project_id = router.currentRoute.value.query.id
    const res = await fetch(`${API_URL}/projects`, {
      method: 'GET',
      credentials: 'include',
    })
    if (!res.ok) {
      router.push('/error/401');
      return;
    }
    const response = await res.json();
    
    // SAS URLを使用したAPIレスポンス形式
    if (response.projects && response.privateBlobAccess) {
      allProjects.value = response.projects;
      privateBlobAccess.value = response.privateBlobAccess;
    } else {
      router.push('/error/500');
      return;
    }
    

    if (project_id) {
      const projectIds = project_id.split(',').map(id => id.trim());
      projects.value = allProjects.value.filter(project => 
        projectIds.includes(project.project_id.toString())
      );
    } else {
      projects.value = allProjects.value;
    }
    
    loading.value = false;
  } catch (error) {
    router.push('/error/500');
  }
})
</script>

<style scoped>
/* 検索非表示機能（スマホのみ） */
@media (max-width: 768px) {
  .search-toggle-btn {
    width: 100%;
    padding: 10px;
    margin-bottom: 10px;
    background-color: #F62938;
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 14px;
    margin-left: auto;
    margin-right: auto;
    display: block;
  }
  .map-modal-btn {
    font-size: 9px;
    padding: 3px 6px;
    background: #F62938;
    color: #fff;
    border: none;
    border-radius: 5px;
    padding: 8px 18px;
    font-size: 8px;
    cursor: pointer;
    transition: background 0.2s;
  }
  .search-container.hidden {
    display: none;
  }
}

@media (min-width: 769px) {
  .search-toggle-btn {
    display: none;
  }
  
  .search-container.hidden {
    display: block !important;
  }

  .map-modal-btn {
    background: #F62938;
    color: #fff;
    border: none;
    border-radius: 5px;
    padding: 8px 18px;
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.2s;
}
}

.search-container{
  margin-top: 10px;
}

.project-item {
  transition: box-shadow 0.2s, transform 0.2s;
}
.project-item:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  transform: translateY(-4px) scale(1.03);
  z-index: 2;
}
.project-image-wrapper img {
  transition: transform 0.2s;
}
.project-image-wrapper img:hover {
  transform: scale(1.08);
}

.map-modal-content {
  position: relative;
  padding: 0;
  background: #fff;
  border-radius: 8px;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.map-modal-buttons {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  width: 100%;
  padding: 16px 16px 0 16px;
  box-sizing: border-box;
}

.map-modal-btn:hover {
  background: #c91d2a;
}
.map-modal-content img {
  width: 100%;
  height: auto;
  max-height: 80vh;
  object-fit: contain;
  border-radius: 8px 8px 0 0;
}
</style>